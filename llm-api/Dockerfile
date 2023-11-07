FROM ultralytics/ultralytics:8.0.158-python

WORKDIR /src

RUN pip3 install fastapi uvicorn opencv-python-headless numpy icecream python-multipart python-dotenv httpx


COPY app.py app.py
COPY models models
RUN mkdir static
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]

EXPOSE 8000
