// ==UserScript==
// @name         Old Reddit Mobile
// @namespace    https://github.com/daviidpaark/old-reddit-mobile
// @version      0.1.0
// @description  A mobile view for old.reddit.com: tap-to-open post cards with big previews, a most-visited subreddit drawer, and tap-to-collapse comment threads.
// @author       daviidpaark
// @match        https://old.reddit.com/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// @noframes
// @updateURL    https://raw.githubusercontent.com/daviidpaark/old-reddit-mobile/main/old-reddit-mobile.user.js
// @downloadURL  https://raw.githubusercontent.com/daviidpaark/old-reddit-mobile/main/old-reddit-mobile.user.js
// ==/UserScript==

(() => {
  history.scrollRestoration = 'manual';

  const viewport = document.createElement('meta');
  viewport.name = 'viewport';
  viewport.content = 'width=device-width, initial-scale=1';
  (document.head || document.documentElement).appendChild(viewport);

  const themeColor = document.createElement('meta');
  themeColor.name = 'theme-color';
  themeColor.content = '#191724';
  (document.head || document.documentElement).appendChild(themeColor);

  const R = ':root:root:root';

  GM_addStyle(`
    :root {
      --orm-bg: #191724; --orm-surface: #1f1d2e; --orm-overlay: #26233a; --orm-text: #e0def4;
      --orm-dim: #908caa; --orm-muted: #6e6a86; --orm-line: #26233a; --orm-pill: #403d52;
      --orm-accent: #ebbcba; --orm-link: #9ccfd8; --orm-up: #eb6f92; --orm-down: #c4a7e7;
      --orm-gold: #f6c177; --orm-iris: #c4a7e7; --orm-pine: #31748f;
    }
    ${R} #sr-header-area, ${R} #RESShortcutsViewport, ${R} #RESShortcuts { background: var(--orm-surface) !important; border: 0 !important; }
    ${R} #sr-header-area a, ${R} #sr-header-area .separator, ${R} #sr-header-area .srSep { color: var(--orm-dim) !important; }
    ${R} a { color: var(--orm-link); }
    html, body { overflow-x: hidden !important; }
    ${R} body {
      background: var(--orm-bg) !important; color: var(--orm-text) !important;
      font: 14px/1.4 Roboto, system-ui, sans-serif !important; min-width: 0 !important;
    }
    ${R} body > .content, ${R} .sitetable, ${R} .thing, ${R} .entry, ${R} .comment, ${R} .commentarea,
    ${R} .usertext-body, ${R} .md, ${R} .child, ${R} .link.self .expando, ${R} .menuarea {
      background: transparent !important; border-color: transparent !important; box-shadow: none !important;
    }

    #header { height: auto !important; position: relative !important; }
    ${R} #header, ${R} #header-bottom-left { background: var(--orm-bg) !important; border: 0 !important; }
    #sr-header-area {
      display: flex !important; align-items: center; font-size: 11px !important;
      overflow-x: auto !important; overflow-y: hidden !important; scrollbar-width: none;
    }
    #sr-header-area > *, #srLeftContainer > *, #RESShortcuts { float: none !important; flex: 0 0 auto; }
    #srLeftContainer { display: flex !important; align-items: center; width: auto !important; }
    #RESShortcutsViewport { width: auto !important; overflow: visible !important; }
    #RESShortcuts { position: static !important; width: auto !important; overflow: visible !important; }
    #sr-more-link, .listing-chooser, .footer-parent, .debuginfo, #header-img, .thing .rank,
    .infobar.listingsignupbar, .premium-banner-outer, #RESShortcutsEditContainer,
    .RESHover, .author-tooltip { display: none !important; }
    @media (hover: none) { ${R} a:hover { text-decoration: none !important; } }
    #header-bottom-left {
      display: flex !important; align-items: center; gap: 8px; padding: 8px 10px 4px !important;
      overflow-x: auto; scrollbar-width: none; white-space: nowrap;
    }
    ${R} .pagename { font: 500 20px Roboto, system-ui, sans-serif !important; text-transform: none !important; margin: 0 !important; }
    ${R} .pagename a { color: var(--orm-text) !important; }
    #header .tabmenu { display: flex !important; gap: 6px; margin: 0 !important; flex: 0 0 auto; }
    ${R} #header .tabmenu li a {
      display: inline-block; padding: 5px 12px !important; font-size: 13px !important; border-radius: 16px !important;
      background: transparent !important; border: 1px solid var(--orm-pill) !important; color: var(--orm-dim) !important;
    }
    ${R} #header .tabmenu li.selected a { color: var(--orm-accent) !important; border-color: var(--orm-accent) !important; }
    ${R} #header-bottom-right { display: none !important; }

    body > .content, .content[role="main"] { margin: 0 !important; padding: 0 !important; }
    body.orm-sidebar-hidden .side { display: none !important; }
    .side { float: none !important; width: auto !important; margin: 6px 10px !important; max-width: none !important; }
    #orm-fab {
      position: fixed; right: 14px; bottom: 18px; z-index: 2147483000;
      width: 48px; height: 48px; border-radius: 16px; border: 0;
      background: var(--orm-overlay); color: var(--orm-accent); font-size: 20px; line-height: 48px;
      box-shadow: 0 2px 10px rgba(0,0,0,.5); opacity: .9;
    }
    #orm-drawer {
      position: fixed; inset: 0; z-index: 2147483001; display: flex; align-items: flex-end;
      background: rgba(25, 23, 36, .6);
    }
    .orm-sheet {
      width: 100%; max-height: 82vh; overflow-y: auto; box-sizing: border-box; padding: 10px 14px 28px;
      background: var(--orm-surface); border-radius: 18px 18px 0 0; font: 15px Roboto, system-ui, sans-serif;
    }
    .orm-sheet::before {
      content: ''; display: block; width: 40px; height: 4px; margin: 0 auto 12px; border-radius: 2px; background: var(--orm-pill);
    }
    ${R} .orm-sheet input {
      width: 100%; box-sizing: border-box; padding: 12px 18px; margin: 0 0 12px; border: 0; border-radius: 24px;
      background: var(--orm-overlay) !important; color: var(--orm-text) !important; font-size: 16px;
    }
    .orm-quick { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
    ${R} .orm-quick a, ${R} .orm-quick button {
      padding: 6px 14px; border-radius: 16px; border: 1px solid var(--orm-pill); background: transparent;
      color: var(--orm-dim) !important; font-size: 14px; text-decoration: none;
    }
    .orm-section { margin: 14px 4px 4px; color: var(--orm-muted); font-size: 12px; letter-spacing: .06em; text-transform: uppercase; }
    ${R} .orm-sub {
      display: flex; align-items: center; gap: 14px; padding: 8px 4px; color: var(--orm-text) !important;
      font-size: 16px; text-decoration: none;
    }
    .orm-sub img, .orm-initial { width: 38px; height: 38px; flex: 0 0 auto; border-radius: 50%; object-fit: cover; }
    .orm-initial { display: grid; place-items: center; background: var(--orm-overlay); color: var(--orm-accent); font-weight: 500; }
    .orm-sub .orm-count { color: var(--orm-dim); }

    ${R} .thing.link {
      display: grid !important; grid-template-columns: auto minmax(0, 1fr) auto; column-gap: 10px; row-gap: 0;
      margin: 0 !important; padding: 14px 12px !important; border-bottom: 1px solid var(--orm-line) !important;
    }
    .thing.link .entry, .thing.link .top-matter { display: contents !important; }
    .thing.link > *, .thing.link .entry > *, .thing.link .top-matter > * {
      grid-column: 1 / -1; float: none !important; margin: 0 !important; min-width: 0;
    }
    ${R} .thing.link .tagline { grid-row: 1; grid-column: 1 / 3; margin-bottom: 4px !important; }
    ${R} .thing.link p.title { grid-row: 2; grid-column: 1 / 3; margin-bottom: 10px !important; }
    .thing.link > .thumbnail { grid-row: 1 / 3; grid-column: 3; align-self: start; }
    ${R} .thing.link > .orm-preview { grid-row: 3; margin: 0 -12px 10px !important; }
    ${R} .thing.link > .orm-snippet { grid-row: 4; margin-bottom: 10px !important; }
    .thing.link > .midcol { grid-row: 5; grid-column: 1; }
    .thing.link .flat-list.buttons { grid-row: 5; grid-column: 2; }
    .thing.link .expando-button { grid-row: 5; grid-column: 3; justify-self: center; align-self: center; }
    ${R} .thing.link .expando { grid-row: 6; margin-top: 10px !important; }
    .thing.link .child, .thing.link .clearleft { display: none !important; }
    .thing.link.orm-has-preview > .thumbnail { display: none !important; }
    .thing.link.orm-has-preview .tagline, .thing.link.orm-has-preview p.title { grid-column: 1 / -1 !important; }

    .orm-preview { display: block; position: relative; overflow: hidden; background: var(--orm-surface); }
    .orm-preview img { display: block; width: 100%; height: auto; max-height: 60vh; object-fit: cover; }
    .orm-preview.orm-blur img { filter: blur(28px) brightness(.7); transform: scale(1.1); }
    .orm-preview.orm-blur::before {
      content: attr(data-label); position: absolute; inset: 0; z-index: 1; display: grid; place-items: center;
      color: var(--orm-text); font-size: 14px; font-weight: 500; letter-spacing: .05em;
    }
    .orm-badge {
      position: absolute; right: 10px; bottom: 10px; padding: 3px 9px; border-radius: 12px;
      background: rgba(25, 23, 36, .8); color: var(--orm-text); font-size: 12px;
    }
    .orm-snippet {
      color: var(--orm-dim); font-size: 14px; line-height: 1.4; overflow: hidden;
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
    }

    ${R} .tagline { display: flex !important; flex-wrap: wrap; align-items: center; gap: 2px 6px; font-size: 0 !important; }
    ${R} .tagline > * { font-size: 13px !important; margin: 0 !important; }
    .tagline .subreddit { order: -2; }
    .tagline .author { order: -1; }
    .tagline .RESUserTag, .tagline .voteWeight, .thing.link .tagline .edited-timestamp { display: none !important; }
    ${R} .thing.link .tagline { color: var(--orm-dim) !important; }
    ${R} .tagline .subreddit { color: var(--orm-accent) !important; font-weight: 500; }
    ${R} .thing.link .tagline .author { color: var(--orm-iris) !important; }
    ${R} .link p.title, ${R} .link .title { font-size: 17px !important; line-height: 1.3 !important; font-weight: 400 !important; }
    ${R} .link a.title { color: var(--orm-text) !important; white-space: normal !important; }
    ${R} .link a.title:visited { color: var(--orm-dim) !important; }
    ${R} .link .domain, ${R} .link .domain a { color: var(--orm-dim) !important; font-size: 12px !important; }
    ${R} .linkflairlabel, ${R} .flair { border-radius: 10px !important; padding: 1px 8px !important; }
    ${R} .linkflairlabel {
      background: transparent !important; border: 1px solid var(--orm-pill) !important; color: var(--orm-dim) !important;
    }
    ${R} .thing.link > .thumbnail { width: 72px !important; margin: 0 !important; }
    .thing.link > .thumbnail img { width: 72px !important; height: auto !important; border-radius: 8px; }

    ${R} .thing.link > .midcol {
      display: flex !important; align-items: center; gap: 10px; width: auto !important; min-width: 0 !important;
      border: 1px solid var(--orm-pill) !important; border-radius: 10px; padding: 4px 10px; height: 30px; box-sizing: border-box;
    }
    .thing.link > .midcol .arrow { margin: 0 !important; transform: scale(1.3); }
    ${R} .thing.link > .midcol .score { font-size: 14px !important; color: var(--orm-text) !important; margin: 0 !important; width: auto !important; }
    ${R} .thing.link > .midcol.likes .score { color: var(--orm-up) !important; }
    ${R} .thing.link > .midcol.dislikes .score { color: var(--orm-down) !important; }

    .flat-list.buttons { display: flex !important; flex-wrap: wrap; align-items: center; gap: 4px 2px; padding: 0 !important; }
    .flat-list.buttons li { padding: 0 !important; }
    ${R} .flat-list.buttons li a, ${R} .flat-list.buttons li .option, ${R} .flat-list.buttons li button {
      display: inline-block; padding: 5px 6px !important; font-size: 13px !important; line-height: 1.2 !important;
      color: var(--orm-dim) !important; font-weight: 400 !important;
    }
    .thing.link .flat-list.buttons li:not(.first) { display: none !important; }
    ${R} .thing.link .flat-list.buttons li.first a {
      border: 1px solid var(--orm-pill) !important; border-radius: 10px; padding: 0 12px !important;
      height: 30px; line-height: 28px !important; box-sizing: border-box; color: var(--orm-text) !important;
    }
    body:not(.comments-page) .thing.link { cursor: pointer; }

    .expando, .expando *, .media-preview-content img, .res-expando-box, .res-media-zoomable,
    .md img, .md video, iframe { max-width: 100% !important; }
    .media-preview-content, .media-preview-content img { width: auto !important; height: auto !important; }
    .res-expando-box, .res-media-zoomable, .media-preview-content img { border-radius: 8px; }
    ${R} .thing .expando, ${R} .thing .expando .usertext-body, ${R} .thing .expando .md,
    ${R} .thing .expando .res-expando-box, ${R} .thing .expando .res-gallery {
      background: var(--orm-surface) !important; border: 0 !important; box-shadow: none !important;
    }
    ${R} .thing.link .expando { border-radius: 12px; padding: 10px !important; overflow: hidden; }
    ${R} .thing .expando .res-media-zoomable, ${R} .thing .expando .res-expando-box { margin-left: 0 !important; }
    ${R} .expando-button { margin: 0 !important; border-radius: 6px !important; opacity: .85; }
    ${R} .expando-button.collapsed { filter: invert(.88) sepia(.35) hue-rotate(205deg); }
    ${R} .expando-button.expanded { filter: hue-rotate(150deg) saturate(.7) brightness(1.5); }

    ${R} .md { max-width: none !important; font-size: 15px !important; line-height: 1.45 !important; color: var(--orm-text) !important; }
    ${R} .md p, ${R} .md li { font-size: 15px !important; }
    ${R} .md a { color: var(--orm-link) !important; }
    .md pre, .md table { max-width: 100%; overflow-x: auto; display: block; }
    ${R} .md pre, ${R} .md code { background: var(--orm-overlay) !important; border-color: var(--orm-pill) !important; border-radius: 6px; }
    ${R} .md pre code { background: transparent !important; }
    ${R} .md th, ${R} .md td { border-color: var(--orm-pill) !important; }
    ${R} .md blockquote { border-left: 2px solid var(--orm-pill) !important; color: var(--orm-dim) !important; padding-left: 8px !important; }

    ${R} .commentarea { margin: 0 !important; padding: 0 12px 60px !important; }
    ${R} .commentarea .menuarea, ${R} .commentarea > .panestack-title {
      display: flex !important; flex-wrap: wrap; align-items: center; gap: 4px 12px;
      font-size: 13px !important; margin: 10px 0 !important; padding: 0 !important; border: 0 !important;
    }
    ${R} .commentarea .menuarea > *, ${R} .commentarea > .panestack-title > * { float: none !important; margin: 0 !important; }
    ${R} .commentarea .panestack-title .title { font-size: 15px !important; color: var(--orm-text) !important; }
    ${R} .RESSubscriptionButton {
      background: transparent !important; border: 1px solid var(--orm-pill) !important; border-radius: 14px !important;
      color: var(--orm-dim) !important; padding: 3px 10px !important;
    }
    ${R} #progressIndicator { background: var(--orm-surface) !important; border: 0 !important; border-radius: 12px; color: var(--orm-dim) !important; }

    ${R} .comment:not(#_), ${R} .comment:not(#_) > .entry, ${R} .comment:not(#_) > .child { background: transparent !important; }
    ${R} .comment { margin: 0 !important; padding: 10px 0 0 !important; border: 0 !important; border-radius: 0 !important; }
    ${R} .comment > .entry {
      margin: 0 !important; padding: 0 !important; overflow: visible !important;
    }
    ${R} :is(.res-selected, .RES-keyNav-activeElement, .RES-keyNav-activeThing):not(#_):not(#_),
    ${R} :is(.res-selected, .RES-keyNav-activeElement, .RES-keyNav-activeThing) :is(.entry, .usertext-body, .md-container, .md, .tagline):not(.expando *):not(#_):not(#_) {
      background: transparent !important; outline: 0 !important; box-shadow: none !important;
    }
    ${R} .comment .entry:active, ${R} .comment .entry *:active, ${R} .comment .entry:focus, ${R} .comment .md:focus,
    ${R} .comment .entry:hover, ${R} .comment .entry *:hover, ${R} .comment:hover {
      background: transparent !important; outline: 0 !important; box-shadow: none !important;
    }
    .comment, .comment * { -webkit-tap-highlight-color: transparent; }
    ${R} .comment .tagline .expand { display: none !important; }
    ${R} .comment.collapsed > .entry .tagline, ${R} .comment.collapsed > .entry .tagline * {
      font-style: normal !important; opacity: 1 !important; margin-bottom: 0 !important; background: none !important;
    }
    ${R} .comment.collapsed > .entry .tagline::before { content: '▸'; order: -3; color: var(--orm-muted); font-size: 13px; }
    ${R} .comment.collapsed { padding-top: 12px !important; }
    ${R} .tagline .flair, ${R} .tagline .linkflairlabel:not([style*="background"]) {
      background: transparent !important; border: 1px solid var(--orm-pill) !important; color: var(--orm-dim) !important;
    }
    ${R} .comment .tagline .flair {
      max-width: 45%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px !important;
    }
    ${R} .tagline .userattrs, .res-floater-visibleAfterScroll { display: none !important; }
    ${R} .comment.collapsed > .entry .tagline .numchildren { color: var(--orm-gold) !important; }
    ${R} .morecomments a, ${R} .deepthread a {
      display: inline-block; padding: 5px 12px; border: 1px solid var(--orm-pill); border-radius: 14px;
      color: var(--orm-link) !important; font-size: 13px !important;
    }
    #orm-toast {
      position: fixed; left: 50%; bottom: 90px; transform: translateX(-50%); z-index: 2147483002;
      padding: 10px 18px; border-radius: 20px; background: var(--orm-overlay); color: var(--orm-text); font-size: 14px;
    }
    .comment > .midcol { display: none !important; }
    .comment > .entry > .flat-list.buttons { display: none !important; }
    ${R} .comment .tagline { font-size: 13px !important; color: var(--orm-muted) !important; white-space: normal !important; margin-bottom: 2px !important; }
    ${R} .comment .tagline .author { color: var(--orm-iris) !important; font-weight: 500; }
    ${R} .comment .tagline .author.submitter { color: var(--orm-accent) !important; background: none !important; }
    ${R} .comment .tagline .author.submitter::after { content: ' OP'; font-size: 11px; font-weight: 600; }
    ${R} .comment .tagline .author.moderator { color: var(--orm-link) !important; background: none !important; }
    ${R} .comment .tagline .author.admin { color: var(--orm-up) !important; background: none !important; }
    ${R} .comment .tagline .score { color: var(--orm-dim) !important; font-weight: 500 !important; }
    ${R} .comment .tagline .score.likes { color: var(--orm-up) !important; }
    ${R} .comment .tagline .score.dislikes { color: var(--orm-down) !important; }
    ${R} .comment .tagline time, ${R} .comment .tagline .edited-timestamp { color: var(--orm-muted) !important; }
    ${R} .comment .usertext-body .md { padding: 0 !important; margin: 0 !important; }

    ${R} .comment > .child, ${R} .comment > .showreplies {
      margin: 6px 0 0 !important; padding-left: 10px !important; border-left: 2px solid var(--orm-link) !important;
    }
    ${R} .child .comment > .child { border-left-color: var(--orm-iris) !important; }
    ${R} .child .child .comment > .child { border-left-color: var(--orm-accent) !important; }
    ${R} .child .child .child .comment > .child { border-left-color: var(--orm-gold) !important; }
    ${R} .child .child .child .child .comment > .child { border-left-color: var(--orm-pine) !important; }
    ${R} .child .child .child .child .child .comment > .child { border-left-color: var(--orm-up) !important; }
    ${R} .morechildren, ${R} .deepthread { margin: 8px 0 !important; font-size: 13px !important; }

    .usertext-edit, .usertext-edit textarea, .usertext-edit .md,
    .roundfield, .roundfield textarea, .roundfield input[type="text"], #title-field textarea {
      width: 100% !important; max-width: 100% !important; box-sizing: border-box !important;
    }
    ${R} .usertext-edit textarea {
      min-height: 90px; font-size: 16px !important; border-radius: 8px;
      background: var(--orm-surface) !important; color: var(--orm-text) !important; border: 1px solid var(--orm-pill) !important;
    }
    ${R} .commentarea > form.usertext:not(:focus-within) .usertext-edit textarea {
      min-height: 0 !important; height: 44px !important; resize: none; border-radius: 22px; padding: 10px 16px !important;
    }
    .commentarea > form.usertext:not(:focus-within) .usertext-edit textarea::placeholder { color: var(--orm-muted); }
    .commentarea > form.usertext:not(:focus-within) .usertext-buttons,
    .commentarea > form.usertext:not(:focus-within) .bottom-area { display: none !important; }
    ${R} .usertext-buttons button {
      background: var(--orm-accent) !important; color: var(--orm-bg) !important; border: 0 !important;
      border-radius: 16px; padding: 6px 16px !important; font-size: 14px !important; font-weight: 500;
    }
    ${R} .usertext-buttons button.cancel { background: transparent !important; color: var(--orm-dim) !important; }
    body.comments-page .thing.link > .thumbnail { display: none !important; }
    body.comments-page .thing.link .tagline, body.comments-page .thing.link p.title { grid-column: 1 / -1 !important; }
    .formtabs-content, .infobar, .link .usertext-body .md { max-width: 100% !important; }
  `);

  const interactive = 'a, button, input, textarea, select, label, .usertext-edit, .arrow, .expando-button, .expando, .res-expando-box, .md-spoiler-text, video, img';
  const cardPassthrough = '.midcol, .orm-preview, .expando, .expando-button, .thumbnail, .tagline a, .flat-list.buttons a, .domain a, input, textarea, button, form';

  document.addEventListener('click', event => {
    const blurred = event.target instanceof Element && event.target.closest('.orm-preview.orm-blur');
    if (!blurred) return;
    event.preventDefault();
    blurred.classList.remove('orm-blur');
  }, true);

  document.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof Element) || document.body.classList.contains('comments-page')) return;
    const thing = target.closest('.thing.link[data-permalink]');
    if (!thing || target.closest(cardPassthrough) || String(getSelection() || '').length) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    location.href = thing.dataset.permalink;
  }, true);

  const commentAt = target => {
    if (!(target instanceof Element) || target.closest(interactive)) return null;
    const comment = target.closest('.comment');
    const child = target.closest('.child');
    return comment && !(child && child.parentElement === comment) ? comment : null;
  };

  document.addEventListener('click', event => {
    const comment = commentAt(event.target);
    if (!comment || String(getSelection() || '').length) return;
    const before = comment.getBoundingClientRect().top;
    comment.querySelector(':scope > .entry .tagline a.expand')?.click();
    const after = comment.getBoundingClientRect().top;
    if (after < 0 || after !== before) window.scrollBy(0, after - Math.max(before, 0));
  });

  const toast = text => {
    document.getElementById('orm-toast')?.remove();
    const note = document.createElement('div');
    note.id = 'orm-toast';
    note.textContent = text;
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 2500);
  };

  const SUB_LIMIT = 100;
  const SUBSCRIBED_LIMIT = 1000;
  const SUB_NAME = /^[A-Za-z0-9_]{2,21}$/;
  const SPECIAL_SUBS = /^(all|popular|random|randnsfw|friends|mod)$/i;

  const validSub = sub => typeof sub?.name === 'string' && SUB_NAME.test(sub.name);

  const saveSubs = subs => {
    const entries = Object.entries(subs).filter(([, sub]) => validSub(sub));
    const visited = entries.filter(([, sub]) => sub.count > 0).sort((a, b) => b[1].count - a[1].count).slice(0, SUB_LIMIT);
    const subscribed = entries.filter(([, sub]) => sub.subscribed).slice(0, SUBSCRIBED_LIMIT);
    GM_setValue('subs', Object.fromEntries([...subscribed, ...visited]));
  };

  const fetchIcon = async key => {
    const subs = GM_getValue('subs', {});
    if (!subs[key] || subs[key].iconChecked) return subs[key]?.icon || '';
    try {
      const response = await fetch(`/r/${subs[key].name}/about.json?raw_json=1`);
      const json = response.ok ? await response.json() : null;
      const current = GM_getValue('subs', {});
      if (!current[key]) return '';
      current[key].icon = json?.data?.community_icon || json?.data?.icon_img || '';
      current[key].iconChecked = true;
      GM_setValue('subs', current);
      return current[key].icon;
    } catch (error) {
      console.warn('[old-reddit-mobile] subreddit icon failed', error);
      return '';
    }
  };

  const recordVisit = () => {
    if (performance.getEntriesByType('navigation')[0]?.type !== 'navigate') return;
    if (/[?&](after|before)=/.test(location.search)) return;
    const match = location.pathname.match(/^\/r\/([A-Za-z0-9_]+)\/?$|^\/r\/([A-Za-z0-9_]+)\/(hot|new|rising|controversial|top|gilded)\/?$/);
    const slug = match && (match[1] || match[2]);
    if (!slug || SPECIAL_SUBS.test(slug)) return;
    const name = document.querySelector('.pagename a')?.textContent.trim() || slug;
    const subs = GM_getValue('subs', {});
    const key = name.toLowerCase();
    const entry = subs[key] || { count: 0 };
    subs[key] = { ...entry, name, count: entry.count + 1, last: Date.now() };
    saveSubs(subs);
    fetchIcon(key);
  };

  const importSubs = () => {
    const match = location.hash.match(/^#orm-import=([A-Za-z0-9_-]+)$/);
    if (!match) return;
    history.replaceState(null, '', location.pathname + location.search);
    try {
      const json = new TextDecoder().decode(Uint8Array.from(atob(match[1].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)));
      const data = JSON.parse(json);
      const visits = (Array.isArray(data.visits) ? data.visits : [])
        .filter(([name, count]) => validSub({ name }) && Number.isInteger(count) && count > 0);
      const subscribed = (Array.isArray(data.subscribed) ? data.subscribed : []).filter(name => validSub({ name }));
      if (!visits.length && !subscribed.length) throw new Error('no valid subreddits');
      if (!confirm(`Import ${visits.length} visited and ${subscribed.length} subscribed subreddits?`)) return;
      const subs = GM_getValue('subs', {});
      visits.forEach(([name, count]) => {
        const key = name.toLowerCase();
        subs[key] = { ...subs[key], name, count: (subs[key]?.count || 0) + count };
      });
      subscribed.forEach(name => {
        const key = name.toLowerCase();
        subs[key] = { count: 0, ...subs[key], name, subscribed: true };
      });
      saveSubs(subs);
      toast(`Imported ${visits.length} visited and ${subscribed.length} subscribed subreddits`);
    } catch (error) {
      console.warn('[old-reddit-mobile] import failed', error);
      toast('Import failed');
    }
  };

  const subRow = (name, icon, count) => {
    const row = document.createElement('a');
    row.className = 'orm-sub';
    row.href = `/r/${name}/`;
    row.dataset.name = name.toLowerCase();
    if (icon) {
      const img = document.createElement('img');
      img.src = icon;
      img.loading = 'lazy';
      img.alt = '';
      row.appendChild(img);
    } else {
      const initial = document.createElement('span');
      initial.className = 'orm-initial';
      initial.textContent = name[0].toUpperCase();
      row.appendChild(initial);
    }
    const label = document.createElement('span');
    label.textContent = name;
    if (count) {
      const counter = document.createElement('span');
      counter.className = 'orm-count';
      counter.textContent = ` (${count})`;
      label.appendChild(counter);
    }
    row.appendChild(label);
    return row;
  };

  const closeDrawer = () => document.getElementById('orm-drawer')?.remove();

  const openDrawer = () => {
    if (document.getElementById('orm-drawer')) return;
    const drawer = document.createElement('div');
    drawer.id = 'orm-drawer';
    drawer.addEventListener('click', event => event.target === drawer && closeDrawer());
    const sheet = document.createElement('div');
    sheet.className = 'orm-sheet';

    const search = document.createElement('input');
    search.type = 'search';
    search.placeholder = 'Go to subreddit…';
    search.enterKeyHint = 'go';
    search.autocapitalize = 'off';
    search.addEventListener('keydown', event => {
      const value = search.value.trim().replace(/^\/?r\//i, '');
      if (event.key === 'Enter' && value) location.href = `/r/${encodeURIComponent(value)}/`;
    });
    search.addEventListener('input', () => {
      const query = search.value.trim().toLowerCase();
      sheet.querySelectorAll('.orm-sub').forEach(row => { row.hidden = !row.dataset.name.includes(query); });
    });
    sheet.appendChild(search);

    const quick = document.createElement('div');
    quick.className = 'orm-quick';
    [['Home', '/'], ['Popular', '/r/popular/'], ['All', '/r/all/'], ['Saved', '/user/me/saved/'], ['Inbox', '/message/inbox/']]
      .forEach(([text, href]) => {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = text;
        quick.appendChild(link);
      });
    const side = document.querySelector('.side');
    if (side) {
      const about = document.createElement('button');
      about.type = 'button';
      about.textContent = 'Sidebar';
      about.addEventListener('click', () => {
        closeDrawer();
        document.body.classList.remove('orm-sidebar-hidden');
        side.scrollIntoView({ behavior: 'smooth' });
      });
      quick.appendChild(about);
    }
    sheet.appendChild(quick);

    const subs = Object.values(GM_getValue('subs', {})).filter(validSub);
    const visited = subs.filter(sub => sub.count > 0).sort((a, b) => b.count - a.count).slice(0, SUB_LIMIT);
    const subscribed = subs.filter(sub => sub.subscribed).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

    const section = text => {
      const heading = document.createElement('div');
      heading.className = 'orm-section';
      heading.textContent = text;
      sheet.appendChild(heading);
    };
    if (visited.length) section('Most visited');
    visited.forEach(sub => sheet.appendChild(subRow(sub.name, sub.icon, sub.count)));
    if (subscribed.length) section('Subscribed');
    subscribed.forEach(sub => sheet.appendChild(subRow(sub.name, sub.icon)));

    drawer.appendChild(sheet);
    document.body.appendChild(drawer);
    loadMissingIcons(subs.filter(sub => !sub.iconChecked).map(sub => sub.name.toLowerCase()));
  };

  const loadMissingIcons = async keys => {
    for (const key of keys) {
      if (!document.getElementById('orm-drawer')) return;
      const icon = await fetchIcon(key);
      if (!icon) continue;
      document.querySelectorAll(`#orm-drawer .orm-sub[data-name="${key}"] .orm-initial`).forEach(initial => {
        const img = document.createElement('img');
        img.src = icon;
        img.alt = '';
        initial.replaceWith(img);
      });
    }
  };

  const addFab = () => {
    if (document.getElementById('orm-fab')) return;
    if (document.querySelector('.side')) document.body.classList.add('orm-sidebar-hidden');
    const button = document.createElement('button');
    button.id = 'orm-fab';
    button.type = 'button';
    button.textContent = '☰';
    button.title = 'Subreddits';
    button.addEventListener('click', openDrawer);
    document.body.appendChild(button);
    document.addEventListener('keydown', event => event.key === 'Escape' && closeDrawer());
  };

  const pickImage = post => {
    const image = post.preview?.images?.[0];
    if (image) {
      const best = image.resolutions.find(r => r.width >= 640) || image.source;
      return { url: best.url, width: best.width, height: best.height };
    }
    const first = post.media_metadata?.[post.gallery_data?.items?.[0]?.media_id]
      || Object.values(post.media_metadata || {}).find(media => media.e === 'Image');
    const best = first?.p?.find(p => p.x >= 640) || first?.s;
    return best?.u ? { url: best.u, width: best.x, height: best.y } : null;
  };

  const plainText = markdown => markdown
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\\(.)/g, '$1')
    .replace(/[*_~>#`]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const decorate = (thing, data) => {
    const post = data.crosspost_parent_list?.[0] || data;
    const nsfw = data.over_18 || post.over_18;
    const spoiler = data.spoiler || post.spoiler;
    const text = post.is_self && !nsfw && !spoiler && plainText(post.selftext || '');
    if (text) {
      const snippet = document.createElement('div');
      snippet.className = 'orm-snippet';
      snippet.textContent = text.slice(0, 400);
      thing.appendChild(snippet);
    }
    const image = pickImage(post);
    if (!image) return;
    const gallery = post.gallery_data?.items?.length;
    const video = post.is_video || /video/.test(post.post_hint || '');
    const preview = document.createElement('a');
    preview.className = 'orm-preview';
    preview.href = gallery || video ? data.permalink : data.url;
    if (nsfw || spoiler) {
      preview.classList.add('orm-blur');
      preview.dataset.label = nsfw ? 'NSFW · tap to show' : 'SPOILER · tap to show';
    }
    const img = document.createElement('img');
    img.src = image.url;
    img.loading = 'lazy';
    img.width = image.width;
    img.height = image.height;
    preview.appendChild(img);
    if (gallery || video) {
      const badge = document.createElement('span');
      badge.className = 'orm-badge';
      badge.textContent = video ? '▶ video' : `▦ ${gallery} images`;
      preview.appendChild(badge);
    }
    thing.appendChild(preview);
    thing.classList.add('orm-has-preview');
  };

  const decorated = new WeakSet();
  let previewTimer = 0;
  let loadingPreviews = false;
  let previewsPending = false;

  const loadPreviews = async () => {
    if (loadingPreviews) {
      previewsPending = true;
      return;
    }
    loadingPreviews = true;
    try {
      const things = [...document.querySelectorAll('.thing.link[data-fullname]')].filter(thing => !decorated.has(thing));
      things.forEach(thing => decorated.add(thing));
      for (let i = 0; i < things.length; i += 100) {
        const batch = things.slice(i, i + 100);
        try {
          const response = await fetch(`/api/info.json?raw_json=1&id=${batch.map(thing => thing.dataset.fullname).join(',')}`);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const json = await response.json();
          const posts = new Map(json.data.children.map(child => [child.data.name, child.data]));
          batch.forEach(thing => posts.has(thing.dataset.fullname) && decorate(thing, posts.get(thing.dataset.fullname)));
          restorePosition();
        } catch (error) {
          batch.forEach(thing => decorated.delete(thing));
          console.warn('[old-reddit-mobile] previews failed', error);
        }
      }
    } finally {
      loadingPreviews = false;
      if (previewsPending) {
        previewsPending = false;
        queuePreviews();
      }
    }
  };

  const SCROLL_KEY = 'orm-scroll';
  const SCROLL_LIMIT = 30;
  const pageKey = location.pathname + location.search;
  let restoring = null;

  const readPositions = () => {
    try {
      return JSON.parse(sessionStorage.getItem(SCROLL_KEY) || '{}');
    } catch {
      return {};
    }
  };

  const savePosition = () => {
    const anchor = [...document.querySelectorAll('.thing[id]')].find(thing => thing.getBoundingClientRect().bottom > 0);
    const positions = readPositions();
    delete positions[pageKey];
    positions[pageKey] = { id: anchor?.id, top: anchor ? anchor.getBoundingClientRect().top : 0, y: scrollY };
    try {
      sessionStorage.setItem(SCROLL_KEY, JSON.stringify(Object.fromEntries(Object.entries(positions).slice(-SCROLL_LIMIT))));
    } catch (error) {
      console.warn('[old-reddit-mobile] saving scroll position failed', error);
    }
  };

  const restorePosition = () => {
    if (!restoring) return;
    const anchor = restoring.id && document.getElementById(restoring.id);
    window.scrollTo(0, anchor ? scrollY + anchor.getBoundingClientRect().top - restoring.top : restoring.y);
  };

  const startRestore = () => {
    const type = performance.getEntriesByType('navigation')[0]?.type;
    if (type !== 'back_forward' && type !== 'reload') return;
    restoring = readPositions()[pageKey] || null;
    if (!restoring) return;
    const stop = () => { restoring = null; };
    addEventListener('touchstart', stop, { once: true, passive: true });
    addEventListener('load', restorePosition, { once: true });
    setTimeout(stop, 5000);
    restorePosition();
  };

  addEventListener('pagehide', savePosition);

  const queuePreviews = () => {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(loadPreviews, 50);
  };

  const start = () => {
    addFab();
    importSubs();
    recordVisit();
    const replyBox = document.querySelector('.commentarea > form.usertext textarea');
    if (replyBox && !replyBox.placeholder) replyBox.placeholder = 'Add a comment…';
    startRestore();
    if (document.body.classList.contains('comments-page')) return;
    queuePreviews();
    const table = document.getElementById('siteTable')?.parentElement;
    if (table) new MutationObserver(queuePreviews).observe(table, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
