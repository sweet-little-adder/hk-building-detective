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
    var cityPanel=document.getElementById('cityPanel');
    var content=rep.querySelector('h3')?rep:(cityPanel&&cityPanel.innerText.trim()?cityPanel:rep);
    var fullText = content.innerText.trim();
    var snap = {v:1,kind:'research',researchKind:content===rep&&rep.querySelector('h3')?'building':'city_market',lang:lang,capturedAt:new Date().toISOString(),text:fullText.slice(0,2800),truncated:fullText.length>2800,links:[]};
    [].slice.call(content.querySelectorAll('a[href]')).forEach(function(a){
      try { var u=new URL(a.href); if (/^https?:$/.test(u.protocol) && snap.links.length<8) snap.links.push({label:a.innerText.trim().slice(0,100),url:u.href.slice(0,600)}); } catch(_){}
    });
    while(JSON.stringify(snap).length>3800 && snap.text.length>100){snap.text=snap.text.slice(0,-100);snap.truncated=true;}
    while(JSON.stringify(snap).length>3800 && snap.links.length){snap.links.pop();}
    window.parent.postMessage({type: 'reagentSave' , url: parentOrigin + home + '#lookup', label: content.querySelector('h3') ? content.querySelector('h3').innerText.trim().slice(0,200) : (q ? t[5] + q : ((document.getElementById('qc')||{}).value || t[6])), notes: JSON.stringify(snap)}, parentOrigin);
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
/* Bounded public research state. Parent owns local persistence and account scope. */
(function(){
 'use strict';
 if(window===window.top)return;
 var parentOrigin;try{parentOrigin=new URL(document.referrer).origin}catch(e){return}
 if(['https://sauletrust.com','https://www.sauletrust.com'].indexOf(parentOrigin)<0)return;
 var lang=(document.documentElement.lang||'en').slice(0,2), initialized=false, restoring=false,timer,forget=false;
 var fields=['qc','q','qnyc','qchi','qvan','qtor','qcal','qedm','qsc'];
 var panels=['report','cityPanel','sellPanel'];
 var views=['buyView','sellView','hkForm','nycForm','chiForm','vanForm','torForm','calForm','edmForm','hkLabel','reportSec'];
 var phrases={en:['Restored search from ','Not refreshed. Search again to check the current source.','Clear saved search'],fr:['Recherche restaurée du ','Non actualisée. Relancez la recherche pour vérifier la source actuelle.','Effacer la recherche enregistrée'],de:['Wiederhergestellte Suche vom ','Nicht aktualisiert. Erneut suchen, um die aktuelle Quelle zu prüfen.','Gespeicherte Suche löschen'],nl:['Zoekopdracht hersteld van ','Niet vernieuwd. Zoek opnieuw om de actuele bron te controleren.','Opgeslagen zoekopdracht wissen'],pl:['Przywrócono wyszukiwanie z ','Dane nieodświeżone. Wyszukaj ponownie, aby sprawdzić aktualne źródło.','Usuń zapisane wyszukiwanie']};
 var words=phrases[lang]||phrases.en;
 function send(d){window.parent.postMessage(d,parentOrigin)}
 function clean(html){
  var tmp=document.createElement('template');tmp.innerHTML=String(html||'').slice(0,70000);
  var allowed=['H2','H3','H4','P','DIV','SPAN','A','UL','OL','LI','B','STRONG','EM','I','SMALL','BR','TABLE','THEAD','TBODY','TR','TH','TD','DETAILS','SUMMARY'];
  [].slice.call(tmp.content.querySelectorAll('*')).forEach(function(el){
   if(allowed.indexOf(el.tagName)<0){el.remove();return}
   [].slice.call(el.attributes).forEach(function(a){if(['class','href','colspan','rowspan','open'].indexOf(a.name)<0)el.removeAttribute(a.name)});
   if(el.tagName==='A'){try{var u=new URL(el.getAttribute('href'),location.href);if(!/^https?:$/.test(u.protocol))throw Error();el.href=u.href;el.target='_blank';el.rel='noopener noreferrer'}catch(e){el.removeAttribute('href')}}
  });return tmp.innerHTML;
 }
 function capture(){
  if(!initialized||restoring||forget)return;
  var state={v:1,lang:lang,inputs:{},panels:{},views:{},tab:document.getElementById('tabSell').classList.contains('on')?'sell':'buy',compare:[]};
  if(document.getElementById('tabCmp')&&document.getElementById('tabCmp').classList.contains('on'))state.tab='compare';
  fields.forEach(function(id){var e=document.getElementById(id);if(e)state.inputs[id]=e.value.slice(0,160)});
  panels.forEach(function(id){var e=document.getElementById(id);if(e&&!e.querySelector('button')&&!/Checking|Resolving|Loading|Vérification|Wird geprüft/i.test(e.innerText))state.panels[id]=clean(e.innerHTML)});
  views.forEach(function(id){var e=document.getElementById(id);if(e)state.views[id]=e.style.display==='none'?'none':''});
  [].slice.call(document.querySelectorAll('#cmpView .cmpsel .chips button.on')).forEach(function(e){state.compare.push(e.textContent.trim().slice(0,100))});
  if(JSON.stringify(state).length<120000)send({type:'reagentStateSave',state:state});
 }
 function schedule(){if(restoring)return;clearTimeout(timer);timer=setTimeout(capture,180)}
 function showNotice(at){
  var old=document.getElementById('restoredResearchNotice');if(old)old.remove();
  var box=document.createElement('div');box.id='restoredResearchNotice';box.setAttribute('role','status');box.style.cssText='border:1px solid #8b735e;padding:12px 14px;margin:24px 0;font-size:12px;line-height:1.7;color:#dcc9ad';
  var p=document.createElement('p');p.textContent=words[0]+new Date(at).toLocaleString(lang)+'. '+words[1];box.appendChild(p);
  var b=document.createElement('button');b.type='button';b.textContent=words[2];b.style.cssText='background:none;color:inherit;border-bottom:1px solid #8b735e;padding:8px 0;font-size:12px;min-height:44px;font-weight:400';b.onclick=function(){forget=true;send({type:'reagentStateClear'});box.remove()};box.appendChild(b);
  var tabs=document.querySelector('.tabs');tabs.parentNode.insertBefore(box,tabs.nextSibling);
 }
 window.addEventListener('message',function(e){
  if(e.source!==window.parent||e.origin!==parentOrigin||!e.data)return;
  if(e.data.type==='reagentStateReset'){location.reload();return}
  if(e.data.type==='reagentStateParentReady'){if(initialized)return;send({type:'reagentStateReady',lang:lang});return}
  if(e.data.type!=='reagentStateRestore')return;
  var state=e.data.state; initialized=true;
  if(!state||state.v!==1||state.lang!==lang)return;
  restoring=true;
  fields.forEach(function(id){var el=document.getElementById(id);if(el&&state.inputs&&typeof state.inputs[id]==='string')el.value=state.inputs[id].slice(0,160)});
  panels.forEach(function(id){var el=document.getElementById(id);if(el&&state.panels&&typeof state.panels[id]==='string')el.innerHTML=clean(state.panels[id])});
  var button=document.getElementById(state.tab==='sell'?'tabSell':state.tab==='compare'?'tabCmp':'tabBuy');if(button)button.click();
  views.forEach(function(id){var el=document.getElementById(id);if(el&&state.views&&['none',''].indexOf(state.views[id])>=0)el.style.display=state.views[id]});
  if(state.tab==='compare'){document.getElementById('buyView').style.display='none';document.getElementById('sellView').style.display='none'}
  if(Array.isArray(state.compare))document.querySelectorAll('#cmpView .cmpsel .chips button').forEach(function(b){var wanted=state.compare.indexOf(b.textContent.trim())>=0;if(b.classList.contains('on')!==wanted)b.click()});
  var suggestion=document.getElementById('suggest');if(suggestion)suggestion.style.display='none';
  showNotice(e.data.savedAt);setTimeout(function(){restoring=false},0);
 });
 document.addEventListener('input',function(){forget=false;schedule()});document.addEventListener('change',schedule);document.addEventListener('submit',function(){forget=false;schedule()});
 document.addEventListener('click',function(e){if(e.target.closest('.tabs,.chips')){forget=false;schedule()}});
 panels.forEach(function(id){var el=document.getElementById(id);if(el)new MutationObserver(schedule).observe(el,{childList:true,subtree:true,characterData:true})});
 window.addEventListener('pagehide',capture);
 send({type:'reagentStateReady',lang:lang});
})();
