(function(){
'use strict';
if(document.documentElement.dataset.tabColoursReady)return;
document.documentElement.dataset.tabColoursReady='true';
var themes={brown:null,navy:{bg:'#192633',surface:'#15212c',text:'#eee8dc',muted:'#bac8cc',line:'#536674',strong:'#ddd6c6',button:'#ddd6c6',ink:'#192633'},forest:{bg:'#253b35',surface:'#1e312b',text:'#f0eadc',muted:'#bbcabd',line:'#60776a',strong:'#e0dbc9',button:'#e0dbc9',ink:'#253b35'},limestone:{bg:'#eeece5',surface:'#e4e2d9',text:'#303834',muted:'#5f6962',line:'#a0a79c',strong:'#35473e',button:'#35473e',ink:'#f4f2e9'},maroon:{bg:'#50151e',surface:'#3d0f16',text:'#ddc99e',muted:'#c4ae8b',line:'#8c7356',strong:'#d2b98a',button:'#d2b98a',ink:'#50151e'}};
function colour(match,prop){
var a=match[0]==='#'?match.slice(1):null,r,g,b;
if(a){if(a.length===3)a=a.split('').map(function(x){return x+x}).join('');r=parseInt(a.slice(0,2),16);g=parseInt(a.slice(2,4),16);b=parseInt(a.slice(4,6),16)}else{var nums=match.match(/[\d.]+/g);r=+nums[0];g=+nums[1];b=+nums[2];if(nums.length===4&&+nums[3]===0)return match}
// Keep semantic green/pink status colours; transform the existing neutral brown/cream palette only.
if(!(r>=g&&g>=b))return match;
var l=.2126*r+.7152*g+.0722*b,key;
if(/background/.test(prop))key=l>170?'button':(l<70?'surface':'bg');
else if(/border|outline/.test(prop))key=l>170?'strong':'line';
else if(prop==='color'||prop==='fill'||prop==='stroke')key=l<110?'ink':l>215?'text':'muted';
else return match;
return 'var(--st-'+key+','+match+')';
}
function patchStyle(style){if(!style)return;Array.from(style).forEach(function(prop){if(prop.indexOf('--')===0)return;var old=style.getPropertyValue(prop);if(old.indexOf('var(')>=0)return;var next=old.replace(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b|rgba?\([^)]*\)/gi,function(c){return colour(c,prop)});if(next!==old)style.setProperty(prop,next,style.getPropertyPriority(prop))})}
function rules(list){Array.from(list||[]).forEach(function(rule){if(rule.style)patchStyle(rule.style);if(rule.cssRules)rules(rule.cssRules)})}
function scan(root){if(root.nodeType!==1)return;if(root.tagName==='STYLE'){try{rules(root.sheet.cssRules)}catch(e){}}patchStyle(root.style);root.querySelectorAll('[style],style').forEach(function(el){if(el.tagName==='STYLE'){try{rules(el.sheet.cssRules)}catch(e){}}patchStyle(el.style)})}
Array.from(document.styleSheets).forEach(function(sheet){try{rules(sheet.cssRules)}catch(e){}});scan(document.documentElement);
// Fixed tab colours. Rent uses original Sepia; Renovate uses the light palette.
function apply(id){var values=themes[id];['bg','surface','text','muted','line','strong','button','ink'].forEach(function(k){if(values)document.documentElement.style.setProperty('--st-'+k,values[k]);else document.documentElement.style.removeProperty('--st-'+k)});document.documentElement.dataset.theme=id}
var mapping={tabRent:'brown',tabCmp:'navy',tabBuy:'maroon',tabSell:'forest',tabReno:'limestone'};
var fadeTimer=0;
function sync(){var active=document.querySelector('.tabs button.on');if(!active)return;var next=mapping[active.id]||'brown',old=document.documentElement.dataset.theme;if(next===old)return;apply(next);if(old&&(old==='limestone'||next==='limestone')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('stContrastGuard');cancelAnimationFrame(fadeTimer);var end=performance.now()+850;function guard(){var rgb=getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g)||[0,0,0];var lum=rgb.slice(0,3).map(function(v){v=+v/255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)});var l=.2126*lum[0]+.7152*lum[1]+.0722*lum[2];document.documentElement.style.setProperty('--st-trans-ink',l>.179?'#181818':'#ffffff');if(performance.now()<end)fadeTimer=requestAnimationFrame(guard);else document.documentElement.classList.remove('stContrastGuard')}guard()}}

var placeholderStyle=document.createElement('style');placeholderStyle.textContent='html[data-theme=maroon] input::placeholder,html[data-theme=maroon] textarea::placeholder{color:#c4ae8b;opacity:.6}';document.head.appendChild(placeholderStyle);
// Ignore legacy stTheme:v1 preferences; each tab now owns its colour.
sync();
var fadeStyle=document.createElement('style');fadeStyle.textContent='html.stColourFade body,html.stColourFade body *{transition-property:background-color,color,border-color,outline-color,fill,stroke;transition-duration:800ms;transition-timing-function:cubic-bezier(.22,.61,.36,1)}html.stContrastGuard body *{color:var(--st-trans-ink)!important;transition-property:background-color,border-color!important}html.stContrastGuard input::placeholder,html.stContrastGuard textarea::placeholder{color:var(--st-trans-ink)!important;opacity:1!important}html.stContrastGuard button,html.stContrastGuard select{background-color:transparent!important}@media(prefers-reduced-motion:reduce){html.stColourFade body,html.stColourFade body *{transition:none!important}}';document.head.appendChild(fadeStyle);
requestAnimationFrame(function(){requestAnimationFrame(function(){document.documentElement.classList.add('stColourFade')})});
var tabs=document.querySelector('.tabs');if(tabs)new MutationObserver(sync).observe(tabs,{subtree:true,attributes:true,attributeFilter:['class']});
new MutationObserver(function(ms){ms.forEach(function(m){if(m.type==='attributes')patchStyle(m.target.style);else m.addedNodes.forEach(scan)})}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['style']});
})();
