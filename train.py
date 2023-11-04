import os

import torch
from ultralytics import YOLO
from roboflow import Roboflow
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.

apikey = os.getenv("APP_ROBEFLOW_API_KEY")  # ****
version = os.getenv("APP_ROBEFLOW_DATASET_VERSION")  # 2
epochs = os.getenv("APP_EPOCHS")  # 2
baseModel = os.getenv("APP_IMAGE_BASE")  # yolov8n.pt
imgsz = os.getenv("APP_IMAGE_SIZE")  # 224

rf = Roboflow(api_key=apikey)

project = rf.workspace().project(project_name="draw2form")

dataset = project.version(version).download(model_format="yolov8", location="dataset", overwrite=True)

if __name__ == "__main__":
    print(torch.cuda.is_available())
    model = YOLO(baseModel)
    model.train(data=os.path.join(os.getcwd(), 'dataset', "data.yaml"), epochs=epochs, model=baseModel, imgsz=imgsz)
