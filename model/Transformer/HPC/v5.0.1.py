print("Started")

from TimeSformer.timesformer.models.vit import TimeSformer

model = TimeSformer(img_size=112, num_classes=3, num_frames=120, attention_type='divided_space_time', pretrained_model='../modelZoo/K400-96.pyth')
print("Model loaded")

import torch
import os
import cv2
import random
import numpy as np

device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
print(device)

IMG_SIZE = 112

def frames_from_video_file(video_path, MAX_SEQ_LENGTH, frame_step, output_size = (IMG_SIZE, IMG_SIZE)):
    result = []
  
    src = cv2.VideoCapture(str(video_path))  

    video_length = src.get(cv2.CAP_PROP_FRAME_COUNT)

    need_length = 1 + (MAX_SEQ_LENGTH - 1) * frame_step

    if need_length > video_length:
        start = 0
    else:
        max_start = video_length - need_length
        start = random.randint(0, max_start + 1)

    src.set(cv2.CAP_PROP_POS_FRAMES, start)
    # ret is a boolean indicating whether read was successful, frame is the image itself
    ret, frame = src.read()
    frame = cv2.resize(frame, output_size)
    result.append(frame)

    for _ in range(MAX_SEQ_LENGTH - 1):
        for _ in range(frame_step):
            ret, frame = src.read()
        if ret:
            frame = cv2.resize(frame, output_size)
            result.append(frame)
        else:
            frame = np.zeros_like(result[0])
            result.append(frame)
    src.release()
    result = np.array(result)
    return result

class VideoDataset(torch.utils.data.Dataset):
    def __init__(self, df, root_dir, MAX_SEQ_LENGTH, frame_step):
        self.video_paths = df["video-name"].values.tolist()
        self.labels = df["label"].values.tolist()
        self.n_frames = MAX_SEQ_LENGTH
        self.root_dir = root_dir
        self.frame_step = frame_step
        
    def __len__(self):
        return len(self.video_paths)
    
    def __getitem__(self, idx):
        path = self.video_paths[idx]
        label = self.labels[idx]
        frames = frames_from_video_file(os.path.join(self.root_dir, path), self.n_frames, self.frame_step)
        frames = np.float32(frames)
        frames = np.moveaxis(frames, -1, 0)
        return frames, label
    
import pandas as pd

df = pd.read_csv("../../data/mirror-data.csv")
df["Action"] = df["Action"].str.rstrip()
df = df[df.Action != "Talking&Yawning"]
df["label"] = df.Action.astype('category').cat.codes
print("CSV loaded")

i = 0
dfTrain = pd.DataFrame()
dfTest = pd.DataFrame()

while i<len(df):
    if i%5==0:
        dfTest = pd.concat([dfTest, df.iloc[[i]]])
    else :
        dfTrain = pd.concat([dfTrain, df.iloc[[i]]])
    i+=1

MAX_SEQ_LENGTH = 120
frame_step = 12

train_ds = VideoDataset(dfTrain, "../../data/YawDD/YawDD dataset/Mirror/all/", MAX_SEQ_LENGTH, frame_step)
test_ds = VideoDataset(dfTest, "../../data/YawDD/YawDD dataset/Mirror/all/", MAX_SEQ_LENGTH, frame_step)
print("Dataset loaded")

from torch.utils.data import DataLoader

train_loader = DataLoader(train_ds, batch_size=1)
val_loader = DataLoader(test_ds, batch_size=1)


import torch.optim as optim
from torch import nn
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=1e-3)

model.to(device)

num_epochs = 30

def accuracy(predictions, labels):
    classes = torch.argmax(predictions, dim=1)
    return torch.mean((classes == labels).float())

print("Start training")
for epoch in range(num_epochs):
    running_loss = 0.0
    running_acc = 0.0
    for i, data in enumerate(train_loader, 0):
        inputs, labels = data[0].to(device), data[1].to(device)
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        running_loss += loss.item()
        running_acc += accuracy(outputs, labels)
        
    print("Evaluate on validation set")
    correct = 0
    total = 0
    with torch.no_grad():
        for data in val_loader:
            inputs, labels = data[0].to(device), data[1].to(device)
            outputs = model(inputs)
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
    val_acc = 100 * correct / total
    
    print('[%d] loss: %.3f, train_Acc: %.3f, val_acc: %.3f' %
          (epoch + 1, running_loss / len(train_loader), running_acc / len(train_loader), val_acc))
    
print("Saving model")
torch.save(model.state_dict(), "./savedModel/v120f_224.pt")