import os
from icecream import ic
from ultralytics import YOLO
import cv2
from flask import Flask, request, jsonify
from PIL import Image
import io

app = Flask(__name__)


def predict_and_print(model_path, confidence, image_data):
    model = YOLO(model_path)

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

                x_min, y_min, x_max, y_max = [int(coord) for coord in coordinates]

                detected_objects.append({
                    "class_id": class_id,
                    "probability": probability
                })
                # print("Detected objects")
                # print(detected_objects)

    return detected_objects


@app.route('/image-info', methods=['POST'])
def get_image_info():
    if 'image' not in request.files:
        return jsonify({"error": "No file part"})

    image_file = request.files['image']

    if image_file.filename == '':
        return jsonify({"error": "No selected file"})

    path = "models/2023-11-01-10-41-best-e5-detect.pt"
    conf = 0.5

    try:
        image = Image.open(io.BytesIO(image_file.read()))
        # print("Image_detail:", image.info)
        # print("Image_detail:", image.width)
        # print("Image_detail:", image.height)
        # print("Image_detail:", image.format)
        # print("Image_detail:", image.mode)

        image_info = {
            "width": image.width,
            "height": image.height,
            "format": image.format,
            "mode": image.mode,
        }
        # print("img: ", image_info)

        detected_objects = predict_and_print(path, conf, image)

        response = {
            "image_info": image_info,
            "detected_objects": detected_objects
        }

        # print("Response: ")
        # print(response)

        return jsonify(response)
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": f"Failed to process the image: {str(e)}"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80, debug=True)
