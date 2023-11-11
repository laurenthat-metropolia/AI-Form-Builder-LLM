FROM ultralytics/ultralytics:8.0.158-python

WORKDIR /src

RUN pip3 install fastapi uvicorn opencv-python-headless numpy icecream python-multipart python-dotenv httpx roboflow


COPY app.py app.py
COPY models models
COPY static static
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]
# uvicorn app:app --port 8001 --reload
EXPOSE 8001
