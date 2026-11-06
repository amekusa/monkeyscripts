// ==UserScript==
// @name         YouTube - Hide chat by default
// @namespace    amekusa.yt-hide-chat
// @author       amekusa
// @version      3.4.0
// @description  Hide chat on YouTube live videos by default.
// @match        https://www.youtube.com/*
// @run-at       document-start
// @grant        none
// @license      MIT
// @homepage     https://github.com/amekusa/monkeyscripts
// @downloadURL  https://update.greasyfork.org/scripts/507558/YouTube%20-%20Hide%20chat%20by%20default.user.js
// @updateURL    https://update.greasyfork.org/scripts/507558/YouTube%20-%20Hide%20chat%20by%20default.meta.js
// ==/UserScript==

(function (doc) {

	let config = {
		// --- Configuration ---
		debug: false,
		wait:  5000, // in milliseconds
		// === End of Configuration ===
	}

	/**
	 * Simple state manager with transition timer.
	 * @author amekusa
	 */
	class State {
		constructor(initial, opts) {
			this.curr = initial;
			this.prev;
			this.timer = null;
			this.debug = false;
			let {debug} = opts;
			if (debug) this.debug = (typeof debug == 'function') ? debug : console.debug;
		}
		get() {
			return this.curr;
		}
		set(value, timer = 0, cb = null) {
			if (this.timer) clearTimeout(this.timer);
			if (timer > 0) {
				this.timer = setTimeout(() => {
					this.timer = null;
					this._set(value);
					if (cb) cb(this);
				}, timer);
				if (this.debug) this.debug(`State will change from`, this.curr, `to`, value, `in`, timer, `ms...`);
			} else {
				this.timer = null;
				this._set(value);
				if (cb) cb(this);
			}
		}
		_set(value) {
			this.prev = this.curr;
			this.curr = value;
			if (this.debug) this.debug(`State changed from`, this.prev, `to`, this.curr);
		}
		is(value) {
			return this.curr === value;
		}
	}

	/**
	 * Observes mutations inside a frame.
	 * @author amekusa
	 */
	class FrameWatcher {
		constructor(frame, action, observerOpts) {
			this.frame = frame;
			this.action = action;
			this.observerOpts = observerOpts || {
				childList: true,
				subtree: true,
				characterData: true,
			};
			this._action = this.action.bind(this, this.frame);
			this.observer;
			this.aborter = new AbortController();
			this.frame.addEventListener('load', () => {
				this._observe();
				this.action(this.frame);
			}, {signal: this.aborter.signal});
			this._observe();
		}
		dispose() {
			this._unobserve();
			this.aborter.abort();
			this.aborter = null;
			this.frame = null;
			this.action = null;
		}
		_observe() {
			this._unobserve();
			let frameDoc;
			try {
				frameDoc = this.frame.contentDocument;
				if (!frameDoc || !frameDoc.documentElement) return;
			} catch (e) {
				return;
			}
			this.observer = new MutationObserver(this._action);
			this.observer.observe(frameDoc.documentElement, this.observerOpts);
		}
		_unobserve() {
			if (!this.observer) return;
			this.observer.disconnect();
			this.observer = null;
		}
	}

	let label = '[yt-hide-chat]'; // label for logging

	let debug = config.debug // debug logger
		? ((...args) => console.debug(label, ...args))
		: (() => {});

	let {wait} = config;

	let state = new State(undefined, {debug});
	const IDLE    = 0; // looking for chat iframe
	const READY   = 1; // chat iframe found
	const DONE    = 2; // closed chat successfully
	const PAUSED  = 4; // transitioning to other page
	const WAITING = 8; // waiting after transition

	let detector; // chat iframe detector
	let watcher;  // mutation observer inside chat iframe

	/**
	 * Finds the close button, then clicks on it.
	 */
	function update(frame) {
		if (!state.is(READY)) return;
		try {
			frame = frame.contentWindow.document;
			if (!frame.querySelector('yt-live-chat-item-list-renderer #items [id], yt-live-chat-item-list-renderer #empty-state-message')) return null;
			let btn = frame.querySelector('yt-live-chat-header-renderer #close-button button');
			if (!btn) return;
			// btn.dispatchEvent(new Event('click'));
			btn.click();
			debug(`Clicked button:`, btn);

		} catch (e) {
			console.error(label, e);
			return;
		}
		killAll();
		state.set(DONE);
	}

	/**
	 * Detects the chat iframe.
	 */
	function detect() {
		if (!state.is(IDLE)) return;
		let frame = doc.querySelector('iframe#chatframe');
		if (frame) {
			debug(`Chat frame detected:`, frame);
			killAll();
			state.set(READY);
			watcher = new FrameWatcher(frame, update);
			update(frame);

		} else { // no frame
			killWatcher();
		}
	}

	function killWatcher() {
		if (watcher) {
			watcher.dispose();
			watcher = null;
			debug(`Killed watcher.`);
		}
	}

	function killDetector() {
		if (detector) {
			detector.disconnect();
			detector = null;
			debug(`Killed detector.`);
		}
	}

	function killAll() {
		killWatcher();
		killDetector();
	}

	/**
	 * Resets the state to idle.
	 */
	function reset() {
		debug(`Reset.`);
		killAll();
		state.set(WAITING);
		state.set(IDLE, wait, () => {
			detector = new MutationObserver(detect);
			detector.observe(doc.documentElement, {
				childList: true,
				subtree: true,
			});
			detect();
		});
	}

	function pause() {
		debug(`Pause.`);
		killAll();
		state.set(PAUSED);
	}

	function init() {
		reset();
		doc.addEventListener('yt-navigate-start',  pause);
		doc.addEventListener('yt-navigate-finish', reset);
	}

	if (doc.readyState == 'loading') {
		doc.addEventListener('DOMContentLoaded', init, {once: true});
	} else init();

})(document);

