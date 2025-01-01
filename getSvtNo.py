import pandas as pd

# 讀取 Excel 檔案
file_path = "5_servents.xlsx"  # 替換為你的檔案路徑
df = pd.read_excel(file_path)

def search_by_japanese_name(jp_name):
    # 篩選符合日文名字的項目
    results = df[df["name_JP"].str.contains(jp_name, na=False)]

    # 如果有找到，格式化輸出
    if not results.empty:
        for _, row in results.iterrows():
            print(f'{row["collectionNo"]}\t{row["className"]}\t{row["name_JP"]}\t{row["name_TW"]}')
    else:
        print("未找到符合的項目。")

print("請輸入日文名字 (按 Ctrl+C 結束)：")

# 無窮迴圈直到用戶按 Ctrl+C 結束
try:
    while True:
        jp_name_input = input(">> ")  # 提示用戶輸入
        search_by_japanese_name(jp_name_input)
except KeyboardInterrupt:
    print("\n程式已結束。")
