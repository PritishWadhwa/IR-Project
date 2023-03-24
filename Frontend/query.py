'''
Code to fetch recipes according to given ingredients
'''

import pickle
import pandas as pd
import os
import ast
import numpy as np

with open('../Backend/Saved/unigramIndex.pickle', 'rb') as f:
    unigramIndex = pickle.load(f)

with open('../Backend/Saved/finaldf.pickle', 'rb') as f:
    dataframe = pickle.load(f)

dataframe['ingredients'] = dataframe['ingredients'].apply(
    lambda x: x.split(", "))

dataframe.to_csv("hello.csv", index=False)
with open('../Backend/Saved/ingredients_supercook_for_flask', 'rb') as f:
    categories = pickle.load(f)


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
    recipe['Nutrition Info'] = ast.literal_eval(recipe['Nutrition Info'])
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

    # Get the the values (int(page)-1)*10 to int(page)*10
    recipe_ids = finalAns['id'].values[(int(page)-1)*10:int(page)*10]
    print()
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
    recipes_formatted = finaldf.to_dict('records')
    # print(recipes_formatted)
    return recipes_formatted


# fetchRecipes(['egg', 'vegetable oil', 'cinnamon'], 1)
