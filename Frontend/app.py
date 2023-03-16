from flask import Flask, render_template, request
import pickle

app = Flask(__name__)

# define the list of ingredients
# categories = [
#     {'name': 'Meat', 'ingredients': [
#         'Beef', 'Chicken', 'Pork', 'Lamb', 'Turkey', 'Salmon', 'Tuna', 'Shrimp', 'Egg', 'Cheese']},
#     {'name': 'Vegetables', 'ingredients': [
#         'Carrots', 'Broccoli', 'Spinach', "Tomato", "Onion", "Butter Lettuce", "Cucumber",
#         "Celery", "Potato", "Garlic", "Mushroom", "Pepper", "Zucchini", "Cauliflower", "Eggplant",
#         "Sweet Potato", "Green Beans", "Asparagus", "Avocado", "Lettuce", "Spinach", "Kale", "Cabbage",
#         "Broccoli", "Brussels Sprouts", "Cucumber", "Tomato", "Corn", "Peas", "Bell Pepper", "Carrot",
#     ]},
#     {'name': 'Fruits', 'ingredients': [
#         'Apples', 'Oranges', 'Bananas', 'Pears', 'Grapes', 'Strawberries', 'Blueberries', 'Raspberries', ]},
#     {'name': 'Spices', 'ingredients': [
#         'Salt', 'Pepper', 'Cumin', "Star Anise", "Turmeric", "Cardamom"]}
# ]
with open('../Backend/Saved/ingredients_supercook_for_flask', 'rb') as f:
    categories = pickle.load(f)

# define the route for the home page


@app.route('/')
def home():
    return render_template('index.html', categories=categories)

# define the route for the recipe suggestion form submission


@app.route('/suggest-recipe', methods=['POST'])
def suggest_recipe():
    selected_ingredients = request.form.getlist('ingredients')
    # logic to suggest recipe based on selected ingredients goes here
    # return the recipe suggestion to the user
    return f'The recipe suggestion based on your selected ingredients {selected_ingredients} is: <insert recipe here>'


if __name__ == '__main__':
    app.run(debug=True)
