// ==UserScript==
// @name         YouTube - Filter videos by title and channel name
// @namespace    amekusa.yt-filter-videos
// @author       amekusa
// @version      0.4.0
// @description  Blur thumbnails of videos matching patterns
// @match        https://www.youtube.com/*
// @run-at       document-start
// @grant        none
// @license      MIT
// @homepage     https://github.com/amekusa/monkeyscripts
// @downloadURL  https://update.greasyfork.org/scripts/603896/YouTube%20-%20Filter%20videos%20by%20title%20and%20channel%20name.user.js
// @updateURL    https://update.greasyfork.org/scripts/603896/YouTube%20-%20Filter%20videos%20by%20title%20and%20channel%20name.meta.js
// ==/UserScript==

(function (doc) {

	let config = {
		// --- Configuration ---
		debug: false,
		filter: [
			// cringe contents
			/(?:^|[^a-z])(?:vtube|holo|ch\.|nijis|genshin|2ch|5ch)/i,
			/(?:ホロライブ|にじさん|原神)/u,
			/(?:歌ってみた|歌い手|初音|ボカロ)/u,
			/(?:コメ付|ゆっくり|ずんだ|(?:2|5|２|５)ちゃん)/u,

			// spoilers
			/(?:時のオカリナ|時オカ)/u,
			/(?:ocarina|oot|zelda)/i,
		],
		debounce: 1500, // in milliseconds
		styles: { // styles for filtered videos
			card: [
				'opacity: .25 !important;',
			],
			thumbnail: [
				'filter: blur(6px) !important;',
			],
		},
		cardSelector: [ // css selector for video items
			// regular video cards
			'yt-lockup-view-model',

			// shorts
			'ytm-shorts-lockup-view-model',
			'.reel-video-in-sequence-new',

			// search results
			'ytd-video-renderer',

			// playlist items
			'ytd-playlist-panel-video-renderer',

			// player recommendations
			'.ytp-videowall-still',
			'.ytp-ce-element.ytp-ce-video',
		],
		// === End of Configuration ===
	}

	let debug = config.debug ? console.debug : (() => {});
	let cardSel = config.cardSelector.join(',');
	let {filter, debounce} = config;

	let NS = '--ns' + Math.floor(Math.random() * 10000); // namespace
	let purged = `${NS}-purged`;

	let scheduled = false;
	let lastUpdate = 0;

	function purge(item, flag = true) {
		item.classList.toggle(purged, flag);
	}

	function check(item) {
		let info = item.innerText;
		for (let i = 0; i < filter.length; i++) {
			if (info.match(filter[i])) {
				debug('purge:', info, item);
				purge(item);
				return;
			}
		}
		purge(item, false)
	}

	function update() {
		lastUpdate = Date.now();
		let cards = doc.querySelectorAll(cardSel);
		for (let i = 0; i < cards.length; i++) {
			check(cards[i]);
		}
	}

	function schedule() {
		if (scheduled) return;
		scheduled = true;
		let delay = Math.max(0, lastUpdate + debounce - Date.now());
		setTimeout(function () {
			scheduled = false;
			update();
		}, delay);
	}

	function init() {
		// css
		let styles = config.styles;
		let style = doc.createElement('style');
		style.textContent = `
			.${purged} {
				${styles.card.join(' ')}
			}
			.${purged} .reel-video-in-sequence-thumbnail,
			.${purged} .ytp-videowall-still-image,
			.${purged} .ytp-modern-videowall-still-image,
			.${purged} .ytp-ce-covering-image,
			.${purged} *[style*="background-image:"],
			.${purged} img,
			.${purged} video,
			.${purged} canvas {
				${styles.thumbnail.join(' ')}
			}
		`;
		(doc.head || doc.documentElement).appendChild(style);

		// initial scan
		update();

		// watch for dynamically loaded or updated content
		let observer = new MutationObserver(schedule);
		observer.observe(doc.documentElement, {
			childList: true,
			subtree: true,
			characterData: true,
			attributes: true,
			attributeFilter: ['aria-hidden'],
		});

		// on page load
		doc.addEventListener('yt-navigate-finish', schedule);

		// on scroll
		doc.addEventListener('scrollend', schedule);
	}

	if (doc.readyState == 'loading') {
		doc.addEventListener('DOMContentLoaded', init, {once: true});
	} else init();

})(document);

