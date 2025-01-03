import requests
from bs4 import BeautifulSoup

def getLuckyBagSvtname(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    table_mixed = []
    tables = soup.find_all("table", class_="trbgcolor")

    for table in tables:
        servants = []
        current_class = ""
        current_rarity = ""
        rows = table.select("tr")

        for row in rows:
            class_name = row.find("td", class_="bd_l_none")
            servant_name = row.find("span", class_="icon_right_txt")
            servant_star = row.find("td", class_="servant_star bg_star_lb")

            # Update class if found
            if class_name:
                current_class = class_name.text.strip()

            # Update rarity if found
            if servant_star:
                current_rarity = servant_star.text.strip()

            # Append servant if rarity matches ★★★★★
            if servant_name and current_rarity == "★★★★★":
                servants.append(f"{current_class}_{servant_name.text.strip()}")

        # Add non-empty lists only
        if servants:
            table_mixed.append(servants)
    return table_mixed