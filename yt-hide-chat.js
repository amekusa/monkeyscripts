// ==UserScript==
// @name         YouTube - Hide chat by default
// @namespace    amekusa.yt-hide-chat
// @author       amekusa
// @version      3.0.0
// @description  Hide chat on YouTube live videos by default.
// @match        https://www.youtube.com/*
// @run-at       document-start
// @grant        none
// @license      MIT
// @homepage     https://github.com/amekusa/monkeyscripts
// ==/UserScript==

(function (doc) {

	let config = {
		// --- Configuration ---
		debug: false,
		wait:  5000, // in milliseconds
		// === End of Configuration ===
	}

	class State {
		constructor(initial, opts) {
			this.curr = initial;
			this.prev;
			this.debug = opts.debug || false;
			this.timer = null;
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
			} else {
				this.timer = null;
				this._set(value);
				if (cb) cb(this);
			}
		}
		_set(value) {
			this.prev = this.curr;
			this.curr = value;
			if (this.debug) console.debug(`State changed from`, this.prev, `to`, this.curr);
		}
		is(value) {
			return this.curr === value;
		}
	}

	/**
	 * Observes mutations inside a frame.
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
			this.frame.addEventListener('load', this._observe.bind(this), {signal: this.aborter.signal});
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
			this.action(this.frame);
		}
		_unobserve() {
			if (!this.observer) return;
			this.observer.disconnect();
			this.observer = null;
		}
	}

	let debug = config.debug ? console.debug : (() => {});
	let {wait} = config;

	let state = new State(undefined, {debug: config.debug});
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
			debug('click:', btn);
			// btn.dispatchEvent(new Event('click'));
			btn.click();

		} catch (e) {
			console.error(`[yt-hide-chat]`, e);
			return;
		}
		state.set(DONE);
	}

	/**
	 * Detects the chat iframe.
	 */
	function detect() {
		if (!state.is(IDLE)) return;
		let frame = doc.querySelector('iframe#chatframe');
		if (frame) {
			if (watcher) watcher.dispose();
			state.set(READY);
			watcher = new FrameWatcher(frame, update);

		} else { // no frame
			if (watcher) {
				watcher.dispose();
				watcher = null;
			}
		}
	}

	/**
	 * Resets the state to idle.
	 */
	function reset() {
		if (watcher) {
			watcher.dispose();
			watcher = null;
		}
		state.set(WAITING);
		state.set(IDLE, wait, detect);
	}

	function pause() {
		state.set(PAUSED);
	}

	function init() {
		reset();
		detector = new MutationObserver(detect);
		detector.observe(doc.documentElement, {
			childList: true,
			subtree: true,
		});
		doc.addEventListener('yt-navigate-start',  pause);
		doc.addEventListener('yt-navigate-finish', reset);
	}

	if (doc.readyState == 'loading') {
		doc.addEventListener('DOMContentLoaded', init, {once: true});
	} else init();

})(document);

