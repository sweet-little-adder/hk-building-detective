/* Rental comparison leads. Explicit deep links and restored user research retain their intent. */
(function(){
'use strict';
var tabs=document.querySelector('.tabs');if(!tabs)return;
var mobileStyle=document.createElement('style');mobileStyle.textContent='.tabs{display:flex!important;flex-wrap:wrap!important;overflow:visible!important;height:auto!important;max-height:none!important;row-gap:8px!important;align-items:center}.tabs button{flex:0 0 auto;min-height:44px}@media(max-width:600px){.tabs{gap:8px 22px!important;justify-content:flex-start}.tabs button{font-size:11px!important;font-weight:700!important;letter-spacing:.07em!important;padding-left:0!important;padding-right:0!important;white-space:nowrap}}';document.head.appendChild(mobileStyle);

['tabRent','tabCmp','tabBuy','tabSell','tabReno'].forEach(function(id){var button=document.getElementById(id);if(button)tabs.appendChild(button)});
if(!/^#(?:buy|sell|rent|compare|renovate)$/i.test(location.hash)){var rent=document.getElementById('tabRent');if(rent)rent.click()}
if(location.hash.toLowerCase()==='#renovate'){var renovate=document.getElementById('tabReno');if(renovate)renovate.click()}
})();
