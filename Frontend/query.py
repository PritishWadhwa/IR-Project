'''
Code to fetch recipes according to given ingredients
'''

import pickle
import pandas as pd
import os
import ast


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


def fetchRecipes(queryIngs):

    if (len(queryIngs) == 0):
        return []

    with open('../Backend/Saved/unigramIndex.pickle', 'rb') as f:
        unigramIndex = pickle.load(f)

    dataframe = pd.read_csv('../Backend/Saved/newDf.csv')
    dataframe = dataframe.drop('fully_final_ingredients', axis=1)
    images = pd.read_csv('../Backend/Saved/images_dataset.csv')

    # Take OR of all the postings lists
    ans = []
    for i in queryIngs:
        ans = OR(unigramIndex[i][1], ans)

    # get all ingredients of the matched documents to count number of ingredients matched with query ingredients
    finalAns = []
    for i in ans:
        ings = dataframe.loc[i]['ingredients']
        ings = ings.split(', ')
        query = set(queryIngs)
        ings = set(ings)
        finalAns.append((i, len(query.intersection(ings))))

    # ranking of the recipes according to maximum ingredients matched to query
    finalAns = sort_tuple(finalAns)[::-1]

    # get only the first 50 recipes
    # pagination/ infinite scroll ??
    finalAns = finalAns[:50]  # format: [(51789, 3), (2334, 3), (46643, 2) ...]

    # get first elements of the tuples
    recipe_ids = list(zip(*finalAns))[0]

    # get detailed information from the document(recipe) id
    dfnew = dataframe.iloc[list(recipe_ids)]
    imnew = images.iloc[list(recipe_ids)]

    # concatenating the two dfs in front of each other
    finaldf = pd.concat([dfnew, imnew], axis=1)

    # convert dataframe to list of dictionaries
    recipes_formatted = finaldf.to_dict('records')
    for recipe in recipes_formatted:
        recipe['Nutrition Info'] = ast.literal_eval(recipe['Nutrition Info'])
        recipe['Method'] = ast.literal_eval(recipe['Method'])
        recipe['ingredients'] = recipe['ingredients'].split(", ")
    # print(recipes_formatted)
    return recipes_formatted
