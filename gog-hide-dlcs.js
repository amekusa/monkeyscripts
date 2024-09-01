// ==UserScript==
// @name         Hide DLCs by default
// @namespace    amekusa.gog-hide-dlcs
// @author       amekusa
// @version      1.0.1
// @description  Hide DLCs in the store page by default. Doesn't work on some links
// @match        https://www.gog.com/*
// @run-at       document-start
// @grant        none
// @license      MIT
// @homepage     https://github.com/amekusa/monkeyscripts
// ==/UserScript==

(function (doc) {
	// url params to add to the store links
	let params = 'hideDLCs=true';
	// params += '&discounted=true'; // option: Show only discounted
	// params += '&hideOwned=true';  // option: Hide all owned products

	let addParams = link => {
		let href = link.getAttribute('href');
		link.setAttribute('href', href + (href.includes('?') ? '&' : '?') + params);
	};
	let update = () => {
		let links = [];
		let exclude = `:not([href*="${params}"])`;
		links.push(doc.querySelectorAll('a[href$="/games"]' + exclude));
		links.push(doc.querySelectorAll('a[href*="/games?"]' + exclude));
		links.push(doc.querySelectorAll('a[href*="/games/"]' + exclude));
		// links.push(doc.querySelectorAll('a[href*="/promo/"]' + exclude));
		for (let i = 0; i < links.length; i++) links[i].forEach(addParams);
	};
	doc.addEventListener('DOMContentLoaded', update);
	doc.addEventListener('scrollend', update);

})(document);

