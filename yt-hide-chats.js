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
	let interval = 1000;
	let debug = false ? console.debug : (() => {});
	// --------------

	let states = {
		FIND:   1,
		ENSURE: 2,
		DONE:   3,
	};
	let state = states.FIND;
	let url = window.location.href;

	let setState = x => {
		state = states[x];
		debug('state:', x);
	};

	let find = () => {
		try {
			let frame = doc.querySelector('iframe#chatframe');
			if (!frame) return null;
			if (!frame.contentWindow.document.querySelector('yt-live-chat-renderer #contents')) return null;
			return frame.contentWindow.document.querySelector('yt-live-chat-renderer #close-button button');
		} catch (e) {
			return e;
		}
	};

	let update = () => {
		let next;
		switch (state) {
		case states.FIND: // mission: find & click the close button
			var btn = find();
			if (btn) {
				if (btn instanceof Error) {
					setState('DONE');
				} else {
					debug('click:', btn);
					btn.dispatchEvent(new Event('click'));
					setState('ENSURE');
				}
			}
			return;
		case states.ENSURE: // mission: ensure the close button does not exist anymore
			var btn = find();
			if (btn) {
				setState('FIND'); // the button is stil there. do it again
				update();
			} else setState('DONE'); // success
			return;
		case states.DONE: // mission: detect url changes
			if (url != window.location.href) {
				url = window.location.href;
				debug('url changed:', url);
				setState('FIND');
			}
			return;
		default:
			console.error('Invalid State');
		}
	};

	doc.addEventListener('DOMContentLoaded', () => {
		setInterval(update, interval);
	});

})(document);

