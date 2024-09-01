// ==UserScript==
// @name         Remove cringe videos & channels on YouTube
// @namespace    amekusa.youtube-cringe-remover
// @author       amekusa
// @version      0.1.0
// @description  Remove cringe videos & channels on YouTube
// @match        https://www.youtube.com/*
// @run-at       document-start
// @grant        none
// @license      MIT
// @homepage     https://github.com/amekusa/monkeyscripts
// ==/UserScript==

(function (doc) {
	let NS = '--ns' + Math.floor(Math.random() * 10000); // namespace

	let filter = [
		/(?:^|[^a-z])(?:vtube|holo|ch\.|nijis|genshin|hongkai|2ch|5ch)/i,
		/(?:ホロライ|にじさん|原神|スターレイル)/u,
		/(?:歌ってみた|歌い手|初音|ボカロ)/u,
		/(?:コメ付|ゆっくり|ずんだも|(?:2|5|２|５)ちゃんねる)/u,
	];

	let brand = `${NS}-cursed`;

	let purge = item => {
		// console.debug('purge:', item);
		item.classList.add(brand);
	};

	let update = () => {
		check('ytd-video-renderer');
		check('ytd-rich-item-renderer');
		check('ytd-reel-item-renderer'); // videos in a carousel list
		check('ytd-compact-video-renderer'); // videos on the right sidebar
	};

	let check = sel => {
		doc.querySelectorAll(`${sel}:not(.${brand})`).forEach(item => {
			let info = item.innerText;
			for (let i = 0; i < filter.length; i++) {
				if (info.match(filter[i])) {
					purge(item);
					return;
				}
			}
		});
	};

	doc.addEventListener('DOMContentLoaded', update);
	doc.addEventListener('scrollend', update);

	let style = doc.createElement('style');
	style.innerHTML = `
.${brand} {
	opacity: .1 !important;
}`
	doc.head.appendChild(style);

})(document);

