from flask import Flask, request
from flask_cors import CORS
import tensorflow as tf
import urllib
from PIL import Image
import numpy as np
import face_recognition

import mediapipe as mp
import pandas as pd
import matplotlib.pyplot as plt
from mediapipe.python.solutions.drawing_utils import _normalized_to_pixel_coordinates as denormalize_coordinates
import cv2

app = Flask(__name__)
CORS(app)

im = cv2.imread("test-close-eyes.jpg")[:, :, ::-1]

# Meidapipe drawing utilities
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles
mp_facemesh = mp.solutions.face_mesh
denormalize_coordinates = mp_drawing._normalized_to_pixel_coordinates

#Eyes landmark points

all_left_eye_idxs = list(mp_facemesh.FACEMESH_LEFT_EYE)
# flatten and remove duplicates
all_left_eye_idxs = set(np.ravel(all_left_eye_idxs)) 
 
# Landmark points corresponding to right eye
all_right_eye_idxs = list(mp_facemesh.FACEMESH_RIGHT_EYE)
all_right_eye_idxs = set(np.ravel(all_right_eye_idxs))
 
# Combined for plotting - Landmark points for both eye
all_idxs = all_left_eye_idxs.union(all_right_eye_idxs)
 
# The chosen 12 points:   P1,  P2,  P3,  P4,  P5,  P6
chosen_left_eye_idxs  = [362, 385, 387, 263, 373, 380]
chosen_right_eye_idxs = [33,  160, 158, 133, 153, 144]
all_chosen_idxs = chosen_left_eye_idxs + chosen_right_eye_idxs

#Landmark points corresponding to Mouth
#             p1  p2  p3  p4  p5   p6   p7   p8
mouth_idxs = [61, 39, 0, 269, 291, 405, 17, 181]

def init():
    global mouth_model, eye_model
    mouth_model = tf.keras.models.load_model('models/yawning_model.h5')
    eye_model = tf.keras.models.load_model('models/eyes_model.h5')
    print("***model loaded***")

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
 
        #Mouth landmark (x, y)-coordinates
        P2_P8 = distance(coords_points[1], coords_points[7])
        P3_P7 = distance(coords_points[2], coords_points[6])
        P4_P6 = distance(coords_points[3], coords_points[5])
        P1_P5 = distance(coords_points[0], coords_points[4])
 
        # Compute the mouth aspect ratio
        mar = (P2_P8 + P3_P7 + P4_P6) / (3.0 * P1_P5)
 
    except:
        mar = 0.0
        coords_points = None
 
    return mar, coords_points

def detectDrowsiness(image):

    images  = image
    EAR = 0
    MAR = 0
    Drowsy = False

    for idx, image in enumerate([images]):
        
        image = np.ascontiguousarray(image)
        imgH, imgW, _ = image.shape
    
        # Creating a copy of the original image for plotting the EAR value
        custom_chosen_lmk_image = image.copy()
    
        # Running inference using static_image_mode
        with mp_facemesh.FaceMesh(refine_landmarks=True) as face_mesh:
            results = face_mesh.process(image).multi_face_landmarks
    
            # If detections are available.
            if results:
                for face_id, face_landmarks in enumerate(results):
                    landmarks = face_landmarks.landmark
                    EAR, _ = calculate_avg_ear(
                            landmarks, 
                            chosen_left_eye_idxs, 
                            chosen_right_eye_idxs, 
                            imgW, 
                            imgH
                        )
                    MAR, _ = get_mar(
                            landmarks, 
                            mouth_idxs,
                            imgW, 
                            imgH
                    )

                print(EAR)
                print(MAR)
                
                if (EAR > 0.20 and MAR < 0.6):
                    Drowsy = False
                elif (EAR < 0.2 or MAR > 0.6):
                    Drowsy = True
                
    
    print("Face Mesh Results")
    print(Drowsy)
    return Drowsy

@app.route('/predict', methods=['POST', 'GET'])
def predict():
    print("running prediction")
    # load image
    data = request.get_json(force=True)["img"]
    response = urllib.request.urlopen(data)
    image = Image.open(response).convert("RGB")

    #FaceMesh Classification
    Drowsy = detectDrowsiness(image)

    # yawning model
    img_yawn = image.resize((224, 224))
    x = tf.keras.utils.img_to_array(img_yawn)
    x = x / 255.0
    x = np.expand_dims(x, axis=0)
    images = np.vstack([x])
    yawning = mouth_model.predict(images)
    print("Yawning: " + str(yawning[0][0]))

    # eye model
    eye_arr = np.array(image)
    face_landmarks_list = face_recognition.face_landmarks(eye_arr)
    eyes = []
    eyeData = 0
    try:
        eyes.append(face_landmarks_list[0]['left_eye'])
        eyes.append(face_landmarks_list[0]['right_eye'])
    except:
        pass
    for eye in eyes:
        x_max = max([coordinate[0] for coordinate in eye])
        x_min = min([coordinate[0] for coordinate in eye])
        y_max = max([coordinate[1] for coordinate in eye])
        y_min = min([coordinate[1] for coordinate in eye])
        x_range = x_max - x_min
        y_range = y_max - y_min
        if x_range > y_range:
            right = round(.5*x_range) + x_max
            left = x_min - round(.5*x_range)
            bottom = round(((right-left) - y_range))/2 + y_max
            top = y_min - round(((right-left) - y_range))/2
        else:
            bottom = round(.5*y_range) + y_max
            top = y_min - round(.5*y_range)
            right = round(((bottom-top) - x_range))/2 + x_max
            left = x_min - round(((bottom-top) - x_range))/2
        im = image.crop((left, top, right, bottom))
        im = im.resize((80, 80))
        x = tf.keras.utils.img_to_array(im)
        x = x / 255.0
        x = np.expand_dims(x, axis=0)
        images = np.vstack([x])
        eyes = eye_model.predict(images)
        eyeData += (1-eyes[0][0])
    print("Closed eyes: " + str(eyeData/2))

    return {"yawnning": int(yawning[0][0]*100), "eyes": int(eyeData/2*100), "faceMeshResults": Drowsy}

if __name__ == "__main__":
    print(("* Loading Keras model and Flask starting server..."
           "please wait until server has fully started"))
    init()
    app.run(debug=True, host="0.0.0.0", use_reloader=True)
