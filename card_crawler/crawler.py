# Do we want to show debug messages?
# 0 = Off, 1 = Low, 2 = Medium, 3 = High, 4 = Extreme
debugLevel = 2

# Go to this link and save it as excel in this folder under the name "Cards Against Humanity.xlsx"
# https://docs.google.com/spreadsheets/d/1lsy7lIwBe-DWOi2PALZPf5DgXHx9MEvKfRw1GaWQkzg/edit#gid=1583239191

# An amazing thank you to the people that put this whole sheet together. This project would've been a lot worse to
# manage without it.


# Which sheets do we want to read from? (I'm later going to add more options)
# Just a sheet to grab everything, or be in the form of:
#  { 
#   "sheet": "sheetName",
#   "include": ["Packnames (case sensitive)"], #optional, only loads these packs
#   "exclude": ["Packnames (case sensitive)"], #optional, loads all packs except these ones
#   "cardFixer": [ #optional, used to fix cards (Like PAX cards have "(Pax East 2014)" for exammple behind it)
#       {
#           "pack": "Pack name (case sensitive)", # optional for all
#           "regexFrom": "regex",
#           "regexTo": "regex"
#       }
#   }
# }


# Don't include the "CAH Main Deck" sheet in here. This deck needs to be handled customly
sheetsToCrawl = [
    "CAH Expansions",
    {
        "sheet": "CAH Packs",
        "exclude": ["Card Lab"],
        # "include": [ "Geek Pack" ], #For testing regex
        "cardFixer": [
            {
                "pack": "Geek Pack",
                "regexFrom": "\(Pax [^)]+\)",
                "regexTo": ""
            }
        ]
    }
]


# Main deck options, this file needs to be handled a
# bit differently, so we use a different format for this 
mainDeckOptions = {
    "sheet": "CAH Main Deck",
    "grab": [
        { "edition": "AU", "version": "v2.0" },
        { "edition": "CA", "version": "v2.0" },
        { "edition": "INTL", "version": "v2.0" },
        { "edition": "UK", "version": "v2.0" },
        { "edition": "US", "version": "v2.1" },
    ]
}

# Ordering
packOrdering = {
    "CAH Main Deck": 1,
    "CAH Expansions": 2,
    "CAH Packs": 3,
}


############################################
# -- From this point no more setting up -- #
############################################
import pandas as pd
import pprint
import re
import uuid
pp = pprint.PrettyPrinter(indent=4)

# Fix using just a string
oldSheetsToCrawl = sheetsToCrawl
sheetsToCrawl = []
for sheet in oldSheetsToCrawl:
    if type(sheet) is str:
        sheetsToCrawl.append({ "sheet": sheet })
    else:
        sheetsToCrawl.append(sheet)
        

# We load the excel sheet
print("Loading excel file")
mainSheetFile = pd.ExcelFile("./Cards Against Humanity.xlsx")

# Cache all sheets that we want to crawl
print("Creating sheet cache")
crawlSheets = {}
for sht in sheetsToCrawl:
    crawlSheets[sht["sheet"]] = {
        "options": sht,
        "sheet": pd.read_excel(mainSheetFile, sht["sheet"], header=None)
    }


# Here we detect all the packs
def doSetDetection(sheet):
    sets = {}

    startRow = 0
    # We first check where the "Set" row starts. We do this by
    # just starting at (0,0) and move 1 row down until we found "Set"
    while len(sheet) - 1 > startRow:
        if sheet.iloc[startRow, 0] == 'Set':
            break
        startRow += 1


    initialCols = []
    col = 0
    # Then we detect which columns indicate the "Set"'s. We do this by
    # using the startRow we detected before, and move 1 to the right
    # and check if there are any other "Set"'s. 
    while len(sheet.iloc[startRow])-1 > col:
        if sheet.iloc[startRow, col] == 'Set':
            initialCols.append(col)
        col += 1

    # Now we know which colums contain the "Set"'s we can figure out where
    # every set starts 
    for col in initialCols:
        row = 0
        while len(sheet)-1 > row:
            if (sheet.iloc[row, col] == 'Set'):
                sets[sheet.iloc[row, col+1]] = { "row": row, "col": col }
            row += 1
    
    #and return it
    return sets




versionRegex = re.compile('v[0-9]', re.IGNORECASE)
# Here we convert all sets to packs
def getAllPacks():
    packs = []
    # We go over all sheets
    for index, sheetName in enumerate(crawlSheets):
        currentSheetObj = crawlSheets[sheetName]
        currentSheet = currentSheetObj["sheet"]
        sheetOptions = currentSheetObj["options"]

        allSheetSets = doSetDetection(currentSheet)
        # Then we grab all sets in the sheet and convert them to packs
        for packName in allSheetSets:
            setStart = allSheetSets[packName]
            if "include" in sheetOptions:
                if packName not in sheetOptions["include"]:
                    continue

            if "exclude" in sheetOptions:
                if packName in sheetOptions["exclude"]:
                    continue
            
            col = setStart["col"]
            row = setStart["row"]

            specialCol = None
            versionCol = None
            # This tells that the last version we checked was empty, so we don't have to continue 
            # doing checks (just a performance thing)
            lastVersionWasEmpty = False

            currentColumn = col - 1
            while True:
                currentColumn += 1
                # Stop IOOB Exception
                if len(currentSheet.iloc[row]) - 1 < currentColumn: break

                value = currentSheet.iloc[row][currentColumn]
                if pd.isnull(value):
                    break

                value = value.lower()

                if value == 'special': specialCol = currentColumn

                # Some packs have empty version columns, very annoying
                # So we need to make sure that a version column is not empty
                if versionRegex.match(value):
                    # If previous version was empty we know this one will be to, so skip
                    if lastVersionWasEmpty:
                        continue
                    versRow = row + 1
                    while len(currentSheet)-2 > versRow:
                        # If the current Row being checked contains "Set" at the start
                        # then we know we are on a new pack so skip
                        if currentSheet.iloc[versRow][col] == 'Set':
                            break

                        # If the current row its cell is empty, we want to continue to next cell
                        if pd.isnull(currentSheet.iloc[versRow][currentColumn]):
                            versRow += 1
                            continue
                        
                        # If this current cell is the same value as the version we know this 
                        # version is valid
                        if currentSheet.iloc[versRow][currentColumn] == value:
                            versionCol = currentColumn
                            break
                        versRow += 1
                    
                    if versionCol != currentColumn:
                        lastVersionWasEmpty = True

            if debugLevel >= 3:
                print("\n\n\n")
                print("Sheet name:", sheetName)
                print("PackName:", packName)
                print("StartingCol:", [row, col])
                print("specialCol:", [row, specialCol])
                print("VersionCol:", [row, versionCol])

            packs.append({
                "sheetName": sheetName,
                "packName": packName,
                "sheetPos": [row, col],
                "specialCol": specialCol,
                "versionCol": versionCol
            })
    return packs

pickRegex = re.compile('pick ?([0-9]+)', re.IGNORECASE)
drawRegex = re.compile('draw ?([0-9]+)', re.IGNORECASE)
def processPack(pack, sheetObj):
    currentRow, col = pack["sheetPos"]
    sheet = sheetObj["sheet"]

    specialCol = pack["specialCol"]
    versionCol = pack["versionCol"]
    
    prompts = []
    responses = []

    while True:
        currentRow += 1
        # Stop IOOB Exception
        if len(sheet) - 1 < currentRow: break

        cardType = sheet.iloc[currentRow][col]
        # If value is "Set" it means we are on the next pack already, so stop
        if cardType == "Set": break

        cardText = sheet.iloc[currentRow][col+1]

        # Sometimes there are whitespaces between cards, we fix it with this
        if pd.isnull(cardText):
            continue

        # Check if the card is in the version we're currently using
        if versionCol != None and pd.isnull(sheet.iloc[currentRow][versionCol]):
            continue

        # If we need to fix some cards we do it here
        if "options" in sheetObj and "cardFixer" in sheetObj["options"]:
            for fixer in sheetObj["options"]["cardFixer"]:
                if "pack" not in fixer or fixer["pack"] == pack["packName"]:
                    cardText = re.sub(fixer["regexFrom"], fixer["regexTo"], cardText)

        #remove whitespaces at front and end
        cardText = cardText.strip()

        pick = 1
        draw = 0

        if specialCol != None:
            # If we have a "Special" column we handle it here
            # Afaik it's only to deal with multiple picks/draws
            special = sheet.iloc[currentRow][specialCol]
            if not pd.isnull(special):
                specials = special.split(",")
                # There can be multiple specials, so we iterate over all of them
                for spec in specials:
                    pickMatch = pickRegex.match(spec.strip())
                    drawMatch = drawRegex.match(spec.strip())
                    if pickMatch:
                        pick = int(pickMatch.group(1))
                    if drawMatch:
                        draw = int(drawMatch.group(1))
            

        if cardType == "Prompt":
            prompts.append({
                "id": str(uuid.uuid4()),
                "text": cardText,
                "pick": pick,
                "draw": draw
            })
        elif cardType == "Response":
            responses.append({
                "id": str(uuid.uuid4()),
                "text": cardText
            })


    return {
        "prompts": prompts,
        "responses": responses
    }


def handleMainDeck():
    # Handling the main deck
    mainSheet = pd.read_excel(mainSheetFile, mainDeckOptions["sheet"], header=None)
    crawlSheets[mainDeckOptions["sheet"]] = {
        "sheet": mainSheet,
        "options": {
            "sheet": mainDeckOptions["sheet"]
        }
    }

    mainRow = 0

    # Get the set row
    while len(mainSheet.index) - 1 > mainRow:
        if mainSheet.iloc[mainRow][0] == "Set":
            break
        mainRow += 1

    # Find the special col
    specialCol = 0
    while len(mainSheet.iloc[mainRow]) > specialCol:
        if mainSheet.iloc[mainRow][specialCol] == "Special":
            break
        specialCol += 1

    mainDecks = []
    for option in mainDeckOptions["grab"]:    
        col = 0
        versionCol = 0
        while len(mainSheet.iloc[mainRow]) > col:
            if mainSheet.iloc[mainRow][col] == option["version"] and mainSheet.iloc[mainRow-1][col] == option["edition"]:
                versionCol = col
                break
            col += 1
        
        if versionCol == 0:
            print("Couldn't find version column for", option["edition"])
            continue

        mainDecks.append({
            "sheetName": mainDeckOptions["sheet"],
            "packName": mainSheet.iloc[mainRow][1] + " ("+option["edition"]+")",
            "sheetPos": [mainRow, 0],
            "specialCol": specialCol,
            "versionCol": versionCol
        })

    return mainDecks



## Get all the packs
print("Getting all the packs from the sheets")
allPacks = getAllPacks() + handleMainDeck()

if debugLevel >= 2:
    pp.pprint(allPacks)

print(len(allPacks), "packs found")

if len(allPacks) == 0:
    print("Stopping as there's nothing to process")
    exit()

processedPacks = []
for pack in allPacks:
    cards = processPack(pack, crawlSheets[pack["sheetName"]])
    if debugLevel >= 3:
        pp.pprint(cards)
    
    if len(cards["prompts"]) == 0 and len(cards["responses"]) == 0:
        if debugLevel >= 1:
            print(pack["packName"], "didn't return any cards")
        continue

    if debugLevel >= 2:
        print(
            pack["packName"], 
            "("+crawlSheets[pack["sheetName"]]["sheet"].iloc[pack["sheetPos"][0]][pack["versionCol"]]+")" if pack["versionCol"] != None else "",
             "contains", len(cards["prompts"]), "prompt cards and", len(cards["responses"]), "response cards"
        )

    packObj = {
        "id": str(uuid.uuid4()),
        "name": pack["packName"],
        "promptCount": len(cards["prompts"]),
        "responseCount": len(cards["responses"]),
        "prompts": cards["prompts"],
        "responses": cards["responses"]
    }

    processedPacks.append({
        "sheet": pack["sheetName"],
        "pack": packObj
    })


# We group all packs together so we can later show them in a nice list
groups = {}
for pack in processedPacks:
    if pack["sheet"] not in groups:
        groups[pack["sheet"]] = []
    
    groups[pack["sheet"]].append(pack["pack"])

oldGroups = groups
groups = []
for index, group in enumerate(oldGroups):
    groups.append({
        "name": group,
        "orderNumber": packOrdering[group],
        "packs": oldGroups[group]
    })


if debugLevel >= 4:
    pp.pprint(groups)

print("Processed all packs")

## Now here we do the exporting to mongodb
## if you want to use a different output you'll have to implement it yourself
print("Starting export to mongoDb")
import pymongo

mongoClient = pymongo.MongoClient("mongodb://localhost:27017/")
mongoDb = mongoClient["cah"]
packCol = mongoDb["packGroups"]
print("Deleting all previous packs")
packCol.delete_many({})
print("Inserting processed packs")
packCol.insert_many(groups)


print("All done!")