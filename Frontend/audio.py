import requests
import json
import time

# url = "https://large-text-to-speech.p.rapidapi.com/tts"
# headers = {
#     "content-type": "application/json",
#     # "X-RapidAPI-Key": "c5ac4d4370mshe0b8219dcd96ceep1c9d58jsn2d1c0e455411",
#     "X-RapidAPI-Key": '9872c7ac76msh345fe172c7cae73p12b10fjsn908d6c305604',
#     "X-RapidAPI-Host": "large-text-to-speech.p.rapidapi.com"
# }


# def create_job(text):
#     print(text)
#     payload = {"text": text}

#     print("Create job")
#     response = requests.request("POST", url, json=payload, headers=headers)
#     return json.loads(response.text)


# def get_audio(id):

#     print("get audio")
#     querystring = {"id": id}
#     response = requests.request(
#         "GET", url, headers=headers, params=querystring)
#     print(response.text)
#     response = json.loads(response.text)
#     if (response['status'] == 'success'):
#         return response['url']
#     elif (response['status'] == 'processing'):
#         time.sleep(10)
#         return get_audio(id)
#     else:
#         return "Error"
#
# def text_to_audio(text):
#     print("The main function")
#     result = create_job(text)
#     if (result["status"] == "success"):
#         return result["url"]
#     elif (result["status"] == "processing"):
#         return get_audio(result["id"])
#     else:
#         return "Error"

import requests

url = "https://voicerss-text-to-speech.p.rapidapi.com/"

querystring = {"key": "d6ac55a8d1864495bee3b68a22f214d0", "hl": "en-us",
               "r": "0", "c": "mp3", "f": "8khz_8bit_mono"}

headers = {
    "X-RapidAPI-Key": "9872c7ac76msh345fe172c7cae73p12b10fjsn908d6c305604",
    "X-RapidAPI-Host": "voicerss-text-to-speech.p.rapidapi.com"
}


def text_to_audio(text):
    querystring['src'] = text
    response = requests.request(
        "GET", url, headers=headers, params=querystring)
    if (response.status_code == 200):
        return response.content
    else:
        return "Error"


print(text_to_audio("Hello world"))
