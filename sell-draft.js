/* Sell listing-draft composer for RE-agent.
   On-device only: photos, written notes and voice notes stay in the visitor's
   browser (localStorage on this device). Nothing is uploaded, published or
   shared. No AI generation yet - the draft is assembled only from what the
   visitor adds, and missing standard fields are listed as blanks to fill. */
(function(){
var sv=document.querySelector('#sellView');
if(!sv||sv.querySelector('#sdRoot'))return;
var lang=(document.documentElement.lang||'en').slice(0,2);
var T={
en:{sec:'03 / Your listing draft',intro:'Add photos, notes and a voice description of your property. The draft is built only from what you add - nothing is uploaded, published or shared.',ph:'Describe your place - rooms, light, view, condition',photo:'Add photos',rec:'Record voice',stop:'Stop',add:'Add →',create:'Create draft →',micFail:'Recording is not available in this window. Add a voice memo file instead:',voiceFile:'Add voice file',defTitle:'Listing draft',review:'Review every word before you publish it anywhere. AI-written drafts are not live yet - this draft uses only your own words.',copy:'Copy text',copied:'Copied',dl:'Download',again:'Start over',todoHdr:'Still to add before publishing:',todoItems:['Asking price','Exact address','Size (sq ft / m²)','Contact details'],photoN:function(n){return 'Photo '+n},voiceN:function(n,d){return 'Voice note '+n+' · '+d},photosLine:function(n){return 'Photos: '+n+' attached (visible in this draft on this device)'},voicesLine:function(n){return 'Voice notes: '+n+' attached on this device'},need:'Add at least one photo, note or voice note first.',saved:'Saved on this device only, for up to 7 days.',hdr:'LISTING DRAFT - review before publishing',created:function(d){return 'Created '+d+' with RE-agent on sauletrust.com. Private draft; nothing has been uploaded or published.'},maxPhotos:'Up to 8 photos.',maxVoices:'Up to 4 voice notes.',confirmReset:'Clear all photos, notes, voice notes and the draft from this device?',rebuild:'Rebuild from my items',confirmRebuild:'Replace the current draft text with a fresh one built from your items?'},
fr:{sec:'03 / Votre annonce',intro:'Ajoutez des photos, des notes et une description vocale de votre bien. Le projet est créé uniquement à partir de ce que vous ajoutez - rien n\'est téléversé, publié ni partagé.',ph:'Décrivez votre bien - pièces, lumière, vue, état',photo:'Ajouter des photos',rec:'Enregistrer la voix',stop:'Arrêter',add:'Ajouter →',create:'Créer le projet →',micFail:'L\'enregistrement n\'est pas disponible dans cette fenêtre. Ajoutez plutôt un fichier vocal :',voiceFile:'Ajouter un fichier vocal',defTitle:'Projet d\'annonce',review:'Relisez chaque mot avant de publier. Les annonces rédigées par IA ne sont pas encore disponibles - ce projet utilise uniquement vos propres mots.',copy:'Copier le texte',copied:'Copié',dl:'Télécharger',again:'Recommencer',todoHdr:'À ajouter avant publication :',todoItems:['Prix demandé','Adresse exacte','Surface (m²)','Coordonnées de contact'],photoN:function(n){return 'Photo '+n},voiceN:function(n,d){return 'Note vocale '+n+' · '+d},photosLine:function(n){return 'Photos : '+n+' jointes (visibles dans ce projet sur cet appareil)'},voicesLine:function(n){return 'Notes vocales : '+n+' jointes sur cet appareil'},need:'Ajoutez d\'abord au moins une photo, une note ou une note vocale.',saved:'Enregistré sur cet appareil uniquement, pendant 7 jours maximum.',hdr:'PROJET D\'ANNONCE - à relire avant publication',created:function(d){return 'Créé le '+d+' avec RE-agent sur sauletrust.com. Projet privé ; rien n\'a été téléversé ni publié.'},maxPhotos:'8 photos maximum.',maxVoices:'4 notes vocales maximum.',confirmReset:'Effacer toutes les photos, notes, notes vocales et le projet de cet appareil ?',rebuild:'Recréer à partir de mes éléments',confirmRebuild:'Remplacer le texte actuel par un nouveau projet créé à partir de vos éléments ?'},
de:{sec:'03 / Ihr Inserat',intro:'Fügen Sie Fotos, Notizen und eine Sprachbeschreibung Ihrer Immobilie hinzu. Der Entwurf wird nur aus Ihren Angaben erstellt - nichts wird hochgeladen, veröffentlicht oder geteilt.',ph:'Beschreiben Sie Ihre Immobilie - Zimmer, Licht, Blick, Zustand',photo:'Fotos hinzufügen',rec:'Sprache aufnehmen',stop:'Stopp',add:'Hinzufügen →',create:'Entwurf erstellen →',micFail:'Aufnahme ist in diesem Fenster nicht verfügbar. Fügen Sie stattdessen eine Audiodatei hinzu:',voiceFile:'Audiodatei hinzufügen',defTitle:'Inseratsentwurf',review:'Prüfen Sie jedes Wort vor einer Veröffentlichung. KI-verfasste Entwürfe sind noch nicht verfügbar - dieser Entwurf verwendet nur Ihre eigenen Worte.',copy:'Text kopieren',copied:'Kopiert',dl:'Herunterladen',again:'Neu beginnen',todoHdr:'Vor der Veröffentlichung noch ergänzen:',todoItems:['Preis','Genaue Adresse','Größe (m²)','Kontaktdaten'],photoN:function(n){return 'Foto '+n},voiceN:function(n,d){return 'Sprachnotiz '+n+' · '+d},photosLine:function(n){return 'Fotos: '+n+' beigefügt (in diesem Entwurf auf diesem Gerät sichtbar)'},voicesLine:function(n){return 'Sprachnotizen: '+n+' auf diesem Gerät beigefügt'},need:'Fügen Sie zuerst mindestens ein Foto, eine Notiz oder eine Sprachnotiz hinzu.',saved:'Nur auf diesem Gerät gespeichert, für bis zu 7 Tage.',hdr:'INSERATSENTWURF - vor Veröffentlichung prüfen',created:function(d){return 'Erstellt am '+d+' mit RE-agent auf sauletrust.com. Privater Entwurf; nichts wurde hochgeladen oder veröffentlicht.'},maxPhotos:'Bis zu 8 Fotos.',maxVoices:'Bis zu 4 Sprachnotizen.',confirmReset:'Alle Fotos, Notizen, Sprachnotizen und den Entwurf von diesem Gerät löschen?',rebuild:'Aus meinen Elementen neu erstellen',confirmRebuild:'Den aktuellen Entwurfstext durch einen neuen aus Ihren Elementen ersetzen?'},
nl:{sec:'03 / Uw advertentie',intro:'Voeg foto\'s, notities en een gesproken beschrijving van uw woning toe. Het concept wordt alleen gemaakt van wat u toevoegt - er wordt niets geüpload, gepubliceerd of gedeeld.',ph:'Beschrijf uw woning - kamers, licht, uitzicht, staat',photo:'Foto\'s toevoegen',rec:'Spraak opnemen',stop:'Stoppen',add:'Toevoegen →',create:'Concept maken →',micFail:'Opnemen is niet beschikbaar in dit venster. Voeg in plaats daarvan een audiobestand toe:',voiceFile:'Audiobestand toevoegen',defTitle:'Advertentieconcept',review:'Controleer elk woord voordat u het ergens publiceert. AI-geschreven concepten zijn nog niet beschikbaar - dit concept gebruikt alleen uw eigen woorden.',copy:'Tekst kopiëren',copied:'Gekopieerd',dl:'Downloaden',again:'Opnieuw beginnen',todoHdr:'Nog toe te voegen vóór publicatie:',todoItems:['Vraagprijs','Exact adres','Oppervlakte (m²)','Contactgegevens'],photoN:function(n){return 'Foto '+n},voiceN:function(n,d){return 'Spraaknotitie '+n+' · '+d},photosLine:function(n){return 'Foto\'s: '+n+' bijgevoegd (zichtbaar in dit concept op dit apparaat)'},voicesLine:function(n){return 'Spraaknotities: '+n+' bijgevoegd op dit apparaat'},need:'Voeg eerst minstens één foto, notitie of spraaknotitie toe.',saved:'Alleen op dit apparaat opgeslagen, tot 7 dagen.',hdr:'ADVERTENTIECONCEPT - controleren vóór publicatie',created:function(d){return 'Gemaakt op '+d+' met RE-agent op sauletrust.com. Privéconcept; er is niets geüpload of gepubliceerd.'},maxPhotos:'Maximaal 8 foto\'s.',maxVoices:'Maximaal 4 spraaknotities.',confirmReset:'Alle foto\'s, notities, spraaknotities en het concept van dit apparaat wissen?',rebuild:'Opnieuw maken uit mijn items',confirmRebuild:'De huidige concepttekst vervangen door een nieuwe op basis van uw items?'},
pl:{sec:'03 / Twoje ogłoszenie',intro:'Dodaj zdjęcia, notatki i głosowy opis swojej nieruchomości. Projekt powstaje wyłącznie z tego, co dodasz - nic nie jest przesyłane, publikowane ani udostępniane.',ph:'Opisz swoją nieruchomość - pokoje, światło, widok, stan',photo:'Dodaj zdjęcia',rec:'Nagraj głos',stop:'Zatrzymaj',add:'Dodaj →',create:'Utwórz projekt →',micFail:'Nagrywanie nie jest dostępne w tym oknie. Zamiast tego dodaj plik audio:',voiceFile:'Dodaj plik audio',defTitle:'Projekt ogłoszenia',review:'Sprawdź każde słowo przed publikacją. Projekty pisane przez AI nie są jeszcze dostępne - ten projekt wykorzystuje tylko Twoje własne słowa.',copy:'Kopiuj tekst',copied:'Skopiowano',dl:'Pobierz',again:'Zacznij od nowa',todoHdr:'Do uzupełnienia przed publikacją:',todoItems:['Cena','Dokładny adres','Powierzchnia (m²)','Dane kontaktowe'],photoN:function(n){return 'Zdjęcie '+n},voiceN:function(n,d){return 'Notatka głosowa '+n+' · '+d},photosLine:function(n){return 'Zdjęcia: '+n+' dołączone (widoczne w tym projekcie na tym urządzeniu)'},voicesLine:function(n){return 'Notatki głosowe: '+n+' dołączone na tym urządzeniu'},need:'Najpierw dodaj co najmniej jedno zdjęcie, notatkę lub notatkę głosową.',saved:'Zapisano tylko na tym urządzeniu, maksymalnie przez 7 dni.',hdr:'PROJEKT OGŁOSZENIA - sprawdź przed publikacją',created:function(d){return 'Utworzono '+d+' w RE-agent na sauletrust.com. Prywatny projekt; nic nie zostało przesłane ani opublikowane.'},maxPhotos:'Maksymalnie 8 zdjęć.',maxVoices:'Maksymalnie 4 notatki głosowe.',confirmReset:'Usunąć wszystkie zdjęcia, notatki, notatki głosowe i projekt z tego urządzenia?',rebuild:'Odbuduj z moich elementów',confirmRebuild:'Zastąpić obecny tekst nowym projektem utworzonym z Twoich elementów?'}
};
var t=T[lang]||T.en;
var KEY='stSellDraft:v1:'+lang;
var MAX_PHOTOS=8,MAX_VOICES=4,MAX_AGE=7*24*3600*1000,MAX_STORE=3500000;

var st=document.createElement('style');
st.textContent='#sdRoot .sd-item{border-top:1px solid #6e5847;padding:12px 26px 12px 0;position:relative;display:flex;gap:12px;align-items:flex-start}'
+'#sdRoot .sd-item p{margin:0;color:#d3bfa2;font-size:13px;line-height:1.6;flex:1;overflow-wrap:anywhere}'
+'#sdRoot .sd-item img{width:120px;max-height:120px;object-fit:cover;border:1px solid #f1e3c6;display:block}'
+'#sdRoot .sd-cap{font-size:10px;color:#bda990;margin-top:4px;line-height:1.5}'
+'#sdRoot .sd-x{position:absolute;right:0;top:10px;background:none;border:0;color:#bda990;font-size:14px;padding:2px 4px;font-weight:400}'
+'#sdRoot .sd-x:hover{color:#f1e3c6;background:none}'
+'#sdRoot .sd-item audio{max-width:100%;height:34px}'
+'#sdRoot .sd-btnrow{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:12px;align-items:center}'
+'#sdRoot .sd-chip{font-size:13px;font-weight:400;background:none;color:#dcc9ad;border:0;border-bottom:1px solid #7c6650;padding:2px 0;min-width:0}'
+'#sdRoot .sd-chip:hover{color:#fdf6e9;border-bottom-color:#f1e3c6;background:none}'
+'#sdRoot .sd-chip.sd-rec{color:#e8b9c4;border-bottom-color:#e8b9c4}'
+'#sdRoot .sd-note{font-size:11px;color:#bda990;margin-top:10px;line-height:1.6}'
+'#sdRoot .sd-warn{color:#e8b9c4}'
+'#sdDraft{margin-top:22px;border-top:1px solid #6e5847;padding-top:16px;display:none}'
+'#sdDraft textarea{width:100%;min-height:240px;background:#4a3629;border:1px solid #6e5847;color:#f6ead6;font-family:inherit;font-size:13px;line-height:1.7;padding:12px;outline:0;resize:vertical}'
+'#sdDraft textarea:focus{border-color:#f1e3c6}'
+'#sdDraft .sd-thumbs{display:flex;flex-wrap:wrap;gap:10px;margin:12px 0}'
+'#sdDraft .sd-thumbs img{width:96px;height:96px;object-fit:cover;border:1px solid #f1e3c6}'
+'#sdDraft .sd-actions{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:12px;align-items:center}'
+'#sdDraft .sd-chip{font-size:13px;font-weight:400;background:none;color:#dcc9ad;border:0;border-bottom:1px solid #7c6650;padding:2px 0;min-width:0}'
+'#sdDraft .sd-chip:hover{color:#fdf6e9;border-bottom-color:#f1e3c6;background:none}'
+'#sdRoot input#sdTitle{border-bottom:1px solid #836d55}'
+'@media (max-width:600px){#sdRoot .sd-item img{width:88px;max-height:88px}#sdDraft .sd-thumbs img{width:72px;height:72px}}';
document.head.appendChild(st);

var root=document.createElement('div');root.id='sdRoot';
root.innerHTML='<p class="label" style="margin-top:26px">'+t.sec+'</p>'
+'<div class="panel"><p>'+t.intro+'</p></div>'
+'<div id="sdThread"></div>'
+'<div style="margin-top:14px"><input id="sdText" type="text" maxlength="500" aria-label="'+t.ph.replace(/"/g,'')+'" placeholder="'+t.ph.replace(/"/g,'')+'"></div>'
+'<div class="sd-btnrow">'
+'<button type="button" class="sd-chip" id="sdPhotoBtn">'+t.photo+'</button>'
+'<button type="button" class="sd-chip" id="sdRecBtn">'+t.rec+'</button>'
+'<button type="button" class="sd-chip" id="sdAddBtn">'+t.add+'</button>'
+'</div>'
+'<p class="sd-note" id="sdNote">'+t.saved+'</p>'
+'<div class="controls" style="justify-content:flex-start"><button type="button" id="sdCreate" disabled>'+t.create+'</button></div>'
+'<div id="sdDraft">'
+'<input id="sdTitle" type="text" maxlength="120" aria-label="'+t.defTitle+'" placeholder="'+t.defTitle+'">'
+'<div class="sd-thumbs" id="sdThumbs"></div>'
+'<div id="sdMedia"></div>'
+'<textarea id="sdBody" aria-label="'+t.defTitle+'"></textarea>'
+'<p class="sd-note">'+t.review+'</p>'
+'<div class="sd-actions">'
+'<button type="button" class="sd-chip" id="sdCopy">'+t.copy+'</button>'
+'<button type="button" class="sd-chip" id="sdDl">'+t.dl+'</button>'
+'<button type="button" class="sd-chip" id="sdRebuild" style="display:none">'+t.rebuild+'</button>'
+'<button type="button" class="sd-chip" id="sdReset">'+t.again+'</button>'
+'</div></div>'
+'<input type="file" id="sdPhotoInput" accept="image/*" multiple style="display:none">'
+'<input type="file" id="sdAudioInput" accept="audio/*" style="display:none">';
sv.querySelector('section').appendChild(root);

var thread=root.querySelector('#sdThread'),textIn=root.querySelector('#sdText'),note=root.querySelector('#sdNote'),
createBtn=root.querySelector('#sdCreate'),draft=root.querySelector('#sdDraft'),titleIn=root.querySelector('#sdTitle'),
body=root.querySelector('#sdBody'),thumbs=root.querySelector('#sdThumbs'),mediaBox=root.querySelector('#sdMedia'),
photoInput=root.querySelector('#sdPhotoInput'),audioInput=root.querySelector('#sdAudioInput'),
recBtn=root.querySelector('#sdRecBtn'),rebuildBtn=root.querySelector('#sdRebuild');

var texts=[],photos=[],voices=[]; /* photos:[dataURL], voices:[{src,dur}] */
var made=false;
var mediaPersist=true;

function fmtDur(s){s=Math.round(s);return Math.floor(s/60)+':'+('0'+(s%60)).slice(-2)}
function save(){
 var o={v:1,savedAt:Date.now(),texts:texts,photos:mediaPersist?photos:[],voices:mediaPersist?voices:[],made:made,title:titleIn.value,body:made?body.value:''};
 var j=JSON.stringify(o);
 while(j.length>MAX_STORE&&(o.photos.length||o.voices.length)){
  if(o.photos.length>=o.voices.length)o.photos.shift();else o.voices.shift();
  j=JSON.stringify(o);
 }
 try{localStorage.setItem(KEY,j)}
 catch(e){if(mediaPersist){mediaPersist=false;note.textContent=t.saved;save()}}
}
function load(){
 try{var o=JSON.parse(localStorage.getItem(KEY)||'null');if(!o||o.v!==1)return;
 if(o.savedAt&&Date.now()-o.savedAt>MAX_AGE){localStorage.removeItem(KEY);return}
 texts=o.texts||[];photos=o.photos||[];voices=o.voices||[];
 if(o.made){titleIn.value=o.title||'';body.value=o.body||'';made=true}
 }catch(e){}
}
function refreshCreate(){createBtn.disabled=!(texts.length||photos.length||voices.length)}
function el(tag,cls){var e=document.createElement(tag);if(cls)e.className=cls;return e}
function addX(item,fn){var x=el('button','sd-x');x.type='button';x.textContent='×';x.setAttribute('aria-label','×');x.onclick=fn;item.appendChild(x)}
function renderThread(){
 thread.innerHTML='';
 photos.forEach(function(src,i){
  var d=el('div','sd-item'),w=el('div'),im=el('img');im.src=src;im.alt=t.photoN(i+1);
  var cap=el('div','sd-cap');cap.textContent=t.photoN(i+1);
  w.appendChild(im);w.appendChild(cap);d.appendChild(w);
  addX(d,function(){photos.splice(i,1);renderThread();refreshCreate();save()});
  thread.appendChild(d);
 });
 texts.forEach(function(tx,i){
  var d=el('div','sd-item'),p=el('p');p.textContent=tx;d.appendChild(p);
  addX(d,function(){texts.splice(i,1);renderThread();refreshCreate();save()});
  thread.appendChild(d);
 });
 voices.forEach(function(v,i){
  var d=el('div','sd-item'),w=el('div'),a=el('audio');a.controls=true;a.src=v.src;
  var cap=el('div','sd-cap');cap.textContent=t.voiceN(i+1,v.dur||'0:00');
  w.appendChild(a);w.appendChild(cap);d.appendChild(w);
  addX(d,function(){voices.splice(i,1);renderThread();refreshCreate();save()});
  thread.appendChild(d);
 });
}
function downscale(file,cb){
 var url=URL.createObjectURL(file),img=new Image();
 img.onload=function(){
  var m=1280,w=img.width,h=img.height;
  if(w>m||h>m){var r=Math.min(m/w,m/h);w=Math.round(w*r);h=Math.round(h*r)}
  var c=document.createElement('canvas');c.width=w;c.height=h;
  c.getContext('2d').drawImage(img,0,0,w,h);
  URL.revokeObjectURL(url);
  cb(c.toDataURL('image/jpeg',0.82));
 };
 img.onerror=function(){URL.revokeObjectURL(url)};
 img.src=url;
}
root.querySelector('#sdPhotoBtn').onclick=function(){if(photos.length>=MAX_PHOTOS){note.textContent=t.maxPhotos;return}photoInput.click()};
photoInput.onchange=function(){
 var files=Array.prototype.slice.call(photoInput.files||[]);photoInput.value='';
 files.slice(0,Math.max(0,MAX_PHOTOS-photos.length)).forEach(function(f){
  downscale(f,function(url){if(!url)return;photos.push(url);renderThread();refreshCreate();save()});
 });
};
function addVoiceFile(file){
 if(voices.length>=MAX_VOICES){note.textContent=t.maxVoices;return}
 var fr=new FileReader();
 fr.onload=function(){voices.push({src:fr.result,dur:'0:00'});renderThread();refreshCreate();save()};
 fr.readAsDataURL(file);
}
audioInput.onchange=function(){var f=audioInput.files&&audioInput.files[0];audioInput.value='';if(f)addVoiceFile(f)};

var recorder=null,recChunks=[],recStart=0,recTimer=null;
recBtn.onclick=function(){
 if(recorder){recorder.stop();return}
 if(voices.length>=MAX_VOICES){note.textContent=t.maxVoices;return}
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||typeof MediaRecorder==='undefined'){micFallback();return}
 navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){
  recChunks=[];recorder=new MediaRecorder(stream);
  recorder.ondataavailable=function(e){if(e.data&&e.data.size)recChunks.push(e.data)};
  recorder.onstop=function(){
   stream.getTracks().forEach(function(tr){tr.stop()});
   clearInterval(recTimer);recBtn.classList.remove('sd-rec');recBtn.textContent=t.rec;
   var blob=new Blob(recChunks,{type:recorder.mimeType||'audio/webm'});recorder=null;
   var dur=fmtDur((Date.now()-recStart)/1000);
   var fr=new FileReader();
   fr.onload=function(){voices.push({src:fr.result,dur:dur});renderThread();refreshCreate();save()};
   fr.readAsDataURL(blob);
  };
  recorder.start();recStart=Date.now();
  recBtn.classList.add('sd-rec');
  var tick=function(){recBtn.textContent='■ '+t.stop+' '+fmtDur((Date.now()-recStart)/1000)};tick();
  recTimer=setInterval(tick,500);
 }).catch(micFallback);
};
function micFallback(){
 recBtn.style.display='none';
 note.innerHTML='';
 note.appendChild(document.createTextNode(t.micFail+' '));
 var b=el('button','sd-chip');b.type='button';b.textContent=t.voiceFile;
 b.onclick=function(){audioInput.click()};
 note.appendChild(b);
}
function addText(){
 var v=textIn.value.trim();if(!v)return;
 texts.push(v);textIn.value='';renderThread();refreshCreate();save();
}
root.querySelector('#sdAddBtn').onclick=addText;
textIn.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();addText()}});

function buildBody(){
 var L=[t.hdr,''];
 L.push((titleIn.value.trim()||t.defTitle).toUpperCase());L.push('');
 texts.forEach(function(tx){L.push(tx);L.push('')});
 if(photos.length)L.push(t.photosLine(photos.length));
 if(voices.length)L.push(t.voicesLine(voices.length));
 if(photos.length||voices.length)L.push('');
 L.push(t.todoHdr);
 t.todoItems.forEach(function(it){L.push('- '+it)});
 L.push('');
 L.push(t.created(new Date().toLocaleDateString()));
 return L.join('\n');
}
function renderDraft(){
 draft.style.display='block';
 rebuildBtn.style.display='';
 thumbs.innerHTML='';
 photos.forEach(function(src,i){var im=el('img');im.src=src;im.alt=t.photoN(i+1);thumbs.appendChild(im)});
 mediaBox.innerHTML='';
 voices.forEach(function(v,i){
  var w=el('div');var a=el('audio');a.controls=true;a.src=v.src;a.style.maxWidth='100%';a.style.height='34px';
  var cap=el('div','sd-cap');cap.textContent=t.voiceN(i+1,v.dur||'0:00');
  w.appendChild(a);w.appendChild(cap);mediaBox.appendChild(w);
 });
}
createBtn.onclick=function(){
 if(!(texts.length||photos.length||voices.length)){note.innerHTML='<span class="sd-warn">'+t.need+'</span>';return}
 if(!titleIn.value.trim())titleIn.value=(texts[0]||'').slice(0,70)||t.defTitle;
 body.value=buildBody();made=true;renderDraft();save();
 draft.scrollIntoView({behavior:'smooth',block:'start'});
};
rebuildBtn.onclick=function(){
 if(body.value.trim()&&body.value!==buildBody()&&!window.confirm(t.confirmRebuild))return;
 body.value=buildBody();save();
};
titleIn.addEventListener('input',function(){if(made)save()});
body.addEventListener('input',function(){if(made)save()});
root.querySelector('#sdCopy').onclick=function(){
 var done=function(){var b=root.querySelector('#sdCopy');b.textContent=t.copied;setTimeout(function(){b.textContent=t.copy},1500)};
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(body.value).then(done,done)}
 else{body.select();try{document.execCommand('copy')}catch(e){}done()}
};
root.querySelector('#sdDl').onclick=function(){
 var blob=new Blob([body.value],{type:'text/plain;charset=utf-8'});
 var a=document.createElement('a');a.href=URL.createObjectURL(blob);
 a.download=(titleIn.value.trim()||t.defTitle).toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.txt';
 document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},400);
};
root.querySelector('#sdReset').onclick=function(){
 if(!window.confirm(t.confirmReset))return;
 texts=[];photos=[];voices=[];made=false;titleIn.value='';body.value='';
 draft.style.display='none';rebuildBtn.style.display='none';
 renderThread();refreshCreate();
 try{localStorage.removeItem(KEY)}catch(e){}
};

load();renderThread();refreshCreate();
if(made)renderDraft();
})();
