import query
from flask import Flask, render_template, request
from flask import request, jsonify
import pickle

import sys
sys.path.insert(0, '../Backend')  # Add the path to the query python code

app = Flask(__name__)

with open('../Backend/Saved/ingredients_supercook_for_flask', 'rb') as f:
    categories = pickle.load(f)

list_ingredients = set([])  # global list of ingredients chosen by the user

# define the route for the home page


@app.route('/')
def home():
    return render_template('index.html', categories=categories)

# define the route for the recipe suggestion form submission


@app.route('/suggest-recipe', methods=['POST'])
def suggest_recipe():
    clicked_ingredient = request.form.get('param')
    action = request.form.get('type')
    page = request.form.get('page')
    if clicked_ingredient == "":
        # For pagination, do not check anything, continue with the same list of ingredients
        recipes = query.fetchRecipes(list_ingredients, page)
    else:
        if (action == 'a'):
            list_ingredients.add(clicked_ingredient)
        else:
            list_ingredients.remove(clicked_ingredient)

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
