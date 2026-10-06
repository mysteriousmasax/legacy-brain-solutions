import re
import requests
from urllib.parse import urljoin

sites = [
    ('BRELA', 'https://www.brela.go.tz/'),
    ('TRA', 'https://www.tra.go.tz/'),
    ('COSOTA', 'https://www.cosota.go.tz/'),
    ('BASATA', 'https://www.basata.go.tz/'),
    ('NSSF', 'https://www.nssf.or.tz/'),
    ('TCAA', 'https://www.tcaa.go.tz/'),
    ('TCRA', 'https://www.tcra.go.tz/'),
    ('BOT', 'https://www.bot.go.tz/'),
    ('RITA', 'https://www.rita.go.tz/'),
]

for name, url in sites:
    print(f'\n=== {name} {url}')
    try:
        r = requests.get(url, timeout=20, headers={'User-Agent': 'Mozilla/5.0'})
        print('status', r.status_code)
        text = r.text
        matches = re.findall(r'<img[^>]+(?:src|data-src)=["\']([^"\']+)["\']', text, flags=re.I)
        seen = []
        for m in matches:
            s = m.strip()
            if s.startswith('//'):
                s = 'https:' + s
            if not s.startswith('http'):
                s = urljoin(url, s)
            if any(k in s.lower() for k in ['logo', 'emblem', 'icon', 'mark', 'png', 'jpg', 'jpeg', 'svg', 'gif']):
                if s not in seen:
                    seen.append(s)
        for s in seen[:30]:
            print(s)
    except Exception as e:
        print('ERR', e)
