import sys
import query
from flask import Flask, render_template, request
from flask import request, jsonify
import generation
import image
import json
imported = None

categories = query.categories
app = Flask(__name__)


# define the route for the home page
@app.route('/')
def home():
    return render_template('index.html', categories=categories)

# define the route for the recipe suggestion form submission


@app.route('/generate/', methods=['POST'])
def generate():
    global imported
    data = request.get_json()
    list_ingredients = data['ingredients']
    generationResult = generation.generate_recipe(list_ingredients)
    return jsonify(generationResult)


# @app.route('/text-to-audio', methods=['POST'])
# def text_to_audio():
#     text = request.form.get('text')
#     print("In app.py", text)
#     url = audio.text_to_audio(text)
#     return jsonify(url)


@app.route('/suggest-recipe', methods=['POST'])
def suggest_recipe():
    data = request.get_json()
    list_ingredients = data['ingredients']
    page = data['page']
    sortingParam = data['sortingParam']
    # For pagination, do not check anything, continue with the same list of ingredients
    # Querying database of recipes using index
    recipes = query.fetchRecipes(list_ingredients, page, sortingParam)
    return jsonify(recipes)


@app.route('/generate_image', methods=['POST'])
def generate_image():
    text = request.data.decode('utf-8')
    print(text)
    url = image.get_image_url(text, 5)
    print("here")
    return json.dumps({'img_b64': url})


@app.route('/recipe', methods=['POST'])
def recipe():
    recipe_id = request.form.get('id')
    recipe = query.fetchRecipe(recipe_id)
    return jsonify(recipe)


if __name__ == '__main__':
    app.run(debug=True)
