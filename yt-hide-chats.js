// ==UserScript==
// @name         YouTube - Hide chats by default
// @namespace    amekusa.yt-hide-chats
// @author       amekusa
// @version      1.0.1
// @description  Hide chats on YouTube live videos by default.
// @match        https://www.youtube.com/*
// @run-at       document-start
// @grant        none
// @license      MIT
// @homepage     https://github.com/amekusa/monkeyscripts
// ==/UserScript==

(function (doc) {
	// --- config ---
	let interval = 1000;
	let debug = false ? console.debug : (() => {});
	// --------------

	let watcher;

	let update = () => {
		let frame = doc.querySelector('iframe#chatframe');
		debug('frame:', frame);
		if (!frame) return;

		let btn = frame.contentWindow.document.querySelector('yt-live-chat-renderer #close-button button');
		debug('button:', btn);
		if (!btn) return;

		clearInterval(watcher);
		btn.dispatchEvent(new Event('click'));
		debug('done.');
	};

	doc.addEventListener('DOMContentLoaded', () => {
		update();
		watcher = setInterval(update, interval);
	});

})(document);

