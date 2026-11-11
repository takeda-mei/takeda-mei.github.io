/* マウスポインター：細い十字と、位置の数値。リンクの上では括弧で囲み、行き先を小さく示す。
   マウスなど細かく指せる端末だけで使う（タッチ端末では何もしない）。
   ページ側で、要素に data-cur="文字" を付けると、その上でその文字を出す（オシロの上の音名など）。
   data-cur-mode="vline"：その要素の上では、十字の代わりに要素の高さいっぱいの縦線（オシロスコープの測定カーソル）。
   data-cur-mode="xy"：その要素の上では、縦横の線が要素いっぱいに伸びる（XY パッド）。
   data-cur-mode="eye"：その要素の上では、目に変わる（三連画への扉）。
   window.__cursorLevel に「音量（0〜1）を返す関数」を入れると、鳴っている間は数字が dB になる（ポインター自体は揺らさない）。
   文字が別のものに切り替わるときは、短く「解読」するように入れ替わる（グリッチ）。目が疲れないように：
   ・線の細い記号だけを使う（塗りつぶしの四角などの明るい記号は使わない）。色・明るさは変えない
   ・入れ替えは 1 秒に約 25 回まで（毎フレームは変えない）。全体で 0.3 秒以内に、左から順に確定する
   ・座標・dB・パッドの数値のように、同じ場所で動き続ける数字にはかけない（行き先が変わったときだけ）
   ・OS の「動きを減らす」設定でも、文字の入れ替えはする（その場で文字が変わるだけで、動きではないため）。1px のずれだけ止める
   ・十字（ポインター自体）は揺らさない */
(function () {
  'use strict';
  if (!window.matchMedia || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var css = [
    'html.cur-on, html.cur-on * { cursor: none !important; }',
    'html.cur-on input, html.cur-on textarea, html.cur-on select, html.cur-on iframe { cursor: auto !important; }',   /* 入力欄と埋め込みプレーヤーでは、いつものポインター */
    '#cur { position: fixed; left: 0; top: 0; z-index: 2147483000; pointer-events: none; color: #e6e6e3; mix-blend-mode: difference; opacity: 0; transition: opacity .15s; }',
    '#cur.on { opacity: 1; }',
    '#cur i { position: absolute; background: currentColor; }',
    '#cur .h1, #cur .h2 { height: 1px; width: 7px; top: 0; }',
    '#cur .h1 { left: -11px; } #cur .h2 { left: 4px; }',
    '#cur .v1, #cur .v2 { width: 1px; height: 7px; left: 0; }',
    '#cur .v1 { top: -11px; } #cur .v2 { top: 4px; }',
    '#cur .dot { width: 1px; height: 1px; left: 0; top: 0; }',
    '#cur .br { position: absolute; left: -14px; top: -14px; width: 29px; height: 29px; opacity: 0; transition: opacity .12s, transform .12s; transform: scale(.6);',
    '  background: linear-gradient(currentColor,currentColor) 0 0/6px 1px, linear-gradient(currentColor,currentColor) 0 0/1px 6px,',
    '  linear-gradient(currentColor,currentColor) 100% 0/6px 1px, linear-gradient(currentColor,currentColor) 100% 0/1px 6px,',
    '  linear-gradient(currentColor,currentColor) 0 100%/6px 1px, linear-gradient(currentColor,currentColor) 0 100%/1px 6px,',
    '  linear-gradient(currentColor,currentColor) 100% 100%/6px 1px, linear-gradient(currentColor,currentColor) 100% 100%/1px 6px; background-repeat: no-repeat; }',
    '#cur.link .br { opacity: 1; transform: scale(1); }',
    '#cur.link .h1, #cur.link .h2, #cur.link .v1, #cur.link .v2 { opacity: 0; }',
    '#cur.down .br { transform: scale(.75); }',
    '#cur .vl { position: absolute; left: 0; width: 1px; background: currentColor; opacity: 0; }',
    '#cur.vline .vl, #cur.xy .vl, #cur.xy .hl { opacity: 1; }',
    '#cur.xy.down .vl, #cur.xy.down .hl { opacity: 0; }',             /* パッドを押している間は、パッド自身の十字を見せる（線を二重にしない） */
    '#cur .hl { position: absolute; top: 0; height: 1px; background: currentColor; opacity: 0; }',
    '#cur.vline .h1, #cur.vline .h2, #cur.vline .v1, #cur.vline .v2, #cur.xy .h1, #cur.xy .h2, #cur.xy .v1, #cur.xy .v2 { opacity: 0; }',
    '#cur .eye { position: absolute; left: -15px; top: -9px; width: 30px; height: 18px; opacity: 0; transform: scaleY(.2); transition: opacity .15s, transform .18s; }',
    '#cur.eye .eye { opacity: 1; transform: scaleY(1); }',
    '#cur.eye b { opacity: 0; }',                                     /* 扉の文字と重ならないよう、目のときは文字を出さない */
    '#cur.eye .h1, #cur.eye .h2, #cur.eye .v1, #cur.eye .v2, #cur.eye .br { opacity: 0 !important; }',
    '#cur b { position: absolute; left: 18px; top: 9px; font: 300 10px/1 "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace; letter-spacing: .08em; white-space: nowrap; font-variant-numeric: tabular-nums; }',
    '#cur b.gl { opacity: .78; }'                                       /* 解読の間だけ、ほんの少し薄く（点滅はさせない） */
  ].join('\n');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var el = document.createElement('div'); el.id = 'cur'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<i class="h1"></i><i class="h2"></i><i class="v1"></i><i class="v2"></i><i class="dot"></i><span class="br"></span><i class="vl"></i><i class="hl"></i>' +
    '<svg class="eye" viewBox="0 0 30 18" fill="none" stroke="currentColor" stroke-width="1"><path d="M1 9 Q15 -3 29 9 Q15 21 1 9 Z"/><circle class="iris" cx="15" cy="9" r="4.2" fill="currentColor" stroke="none"/></svg><b></b>';
  var label = el.querySelector('b'), vl = el.querySelector('.vl'), hl = el.querySelector('.hl'), iris = el.querySelector('.iris');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function mount() { document.body.appendChild(el); document.documentElement.classList.add('cur-on'); }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);

  function pad(n) { n = Math.max(0, Math.round(n)); return ('000' + n).slice(-4); }
  function linkText(a) {
    if (a.hasAttribute('data-cur')) return a.getAttribute('data-cur');
    var shown = a.querySelector('.p'); if (shown) return shown.textContent.trim();   // リンクに行き先の表示があれば、それと同じ文字にする
    if (a.tagName === 'BUTTON' && a.classList.contains('play')) return a.getAttribute('aria-pressed') === 'true' ? 'STOP' : 'PLAY';   // 再生ボタン
    if (a.tagName === 'BUTTON') return (a.textContent || '').trim().toUpperCase() || 'PRESS';   // そのほかのボタンは、ボタンの名前
    var h = a.getAttribute('href') || '';
    if (/^https?:/.test(h)) return 'OPEN ↗';
    return h.replace(/\.html$/, '').replace(/^\//, '/') || 'OPEN';
  }
  var lastEl = null;
  var x = -100, y = -100, jx = 0, jy = 0, mode = '', base = '', db = null, vx = 0, vy = 0, loop = false;
  function place() { el.style.transform = 'translate3d(' + (x + jx) + 'px,' + (y + jy) + 'px,0)'; }
  // ---- 文字の切り替え（解読するように入れ替わる） ----
  var GLYPH = '·:-_/\\|=01';                                           // 線の細い記号だけ
  var STEP = 40, target = '', key = null, gl = null, glRaf = 0;          // STEP ミリ秒ごとに入れ替える（約 25 回／秒）
  function glFrame() {
    glRaf = 0; if (!gl) return;
    var now = performance.now(), p = (now - gl.t0) / gl.dur;
    if (p >= 1) { gl = null; label.classList.remove('gl'); label.textContent = target; label.style.transform = ''; return; }
    var step = Math.floor((now - gl.t0) / STEP);
    if (step !== gl.step) {                                              // 決まった間隔でだけ書き換える
      gl.step = step;
      var from = gl.from, to = target, n = Math.round(from.length + (to.length - from.length) * Math.min(1, p * 1.6)), out = '';
      for (var i = 0; i < n; i++) {
        var at = 0.25 + 0.65 * (i / Math.max(1, n));                     // この文字が確定する時刻（左から順に）
        var ch = to.charAt(i);
        if (p >= at && i < to.length) out += ch;
        else if (ch === ' ' || (!ch && from.charAt(i) === ' ')) out += ' ';   // 空白は空白のまま（語の形を崩さない）
        else if (p < at - 0.45 && i < from.length) out += from.charAt(i);     // はじめは前の文字が残る
        else out += GLYPH.charAt((i * 7 + step * 3) % GLYPH.length);
      }
      label.textContent = out;
      label.style.transform = (!reduce && (step === 1 || step === 3)) ? 'translateX(1px)' : '';   // 2 回だけ 1px ずれる（揺らし続けない。動きを減らす設定では、ずらさない）
    }
    glRaf = requestAnimationFrame(glFrame);
  }
  function show(text, k) {
    target = text;
    var changed = key !== null && k !== key; key = k;
    if (changed && label.textContent) {                       // 行き先が変わった：今見えている文字から解読を始める
      gl = { t0: performance.now(), dur: Math.min(300, 160 + 10 * Math.max(text.length, label.textContent.length)), from: label.textContent, step: -1 };
      label.classList.add('gl');
      if (!glRaf) glRaf = requestAnimationFrame(glFrame);
    } else if (!gl) label.textContent = text;                            // 同じ場所で数字が動くだけなら、そのまま書き換える
  }
  var keyEl = null;
  function render() {
    // 普段の場所（リンクでも特別な要素でもない）では、鳴っている間は数字を dB にする
    var text = (mode === '' && db !== null) ? (db <= -60 ? '-inf dB' : db.toFixed(1) + ' dB') : base;
    // 解読をかけるのは「何を指しているか」が変わったとき。ボタンの上だけは、同じボタンでも文字が変われば（PLAY → STOP）かける
    var k = mode === 'eye' ? 'eye' : keyEl ? (mode === 'link' ? text : 'el') : (mode === '' && db !== null ? 'db' : 'xy');
    show(text, k + '|' + (keyEl ? keyEl.__curId || (keyEl.__curId = ++curSeq) : 0));
  }
  var curSeq = 0;
  // 音量を見て、数字を dB にする（ポインターは揺らさない。jx・jy は常に 0）
  function tick() {
    var lv = typeof window.__cursorLevel === 'function' ? +window.__cursorLevel() || 0 : 0;
    if (lv > 0.002) {
      db = 20 * Math.log10(lv);
      loop = true; render(); requestAnimationFrame(tick);
    } else {
      db = null; loop = false; render();
      setTimeout(function () { requestAnimationFrame(tick); }, 120);
    }
  }
  requestAnimationFrame(tick);
  document.addEventListener('pointermove', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    var tnow = performance.now(); if (tnow - (window.__curT || 0) > 100) { vx = 0; vy = 0; } window.__curT = tnow;   // 少し止まったら、動きの向きを忘れる
    vx = vx * 0.5 + (e.clientX - x) * 0.5; vy = vy * 0.5 + (e.clientY - y) * 0.5;
    x = e.clientX; y = e.clientY;
    place();
    var t = e.target && e.target.closest ? e.target : null;
    if (t && t.closest('input, textarea, select, iframe')) { el.classList.remove('on'); return; }   // 入力欄・埋め込みの上では隠す（いつものポインターを使う）
    el.classList.add('on');
    var special = t && t.closest('[data-cur-mode]');
    var link = t && t.closest('a, button');
    var cur = t && t.closest('[data-cur]');
    mode = special ? special.getAttribute('data-cur-mode') : link ? 'link' : cur ? 'label' : '';
    el.classList.toggle('link', mode === 'link');
    el.classList.toggle('vline', mode === 'vline');
    el.classList.toggle('xy', mode === 'xy');
    el.classList.toggle('eye', mode === 'eye');
    if (mode === 'vline' || mode === 'xy') {                             // 要素の高さいっぱいの縦線（xy は横線も）。文字は線の上端に（波形と重ならない）
      var r = special.getBoundingClientRect();
      vl.style.top = (r.top - y) + 'px'; vl.style.height = r.height + 'px';
      if (mode === 'xy') { hl.style.left = (r.left - x) + 'px'; hl.style.width = r.width + 'px'; }
      label.style.left = '8px'; label.style.top = (r.top - y - 14) + 'px';
    } else { label.style.left = ''; label.style.top = ''; }
    lastEl = { special: special, link: link, cur: cur };
    keyEl = special || link || cur || null;
    if (mode === 'eye') {                                                // 黒目は動いた方向を少し見る
      var m = Math.hypot(vx, vy) || 1, k = Math.min(1, m / 12);
      iris.setAttribute('cx', (15 + vx / m * 5 * k).toFixed(2)); iris.setAttribute('cy', (9 + vy / m * 2.5 * k).toFixed(2));
    }
    base = special && special.hasAttribute('data-cur') ? special.getAttribute('data-cur') : link ? linkText(link) : cur ? cur.getAttribute('data-cur') : pad(x) + ' ' + pad(y);
    render();
  }, { passive: true });
  // 押した・離したときも、文字を読み直す（ページ側が押した瞬間に文字を変えることがあるため。ページの処理のあとで読む）
  function reread() {
    if (!lastEl) return;
    var sp = lastEl.special, ln = lastEl.link, cu = lastEl.cur;
    base = sp && sp.hasAttribute('data-cur') ? sp.getAttribute('data-cur') : ln ? linkText(ln) : cu ? cu.getAttribute('data-cur') : pad(x) + ' ' + pad(y);
    render();
  }
  document.addEventListener('pointerdown', function () { el.classList.add('down'); setTimeout(reread, 0); }, { passive: true });
  document.addEventListener('pointerup', function () { el.classList.remove('down'); setTimeout(reread, 0); }, { passive: true });
  // ボタンの状態があとから変わったとき（再生は音源を読み込んでから始まる）も、乗っているボタンなら文字を読み直す
  if (window.MutationObserver) new MutationObserver(function (list) {
    if (!lastEl || !lastEl.link) return;
    for (var i = 0; i < list.length; i++) if (list[i].target === lastEl.link) { reread(); return; }
  }).observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['aria-pressed'] });
  document.documentElement.addEventListener('mouseleave',function () { el.classList.remove('on'); });
  document.addEventListener('pointerover', function (e) { if (e.target && e.target.tagName === 'IFRAME') el.classList.remove('on'); }, { passive: true });
  window.addEventListener('blur', function () { el.classList.remove('on'); });
  window.__cursor = { get state() { return { on: el.classList.contains('on'), link: el.classList.contains('link'), mode: mode, label: label.textContent, target: target, glitching: !!gl, x: x, y: y, jitter: Math.hypot(jx, jy), hline: mode === 'xy' ? { left: hl.getBoundingClientRect().left, width: hl.getBoundingClientRect().width } : null, vline: (mode === 'vline' || mode === 'xy') ? { top: vl.getBoundingClientRect().top, height: vl.getBoundingClientRect().height } : null }; } };
})();