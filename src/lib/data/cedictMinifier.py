import ujson

exceptions = {"个": "generic classifier for noun", "吗": "question particle", "被": "by"}

with open("cedict.json", "r") as f:
    cedict = ujson.load(f)

    new_cedict = {}

    # remove only the 2nd element from each cedict entry's array
    # which is the pronunciation
    for word, entries in cedict.items():
        for entry in entries:
            if len(entry) < 2:
                print(entry)
            entry[1] = entry[1][1:]

        new_cedict[word] = entries

    with open("cedict.min.json", "w") as f:

        ujson.dump(new_cedict, f)
