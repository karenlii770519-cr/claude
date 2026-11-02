/* 簡易密碼頁：只是擋一般訪客，不是真正的安全保護（原始碼與圖片仍可直接存取） */
(function () {
  var HASH = '8598b82c517322ea80020ef7be0eddbef23a9ab43d3d7627c000338a428296c2';
  var KEY = 'kl-gate';
  var ok = false;
  try { ok = localStorage.getItem(KEY) === HASH; } catch (e) {}
  if (ok) return;

  var root = document.documentElement;
  root.classList.add('kl-locked');
  var css = document.createElement('style');
  css.textContent =
    'html.kl-locked body>*:not(#kl-gate){display:none!important}' +
    'html.kl-locked,html.kl-locked body{overflow:hidden!important;background:#F7942E!important}' +
    '#kl-gate{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:20px;background:#F7942E;font-family:"Zen Maru Gothic","Noto Sans TC",system-ui,sans-serif;color:#2B2522}' +
    '#kl-gate form{width:min(360px,100%);background:#fff;border-radius:28px;padding:36px 28px 30px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.12)}' +
    '#kl-gate .lg{width:56px;height:56px;margin:0 auto 6px}' +
    '#kl-gate .nm{font:700 12px/1 Outfit,sans-serif;letter-spacing:.16em;color:#F7942E;margin-bottom:18px}' +
    '#kl-gate h1{margin:0 0 6px;font-size:20px;font-weight:900}' +
    '#kl-gate p{margin:0 0 20px;font-size:14px;color:#7C746F}' +
    '#kl-gate input{width:100%;box-sizing:border-box;font-size:18px;letter-spacing:.2em;text-align:center;padding:14px;border:2px solid #E7DED6;border-radius:14px;outline:none}' +
    '#kl-gate input:focus{border-color:#F7942E}' +
    '#kl-gate button{margin-top:12px;width:100%;border:0;border-radius:999px;background:#2B2522;color:#fff;font-size:16px;font-weight:700;padding:14px;cursor:pointer}' +
    '#kl-gate button:hover{background:#E57A12}' +
    '#kl-gate .err{min-height:1.5em;margin:10px 0 0;font-size:13px;color:#C0392B}';
  document.head.appendChild(css);

  function sha256(text) {
    if (!(window.crypto && crypto.subtle)) return Promise.resolve(null);
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ('0' + b.toString(16)).slice(-2);
      }).join('');
    });
  }

  function mount() {
    var gate = document.createElement('div');
    gate.id = 'kl-gate';
    gate.innerHTML =
      '<form autocomplete="off">' +
      '<svg class="lg" viewBox="0 0 100 100" aria-hidden="true"><g fill="#F7942E"><circle cx="50" cy="22" r="18"/><circle cx="78" cy="42" r="18"/><circle cx="68" cy="75" r="18"/><circle cx="32" cy="75" r="18"/><circle cx="22" cy="42" r="18"/></g><circle cx="50" cy="52" r="12" fill="#fff"/></svg>' +
      '<div class="nm">KAREN LI</div>' +
      '<h1>網站準備中</h1>' +
      '<p>請輸入密碼瀏覽</p>' +
      '<input type="password" inputmode="numeric" aria-label="密碼" required>' +
      '<button type="submit">進入</button>' +
      '<div class="err" role="alert"></div>' +
      '</form>';
    document.body.appendChild(gate);
    var form = gate.querySelector('form');
    var input = gate.querySelector('input');
    var err = gate.querySelector('.err');
    input.focus();
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      sha256(input.value.trim()).then(function (h) {
        if (h === HASH) {
          try { localStorage.setItem(KEY, HASH); } catch (e) {}
          gate.remove();
          root.classList.remove('kl-locked');
        } else {
          err.textContent = h === null ? '此瀏覽器無法驗證，請改用一般瀏覽器開啟' : '密碼不正確';
          input.select();
        }
      });
    });
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
