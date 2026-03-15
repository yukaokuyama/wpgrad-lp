(function () {
  var STORAGE_KEY = 'hm_cookie_consent';

  function grantConsent() {
    localStorage.setItem(STORAGE_KEY, '1');
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'consent_granted' });
    var banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'none';
  }

  function initBanner() {
    if (localStorage.getItem(STORAGE_KEY) === '1') {
      // 同意済み：即座にdataLayer通知
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'consent_granted' });
      return;
    }

    // バナーを表示
    var banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.style.cssText = [
      'position:fixed', 'bottom:0', 'left:0', 'right:0', 'z-index:9999',
      'background:#111', 'border-top:1px solid #2a2a2a',
      'padding:16px 24px', 'display:flex', 'align-items:center',
      'justify-content:space-between', 'gap:16px', 'flex-wrap:wrap',
      'font-family:Helvetica Neue,Arial,sans-serif'
    ].join(';');

    var text = document.createElement('p');
    text.style.cssText = 'margin:0;font-size:13px;color:#aaa;line-height:1.6;flex:1;min-width:200px;';
    text.innerHTML = '当サイトではGoogle Analytics・Google Tag Managerを使用しています。'
      + '詳しくは<a href="/privacy/" style="color:#fff;text-decoration:underline;">プライバシーポリシー</a>をご覧ください。';

    var btn = document.createElement('button');
    btn.textContent = '同意する';
    btn.style.cssText = [
      'background:#fff', 'color:#0a0a0a', 'border:none',
      'padding:10px 24px', 'font-size:13px', 'font-weight:700',
      'cursor:pointer', 'border-radius:3px', 'white-space:nowrap',
      'flex-shrink:0'
    ].join(';');
    btn.addEventListener('click', grantConsent);

    banner.appendChild(text);
    banner.appendChild(btn);
    document.body.appendChild(banner);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBanner);
  } else {
    initBanner();
  }
})();
