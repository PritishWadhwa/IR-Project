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
    recipe['ingredients'] = recipe['ingredients'].split(", ")
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

    # get all ingredients of the matched documents to count number of ingredients matched with query ingredients
    finalAns = []
    for i in ans:
        ings = dataframe[dataframe['id'] == i].reset_index(
            drop=True).loc[0]['ingredients']
        ings = ings.split(', ')
        query = set(queryIngs)
        ings = set(ings)
        finalAns.append((i, len(query.intersection(ings))))

    # ranking of the recipes according to maximum ingredients matched to query
    finalAns = sort_tuple(finalAns)[::-1]

    # get only the first 50 recipes
    # pagination/ infinite scroll ??
    # format: [(51789, 3), (2334, 3), (46643, 2) ...]
    finalAns = finalAns[(int(page)-1)*10:int(page)*10]

    # get first elements of the tuples
    recipe_ids = list(zip(*finalAns))[0]

    # get detailed information from the document(recipe) id
    finaldf = dataframe[dataframe['id'].isin(recipe_ids)]

    # concatenating the two dfs in front of each other
    # finaldf = pd.concat([dfnew, imnew], axis=1)
    queryset = set(queryIngs)

    # Convert to a list
    finaldf['ingredients'] = finaldf['ingredients'].apply(
        lambda x: x.split(', '))

    # Find common ingredients
    finaldf['common'] = finaldf['ingredients'].apply(
        lambda x: list(set(x).intersection(queryset)))

    # Drop the columns not neede to reduce the size of the response
    finaldf = finaldf.drop(
        columns=['ingredients', 'Nutrition Info', 'Method'])

    # convert dataframe to list of dictionaries
    recipes_formatted = finaldf.to_dict('records')
    return recipes_formatted
