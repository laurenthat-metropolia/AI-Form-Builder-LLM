from typing import Annotated
import os
import io
from icecream import ic
from ultralytics import YOLO
from fastapi import FastAPI, File, UploadFile, status
from PIL import Image
from fastapi.responses import JSONResponse

app = FastAPI()
model_path = "models/model-v2-e5-2023-11-06-08-20.pt"
model = YOLO(model_path)


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


@app.post('/image-info')
async def get_image_info(image: UploadFile):
    try:
        image = Image.open(io.BytesIO(await image.read()))

        image_info = {
            "width": image.width,
            "height": image.height,
            "format": image.format,
            "mode": image.mode,
        }

        conf = 0.5

        detected_objects = predict_and_print(conf, image)

        response = {
            "model_path": model_path
            "image_info": image_info,
            "detected_objects": detected_objects
        }

        return response
    except Exception as e:
        ic(e)
        content = {"message": "Something went wrong!"}
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,content=content)
