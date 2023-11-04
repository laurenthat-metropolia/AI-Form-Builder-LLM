import os

import torch
from ultralytics import YOLO

if __name__ == "__main__":
    print(torch.cuda.is_available())
    model = YOLO("yolov8n.pt")
    model.train(data=os.path.join(os.getcwd(), 'dataset', "data.yaml"),epochs=2,model="yolov8n.pt", imgsz=224)
