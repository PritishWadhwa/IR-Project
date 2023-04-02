'''
Code to fetch recipes according to given ingredients
'''

import pickle
import pandas as pd
import os
import ast
import numpy as np
fn = "https://food.fnr.sndimg.com/content/dam/images/food/editorial/homepage/fn-feature.jpg.rend.hgtvcom.826.620.suffix/1474463768097.jpeg"
with open('../Backend/Saved/unigramIndex.pickle', 'rb') as f:
    unigramIndex = pickle.load(f)

with open('../Backend/Saved/finaldf.pickle', 'rb') as f:
    dataframe = pickle.load(f)

dataframe = dataframe.drop_duplicates(
    subset=dataframe.columns.difference(['id']), keep='first')

dataframe['ingredients'] = dataframe['ingredients'].apply(
    lambda x: x.split(", "))

dataframe.fillna(fn, inplace=True)

# dataframe.to_csv("hello.csv", index=False)
with open('../Backend/Saved/ingredients_supercook_for_flask', 'rb') as f:
    categories = pickle.load(f)

for cat_dict in categories:
    to_remove = []
    for ing in cat_dict['ingredients']:
        if ing not in set(unigramIndex.keys()):
            to_remove.append(ing)
    for ing in to_remove:
        cat_dict['ingredients'].remove(ing)


def OR(list1, list2):
    i = 0
    j = 0
    answer = []
    while (i < len(list1) and j < len(list2)):
        if (list1[i] < list2[j]):
            answer.append(list1[i])
            i += 1
        elif (list1[i] > list2[j]):
            answer.append(list2[j])
            j += 1
        else:
            answer.append(list1[i])
            i += 1
            j += 1
    while (i < len(list1)):
        answer.append(list1[i])
        i += 1
    while (j < len(list2)):
        answer.append(list2[j])
        j += 1
    return answer


def sort_tuple(tup):
    tup.sort(key=lambda x: x[1])
    return tup


def fetchRecipe(recipe_id):
    if (len(recipe_id) == 0):
        return {}
    recipe_id = int(recipe_id)
    recipe = dataframe[dataframe['id'] == recipe_id].to_dict(orient='records')[
        0]
    recipe['NutritionInfo'] = ast.literal_eval(recipe['Nutrition Info'])
    recipe['Method'] = ast.literal_eval(recipe['Method'])
    recipe['ingredients_phrase'] = ast.literal_eval(
        recipe['ingredients_phrase'])
    # recipe['ingredients'] = recipe['ingredients'].split(", ")
    return recipe

# print(fetchRecipe(2))


def fetchRecipes(queryIngs, page):

    if (len(queryIngs) == 0):
        return []

    # Take OR of all the postings lists
    ans = []
    for i in queryIngs:
        posting_list = []
        if i in unigramIndex:
            posting_list = unigramIndex[i][1]
        ans = OR(posting_list, ans)

    queryset = set(queryIngs)
    print(queryset)
    # Find the documents given by the OR query
    finalAns = dataframe[dataframe['id'].isin(
        ans)][['id', 'ingredients']].reset_index(drop=True)

    # Get the number of common ingredients between the query and the document
    finalAns['number'] = finalAns['ingredients'].apply(
        lambda x: len(set(x).intersection(queryset)))

    # Sort by the number of common ingredients
    finalAns = finalAns.sort_values(by=['number'], ascending=False)

    # print(finalAns[['id', 'number']].values[:10])
    # Drop the columns not neede to reduce the size of the response
    finalAns = finalAns.drop(columns=['ingredients', 'number'])

    # Reset the index
    finalAns = finalAns.reset_index(drop=True)
    # print(finalAns)
    # Get the the values (int(page)-1)*10 to int(page)*10
    recipe_ids = finalAns['id'].values[(int(page)-1)*10:int(page)*10]
    # print(recipe_ids)
    # print(recipe_ids)
    # get detailed information from the document(recipe) id
    finaldf = dataframe[dataframe['id'].isin(
        recipe_ids)].reset_index(drop=True)

    # Find common ingredients
    finaldf['common'] = finaldf['ingredients'].apply(
        lambda x: list(set(x).intersection(queryset)))
    # Get the number of common ingredients
    finaldf['number'] = finaldf['ingredients'].apply(
        lambda x: len(set(x).intersection(queryset)))
    # Sort by the number of common ingredients
    finaldf = finaldf.sort_values(by=['number'], ascending=False)
    # print()
    # print(finaldf[['id', 'number', 'common']].values)
    # Drop the columns not neede to reduce the size of the response
    finaldf = finaldf.drop(
        columns=['ingredients', 'Nutrition Info', 'Method', 'number'])

    # convert dataframe to list of dictionaries
    recipes_formatted = {}
    recipes_formatted['results'] = finaldf.to_dict('records')
    recipes_formatted['total'] = finalAns.shape[0]
    # print(recipes_formatted)
    return recipes_formatted


# fetchRecipes(['egg', 'vegetable oil', 'cinnamon'], 1)
