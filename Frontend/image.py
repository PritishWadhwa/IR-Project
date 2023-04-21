import time
from PIL import Image
import base64
import io
import requests


def get_image_url(text, count):
    if (count == 0):
        return "Error"
    try:
        r = requests.post(
            "https://api.deepai.org/api/text2img",
            data={
                'text': text,
            },
            headers={'api-key': 'quickstart-QUdJIGlzIGNvbWluZy4uLi4K'}
        )
        print(r.json())
        return r.json()['output_url']
    except Exception as e:
        print(e)
        return get_image_url(text, count - 1)
        # return "Error"


# API_URL = "https://api-inference.huggingface.co/models/cloudqi/cqi_text_to_image_pt_v0"
# headers = {"Authorization": "Bearer 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"}
# invalid = "eyJlcnJvciI6Ik1vZGVsIGNsb3VkcWkvY3FpX3RleHRfdG9faW1hZ2VfcHRfdjAgaXMgY3VycmVudGx5IGxvYWRpbmciLCJlc3RpbWF0ZWRfdGltZSI6MjAuMH0="


# def get_image_url(text, count):
#     try:
#         if (count == 0):
#             return "Error"
#         print("Started Image Generation")
#         payload = {"inputs": text, }
#         response = requests.post(API_URL, headers=headers, json=payload)
#         img_bytes = response.content
#         img_b64 = base64.b64encode(img_bytes).decode('utf-8')
#         if (img_b64 == invalid):
#             time.sleep(2)
#             return get_image_url(text, count - 1)
#         print("Ended Image Generation")
#         return img_b64

#     except Exception as e:
#         print(e)
#         return "Error"
