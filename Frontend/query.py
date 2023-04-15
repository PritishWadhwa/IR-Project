'''
Code to fetch recipes according to given ingredients
'''

import pickle
import pandas as pd
import os
import ast
import numpy as np
fn = "https://food.fnr.sndimg.com/content/dam/images/food/editorial/homepage/fn-feature.jpg.rend.hgtvcom.826.620.suffix/1474463768097.jpeg"
with open('./Data/unigramIndex.pickle', 'rb') as f:
    unigramIndex = pickle.load(f)

with open('./Data/finaldf.pickle', 'rb') as f:
    dataframe = pickle.load(f)

dataframe = dataframe.drop_duplicates(
    subset=dataframe.columns.difference(['id']), keep='first')

dataframe['ingredients'] = dataframe['ingredients'].apply(
    lambda x: x.split(", "))

dataframe = dataframe[dataframe['Level:'] != "None"]
dataframe.fillna(fn, inplace=True)
# dataframe.to_csv("hello.csv", index=False)
with open('./Data/ingredients_supercook_for_flask', 'rb') as f:
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
    return recipe


def putLevel(stringName):
    if stringName == "Advanced":
        return 2
    elif stringName == "Intermediate":
        return 1
    elif stringName == "Easy":
        return 0


def calculateTime(time):
    words = time.lower().split()
    curr = 0
    for i in range(0, len(words), 2):
        if words[i+1][0] == 'd':
            curr += int(words[i])*24*60
        elif words[i+1][0] == 'h':
            curr += int(words[i])*60
        elif words[i+1][0] == 'm':
            curr += int(words[i])
        else:
            print("khatra khatra khatra", time)
    return curr


def fetchRecipes(queryIngs, page, chhantneKaParam):

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
    # Find the documents given by the OR query
    finalAns = dataframe[dataframe['id'].isin(
        ans)][['id', 'ingredients', 'Level:', 'Total:']].reset_index(drop=True)

    # Get the number of common ingredients between the query and the document
    finalAns['number'] = finalAns['ingredients'].apply(
        lambda x: len(set(x).intersection(queryset)))
    finalAns['levelNum'] = finalAns['Level:'].apply(putLevel)
    finalAns['totalTime'] = finalAns['Total:'].apply(calculateTime)

    if chhantneKaParam == "num-selected-ingredients":
        finalAns = finalAns.sort_values(by=['number'], ascending=False)
    elif chhantneKaParam == "level-asc":
        finalAns = finalAns.sort_values(by=['levelNum'], ascending=True)
    elif chhantneKaParam == "level-desc":
        finalAns = finalAns.sort_values(by=['levelNum'], ascending=False)
    elif chhantneKaParam == "time-asc":
        finalAns = finalAns.sort_values(by=['totalTime'], ascending=True)
    elif chhantneKaParam == "time-desc":
        finalAns = finalAns.sort_values(by=['totalTime'], ascending=False)
    else:
        finalAns = finalAns.sort_values(by=['number'], ascending=False)

    # Drop the columns not neede to reduce the size of the response
    finalAns = finalAns.drop(
        columns=['ingredients', 'number', 'Level:', 'Total:', 'levelNum', 'totalTime'])

    # Reset the index
    finalAns = finalAns.reset_index(drop=True)

    # Get the the values (int(page)-1)*10 to int(page)*10
    recipe_ids = finalAns['id'].values[(int(page)-1)*10:int(page)*10]

    # get detailed information from the document(recipe) id
    finaldf = dataframe[dataframe['id'].isin(
        recipe_ids)].reset_index(drop=True)

    # Find common ingredients
    finaldf['common'] = finaldf['ingredients'].apply(
        lambda x: list(set(x).intersection(queryset)))
    finaldf['number'] = finaldf['ingredients'].apply(
        lambda x: len(set(x).intersection(queryset)))
    finaldf['totalTime'] = finaldf['Total:'].apply(calculateTime)
    finaldf['levelNum'] = finaldf['Level:'].apply(putLevel)

    if chhantneKaParam == "num-selected-ingredients":
        finaldf = finaldf.sort_values(by=['number'], ascending=False)
    elif chhantneKaParam == "level-asc":
        finaldf = finaldf.sort_values(by=['levelNum'], ascending=True)
    elif chhantneKaParam == "level-desc":
        finaldf = finaldf.sort_values(by=['levelNum'], ascending=False)
    elif chhantneKaParam == "time-asc":
        finaldf = finaldf.sort_values(by=['totalTime'], ascending=True)
    elif chhantneKaParam == "time-desc":
        finaldf = finaldf.sort_values(by=['totalTime'], ascending=False)
    else:
        finaldf = finaldf.sort_values(by=['number'], ascending=False)

    finaldf = finaldf.reset_index(drop=True)
    # Drop the columns not neede to reduce the size of the response
    finaldf = finaldf.drop(
        columns=['ingredients', 'Nutrition Info', 'Method', 'number', 'levelNum', 'totalTime'])

    # convert dataframe to list of dictionaries
    recipes_formatted = {}
    recipes_formatted['results'] = finaldf.to_dict('records')
    recipes_formatted['total'] = finalAns.shape[0]
    return recipes_formatted
