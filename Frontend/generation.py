import requests
import re


def sentence_case(string):
    if string != '':
        result = re.sub('([A-Z])', r' \1', string)
        return result[:1].upper() + result[1:].lower()
    return


API_URL = "https://api-inference.huggingface.co/models/flax-community/t5-recipe-generation"
headers = {"Authorization": "Bearer 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"}


def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()


def generate_recipe(ingredients):
    generation = {}
    output = query({
        "inputs": ", ".join(ingredients),
    })
    for text in output:
        text = text['generated_text']
        title = text.split('title:')[1].split('ingredients:')[0]
        title = title.strip()
        title = sentence_case(title)
        ingredients = text.split('ingredients:')[1].split('directions:')[0]
        directions = text.split('directions:')[1]
        directions = directions.replace('\n', '')
        directions = directions.split('. ')
        directions = [sentence_case(method.strip()) for method in directions]
        generation["TITLE"] = title
        generation["INGREDIENTS"] = ingredients
        generation["METHOD"] = directions
    return generation
