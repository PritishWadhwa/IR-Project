import requests


def get_image_url(text):
    try:
        r = requests.post(
            "https://api.deepai.org/api/text2img",
            data={
                'text': text,
            },
            headers={'api-key': 'quickstart-QUdJIGlzIGNvbWluZy4uLi4K'}
        )
        return r.json()['output_url']
    except:
        return "https://i.imgur.com/5YQZ2Zb.jpg"
