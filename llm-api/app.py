import json
import time
from typing import Annotated
import os
import io

import requests
from dotenv import load_dotenv
from icecream import ic
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
from fastapi import FastAPI, File, UploadFile, status
from PIL import Image
from fastapi.responses import JSONResponse

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
model_path = "models/model-v2-e5-2023-11-06-08-20.pt"
model = YOLO(model_path)
load_dotenv()

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

async  def get_text_info(name):
    image_url = f"https://draw2form-llm.ericaskari.com/static/{name}"
    ic(image_url)
    data = {'url': image_url}
    response = requests.post(text_recognition_url, headers=headers, json=data)
    response.raise_for_status()

    # Holds the URI used to retrieve the recognized text.
    # operation_url = response.headers["Operation-Location"]

    # The recognized text isn't immediately available, so poll to wait for completion.
    analysis = {}
    poll = True
    while (poll):
        response_final = requests.get(
            response.headers["Operation-Location"], headers=headers)
        analysis = response_final.json()

        print(json.dumps(analysis, indent=4))

        time.sleep(1)
        if ("analyzeResult" in analysis):
            poll = False
        if ("status" in analysis and analysis['status'] == 'failed'):
            poll = False

    polygons = []
    if ("analyzeResult" in analysis):
        # Extract the recognized text, with bounding boxes.
        polygons = [(line["boundingBox"], line["text"])
                    for line in analysis["analyzeResult"]["readResults"][0]["lines"]]
    return polygons

@app.post('/image-info')
async def get_image_info(image: UploadFile):
    try:
        name = image.filename
        image = Image.open(io.BytesIO(await image.read()))
        image.save(f"static/{name}")

        text_info = await get_text_info(name)
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
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,content=content)
