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
        print(r.json())
        return r.json()['output_url']
    except Exception as e:
        print(e)
        return "https://i.imgur.com/5YQZ2Zb.jpg"
