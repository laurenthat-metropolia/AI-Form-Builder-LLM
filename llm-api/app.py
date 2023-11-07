import os
import io

import httpx
from dotenv import load_dotenv
from httpx import AsyncClient, Response
from icecream import ic
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
from fastapi import FastAPI, File, UploadFile, status
from PIL import Image
from fastapi.responses import JSONResponse
import asyncio

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
model_path = "models/model-v2-e5-2023-11-06-08-20.pt"
model = YOLO(model_path)
load_dotenv()

server_address = os.environ['APP_SERVER_ADDR']

subscription_key = os.environ['COMPUTER_VISION_KEY']

endpoint = os.environ['COMPUTER_VISION_ENDPOINT']

text_recognition_url = endpoint + "vision/v3.1/read/analyze"

headers = {'Ocp-Apim-Subscription-Key': subscription_key}


def predict_and_print(confidence, image_data):
    # Perform object detection on the image data
    results = model.predict(image_data, conf=confidence)

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

                # x_min, y_min, x_max, y_max = [int(coord) for coord in coordinates]

                detected_objects.append({
                    "type": class_id,
                    "probability": probability,
                    "coordinates": coordinates
                })
                # print("Detected objects")
                # print(detected_objects)

    return detected_objects


async def get_text_info(name: str, client: AsyncClient):
    image_url = f"{server_address}/static/{name}"
    data = {'url': image_url}
    response: Response = await client.post(text_recognition_url, headers=headers, json=data, timeout=10.0)
    operation_url = response.headers["Operation-Location"]

    # Holds the URI used to retrieve the recognized text.
    # operation_url = response.headers["Operation-Location"]

    # The recognized text isn't immediately available, so poll to wait for completion.
    analysis = {}
    poll = True
    while (poll):
        response_final = await client.get(operation_url, headers=headers, timeout=10.0)
        analysis = response_final.json()

        await asyncio.sleep(1)

        if ("analyzeResult" in analysis):
            poll = False
        if ("status" in analysis and analysis['status'] == 'failed'):
            poll = False
        ic("Still waiting for Azure")

    polygons = []
    if ("analyzeResult" in analysis):
        # Extract the recognized text, with bounding boxes.
        polygons = [(line["boundingBox"], line["text"])
                    for line in analysis["analyzeResult"]["readResults"][0]["lines"]]
    return polygons


@app.post('/image-info')
async def get_image_info(image: UploadFile):
    async with httpx.AsyncClient() as client:
        try:
            name = image.filename
            image = Image.open(io.BytesIO(await image.read()))
            image.save(f"static/{name}")

            text_info = await get_text_info(name, client)
            image_info = {
                "width": image.width,
                "height": image.height,
                "format": image.format,
                "mode": image.mode,
            }

            conf = 0.5

            detected_objects = predict_and_print(conf, image)

            response = {
                "model_path": model_path,
                "image_info": image_info,
                "detected_objects": detected_objects,
                "text_info": text_info
            }

            return response
        except Exception as e:
            ic(e)
            content = {"message": "Something went wrong!"}
            return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=content)
