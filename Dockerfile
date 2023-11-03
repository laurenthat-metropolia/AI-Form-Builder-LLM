FROM ultralytics/ultralytics:8.0.158-python

WORKDIR /src

RUN pip3 install fastapi uvicorn opencv-python-headless numpy icecream python-multipart


COPY app.py app.py
COPY models/2023-11-01-10-41-best-e5-detect.pt models/2023-11-01-10-41-best-e5-detect.pt

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]

EXPOSE 8000
