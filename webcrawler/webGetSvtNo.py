import pandas as pd
from webFetchSvtName import getLuckyBagSvtname

# Mapping of class names
class_name_map = {
    "セイバー": "Saber",
    "アーチャー": "Archer",
    "ランサー": "Lancer",
    "ライダー": "Rider",
    "キャスター": "Caster",
    "アサシン": "Assassin",
    "バーサーカー": "Berserker",
    "ルーラー": "Ruler",
    "アヴェンジャー": "Avenger",
    "ムーンキャンサー": "Mooncancer",
    "アルターエゴ": "Alterego",
    "フォーリナー": "Foreigner",
    "プリテンダー": "Pretender",
    "ビースト": "Beast",
    "シールダー": "Shielder",
}

def process_servant_name(svt_name):
    """
    Handles special cases and replaces specific characters in servant names.
    """
    # Define the exceptions for special servant names
    name_updates = {
        "巌窟王 エドモン･ダンテス": "巌窟王",
        "ジェームズ･モリアーティ(新宿のアーチャー)": "ジェームズ・モリアーティ",
        "魔王信長(織田信長)": "魔王信長",
        "カレン･Ｃ･オルテンシア(アムール〔カレン〕)": "アムール〔カレン〕",
        "メリュジーヌ(妖精騎士ランスロット)": "メリュジーヌ",
        "救世主トネリコ(雨の魔女トネリコ)": "雨の魔女トネリコ",
        "グレゴリー･ラスプーチン": "言峰綺礼",
        "武田信玄(武田晴信)": "武田晴信",
        "巌窟王 モンテ･クリスト": "巌窟王　モンテ・クリスト",
        "阿曇磯良(ひびき＆千鍵)" : "ひびき＆千鍵"
    }

    # Apply special name updates if applicable
    updated_name = name_updates.get(svt_name, svt_name)

    # Replace special characters
    updated_name = updated_name.replace("･", "・").replace(":", "：")

    return updated_name

def getLuckyBagArr(url):

    # Load the Excel file
    file_path = "5_servents.xlsx"
    df = pd.read_excel(file_path)

    # Fetch `table_mixed` using the function
    table_mixed = getLuckyBagSvtname(url)

    # Create a dictionary for quick lookup with normalized servant names
    lookup_dict = {
        f"{row['className']}{process_servant_name(row['name_JP'])}": row['collectionNo']
        for _, row in df.iterrows()
    }

    # Process `table_mixed` and generate `table_collections`
    table_collections = []

    for table in table_mixed:
        table_collection = []
        for entry in table:
            class_name, name_jp = entry.split("_")
            class_name_eng = class_name_map.get(class_name, class_name)

            name_jp = process_servant_name(name_jp)

            key = f"{class_name_eng}{name_jp}"

            # Lookup collection number
            collection_no = lookup_dict.get(key)
            if collection_no:
                table_collection.append(collection_no)
            else:
                print(f"Unmatched Entry: {entry} -> Key: {key}")

        if table_collection:
            table_collections.append(table_collection)

    return table_collections