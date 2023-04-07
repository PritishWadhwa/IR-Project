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
// Create an audio element and set its src attribute to the MediaSource URL
const audio = document.createElement('audio');
// Add the audio element to the HTML page
document.body.appendChild(audio);



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
                    <div class="ingredient-set"> <p style = 'display: inline-block; color: rgb(100, 100, 100);'>Matched Ingredients:&nbsp;&nbsp;</p>`;
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
                                <p style = 'color: rgb(100, 100, 100);' class="prep-time" id = "prep-time"><i class="fas fa-clock"></i> Total Time:<br>`+ recipe['Total:'] + `</p>
                                <p style = 'color: rgb(100, 100, 100);' class="servings" id = 'servings'><i class="fas fa-utensils"></i> Servings:<br>`+ recipe.Yield + `</p>
                                <p style = 'color: rgb(100, 100, 100);' class="level" id = 'level'><i class="fas fa-star"></i> Level:<br>`+ recipe['Level:'] + `</p>
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
            let ingredient_speak = ""
            $.each(response.ingredients_phrase, function(index, ingredient) {
                ingredientHtml+= '<li>' + ingredient + '</li>';
                ingredient_speak += ingredient + ". ";
            });
            let methodHtml = "";
            let method_speak = ""
            $.each(response.Method, function(index, method) {
                methodHtml+= '<li>' + method + '</li>'
                method_speak += method + ". ";
            });
            let nutritionHtml = "";
            for (const key in response.NutritionInfo) {
                nutritionHtml += '<li>' + `${key}: ${response.NutritionInfo[key]}` + '</li>'
            }

            // The title audio-button
            let audio_text1 = response.Name;
            audio_text1 = encodeURIComponent(audio_text1)
            audio_text1 = audio_text1.replace("'", "");
            let audiobutton1 =  `<button class ="speak-button" onclick="text_to_audio(this,'`+ audio_text1+`')">Speak  <i class = "fas fa-play"></i></button>`

            let audio_text2 = ingredient_speak;
            audio_text2 = encodeURIComponent(audio_text2)
            audio_text2 = audio_text2.replace("'", "");
            let audiobutton2 =  `<button class ="speak-button" onclick="text_to_audio(this,'`+ audio_text2+`')">Speak  <i class = "fas fa-play"></i></button>`

            let audio_text3 = method_speak;
            audio_text3 = encodeURIComponent(audio_text3)
            audio_text3 = audio_text3.replace("'", "");
            let audiobutton3 =  `<button class ="speak-button" onclick="text_to_audio(this,'`+ audio_text3+`')">Speak  <i class = "fas fa-play"></i></button>`


            $("#myModalShit").empty();
            let modalShit ="";
            modalShit+=`<div class="modal-header">
                <h5 class="recipe-title-modal" id="modal-title">`+ response.Name +`</h5>`
                +audiobutton1+
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
                            <h2>Ingredients</h2> `+audiobutton2+`
                            <ul id ='ingredients' style="column-count: 2;">`+ ingredientHtml + `</ul>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <div class = "method-list-modal">
                            <h2>Method</h2> `+audiobutton3+`
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
// searchInput.addEventListener('input', () => {
//     const searchText = searchInput.value.toLowerCase().trim();

//     ingredients.forEach(ingredient => {
//         const ingredientName = ingredient.textContent.toLowerCase();

//         if (ingredientName.includes(searchText)) {
//             ingredient.style.display = 'inline-block';
//         } else {
//             ingredient.style.display = 'none';
//         }
//     });


// });

// search input
searchInput.addEventListener('input', () => {
    const searchText = searchInput.value.toLowerCase().trim();

    if(searchText == '') { // go back to default display
        categories.forEach(category => {
            const ingredients = category.querySelectorAll('.ingredient');
            const firstfive = Array.prototype.slice.call(ingredients, 0, 5); // get the first five
            const extras = Array.prototype.slice.call(ingredients, 5); // get all except the first 5

            firstfive.forEach(function(childDiv){
                childDiv.style.display = 'inline-block'; // Make visible
            }); 

            extras.forEach(function(childDiv){
                childDiv.style.display = 'none'; // Make invisible
            }); 
        });

        vmbuttons.forEach(button => {
            button.innerHTML = 'View More   <i class="fas fa-angle-right"></i>';
            button.style.display = 'inline-block';
        });

    }
    else {
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

        vmbuttons.forEach(button => { // make all View More buttons invisible
            button.style.display = 'none';
        });
    }
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
        generateButton.innerHTML = "Start the Generation"
        generatedRecipes.innerHTML = "";
    }
}


function text_to_audio(button, text){

    button.innerHTML = "Loading...";
    button.disabled = true;
    fetch("https://voicerss-text-to-speech.p.rapidapi.com?key=d6ac55a8d1864495bee3b68a22f214d0&src=" + text +"&hl=en-us&r=0&c=mp3&v=Nancy&f=8khz_8bit_stereo",
    {
    "method": "GET",
    "headers": {
    "x-rapidapi-host": "voicerss-text-to-speech.p.rapidapi.com",
    "x-rapidapi-key": "9872c7ac76msh345fe172c7cae73p12b10fjsn908d6c305604"
    }}).then(response => {
        // Get the readable stream from the response body
        const stream = response.body;
      
        // Create a new MediaSource object
        const mediaSource = new MediaSource();
      
        
        audio.src = URL.createObjectURL(mediaSource);
      
        
      
        // Wait for the MediaSource to open
        mediaSource.addEventListener('sourceopen', () => {
          // Create a new source buffer
          const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
      
          // Get data from the stream and append it to the source buffer
          const reader = stream.getReader();
          function read() {
            reader.read().then(({ done, value }) => {
              if (done) {
                sourceBuffer.addEventListener('updateend', () => {
                  mediaSource.endOfStream();
                  audio.play(); // Start playback
                });
                sourceBuffer.updating || sourceBuffer.dispatchEvent(new Event('updateend'));
                return;
              }
              sourceBuffer.appendBuffer(value);
              read();
            });
          }
          read();

            button.innerHTML = "Speak " + '<i class = "fas fa-play"></i>';
            button.disabled = false;
        });
      })
      .catch(err => {
        console.log(err);
        alert("Error: " + err);
      });
      
      
}
function get_image(text) {
    const generatedImages = document.getElementById("generated-image");
    generatedImages.innerHTML = '<img class = "loading" src = "./static/Loading.gif", alt = "Loading....">';
    $.ajax({
        url: '/generate_image' ,
        method: 'POST',
        data: JSON.stringify({text: text}),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function(response) {
            console.log(response);
            generatedImages.innerHTML = '<img src ="' + response +'", alt = "Recipe Image">';
        }
    });
}

async function generation() {
    alert(`Disclaimer: This recipe was generated by an artificial intelligence program and has not been taste-tested or reviewed by a human chef. The ingredients and cooking instructions are provided for informational purposes only and may not result in a tasty or safe dish. Use caution when preparing and consuming this recipe, and make any necessary adjustments based on your own cooking experience and preferences.`)
    generateButton.style.display= 'None';   
    generatedRecipes.innerHTML = '<img class = "loading" src = "./static/loading_pan.gif", alt = "Loading....">';
    if(query_ingredients.length == 0){
        alert("Please Select Ingredients");
        generateButton.style.display = 'block';
        generateButton.innerHTML = "Regenerate " +  '<i class = "fas fa-sync"></i>';
        generatedRecipes.innerHTML = "";
        return;
    }
    $.ajax({
        url: '/generate' ,
        method: 'POST',
        data: JSON.stringify({ingredients: query_ingredients}),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: async function(response) {
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
            

            let audio_text = "TITLE " + element['TITLE'] + ". INGREDIENTS " + element['INGREDIENTS'] + ". METHOD " + method_text;
            audio_text = encodeURIComponent(audio_text)
            audio_text = audio_text.replace("'", "");

            let audiobutton =  `<button class ="speak-button" onclick="text_to_audio(this,'`+ audio_text+`')">Speak  <i class = "fas fa-play"></i></button>`

            
            let generatedText = "";
            generatedText += "<h1>Generated Recipe</h1>";

            let methodHtml = "";
            $.each(element.METHOD, function(index, method) {
                methodHtml+= '<li>' + method + '</li>'});
            generatedText += audiobutton;
            let generationPrompt = "'" + element['TITLE'] + "'";
            generatedText+= `<div class="recipe-card">
                                <div class="recipe-image" id = "generated-image">
                                    <img src= "./static/placeholder.jpg" alt="Recipe Image">
                                </div>
                                <div class="recipe-info">
                                    <h2 class="recipe-name" id = "recipe-name">`+ element['TITLE'] + `</h2>
                                    
                                        <h3 class='card-title'> INGREDIENTS </h2>
                                        <h4 class='card-text'>`+ element['INGREDIENTS'] + `</h4>
                                        <h3 class='card-title'> METHOD </h2>
                                        <ul>` + methodHtml + `</ul>       
                                </div>
                            </div>`; 
            generatedRecipes.innerHTML = generatedText;
            
            const result = await get_image(generationPrompt);

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

