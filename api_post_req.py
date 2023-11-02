import requests
from flask import Flask, request, jsonify

app = Flask(__name__)
url = 'http://127.0.0.1:8000/my-image-info'
files = {'image': ('images/wireframe-6.jpeg', open('images/wireframe-6.jpeg', 'rb'))}

response = requests.post(url, files=files)

if response.status_code == 200:
    data = response.json()
    print(data)
else:
    print(f"Error: {response.status_code} - {response.text}")
