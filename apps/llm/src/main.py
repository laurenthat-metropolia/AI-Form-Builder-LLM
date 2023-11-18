import os

import cv2

import numpy as np
import requests
from dotenv import load_dotenv
from icecream import ic
from roboflow import Roboflow
from ultralytics import YOLO
from fastapi import FastAPI, status
from PIL import Image
from fastapi.responses import JSONResponse


load_dotenv()
version = os.getenv("APP_BUILD_VERSION", "development")
env = os.getenv("APP_ENV", "development")
is_production = env == "production"
is_development = not is_production

print(f"Starting Version: \"{version}\" Environment: \"{env}\"")


app = FastAPI()
subapi = FastAPI()
app.mount("/llm", subapi)


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
        results = prediction.json()
        prediction_results = results['predictions']

        output = []
        for prediction_result in prediction_results:
            del prediction_result['image_path']
            del prediction_result['prediction_type']
            x1 = prediction_result.get('x') - prediction_result.get('width') / 2
            y1 = prediction_result.get('y') - prediction_result.get('height') / 2
            x2 = x1 + prediction_result.get('width')
            y2 = y1 + prediction_result.get('height')
            prediction_result['coordinates'] = [x1, y1, x2, y2]
            output.append(prediction_result)

        sorted_output = sorted(output, key=lambda x: x["y"])

        return sorted_output


class LocalModel:
    def __init__(self, local_model_name):
        self.local_model_name = local_model_name
        self.local_model = YOLO(f"models/{local_model_name}")

    def predict(self, image_path: Image, confidence: int = 40, overlap: int = 30):
        image_data: Image = Image.open(image_path)

        # Perform object detection on the image data
        results = self.local_model.predict(image_data, conf=confidence / 100)
        # Loop through the detected objects and print the possibilities
        detected_objects = []

        for result in results:
            for box in result.boxes:
                for i, class_conf in enumerate(box.cls):
                    class_id = int(class_conf.item())
                    prediction_class = result.names[class_id]
                    coordinates = box.xyxy[i].tolist()
                    coordinates = [round(x) for x in coordinates]

                    confidence = round(box.conf[i].item(), 2)
                    x1, y1, x2, y2 = coordinates
                    x = min(x1, x2)
                    y = min(y1, y2)
                    width = abs(x2 - x1)
                    height = abs(y2 - y1)

                    detected_objects.append({
                        "x": x,
                        "y": y,
                        "width": width,
                        "height": height,
                        "confidence": confidence,
                        "class": prediction_class,
                        "class_id": class_id,
                        "coordinates": coordinates
                    })

        sorted_output = sorted(detected_objects, key=lambda x: x["y"])
        return sorted_output


def download_image(image_url: str, file_path: str):
    # Send an HTTP GET request to the image URL
    response = requests.get(image_url)
    # Check if the request was successful (status code 200)
    if response.status_code == 200:
        # Open a binary file with the specified file name to write the image content
        with open(file_path, 'wb') as file:
            file.write(response.content)
            print(f'Image downloaded as {file_path} successfully.')
            return True
    else:
        print('Failed to download the image. Status code:', response.status_code)
        return False


roboflow_model_d1 = RoboflowModel(project_name="html-merged-comps", project_version=4)
local_model_d1 = LocalModel("2023-11-08-22-40-best-e50.pt")
local_model_d2 = LocalModel("2023-11-10-6-38-best-e50-initial-model.pt")

models = {
    "roboflow": roboflow_model_d1,
    "2023-11-08-22-40-best-e50": local_model_d1,
    "2023-11-10-6-38-best-e50-initial-model": local_model_d2
}


@subapi.post('/predict')
async def get_image_info(
        model_name: str,
        image_url: str,
        confidence: int = 40,
        overlap: int = 30
):
    try:
        if models.get(model_name) is None:
            content = {"message": f"Model '{model_name}' does not exist."}
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=content)
        else:
            print(f"Model '{model_name}' exists.")

            model = models.get(model_name)

            image_name = os.path.basename(image_url)
            image_path = f"{os.getcwd()}/images/{image_name}"

            print(f"Downloading Image ${image_url}.")
            if is_development:
                download_url = image_url
            else:
                download_url = image_url.replace("https://draw2form.ericaskari.com", "http://localhost:80")

            if not download_image(download_url, image_path):
                content = {"message": f"Image '{image_url}' cannot be downloaded."}
                return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=content)

            print(f"Image ${image_url} Downloaded successfully.")
            prediction = model.predict(image_path, confidence=confidence, overlap=overlap)
            return JSONResponse(status_code=status.HTTP_200_OK, content=prediction)
    except Exception as e:
        print(e)
        content = {"message": "Something went wrong!"}
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=content)


def convert_from_cv2_to_image(img: np.ndarray) -> Image:
    # return Image.fromarray(img)
    return Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))


def convert_from_image_to_cv2(img: Image) -> np.ndarray:
    # return np.asarray(img)
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
