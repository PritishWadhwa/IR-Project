const ingredients = document.querySelectorAll('.ingredient');
const categories = document.querySelectorAll('.category');
const selectedIngredients = document.getElementById('selected-ingredients');
const searchInput = document.getElementById('search-input');
const modal = document.getElementById("myModal");
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
        getRecipes(ingredientName, typestr, currentPage);
        
    });
});

function getRecipes(ingredientName, typestr ,currentPage)
{
    // send ingredient name and action (added/deleted) to python
    $.ajax({
        url: "/suggest-recipe",
        type: 'POST',
        data: { param: ingredientName, type: typestr , page: currentPage},
        success: function(response) {
            $("#recipes").empty();
            console.log("here 2");
            $.each(response, function(index, recipe) {
                // console.log(recipe)
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
                                <button class="view-recipe-btn" id = 'view-recipe' onclick = "viewRecipeClicked(`+ recipe.id +`)"> View Recipe </button>
                            </div>` + 
                            inner_list +
                        `</div>
                    </div>`);    
            });
        },
        error: function(error) {
            console.log(error);
        }
    });
}

function viewRecipeClicked (recipe_id)
{
    console.log("Button Clicked")
    console.log(recipe_id)
    $.ajax({
        url: '/recipe' ,
        method: 'POST',
        data: { id: recipe_id},
        success: function(response) {
            console.log(response)
            let ingredientHtml = "";
            $.each(response.ingredients, function(index, ingredient) {
                ingredientHtml+= '<li>' + ingredient + '</li>'
            });
            let methodHtml = "";
            $.each(response.Method, function(index, method) {
                methodHtml+= '<li>' + method + '</li>'
            });
            $("#myModalShit").empty();
            let modalShit ="";
            modalShit+=`<div class="modal-header">
                <h5 class="recipe-title-modal" id="modal-title">`+ response.Name +`</h5>
            </div>
            <div class="modal-body" id = 'modal-body'>
                <div class="row">
                    <div class="col-md-6">
                        <img id = 'recipe-image' src="`+ response['Image Link']+ `" alt="" class="recipe-image-modal">
                    </div>
                    <div class="col-md-6">
                        <div class = "recipe-details-modal"> 
                            <table class="table">
                                <tbody>
                                <tr>
                                    <td>Cooking Time</td>
                                    <td id = 'cooking-time'>`+response['Total:'] + `</td>
                                </tr>
                                <tr>
                                    <td>Yield</td>
                                    <td id = 'yield'>`+response['Yield'] + `</td>
                                </tr>
                                <tr>
                                    <td>Recipe Level</td>
                                    <td id = "recipe-level">`+response['Level:'] + `</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <div class = "ingredient-list-modal">
                            <h2>Ingredients</h2>
                            <ul id ='ingredients'>`+ ingredientHtml + `</ul>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <div class = "method-details-modal">
                            <h2>Method</h2>
                            <ol id = 'methods'>`+ methodHtml + `</ol>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <span class="close" id = 'close'>&times;</span>
                </div>
            </div>`;
            $("#myModalShit").append(modalShit);
            // When the user clicks the button, open the modal 
            modal.style.display = 'block';
            
        },
        error: function(xhr, status, error) {
        alert('Error fetching recipe data');
        }
    });
}   

const span = document.getElementById("close");
span.onclick = function() {
    modal.style.display = "none";
    // modal.innerHTML = "";
  }
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

// Set the number of items per page and the initial page
const itemsPerPage = 10;
let currentPage = 1;

// Create the pagination links
let paginationHTML = "<div class = 'row' class = 'paginations'>";
paginationHTML += `<button href = "#TOP_OF_PAGE" id="pagination-link-prev" onclick = 'prev()'>Prev</button>`;
paginationHTML += `<button id="pagination-link"> ${currentPage} </button>`;
paginationHTML += `<button  id="pagination-link-next" onclick = 'next()'>Next</button>`;
paginationHTML += "</div>";
// Add the pagination links to the page
document.getElementById("pagination").innerHTML = paginationHTML;

// Add event listeners to the pagination links
const paginationLinks = document.getElementById(".pagination-link");
const paginationLinksPrev = document.getElementById(".pagination-link-prev");
const paginationLinksNext = document.getElementById(".pagination-link-next");

function prev(){
    currentPage = currentPage - 1;
    currentPage = Math.max(currentPage, 1);
    scrollSmoothTo()
    // Call your function to display the items for the current page
    getRecipes("", "", currentPage);
    paginationLinks.textContent = currentPage;
}

function next(){
    currentPage = currentPage + 1;
    //  !!!!!!!!!! ChANGE THIS TO THE NUMBER OF PAGES !!!!!!!!!!    
    currentPage = Math.min(currentPage, 1000);
    scrollSmoothTo()
    // Call your function to display the items for the current page
    getRecipes("", "", currentPage);
    paginationLinks.textContent = currentPage;
    
}

function scrollSmoothTo() {
    let element = document.getElementById("TOP_OF_PAGE");
    element.scrollIntoView({
      block: 'start',
      behavior: 'smooth'
    });
  }