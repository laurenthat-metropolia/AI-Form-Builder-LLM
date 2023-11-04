import os

import torch
from ultralytics import YOLO
from roboflow import Roboflow
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.

rf = Roboflow(api_key=os.getenv("APP_ROBEFLOW_API_KEY"))

project = rf.workspace().project(project_name="draw2form")

dataset = project.version(1).download(model_format="yolov8", location="dataset", overwrite=True)


if __name__ == "__main__":
    print(torch.cuda.is_available())
    model = YOLO("yolov8n.pt")
    model.train(data=os.path.join(os.getcwd(), 'dataset', "data.yaml"),epochs=2,model="yolov8n.pt", imgsz=224)
