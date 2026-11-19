(function(){

 const el=(tag,value,cls)=>{const e=document.createElement(tag);e.textContent=value;if(cls)e.className=cls;return e};
 let generation=0;window.cancelBuyResearch=()=>{generation++};
 window.renderBuyResearch=async function(raw,panel){
 if(!/^monaco(?:, monaco)?$/i.test(raw.trim())){generation++;return false;}
 const requestId=++generation,loading=window.beginListingLoad(panel);
 panel.replaceChildren(el('p','Fetching source listing index and matching property photos now...','muted'));
 let data;try{const r=await fetch('/api/buy-search?city='+encodeURIComponent(raw),{signal:loading.signal});if(!r.ok)throw Error('Source unavailable');data=await r.json();if(requestId!==generation||!loading.active)return true}catch{if(requestId!==generation||!loading.active)return true;panel.replaceChildren(el('p','Source unavailable. This is not a zero-homes result.'));return true}finally{loading.finish()}
 panel.replaceChildren(el('h2',data.city?data.city+' / Homes for sale':'City coverage'));if(!Array.isArray(data.listings))data.listings=[];
 panel.append(el('p','Source-advertised properties, not verified available inventory. Sale status, buyer fees, taxes and full acquisition costs need confirmation.','listing-preview-note'));
 if(!data.listings.length){panel.append(el('p',data.message||'Source unavailable.'));return true}
 panel.append(el('p',data.listings.length+' source advertisements · checked '+(data.listings[0].checkedAt||'on request')+' · photos hosted by their source','listing-caption'));
 if(data.discoveryMode)panel.append(el('p',data.discoveryMode,'listing-caption'));const grid=el('div','','listing-grid');for(const r of data.listings){const c=el('article','','listing-card');c.append(el('p',r.source+' / '+r.location,'listing-caption'));const urls=r.images;const gallery=createRentalGallery(urls,r.title);c.append(gallery);window.bindRentalDetail(gallery,r,urls,panel);c.append(el('h3',r.title));c.append(createRentalFavourite(r));c.append(el('p',r.priceText,'listing-price'));c.append(el('p',r.specs.join(' · ')));c.append(el('p',r.freshnessWarning||'Buyer costs and current sale status unconfirmed.'));c.append(el('p','Photos: '+r.source+'. Matched to this listing source page.','listing-caption'));const phone=el('a',r.advertiserRole==='property manager'?'Contact property manager':'Contact agency');phone.href='tel:'+r.agencyPhone;const a=el('a','Source details');a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';c.append(phone,a);grid.append(c)}panel.append(grid);return true;
 };
})();
