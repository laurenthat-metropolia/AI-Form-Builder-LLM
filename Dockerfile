FROM ultralytics/ultralytics:8.0.158-python

WORKDIR /src

RUN pip3 install flask icecream uwsgi

COPY main.py main.py
COPY app.ini app.ini

COPY models/2023-11-01-10-41-best-e5-detect.pt models/2023-11-01-10-41-best-e5-detect.pt

RUN adduser uwsgi

USER uwsgi

CMD ["uwsgi", "--ini", "app.ini"]