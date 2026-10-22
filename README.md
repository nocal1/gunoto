# Gün Oto, web sitesi (tasarım önizlemesi)

Gün Oto Euro Repar Servis (Kepez, Antalya) için tek sayfalık statik site. Derleme adımı yok: HTML, CSS ve JavaScript.

## Yayın

Netlify bu depoya bağlı. `main` dalına yapılan her push siteyi otomatik günceller.

Canlı önizleme: https://gun-oto-onizleme.netlify.app

## Yerelde açma

`index.html` dosyasına çift tıklamak yeterli.

## Önizleme modu

Site işletmenin onayı alınana kadar önizleme modunda. Kapatmak için koddaki `ÖNİZLEME` notlarını izleyin:

- `index.html`: önizleme şeridi ve `noindex` meta etiketi
- `robots.txt`: `Disallow: /` satırı
- `_headers`: `X-Robots-Tag` satırı
- `script.js`: `PREVIEW = true`

Fotoğraflar işletmenin ve müşterilerin Google Haritalar fotoğrafları. Yayından önce izin alınmalı.
