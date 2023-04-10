let ingredients = "1 medium potato 1 medium tomato 1 tsp. sugar 1 tbsp. corn oil 1/2 tbsp. salt";
console.log(ingredients);

// split ingredients into an array by numbers and fractions and should contain the numbers or fractions
let finalIngredientsArray = [];
let ingredientsArray = ingredients.split(" ");

let currIng = "";
for (let i = 0; i < ingredientsArray.length; i++) {
    if (Number.isInteger(parseInt(ingredientsArray[i][0]))) {
        if (currIng != "") {
            finalIngredientsArray.push(currIng);
            currIng = "";
        }
    }
    currIng += ingredientsArray[i] + " ";
}
if (currIng != "") {
    finalIngredientsArray.push(currIng);
}

console.log(finalIngredientsArray);




