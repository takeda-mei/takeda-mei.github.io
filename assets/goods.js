/* =====================================================================
   グッズの情報（ここだけを書き換える）
   GOODS ページと、予約完了のダイアログ（会場限定グッズ）の両方がこれを読む。
   値が空・null の項目は、その部分を出さない（未定の情報を出さないため）。
   ===================================================================== */
window.MEI_GOODS = {
  // SUZURI（通信販売）のショップのアドレス。空なら「準備中」になり、押せない
  suzuri: 'https://suzuri.jp/takeda_mei',

  // 商品。where：'online'（SUZURI の通信販売）・'venue'（ライブ会場限定）
  // 会場限定のものは、予約完了のダイアログにも出る
  // images：商品の写真（GOODS ページに出る）。assets/goods/ に写真を置いて、パスを並べる。
  //   1枚目が最初に出る。2枚以上なら小さい写真が並び、押すと切り替わる（キーホルダーの2種、Tシャツの表・裏など）
  //   書き方：'assets/goods/nfc-a.jpg' または { src: 'assets/goods/nfc-a.jpg', alt: 'キーホルダー A' }
  //   空なら、写真の代わりに線画が出る（ファイルが置かれていないときも線画に戻る）
  // url：通信販売の商品だけ。SUZURI の商品ページのアドレス（https://suzuri.jp/...）。「SUZURI で見る」でそこが開く。空ならショップのトップが開く
  items: [
    { id: 'tshirt',   name: 'T-shirt',          price: 4950, sizes: ['S', 'M', 'L', 'XL'], where: 'online', images: ['assets/goods/tshirts-img-1.png' ,'assets/goods/tshirts-img-2.png' ], url: 'https://suzuri.jp/takeda_mei/14348428/big-t-shirt/xl/black' },
     { id: 'totobag',   name: 'トートバッグ',          price: 3410, sizes: [], where: 'online', images: ['assets/goods/totobag-1.png' ], url: 'https://suzuri.jp/takeda_mei/14348428/tote-bag/m/natural' },
    { id: 'cassette', name: 'カセットテープ',   price: 2000, note: '試聴は LISTEN で', where: 'venue', images: ['assets/goods/cassette.jpg'],
      // reels：写真の中の「窓」の位置（写真の幅・高さに対する %）。ここにリールとテープの動く線画を重ねる（1枚目の写真のときだけ）
      //   写真を差し替えて窓の位置が変わったら、ここを直す。null にすると重ねない
      reels: { x: 17.52, y: 34.56, w: 63.52, h: 41.05 } },
    { id: 'sticker',  name: 'Sticker シール',      price: 300,  where: 'venue', images: ['assets/goods/logo-sticker.png'] },
    { id: 'nfc',      name: 'NFC キーホルダー', price: 1000, note: '全2種・各 ¥1,000　かざすと Spotify が開く NFC タグ付き', where: 'venue', images: ['assets/goods/nfc-tag-1.png', 'assets/goods/nfc-tag-2.png'] }
  ],

  // カセットの詳しい情報（分かったものだけ入れる。空の項目は出さない）
  cassette: { title: '', tracks: '', release: '', buy: '' }
};

/* 価格の表示（¥4,950）。null なら空 */
window.MEI_GOODS.yen = function (v) { return typeof v === 'number' ? '¥' + v.toLocaleString('ja-JP') : ''; };

/* 名前 …… 価格 の一覧を作る（GOODS ページとダイアログで共通） */
window.MEI_GOODS.priceList = function (items) {
  var ul = document.createElement('ul'); ul.className = 'pricelist';
  items.forEach(function (it) {
    var li = document.createElement('li'); li.className = 'pricelist__item';
    var n = document.createElement('span'); n.className = 'pricelist__name'; n.textContent = it.name;
    var dots = document.createElement('span'); dots.className = 'pricelist__dots'; dots.setAttribute('aria-hidden', 'true');
    var p = document.createElement('span'); p.className = 'pricelist__price'; p.textContent = window.MEI_GOODS.yen(it.price) || '準備中';
    if (it.price == null) p.classList.add('is-tbd');
    li.appendChild(n); li.appendChild(dots); li.appendChild(p);
    var sub = [];
    if (it.sizes && it.sizes.length) sub.push(it.sizes.join(' / '));
    if (it.note) sub.push(it.note);
    if (sub.length) { var s = document.createElement('span'); s.className = 'pricelist__sub'; s.textContent = sub.join('　'); li.appendChild(s); }
    ul.appendChild(li);
  });
  return ul;
};

/* 写真のパスを確かめて { src, alt } にそろえる。サイトの中のファイル（assets/...）か https のものだけ通す */
window.MEI_GOODS.imagesOf = function (it) {
  return (it.images || []).map(function (im) { return typeof im === 'string' ? { src: im, alt: '' } : (im || {}); })
    .filter(function (im) { return typeof im.src === 'string' && (/^\/?assets\/[\w\-\/.]+\.(jpe?g|png|webp|gif|avif)$/i.test(im.src) && im.src.indexOf('..') < 0 || /^https:\/\/[^\s"'<>]+$/.test(im.src)); })
    .map(function (im) { return { src: im.src, alt: typeof im.alt === 'string' && im.alt ? im.alt : it.name }; });
};