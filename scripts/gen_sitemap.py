import os, urllib.parse, sys
from datetime import date

BASE_URL = 'https://secondopt.com.ua'
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)
IMAGES_DIR = os.path.join(ROOT_DIR, 'images')
TODAY = date.today().isoformat()

CATEGORY_TITLES = {
    'Одяг': 'Одяг секонд-хенд гуртом — L-TEX',
    'Взуття': 'Взуття секонд-хенд оптом — L-TEX',
    'Сумки та аксесуари': 'Сумки та аксесуари секонд-хенд — L-TEX',
    'Дім та побут': 'Товари для дому секонд-хенд — L-TEX',
    'Іграшки': 'Іграшки секонд-хенд гуртом — L-TEX',
    'Bric-a-Brac': 'Bric-a-Brac вінтаж антикваріат — L-TEX',
    'Косметика': 'Косметика та парфумерія секонд-хенд — L-TEX',
    'Наш склад та товар': 'Склад L-TEX — секонд-хенд гуртом Луцьк',
    'Головне фото': 'L-TEX секонд-хенд гуртом — склад Луцьк',
}

SUBPAGES = [
    {'loc': BASE_URL + '/', 'lastmod': TODAY, 'changefreq': 'weekly', 'priority': '1.0', 'imageFolder': None},
    {'loc': BASE_URL + '/odyag.html', 'lastmod': TODAY, 'changefreq': 'monthly', 'priority': '0.8', 'imageFolder': 'Одяг'},
    {'loc': BASE_URL + '/vzuttya.html', 'lastmod': TODAY, 'changefreq': 'monthly', 'priority': '0.8', 'imageFolder': 'Взуття'},
    {'loc': BASE_URL + '/sumky.html', 'lastmod': TODAY, 'changefreq': 'monthly', 'priority': '0.8', 'imageFolder': 'Сумки та аксесуари'},
    {'loc': BASE_URL + '/dim-pobut.html', 'lastmod': TODAY, 'changefreq': 'monthly', 'priority': '0.7', 'imageFolder': 'Дім та побут'},
    {'loc': BASE_URL + '/igrashky.html', 'lastmod': TODAY, 'changefreq': 'monthly', 'priority': '0.7', 'imageFolder': 'Іграшки'},
    {'loc': BASE_URL + '/bric-a-brac.html', 'lastmod': TODAY, 'changefreq': 'monthly', 'priority': '0.7', 'imageFolder': 'Bric-a-Brac'},
]

def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

def get_imgs(folder):
    p = os.path.join(IMAGES_DIR, folder)
    if not os.path.isdir(p):
        return []
    return sorted(f for f in os.listdir(p) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')))

lines = []
lines.append('<?xml version="1.0" encoding="UTF-8"?>')
lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
lines.append('        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">')

total = 0

for page in SUBPAGES:
    lines.append('  <url>')
    lines.append('    <loc>' + esc(page['loc']) + '</loc>')
    lines.append('    <lastmod>' + page['lastmod'] + '</lastmod>')
    lines.append('    <changefreq>' + page['changefreq'] + '</changefreq>')
    lines.append('    <priority>' + page['priority'] + '</priority>')

    if page['loc'].endswith('/'):
        for folder, title in CATEGORY_TITLES.items():
            for f in get_imgs(folder):
                url = BASE_URL + '/images/' + urllib.parse.quote(folder) + '/' + urllib.parse.quote(f)
                lines.append('      <image:image>')
                lines.append('        <image:loc>' + esc(url) + '</image:loc>')
                lines.append('        <image:title>' + esc(title) + '</image:title>')
                lines.append('      </image:image>')
                total += 1
        root_imgs = sorted(f for f in os.listdir(IMAGES_DIR) if os.path.isfile(os.path.join(IMAGES_DIR, f)) and f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')))
        for f in root_imgs:
            url = BASE_URL + '/images/' + urllib.parse.quote(f)
            lines.append('      <image:image>')
            lines.append('        <image:loc>' + esc(url) + '</image:loc>')
            lines.append('        <image:title>L-TEX секонд-хенд гуртом — склад Луцьк</image:title>')
            lines.append('      </image:image>')
            total += 1
    elif page['imageFolder']:
        folder = page['imageFolder']
        title = CATEGORY_TITLES.get(folder, folder)
        for f in get_imgs(folder):
            url = BASE_URL + '/images/' + urllib.parse.quote(folder) + '/' + urllib.parse.quote(f)
            lines.append('      <image:image>')
            lines.append('        <image:loc>' + esc(url) + '</image:loc>')
            lines.append('        <image:title>' + esc(title) + '</image:title>')
            lines.append('      </image:image>')
            total += 1

    lines.append('  </url>')

lines.append('</urlset>')

output_path = os.path.join(ROOT_DIR, 'sitemap.xml')
with open(output_path, 'w', encoding='utf-8') as out:
    out.write('\n'.join(lines) + '\n')

print('Sitemap generated: ' + output_path)
print('Total images: ' + str(total))
