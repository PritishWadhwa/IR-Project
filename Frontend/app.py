from flask import Flask, render_template, request
import pickle

list_ingredients=[]

app = Flask(__name__)

with open('../Backend/Saved/ingredients_supercook_for_flask', 'rb') as f:
    categories = pickle.load(f)

# define the route for the home page


@app.route('/')
def home():
    return render_template('index.html', categories=categories)

# define the route for the recipe suggestion form submission


@app.route('/suggest-recipe', methods=['POST'])
def suggest_recipe():
    print('hi')
    selected_ingredients = request.form.get('param')
    if(request.form.get('type')=='a'):
        list_ingredients.append(selected_ingredients)
    else:
        list_ingredients.remove(selected_ingredients)
    print(list_ingredients)
    print('hi')
    return ('success', True)


if __name__ == '__main__':
    app.run(debug=True)