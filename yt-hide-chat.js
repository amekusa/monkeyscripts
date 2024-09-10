// ==UserScript==
// @name         YouTube - Hide chat by default
// @namespace    amekusa.yt-hide-chat
// @author       amekusa
// @version      1.2.1
// @description  Hide chat on YouTube live videos by default.
// @match        https://www.youtube.com/*
// @run-at       document-start
// @grant        none
// @license      MIT
// @homepage     https://github.com/amekusa/monkeyscripts
// ==/UserScript==

(function (doc) {
	// --- config ---
	let wait = 4000; // initial wait time (ms)
	let interval = 2000; // update interval (ms)
	let match = /^https:\/\/www\.youtube\.com\/(?:watch\?|clip\/)/; // url pattern
	let debug = false ? console.debug : (() => {});
	// --------------

	let watcher;
	let hide;
	let url;

	function findCloseButton() {
		try {
			let el = doc.querySelector('iframe#chatframe');
			if (!el) return null;
			el = el.contentWindow.document;
			if (!el.querySelector('yt-live-chat-item-list-renderer #items [id], yt-live-chat-item-list-renderer #empty-state-message')) return null;
			return el.querySelector('yt-live-chat-header-renderer #close-button button');
		} catch (e) {
			return null;
		}
	}

	function unhide() {
		debug('unhide.');
		hide = false;
	}

	function update() {
		if (!window.location.href.match(match)) return; // do nothing

		// detect url change
		if (url != window.location.href) {
			debug('url changed:', window.location.href);
			return init();
		}

		if (!hide) return;

		// find & click the close button
		let btn = findCloseButton();
		if (btn) {
			debug('click:', btn);
			return btn.dispatchEvent(new Event('click'));
		}

		// hook "Show chat" button
		btn = doc.querySelector('#chat-container #show-hide-button button');
		if (btn) {
			btn.removeEventListener('click', unhide);
			btn.addEventListener('click', unhide);
		}
	}

	function init() {
		if (watcher) clearInterval(watcher);
		debug('initializing...');
		hide = true;
		url = window.location.href;
		setTimeout(() => {
			watcher = setInterval(update, interval);
			debug('initialized.');
			update();
		}, wait);
	}

	doc.addEventListener('DOMContentLoaded', init);

})(document);

