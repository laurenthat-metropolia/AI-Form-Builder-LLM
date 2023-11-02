FROM ultralytics/ultralytics:8.0.158-python

WORKDIR /src

RUN pip3 install flask icecream

COPY main.py main.py
COPY models/2023-11-01-10-41-best-e5-detect.pt models/2023-11-01-10-41-best-e5-detect.pt

CMD ["python3", "main.py"]
