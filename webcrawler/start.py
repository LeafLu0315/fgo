from webGetSvtNo import getLuckyBagArr
url = "https://news.fate-go.jp/2025/luckybag2025"
svt_arr = getLuckyBagArr(url)
for items in svt_arr:
    print(items)