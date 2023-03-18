const ingredients = document.querySelectorAll('.ingredient');
const categories = document.querySelectorAll('.category');
const selectedIngredients = document.getElementById('selected-ingredients');
const searchInput = document.getElementById('search-input');

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
        } else {
            const selectedIngredientItems = selectedIngredients.querySelectorAll('li');
            selectedIngredientItems.forEach(selectedIngredientItem => {
                if (selectedIngredientItem.textContent === `${category}: ${ingredientName}`) {
                    selectedIngredientItem.remove();
                }
            });
            typestr = typestr.concat('d'); // ingredient deleted
        }

        // send ingredient name and action (added/deleted) to python
        $.ajax({
            url: "/suggest-recipe",
            type: 'POST',
            data: { param: ingredientName, type: typestr},
            success: function(response) {
                console.log(response);
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
        console.log(category);
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
