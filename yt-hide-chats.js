// ==UserScript==
// @name         YouTube - Hide chats by default
// @namespace    amekusa.yt-hide-chats
// @author       amekusa
// @version      1.0.1
// @description  Hide chats on YouTube live videos by default.
// @match        https://www.youtube.com/watch?*
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

