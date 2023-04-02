const ingredients = document.querySelectorAll('.ingredient');
const categories = document.querySelectorAll('.categories');
const selectedIngredients = document.getElementById('selectedings');
const searchInput = document.getElementById('search-input');
const modal = document.getElementById("myModal");
const vmbuttons = document.querySelectorAll('.view-more-btn');
const selsel = document.getElementById("sel");
document.getElementById("default").click();
const generatedRecipes = document.getElementById('generated-recipes');
const generateButton = document.getElementById('gen-button');
// Set the number of items per page and the initial page
const itemsPerPage = 10;
let currentPage = 1;

// Create the pagination links
let paginationHTML = "<div class = 'row' class = 'paginations'>";
paginationHTML += `<button href = "#TOP_OF_PAGE" id="pagination-link-prev" onclick = 'prev()'>Prev</button>`;
paginationHTML += `<button  id="pagination-link-next" onclick = 'next()'>Next</button>`;
paginationHTML += "</div>";
// Add the pagination links to the page
document.getElementById("pagination").innerHTML = paginationHTML;

// Add event listeners to the pagination links
const paginationLinksPrev = document.getElementById("pagination-link-prev");
const paginationLinksNext = document.getElementById("pagination-link-next");


let max = 1;
let query_ingredients = [];

// View More buttons
vmbuttons.forEach(function(button){
    button.addEventListener('click', function(){
        const parentDiv = button.parentNode;
        if(button.textContent === "View More   "){
            const childDivs = parentDiv.querySelectorAll('.ingredient');
            const extras = Array.prototype.slice.call(childDivs, 5); // get all except the first 5

            extras.forEach(function(childDiv){
                childDiv.style.display = 'inline-block'; // Make visible
            });
            button.innerHTML = '<i class="fas fa-angle-left"></i>   View Less';
            
        }
        else{
            const childDivs = parentDiv.querySelectorAll('.ingredient');
            const extras = Array.prototype.slice.call(childDivs, 5); // get all except the first 5

            extras.forEach(function(childDiv){
                childDiv.style.display = 'none'; // Make invisible
            });            
            button.innerHTML = 'View More   <i class="fas fa-angle-right"></i>';
        }
    });
});

// selecting ingredients
ingredients.forEach(ingredient => {
    ingredient.addEventListener('click', () => {

        // Make the selected bubble green
        ingredient.classList.toggle('selected');

        // Get the category name and selected ingredients for the selected bubble
        const category = ingredient.parentNode.parentNode.querySelector('.category-name').textContent;
        const ingredientName = ingredient.textContent;

        // Add or remove selected ingredients from the right-hand side
        const selectedIngredientItem = document.createElement('div');
        selectedIngredientItem.classList.add("ingredient", "selected", "selected-ingredients");
        selectedIngredientItem.addEventListener('click', ()=> {
            ingredient.classList.toggle('selected');
            const selectedIngredientItems = selectedIngredients.querySelectorAll('div');
            selectedIngredientItems.forEach(selectedIngredientItem => {
                if (selectedIngredientItem.textContent === ingredientName) {
                    selectedIngredientItem.remove();
                }
            });
            query_ingredients.splice(query_ingredients.indexOf(ingredientName), 1);
            
            if(query_ingredients.length == 0) {
                selsel.style.display = 'none'; 
                document.getElementById("zero_recipes").style.display = "block";
                document.getElementById("TOP_OF_PAGE").style.display = "none";
            }
            else{
                document.getElementById("zero_recipes").style.display = "None";
                document.getElementById("TOP_OF_PAGE").style.display = "block";
            }

            currentPage = 1
            getRecipes();

            console.log(query_ingredients)
        });
        selectedIngredientItem.textContent =  ingredientName;

        if (ingredient.classList.contains('selected')) {
            selectedIngredients.appendChild(selectedIngredientItem);
            query_ingredients.push(ingredientName);
            console.log(query_ingredients)
        } else {
            const selectedIngredientItems = selectedIngredients.querySelectorAll('div');
            selectedIngredientItems.forEach(selectedIngredientItem => {
                if (selectedIngredientItem.textContent === ingredientName) {
                    selectedIngredientItem.remove();
                }
            });
            query_ingredients.splice(query_ingredients.indexOf(ingredientName), 1);
            
            console.log(query_ingredients)
        }

        if(query_ingredients.length == 0) {
            selsel.style.display = 'none';
            document.getElementById("zero_recipes").style.display = "block";
            document.getElementById("TOP_OF_PAGE").style.display = "none";
        }
        else{
            selsel.style.display = 'inline-block';
            document.getElementById("zero_recipes").style.display = "None";
            document.getElementById("TOP_OF_PAGE").style.display = "block";
        }

        currentPage = 1
        getRecipes();
        
    });
});

function getRecipes()
{
    // send ingredient name and action (added/deleted) to python
    $.ajax({
        url: "/suggest-recipe",
        type: 'POST',
        data: JSON.stringify({ingredients: query_ingredients, page: currentPage}),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function(response) {
            $("#recipes").empty();
            
            max = parseInt(response['total']/itemsPerPage) + 1
            
            if(currentPage==max)
            {
                // Disable the next button
                paginationLinksNext.disabled = true;
            }
            else
            {
                paginationLinksNext.disabled = false;
            }
            if(currentPage==1)
            {
                // Disable the previous button
                paginationLinksPrev.disabled = true;
            }
            else{
                paginationLinksPrev.disabled = false;
            }
            response = response['results']
            // console.log(max)
            $.each(response, function(index, recipe) {

                // console.log(recipe)
                let inner_list = 
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
                                <p class="prep-time" id = "prep-time"><i class="fas fa-clock"></i> Total Time:<br>`+ recipe['Total:'] + `</p>
                                <p class="servings" id = 'servings'><i class="fas fa-utensils"></i> Servings:<br>`+ recipe.Yield + `</p>
                                <p class="level" id = 'level'><i class="fas fa-star"></i> Level:<br>`+ recipe['Level:'] + `</p>
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
    $.ajax({
        url: '/recipe' ,
        method: 'POST',
        data: { id: recipe_id},
        success: function(response) {
            let ingredientHtml = "";
            $.each(response.ingredients_phrase, function(index, ingredient) {
                ingredientHtml+= '<li>' + ingredient + '</li>'
            });
            let methodHtml = "";
            $.each(response.Method, function(index, method) {
                methodHtml+= '<li>' + method + '</li>'
            });
            let nutritionHtml = "";
            for (const key in response.NutritionInfo) {
                nutritionHtml += '<li>' + `${key}: ${response.NutritionInfo[key]}` + '</li>'
            }
            let audio_text = response.Name;;
            let audiobutton =  `<button onclick="text_to_audio(this,'`+ audio_text+`')">Speak  <i class = "fas fa-play"></i></button>`

            $("#myModalShit").empty();
            let modalShit ="";
            modalShit+=`<div class="modal-header">
                <h5 class="recipe-title-modal" id="modal-title">`+ response.Name +`</h5>`
                +audiobutton+
                `
            </div>
            <div class="modal-body" id = 'modal-body'>
                <div class="row">
                    <div class="col-md-6">
                        <img id = 'recipe-image' src="`+ response['Image Link']+ `" alt="" class="recipe-image-modal">
                    </div>
                    <br>
                    <div class="col-md-6">
                        <p><strong>Total Time:</strong> `+response['Total:'] + `</p>
                        <p><strong>Yield:</strong> `+response['Yield'] + `</p> 
                        <p><strong>Difficulty Level:</strong> `+response['Level:'] + `</p>
                    </div>
                </div>
                <br>
                <div class="row">
                    <div class="col-md-12">
                        <div class = "nutrition-list-modal">
                            <h2>Nutritional Information</h2>
                            <ul id ='nutrition' style="column-count: 2;">`+ nutritionHtml + `</ul>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <div class = "ingredient-list-modal">
                            <h2>Ingredients</h2>
                            <ul id ='ingredients' style="column-count: 2;">`+ ingredientHtml + `</ul>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <div class = "method-list-modal">
                            <h2>Method</h2>
                            <ol id = 'methods'>`+ methodHtml + `</ol>
                        </div>
                    </div>
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

function clearAll(){
    const selectedIngredientItems = selectedIngredients.querySelectorAll('div');
    selectedIngredientItems.forEach(selectedIngredientItem => {
        selectedIngredientItem.remove();
    });
    ingredients.forEach(ingredient => {
        if(ingredient.classList.contains('selected')){
            ingredient.classList.toggle('selected');
        }
        else{
            query_ingredients.splice(query_ingredients.indexOf(ingredient.textContent), 1);
        }
    });

    if(query_ingredients.length == 0) {
        selsel.style.display = 'none';
        document.getElementById("zero_recipes").style.display = "block";
        document.getElementById("TOP_OF_PAGE").style.display = "none";

    }
    else{
        document.getElementById("zero_recipes").style.display = "None";
        document.getElementById("TOP_OF_PAGE").style.display = "block";
    }

    currentPage = 1;
    getRecipes();
}

function openCity(evt, cityName) {
    // Declare all variables
    let i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
    if(cityName == "Generation")
    {
        generateButton.textContent = "Start the Generation"
        generatedRecipes.innerHTML = "";
    }
}


function text_to_audio(button,text){

    button.text = "Processing...";
    $.ajax({
        url: '/text-to-audio' ,
        method: 'POST',
        data: {text: text},
        success: function(response) {
            button.text = "Speak";
            console.log("Doneee!!!");
            console.log(response);
            if(response == "Error"){
                alert("Could not be processed!");
            }
            else{
                var audio = new Audio(response);
                audio.play();
            }
        },
    
        });
    }



function generation() {
    alert(`Disclaimer: This recipe was generated by an artificial intelligence program and has not been taste-tested or reviewed by a human chef. The ingredients and cooking instructions are provided for informational purposes only and may not result in a tasty or safe dish. Use caution when preparing and consuming this recipe, and make any necessary adjustments based on your own cooking experience and preferences.`)
    generateButton.style.display= 'None';   
    generatedRecipes.innerHTML = '<img class = "loading" src = "./static/Loading.gif", alt = "Loading....">';
    if(query_ingredients.length == 0){
        alert("Please Select Ingredients");
        generateButton.style.display = 'block';
        generateButton.textContent = "Regenerate <i fas fa-sync></i>"
        generatedRecipes.innerHTML = "";
        return;
    }
    $.ajax({
        url: '/generate' ,
        method: 'POST',
        data: JSON.stringify({ingredients: query_ingredients}),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function(response) {
            let element = response;
            generateButton.style.display = 'block';
            generateButton.innerHTML = 'Regenerate <i class = "fas fa-sync"></i>';
            generatedRecipes.innerHTML = "";
            if (element == "Error"){             
                alert("OOPS! Could Not Generate Recipe. Please Try Again!");
            }
            else{
            let method_text = "";
            $.each(element.METHOD, function(index, method) {
                method_text+=  method + ". "
            });

            // let audio_text = "TITLE " + element['TITLE'] + ". INGREDIENTS " + element['INGREDIENTS'] + ". METHOD " + method_text;
            // console.log(audio_text)
            
            let audiobutton = ""
            console.log(response);
            let generatedText = audiobutton + "";
            generatedText += "<h1>Generated Recipe</h1>";
            generatedText += "<div class='generated-recipe'>";
            generatedText += "<div class='row'>";
            
                generatedText += "<div class='col-md-4'>";
                generatedText += "<h2 class='card-title'>"+ "TITLE: "+ element['TITLE'] + "</h2>";
                generatedText += "<h3 class='card-title'>"+ "INGREDIENTS"+"</h2>";
                generatedText += "<h4 class='card-text'>"+ element['INGREDIENTS'] + "</h4>";
                let methodHtml = "";
                $.each(element.METHOD, function(index, method) {
                    methodHtml+= '<li>' + method + '</li>'
                });
                generatedText += "<h3 class='card-title'>"+ "METHOD"+"</h2>";
                generatedText += "<ul>" + methodHtml + "</ul>";
                generatedText += "</div>";
            generatedText += "</div>";
            generatedText += "</div>";
            generatedRecipes.innerHTML = generatedText;
            }
        }
    });
}
function prev(){
    currentPage = currentPage - 1;
    currentPage = Math.max(currentPage, 1);
    scrollSmoothTo();
    // Call your function to display the items for the current page
    getRecipes();
}

function next(){
    currentPage = currentPage + 1; 
    currentPage = Math.min(currentPage, max);
    scrollSmoothTo();
    // Call your function to display the items for the current page
    getRecipes();
    
}

function scrollSmoothTo() {
    let element = document.getElementById("TOP_OF_PAGE");
    element.scrollIntoView({
      block: 'start',
      behavior: 'smooth'
    });
}

