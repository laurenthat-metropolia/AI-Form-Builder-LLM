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

roboflow_apikey = os.getenv("APP_ROBOFLOW_API_KEY")  # ****
roboflow_instance = Roboflow(api_key=roboflow_apikey)
roboflow_project = roboflow_instance.workspace().project("html-merged-comps")
roboflow_model = roboflow_project.version(4).model

local_model_name = "2023-11-08-22-40-best-e50.pt"
local_model = YOLO(f"models/{local_model_name}")

app = FastAPI()
subapi = FastAPI()
app.mount("/llm", subapi)

subapi.mount("/static", StaticFiles(directory="static"), name="static")

load_dotenv()

server_address = os.environ['APP_SERVER_ADDR']

computer_vision_subscription_key = os.environ['COMPUTER_VISION_KEY']
computer_vision_endpoint = os.environ['COMPUTER_VISION_ENDPOINT']
computer_vision_text_recognition_url = f"{computer_vision_endpoint}vision/v3.1/read/analyze"
computer_vision_headers = {'Ocp-Apim-Subscription-Key': computer_vision_subscription_key}


def predict_roboflow(image_url, confidence: int = 40, overlap: int = 30):
    prediction = roboflow_model.predict(image_url, confidence=confidence, overlap=overlap)

    extension = pathlib.Path(image_url).suffix
    preview_url = f'static/{uuid4()}{extension}'
    prediction.save(preview_url)

    results = prediction.json()
    results['preview_url'] = f"{server_address}/{preview_url}"
    return results


def predict_local(image_data: Image, confidence: int = 50):
    # Perform object detection on the image data
    results = local_model.predict(image_data, conf=confidence / 100)
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
                cv2.putText(preview_image, label, (x_min, y_min - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,0,0), 1)

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
        "model_name": local_model_name,
        "predictions": detected_objects,
        "preview_url": f"{server_address}/{preview_url}"
    }


async def predict_text_azure(local_image_url: str, client: AsyncClient):
    data = {'url': f"{server_address}/{local_image_url}"}
    ic(data)
    response: Response = await client.post(computer_vision_text_recognition_url, headers=computer_vision_headers,
                                           json=data, timeout=10.0)
    ic(response.headers)
    operation_url = response.headers["Operation-Location"]

    # Holds the URI used to retrieve the recognized text.
    # operation_url = response.headers["Operation-Location"]

    # The recognized text isn't immediately available, so poll to wait for completion.
    analysis = {}
    poll = True
    while poll:
        response_final = await client.get(operation_url, headers=computer_vision_headers, timeout=10.0)
        analysis = response_final.json()

        await asyncio.sleep(1)

        if "analyzeResult" in analysis:
            poll = False
        if "status" in analysis and analysis['status'] == 'failed':
            poll = False
        ic("Still waiting for Azure")

    predictions = []
    if "analyzeResult" in analysis:
        lines = analysis["analyzeResult"]["readResults"][0]["lines"]
        preview_image = cv2.imread(local_image_url)

        for line in lines:
            coordinates = line["boundingBox"]
            text = line["text"]
            predictions.append({
                "text": text,
                "coordinates": coordinates
            })

            points = [(coordinates[i], coordinates[i + 1]) for i in range(0, len(coordinates), 2)]
            points = np.array(points, np.int32).reshape((-1, 1, 2))
            cv2.polylines(preview_image, [points], isClosed=True, color=(138,54,15), thickness=1)
            x, y = points[-1][0][0], points[-1][0][1]
            label = f"{text}"
            cv2.putText(preview_image, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (138,54,15), 1)

        preview_url = f'static/{uuid4()}.jpg'
        cv2.imwrite(preview_url, preview_image)

        return {
            "predictions": predictions,
            "preview_url": f"{server_address}/{preview_url}"
        }



@subapi.get('/image-info')
async def get_image_info():
    return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content="Did you mean to send a POST request?")



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

    text_prediction = await predict_text_azure(image_url, client)
    roboflow_prediction = predict_roboflow(image_url, confidence=roboflow_confidence, overlap=roboflow_overlap)
    local_prediction = predict_local(image, confidence=local_confidence)

    response = {
        "roboflow_prediction": roboflow_prediction,
        "local_prediction": local_prediction,
        "text_prediction": text_prediction
    }

    return response


def convert_from_cv2_to_image(img: np.ndarray) -> Image:
    # return Image.fromarray(img)
    return Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))


def convert_from_image_to_cv2(img: Image) -> np.ndarray:
    # return np.asarray(img)
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)



