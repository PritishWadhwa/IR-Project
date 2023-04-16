# import requests


# def get_image_url(text):
#     try:
#         r = requests.post(
#             "https://api.deepai.org/api/text2img",
#             data={
#                 'text': text,
#             },
#             headers={'api-key': 'quickstart-QUdJIGlzIGNvbWluZy4uLi4K'}
#         )
#         print(r.json())
#         return r.json()['output_url']
#     except Exception as e:
#         print(e)
#         return "https://i.imgur.com/5YQZ2Zb.jpg"

import requests
import io
import base64
from PIL import Image

API_URL = "https://api-inference.huggingface.co/models/cloudqi/cqi_text_to_image_pt_v0"
headers = {"Authorization": "Bearer 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"}


def get_image_url(text):
    try:
        print("Started Image Generation")
        payload = {"inputs": text, }
        print("zero")
        response = requests.post(API_URL, headers=headers, json=payload)
        print("one")
        img_bytes = response.content
        print('two')
        img_b64 = base64.b64encode(img_bytes).decode('utf-8')
        return img_b64

    except Exception as e:
        print(e)
        return "Error"
