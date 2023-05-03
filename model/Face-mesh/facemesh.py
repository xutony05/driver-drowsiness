import cv2 as cv
import numpy as np
import mediapipe as mp
from mediapipe.python.solutions.drawing_utils import _normalized_to_pixel_coordinates as denormalize_coordinates

def open_len(arr):
    y_arr = []

    for _,y in arr:
        y_arr.append(y)

    min_y = min(y_arr)
    max_y = max(y_arr)

    return max_y - min_y

mp_face_mesh = mp.solutions.face_mesh

# A: location of the eye-landamarks in the facemesh collection
RIGHT_EYE = [ 362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385,384, 398 ]
LEFT_EYE = [ 33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161 , 246 ]

chosen_left_eye_idxs  = [362, 385, 387, 263, 373, 380]
chosen_right_eye_idxs = [33,  160, 158, 133, 153, 144]
all_chosen_idxs = chosen_left_eye_idxs + chosen_right_eye_idxs

mouth_idxs = [61, 39, 269,  291, 405, 181]
mouth_idx = [61, 146, 146, 91, 91, 181, 181, 84, 84, 17, 17, 314, 314, 405, 405, 321,
321, 375, 375, 291, 61, 185, 185, 40, 40, 39, 39, 37, 37, 0, 0, 267, 267,
269, 269, 270, 270, 409, 409, 291, 78, 95, 95, 88, 88, 178, 178, 87, 87, 14,
14, 317, 317, 402, 402, 318, 318, 324, 324, 308, 78, 191, 191, 80, 80, 81,
81, 82, 82, 13, 13, 312, 312, 311, 311, 310, 310, 415, 415, 308,]


#distance calculation
def distance(point_1, point_2):
    """Calculate l2-norm between two points"""
    dist = sum([(i - j) ** 2 for i, j in zip(point_1, point_2)]) ** 0.5
    return dist

#Eye Aspect Ratio for one eye 
def get_ear(landmarks, refer_idxs, frame_width, frame_height):
    try:
        # Compute the euclidean distance between the horizontal
        coords_points = []
        for i in refer_idxs:
            lm = landmarks[i]
            coord = denormalize_coordinates(lm.x, lm.y, 
                                             frame_width, frame_height)
            coords_points.append(coord)
 
        # Eye landmark (x, y)-coordinates
        P2_P6 = distance(coords_points[1], coords_points[5])
        P3_P5 = distance(coords_points[2], coords_points[4])
        P1_P4 = distance(coords_points[0], coords_points[3])
 
        # Compute the eye aspect ratio
        ear = (P2_P6 + P3_P5) / (2.0 * P1_P4)
 
    except:
        ear = 0.0
        coords_points = None
 
    return ear, coords_points


#Avergae eye aspect ratio using both eyes
def calculate_avg_ear(landmarks, left_eye_idxs, right_eye_idxs, image_w, image_h):
    """Calculate Eye aspect ratio"""
 
    left_ear, left_lm_coordinates = get_ear(
                                      landmarks, 
                                      left_eye_idxs, 
                                      image_w, 
                                      image_h
                                    )

    right_ear, right_lm_coordinates = get_ear(
                                      landmarks, 
                                      right_eye_idxs, 
                                      image_w, 
                                      image_h
                                    )
                                    
    Avg_EAR = (left_ear + right_ear) / 2.0
 
    return Avg_EAR, (left_lm_coordinates, right_lm_coordinates)

# Mouth aspect ratio calculation
def get_mar(landmarks, refer_idxs, frame_width, frame_height):
    try:
        # Compute the euclidean distance between the horizontal
        coords_points = []
        for i in refer_idxs:
            lm = landmarks[i]
            coord = denormalize_coordinates(lm.x, lm.y, 
                                             frame_width, frame_height)
            coords_points.append(coord)
 
        # Eye landmark (x, y)-coordinates
        P2_P6 = distance(coords_points[1], coords_points[5])
        P3_P5 = distance(coords_points[2], coords_points[4])
        P1_P4 = distance(coords_points[0], coords_points[3])
 
        # Compute the eye aspect ratio
        mar = (P2_P6 + P3_P5) / (2.0 * P1_P4)
 
    except:
        mar = 0.0
        coords_points = None
 
    return mar, coords_points

# handle of the webcam
cap = cv.VideoCapture(0)

# Mediapipe parametes
with mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
) as face_mesh:

    # B: count how many frames the user seems to be going to nap (half closed eyes)
    drowsy_frames = 0

    # C: max height of each eye
    max_left = 0
    max_right = 0

    while True:

        # get every frame from the web-cam
        ret, frame = cap.read()
        if not ret:
            break

        # Get the current frame and collect the image information
        frame = cv.flip(frame, 1)
        rgb_frame = cv.cvtColor(frame, cv.COLOR_BGR2RGB)
        img_h, img_w = frame.shape[:2]

        # D: collect the mediapipe results
        results = face_mesh.process(rgb_frame)

        # E: if mediapipe was able to find any landmanrks in the frame...
        if results.multi_face_landmarks:

            # F: collect all [x,y] pairs of all facial landamarks
            all_landmarks = np.array([np.multiply([p.x, p.y], [img_w, img_h]).astype(int) for p in results.multi_face_landmarks[0].landmark])

            # G: right and left eye landmarks
            right_eye = all_landmarks[RIGHT_EYE]
            left_eye = all_landmarks[LEFT_EYE]
            mouth = all_landmarks[mouth_idxs]

            # H: draw only landmarks of the eyes over the image
            cv.polylines(frame, [left_eye], True, (0,255,0), 1, cv.LINE_AA)
            cv.polylines(frame, [right_eye], True, (0,255,0), 1, cv.LINE_AA) 
            cv.polylines(frame, [mouth], True, (0,255,0), 1, cv.LINE_AA) 

            # I: estimate eye-height for each eye
            len_left = open_len(right_eye)
            len_right = open_len(left_eye)

            # J: keep highest distance of eye-height for each eye
            if len_left > max_left:
                max_left = len_left

            if len_right > max_right:
                max_right = len_right

            # print on screen the eye-height for each eye
            #cv.putText(img=frame, text='Max: ' + str(max_left)  + ' Left Eye: ' + str(len_left), fontFace=0, org=(10, 30), fontScale=0.5, color=(0, 255, 0))
            #Scv.putText(img=frame, text='Max: ' + str(max_right)  + ' Right Eye: ' + str(len_right), fontFace=0, org=(10, 50), fontScale=0.5, color=(0, 255, 0))

            # K: condition: if eyes are half-open the count.
            if (len_left <= int(max_left / 2) + 1 and len_right <= int(max_right / 2) + 1):
                drowsy_frames += 1
            else:
                drowsy_frames = 0

            # L: if count is above k, that means the person has drowsy eyes for more than k frames.
            if (drowsy_frames > 20):
                cv.putText(img=frame, text='ALERT', fontFace=0, org=(200, 300), fontScale=3, color=(0, 255, 0), thickness = 3)


        cv.imshow('img', frame)
        key = cv.waitKey(1)
        if key == ord('q'):
            break

cap.release()
cv.destroyAllWindows()