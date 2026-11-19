/* Rental comparison leads. Explicit deep links and restored user research retain their intent. */
(function(){
'use strict';
var tabs=document.querySelector('.tabs');if(!tabs)return;
var mobileStyle=document.createElement('style');mobileStyle.textContent='@media(max-width:600px){.tabs{display:flex!important;flex-wrap:nowrap!important;gap:0!important;justify-content:space-between;overflow-x:auto;scrollbar-width:none}.tabs button{flex:0 0 auto;font-size:10px!important;font-weight:700!important;letter-spacing:.07em!important;padding-left:0!important;padding-right:0!important;white-space:nowrap;min-height:44px}}';document.head.appendChild(mobileStyle);

['tabRent','tabCmp','tabBuy','tabSell','tabReno'].forEach(function(id){var button=document.getElementById(id);if(button)tabs.appendChild(button)});
if(!/^#(?:buy|sell|rent|compare|renovate)$/i.test(location.hash)){var rent=document.getElementById('tabRent');if(rent)rent.click()}
if(location.hash.toLowerCase()==='#renovate'){var renovate=document.getElementById('tabReno');if(renovate)renovate.click()}
})();
