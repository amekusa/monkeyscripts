// ==UserScript==
// @name         Hide DLCs by default
// @namespace    amekusa.gog-hide-dlcs
// @author       amekusa
// @version      1.0
// @description  Hide DLCs in the store page by default. Only affects the "STORE" link on the top
// @match        https://www.gog.com/*
// @run-at       document-start
// @grant        none
// @license      MIT
// @homepage     https://github.com/amekusa/monkeyscripts
// ==/UserScript==

(function () {
	let doc = document;
	doc.addEventListener('DOMContentLoaded', () => {
		let link = doc.querySelector('a.menu-link[href$="/games"]');
		if (!link) {
			console.error('Bad HTML');
			return;
		}
		link.setAttribute('href', link.getAttribute('href') + '?hideDLCs=true');
	})
})();

