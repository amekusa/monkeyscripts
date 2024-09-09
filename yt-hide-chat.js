// ==UserScript==
// @name         YouTube - Hide chat by default
// @namespace    amekusa.yt-hide-chat
// @author       amekusa
// @version      1.1.2
// @description  Hide chat on YouTube live videos by default.
// @match        https://www.youtube.com/*
// @run-at       document-start
// @grant        none
// @license      MIT
// @homepage     https://github.com/amekusa/monkeyscripts
// ==/UserScript==

(function (doc) {
	// --- config ---
	let interval = 1500;
	let debug = false ? console.debug : (() => {});
	// --------------

	let hide = true;
	let url = window.location.href;

	let find = () => {
		try {
			let frame = doc.querySelector('iframe#chatframe');
			return frame ? frame.contentWindow.document.querySelector('yt-live-chat-renderer #close-button button') : null;
		} catch (e) {
			return null;
		}
	};

	let unhide = () => {
		debug('unhide');
		hide = false;
	};

	let update = () => {
		// only work with a video page
		if (!window.location.href.startsWith('https://www.youtube.com/watch?')) return;

		// hook "Show chat" button
		let btn = doc.querySelector('#chat-container #show-hide-button button');
		if (btn) {
			btn.removeEventListener('click', unhide);
			btn.addEventListener('click', unhide);
		}

		// detect url change
		if (url != window.location.href) {
			url = window.location.href;
			debug('url changed:', url);
			hide = true;
		} else if (!hide) return;

		// find & click the close button
		btn = find();
		if (btn) {
			debug('click:', btn);
			btn.dispatchEvent(new Event('click'));
		}
	};

	doc.addEventListener('DOMContentLoaded', () => {
		setInterval(update, interval);
	});

})(document);

