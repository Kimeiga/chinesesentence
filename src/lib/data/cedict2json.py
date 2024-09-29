import json
import os
import re

PinyinToneMark = {
    0: "aoeiuv\u00fc",
    1: "\u0101\u014d\u0113\u012b\u016b\u01d6\u01d6",
    2: "\u00e1\u00f3\u00e9\u00ed\u00fa\u01d8\u01d8",
    3: "\u01ce\u01d2\u011b\u01d0\u01d4\u01da\u01da",
    4: "\u00e0\u00f2\u00e8\u00ec\u00f9\u01dc\u01dc",
}


def decode_pinyin(s):
    s = s.lower()
    r = ""
    t = ""
    for c in s:
        if c >= "a" and c <= "z":
            t += c
        elif c == ":":
            if t and t[-1] == "u":
                t = t[:-1] + "\u00fc"
            else:
                r += t + ":"
                t = ""
        else:
            if c >= "0" and c <= "5":
                tone = int(c) % 5
                if tone != 0:
                    m = re.search("[aoeiuv\u00fc]+", t)
                    if m is None:
                        t += c
                    elif len(m.group(0)) == 1:
                        t = (
                            t[: m.start(0)]
                            + PinyinToneMark[tone][PinyinToneMark[0].index(m.group(0))]
                            + t[m.end(0) :]
                        )
                    else:
                        if "a" in t:
                            t = t.replace("a", PinyinToneMark[tone][0])
                        elif "o" in t:
                            t = t.replace("o", PinyinToneMark[tone][1])
                        elif "e" in t:
                            t = t.replace("e", PinyinToneMark[tone][2])
                        elif t.endswith("ui"):
                            t = t.replace("i", PinyinToneMark[tone][3])
                        elif t.endswith("iu"):
                            t = t.replace("u", PinyinToneMark[tone][4])
                        else:
                            t += "!"
            else:
                r += t + c
                t = ""
    r += t
    return r


def process_cedict_file(file_path):
    entries = {}

    with open(file_path, "r", encoding="utf-8") as file:
        for line in file:
            if line.startswith("#"):  # Skip comment lines
                continue

            parts = line.strip().split(" ", 2)
            if len(parts) < 3:
                continue

            trad, simp = parts[0], parts[1]
            rest = parts[2]

            # Extract pronunciations and definitions
            match = re.match(r"\[(.*?)\] /(.*?)/$", rest)
            if not match:
                continue

            pinyin, definitions = match.groups()
            pinyin = decode_pinyin(pinyin)
            defs = definitions.split("/")

            # Add to entries
            for char in set([trad, simp]):
                if char not in entries:
                    entries[char] = []
                entries[char].append([pinyin, defs])

    # Create JSON files
    output_dir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "dictionary")
    )
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for char, data in entries.items():
        filename = os.path.join(output_dir, f"{char}.json")
        with open(filename, "w", encoding="utf-8") as f:
            if len(data) == 1:
                json.dump(data[0], f, ensure_ascii=False, separators=(",", ":"))
            else:
                json.dump(
                    list(zip(*data)), f, ensure_ascii=False, separators=(",", ":")
                )


# Usage
script_dir = os.path.dirname(os.path.abspath(__file__))
cedict_file_path = os.path.join(script_dir, "cedict_ts.u8")
process_cedict_file(cedict_file_path)
