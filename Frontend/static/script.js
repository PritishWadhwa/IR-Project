const ingredients = document.querySelectorAll('.ingredient');
const categories = document.querySelectorAll('.category');
const selectedIngredients = document.getElementById('selected-ingredients');
const searchInput = document.getElementById('search-input');
// const recipes = document.getElementById('recipes');
var list2 = [];
// selecting ingredients
ingredients.forEach(ingredient => {
    ingredient.addEventListener('click', () => {

        // Make the selected bubble green
        ingredient.classList.toggle('selected');

        // Get the category name and selected ingredients for the selected bubble
        const category = ingredient.parentNode.parentNode.querySelector('.category-name').textContent;
        const ingredientName = ingredient.textContent;

        // Add or remove selected ingredients from the right-hand side
        const selectedIngredientItem = document.createElement('li');
        selectedIngredientItem.textContent = `${category}: ${ingredientName}`;

        let typestr = "";
        if (ingredient.classList.contains('selected')) {
            selectedIngredients.appendChild(selectedIngredientItem);
            typestr = typestr.concat('a'); // ingredient added
            list2.push(ingredientName);
        } else {
            const selectedIngredientItems = selectedIngredients.querySelectorAll('li');
            selectedIngredientItems.forEach(selectedIngredientItem => {
                if (selectedIngredientItem.textContent === `${category}: ${ingredientName}`) {
                    selectedIngredientItem.remove();
                }
            });
            typestr = typestr.concat('d'); // ingredient deleted
            list2.pop(ingredientName);
        }

        // send ingredient name and action (added/deleted) to python
        $.ajax({
            url: "/suggest-recipe",
            type: 'POST',
            data: { param: ingredientName, type: typestr},
            success: function(response) {
                $("#recipes").empty();
                console.log("here 2");
                $.each(response, function(index, recipe) {
                    console.log(recipe)
                    var inner_list = 
                    `<div class="recipe-ingredients">
                        <div class="ingredient-set">`;
                    $.each(recipe.common, function(index, ing) {
                        inner_list+= '<span class="ingredient-bubble green">'+ing + '</span>';
                    });    
                    inner_list+=
                    `   </div>
                    </div>`;   
                    $("#recipes").append(                
                        `<div class="recipe-card">
                            <div class="recipe-image" id = "recipe-image">
                                <img src= "` + recipe['Image Link']+ `"
                                alt="Recipe Image">
                            </div>
                            <div class="recipe-info" >
                                <h2 class="recipe-name" id = "recipe-name">`+ recipe.Name + `</h2>
                                <div class="recipe-details">
                                    <p class="prep-time" id = "prep-time"><i class="far fa-clock"></i> Prep Time: ` + recipe['Total:'] + `</p>
                                    <p class="servings" id = 'servings'><i class="fas fa-utensils"></i> Servings: `+ recipe.Yield + `</p>
                                    <p class="level" id = 'level'><i class="fa-solid fa-layer-group"></i> Level: `+ recipe['Level:'] + `</p>
                                    <button class="view-recipe-btn">View Recipe</button>
                                </div>` + 
                                inner_list +
                            `</div>
                        </div>`);    
              });
                // resultsDiv.html(data.results);
                console.log("Here");
              },
              error: function(error) {
                console.log(error);
              }
        });
    });
});

// search input
searchInput.addEventListener('input', () => {
    const searchText = searchInput.value.toLowerCase().trim();

    ingredients.forEach(ingredient => {
        const ingredientName = ingredient.textContent.toLowerCase();

        if (ingredientName.includes(searchText)) {
            ingredient.style.display = 'inline-block';
        } else {
            ingredient.style.display = 'none';
        }
    });
});

// search input
searchInput.addEventListener('input', () => {
    const searchText = searchInput.value.toLowerCase().trim();

    categories.forEach(category => {
        // console.log(category);
        const categoryName = category.querySelector('.category-name').textContent.toLowerCase();
        const ingredients = category.querySelectorAll('.ingredient');
        let isCategoryMatched = categoryName.includes(searchText);
        let isIngredientMatched = false;

        ingredients.forEach(ingredient => {
            const ingredientName = ingredient.textContent.toLowerCase();
            if (ingredientName.includes(searchText)) {
                isIngredientMatched = true;
                ingredient.style.display = 'inline-block';
            } else {
                ingredient.style.display = 'none';
            }
        });

        if (isCategoryMatched || isIngredientMatched) {
            category.style.display = 'block';
        } else {
            category.style.display = 'none';
        }
        if (categoryName.includes(searchText)) {
            category.style.display = 'block';
            ingredients.forEach(ingredient => {
                ingredient.style.display = 'inline-block';
            });
        }
    });
});
