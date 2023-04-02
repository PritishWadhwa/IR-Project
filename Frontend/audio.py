import requests
import json
import time

url = "https://large-text-to-speech.p.rapidapi.com/tts"


def create_job(text):
    print(text)
    payload = {"text": text}
    headers = {
        "content-type": "application/json",
        "X-RapidAPI-Key": "c5ac4d4370mshe0b8219dcd96ceep1c9d58jsn2d1c0e455411",
        "X-RapidAPI-Host": "large-text-to-speech.p.rapidapi.com"
    }
    print("Create job")
    response = requests.request("POST", url, json=payload, headers=headers)
    return json.loads(response.text)


def get_audio(id):

    print("get audio")
    querystring = {"id": id}

    headers = {
        "X-RapidAPI-Key": "c5ac4d4370mshe0b8219dcd96ceep1c9d58jsn2d1c0e455411",
        "X-RapidAPI-Host": "large-text-to-speech.p.rapidapi.com"
    }

    response = requests.request(
        "GET", url, headers=headers, params=querystring)
    print(response.text)
    response = json.loads(response.text)
    if (response['status'] == 'success'):
        return response['url']
    elif (response['status'] == 'processing'):
        time.sleep(2)
        return get_audio(id)
    else:
        return "Error"


def text_to_audio(text):
    print("The main function")
    result = create_job(text)
    if (result["status"] == "success"):
        return result["url"]
    elif (result["status"] == "processing"):
        return get_audio(result["id"])
    else:
        return "Error"
