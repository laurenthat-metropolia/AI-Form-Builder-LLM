import os
import io

import cv2
import httpx
import asyncio
import pathlib

from uuid import uuid4

import numpy as np
from dotenv import load_dotenv
from httpx import AsyncClient, Response
from icecream import ic
from fastapi.staticfiles import StaticFiles
from roboflow import Roboflow
from ultralytics import YOLO
from fastapi import FastAPI, File, UploadFile, status
from PIL import Image
from fastapi.responses import JSONResponse

app = FastAPI()
subapi = FastAPI()
app.mount("/llm", subapi)

subapi.mount("/static", StaticFiles(directory="static"), name="static")

load_dotenv()

server_address = os.environ['APP_SERVER_ADDR']

class RoboflowModel:
    def __init__(self, project_name: str, project_version: int,
                 roboflow_apikey: str = os.getenv("APP_ROBOFLOW_API_KEY")):
        self.project_name = project_name
        self.project_version = project_version
        self.roboflow_instance = Roboflow(api_key=roboflow_apikey)
        self.roboflow_project = self.roboflow_instance.workspace().project(project_name)
        self.roboflow_model = self.roboflow_project.version(project_version).model

    def predict(self, image_url, confidence: int = 40, overlap: int = 30):
        prediction = self.roboflow_model.predict(image_url, confidence=confidence, overlap=overlap)

        extension = pathlib.Path(image_url).suffix
        preview_url = f'static/{uuid4()}{extension}'
        prediction.save(preview_url)

        results = prediction.json()
        results['model_name'] = self.project_name
        results['model_version'] = self.project_version
        results['preview_url'] = f"{server_address}/{preview_url}"
        return results


class LocalModel:
    def __init__(self, local_model_name):
        self.local_model_name = local_model_name
        self.local_model = YOLO(f"models/{local_model_name}")

    def predict(self, image_data: Image, confidence: int = 50):
        # Perform object detection on the image data
        results = self.local_model.predict(image_data, conf=confidence / 100)
        preview_image = convert_from_image_to_cv2(image_data)

        # Loop through the detected objects and print the possibilities
        ic(len(results))
        detected_objects = []

        for result in results:
            for box in result.boxes:
                for i, class_conf in enumerate(box.cls):
                    class_id = result.names[class_conf.item()]
                    coordinates = box.xyxy[i].tolist()
                    coordinates = [round(x) for x in coordinates]

                    probability = round(box.conf[i].item(), 2)

                    x_min, y_min, x_max, y_max = [int(coord) for coord in coordinates]
                    cv2.rectangle(preview_image, (x_min, y_min), (x_max, y_max), (0, 0, 0), 1)
                    # Add label with class and probability
                    label = f"{class_id}: {probability}"
                    cv2.putText(preview_image, label, (x_min, y_min - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0),
                                1)

                    detected_objects.append({
                        "type": class_id,
                        "probability": probability,
                        "coordinates": coordinates
                    })
                    # print("Detected objects")
                    # print(detected_objects)

        preview_url = f'static/{uuid4()}.jpg'
        cv2.imwrite(preview_url, preview_image)
        return {
            "model_name": self.local_model_name,
            "predictions": detected_objects,
            "preview_url": f"{server_address}/{preview_url}"
        }

roboflow_model_d1 = RoboflowModel(project_name="html-merged-comps", project_version=4)
local_model_d1 = LocalModel("2023-11-08-22-40-best-e50.pt")
local_model_d2 = LocalModel("2023-11-10-6-38-best-e50-initial-model.pt")


@subapi.post('/image-info')
async def get_image_info(
        image: UploadFile,
        local_confidence: int = 50,
        roboflow_confidence: int = 40,
        roboflow_overlap: int = 30
):
    async with httpx.AsyncClient() as client:
        try:
            return await process_get_image_info(
                image,
                client,
                local_confidence=local_confidence,
                roboflow_confidence=roboflow_confidence,
                roboflow_overlap=roboflow_overlap
            )
        except Exception as e:
            ic(e)
            content = {"message": "Something went wrong!"}
            return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=content)


async def process_get_image_info(
        uploaded_file: UploadFile,
        client: AsyncClient,
        local_confidence: int,
        roboflow_confidence: int,
        roboflow_overlap: int
):
    image: Image = Image.open(io.BytesIO(await uploaded_file.read()))

    extension = pathlib.Path(uploaded_file.filename).suffix
    name = f'{uuid4()}{extension}'
    image.save(f"static/{name}")

    image_url = f"static/{name}"

    roboflow_prediction = roboflow_model_d1.predict(image_url, confidence=roboflow_confidence, overlap=roboflow_overlap)
    local_prediction_d1 = local_model_d1.predict(image, confidence=local_confidence)
    local_prediction_d2 = local_model_d2.predict(image, confidence=local_confidence)

    response = {
        "roboflow_prediction": roboflow_prediction,
        "local_prediction_d1": local_prediction_d1,
        "local_prediction_d2": local_prediction_d2
    }

    return response


def convert_from_cv2_to_image(img: np.ndarray) -> Image:
    # return Image.fromarray(img)
    return Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))


def convert_from_image_to_cv2(img: Image) -> np.ndarray:
    # return np.asarray(img)
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
