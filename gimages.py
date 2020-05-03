'''
get images for each article from google images
(first one usally matches the articles title.)
'''
import requests
import json
import re

def get_google_img(query):
    url = "https://www.google.com/search?q=" + str(query) + "&source=lnms&tbm=isch"
    headers={'User-Agent':"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36"}

    try:
        html = requests.get(url, headers=headers).text
    except requests.ConnectionError:
        print("couldn't reach google")

    links = []
    for line in html.split('\n'):
        if 'https://ichef.bbci.co.uk/news' in line:
            print(line)
            links.extend(re.findall(r'https://ichef.bbci.co.uk/news/.+jpg', html))
            break

    if len(links) <= 0:
        print('no image')
    else:
        print('image')

    return links[0] if len(links) > 0 else 'https://ichef.bbci.co.uk/images/ic/1008x567/p07jbsw9.jpg'


with open('./articles.json') as fp:
    articles = json.load(fp)

if __name__ == '__main__':
    for a in articles:
        a['img'] = get_google_img(a['title'])

    with open('full.json', 'w+') as fp:
        json.dump(articles, fp, indent=4)

