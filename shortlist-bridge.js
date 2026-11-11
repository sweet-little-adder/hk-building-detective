/* SauleTrust private shortlist bridge. Only the containing SauleTrust page owns auth. */
(function () {
  'use strict';
  if (window === window.top) return;
  var allowed = ['https://sauletrust.com', 'https://www.sauletrust.com'];
  var parentOrigin;
  try { parentOrigin = new URL(document.referrer).origin; } catch (_) { return; }
  if (allowed.indexOf(parentOrigin) < 0) return;
  var lang = (document.documentElement.lang || 'en').split('-')[0];
  var words = {
    en: ['Save to my shortlist', 'Saving...', 'Saved', 'Sign in to save', 'Save failed - try again', 'Building: ', 'Building record'],
    fr: ['Ajouter à ma sélection', 'Enregistrement...', 'Enregistré', 'Se connecter pour enregistrer', 'Échec - réessayer', 'Bâtiment : ', 'Fiche du bâtiment'],
    de: ['Auf meiner Merkliste speichern', 'Wird gespeichert...', 'Gespeichert', 'Zum Speichern anmelden', 'Speichern fehlgeschlagen - erneut versuchen', 'Gebäude: ', 'Gebäudedaten'],
    nl: ['Opslaan in mijn favorieten', 'Opslaan...', 'Opgeslagen', 'Log in om op te slaan', 'Opslaan mislukt - probeer opnieuw', 'Gebouw: ', 'Gebouwgegevens'],
    pl: ['Zapisz na mojej liście', 'Zapisywanie...', 'Zapisano', 'Zaloguj się, aby zapisać', 'Nie udało się zapisać - spróbuj ponownie', 'Budynek: ', 'Dane budynku']
  };
  if (!words[lang]) lang = 'en';
  var t = words[lang];
  var sec = document.getElementById('reportSec'), rep = document.getElementById('report');
  if (!sec || !rep || document.getElementById('saveShort')) return;
  var btn = document.createElement('button');
  btn.type = 'button'; btn.id = 'saveShort';
  btn.style.cssText = 'display:none;margin-top:14px;background:none;border:1px solid #7c6650;color:#dcc9ad;font-size:12.5px;padding:8px 14px;letter-spacing:.04em;font-weight:400;max-width:100%;white-space:normal;text-align:left;line-height:1.5;min-height:44px';
  sec.appendChild(btn);
  var pending = false, authNeeded = false, timer;
  var home = lang === 'en' ? '/' : '/' + lang + '/';
  var account = parentOrigin + '/account/?lang=' + lang;
  function reset() { btn.disabled = false; btn.textContent = '\u2606 ' + t[0]; }
  function currentQuery() {
    var inputs = [].slice.call(document.querySelectorAll('form input'));
    var visible = inputs.filter(function (el) { return el.id !== 'qc' && el.offsetParent && el.value.trim(); });
    return visible.length ? visible[visible.length - 1].value.trim() : '';
  }
  new MutationObserver(function () {
    var has = rep.innerText.trim().length > 20 && getComputedStyle(sec).display !== 'none';
    btn.style.display = has ? '' : 'none';
    if (has && !pending) { authNeeded = false; reset(); }
  }).observe(rep, { childList: true, subtree: true, characterData: true });
  btn.addEventListener('click', function () {
    if (authNeeded) { window.top.location.href = account; return; }
    if (pending) return;
    var q = currentQuery();
    pending = true; btn.disabled = true; btn.textContent = t[1];
    var fullText = rep.innerText.trim();
    var snap = {v:1,kind:'building-research',lang:lang,capturedAt:new Date().toISOString(),text:fullText.slice(0,2800),truncated:fullText.length>2800,links:[]};
    [].slice.call(rep.querySelectorAll('a[href]')).forEach(function(a){
      try { var u=new URL(a.href); if (/^https?:$/.test(u.protocol) && snap.links.length<8) snap.links.push({label:a.innerText.trim().slice(0,100),url:u.href.slice(0,600)}); } catch(_){}
    });
    while(JSON.stringify(snap).length>3800 && snap.text.length>100){snap.text=snap.text.slice(0,-100);snap.truncated=true;}
    while(JSON.stringify(snap).length>3800 && snap.links.length){snap.links.pop();}
    window.parent.postMessage({type: 'reagentSave' , url: parentOrigin + home + '#lookup', label: q ? t[5] + q : t[6], notes: JSON.stringify(snap)}, parentOrigin);
    clearTimeout(timer);
    timer = setTimeout(function () { if (pending) { pending = false; reset(); } }, 8000);
  });
  window.addEventListener('message', function (e) {
    if (e.source !== window.parent || e.origin !== parentOrigin || !e.data || e.data.type !== 'reagentSaveResult') return;
    clearTimeout(timer); pending = false; btn.disabled = false;
    if (e.data.ok) btn.textContent = t[2] + ' \u2713';
    else if (e.data.authRequired) { authNeeded = true; btn.textContent = t[3]; }
    else btn.textContent = t[4];
  });
})();
