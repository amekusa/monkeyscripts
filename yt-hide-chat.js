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
	let wait     = 4000; // initial wait time (ms)
	let interval = 2000; // update interval (ms)
	let match    = /^https:\/\/www\.youtube\.com\/(?:watch\?|clip\/)/; // url pattern
	let debug    = true ? console.debug : (() => {});
	// --------------

	let watcher;
	let paused;
	let hide;

	function findCloseButton() {
		try {
			let fr = doc.querySelector('iframe#chatframe'); // frame
			if (!fr) return null;
			fr = fr.contentWindow.document;
			if (!fr.querySelector('yt-live-chat-item-list-renderer #items [id], yt-live-chat-item-list-renderer #empty-state-message')) return null;
			return fr.querySelector('yt-live-chat-header-renderer #close-button button');
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
		if (paused || !hide) return; // do nothing

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

	function pause() {
		debug('pause.');
		paused = true;
		if (watcher) {
			clearTimeout(watcher);
			clearInterval(watcher);
			watcher = null;
		}
	}

	function init() {
		if (watcher) return; // already running
		if (paused) {
			debug('resume.');
			paused = false;
		}
		debug('initializing...');
		hide = true;
		watcher = setTimeout(() => {
			watcher = setInterval(update, interval);
			debug('initialized.');
			update();
		}, wait);
	}

	doc.addEventListener('yt-navigate-start', pause);
	doc.addEventListener('yt-navigate-finish', init);

})(document);

