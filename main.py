import os
from icecream import ic
from ultralytics import YOLO
import cv2


def predict_and_print(model_path, confidence, image_path):
    model = YOLO(model_path)
    results = model.predict(image_path, conf=confidence)

    # Loop through the detected objects and print the possibilities
    image = cv2.imread(image_path)

    ic(len(results))
    for result in results:
        # ic(result)
        # ic(result.boxes)
        ic(len(result.boxes))
        for box in result.boxes:
            ic(len(box.cls))
            for i, class_conf in enumerate(box.cls):
                class_id = result.names[class_conf.item()]
                coordinates = box.xyxy[i].tolist()
                coordinates = [round(x) for x in coordinates]

                probability = round(box.conf[i].item(), 2)
                print("Object type:", class_id)
                print("Coordinates:", coordinates)
                print("Probability:", probability)
                print("---")

                # Extract coordinates
                x_min, y_min, x_max, y_max = [int(coord) for coord in coordinates]
                # Draw a red rectangle around the detected object
                cv2.rectangle(image, (x_min, y_min), (x_max, y_max), (0, 0, 255), 2)
                # Display class name
                label = class_id + ": " + str(probability)
                cv2.putText(image, label, (x_min, y_min - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

    # Display the image (optional)
    cv2.imshow("Image with Red Borders", image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


model_path = "models/2023-11-01-10-41-best-e5-detect.pt"
confidence = 0.5

predict_and_print(model_path, confidence, "images/wireframe-6.jpeg")
predict_and_print(model_path, confidence, "images/two.png")
predict_and_print(model_path, confidence, "images/button-1.png")
predict_and_print(model_path, confidence, "images/button-0116.jpg")
predict_and_print(model_path, confidence, "images/g4.png")
predict_and_print(model_path, confidence, "images/img_1.png")
predict_and_print(model_path, confidence, "images/img_2.png")
predict_and_print(model_path, confidence, "images/img_3.png")
predict_and_print(model_path, confidence, "images/wireframe.jpeg")
predict_and_print(model_path, confidence, "images/wireframe-1.png")
predict_and_print(model_path, confidence, "images/wireframe-2.jpeg")
predict_and_print(model_path, confidence, "images/wireframe-4.jpeg")
predict_and_print(model_path, confidence, "images/wireframe-5.png")












