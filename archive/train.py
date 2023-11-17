import os

import torch
from ultralytics import YOLO
from roboflow import Roboflow
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.

apikey = os.getenv("APP_ROBOFLOW_API_KEY")  # ****
version = os.getenv("APP_ROBOFLOW_DATASET_VERSION")  # 2
project_name = os.getenv("APP_ROBOFLOW_PROJECT_NAME")  # 2
workspace = os.getenv("APP_ROBOFLOW_WORKSPACE")  # 2
epochs = os.getenv("APP_EPOCHS")  # 2
base_model = os.getenv("APP_IMAGE_BASE")  # yolov8n.pt
imgsz = os.getenv("APP_IMAGE_SIZE")  # 224
modelFormat = os.getenv("APP_ROBOFLOW_MODEL_FORMAT")  # yolov8

rf = Roboflow(api_key=apikey)

project = rf.workspace(workspace).project(project_name=project_name)

dataset = project.version(int(version)).download(model_format=modelFormat, location="dataset", overwrite=True)

data = os.path.join(os.getcwd(), 'dataset', "data.yaml")

if __name__ == "__main__":
    print(torch.cuda.is_available())
    model = YOLO(base_model)
    model.train(data=data, epochs=int(epochs), model=base_model, imgsz=int(imgsz))
