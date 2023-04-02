import sys
import query
from flask import Flask, render_template, request
from flask import request, jsonify
import generation
import pickle
import audio
imported = None

sys.path.insert(0, '../Backend')  # Add the path to the query python code

app = Flask(__name__)

with open('../Backend/Saved/ingredients_supercook_for_flask', 'rb') as f:
    categories = pickle.load(f)

for cat_dict in categories:
    for ing in cat_dict['ingredients']:
        if ing not in query.unigramIndex:
            cat_dict['ingredients'].remove(ing)


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


@app.route('/text-to-audio', methods=['POST'])
def text_to_audio():
    text = request.form.get('text')
    print("In app.py", text)
    url = audio.text_to_audio(text)
    return jsonify(url)


@app.route('/suggest-recipe', methods=['POST'])
def suggest_recipe():
    data = request.get_json()
    list_ingredients = data['ingredients']
    page = data['page']
    # For pagination, do not check anything, continue with the same list of ingredients
    # Querying database of recipes using index
    recipes = query.fetchRecipes(list_ingredients, page)
    return jsonify(recipes)


@app.route('/recipe', methods=['POST'])
def recipe():
    recipe_id = request.form.get('id')
    recipe = query.fetchRecipe(recipe_id)
    return jsonify(recipe)


if __name__ == '__main__':
    app.run(debug=True)
