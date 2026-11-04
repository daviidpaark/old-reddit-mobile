# Changelog

All notable changes to `old-reddit-mobile` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-11-04

### Added
- **Mobile Layout:** old.reddit.com renders at the phone's width with readable text and tap-sized controls. The username, karma and preferences bar, the footer, the multireddit panel and sign-up banners are hidden, and the sidebar moves behind the subreddit drawer.
- **Dark Theme:** Every page uses one dark palette, including flairs, code blocks, tables, RES's expand buttons, expanded media, subreddit bar and loading bar. RES's selection highlight and hover cards don't show.
- **Post Cards:** Each post is a card with the subreddit, author and time above the title, a vote pill and a comments pill below. Tapping anywhere else on the card opens its comments.
- **Big Previews:** Image posts show a full-width preview, galleries a "▦ N images" badge and videos a "▶ video" badge. Text posts show their first three lines without markdown. NSFW and spoiler previews stay blurred until tapped, and their text isn't previewed.
- **Subreddit Drawer:** The ☰ button opens a bottom sheet with a subreddit search, Home, Popular, All, Saved and Inbox shortcuts, the current subreddit's sidebar, your most visited subreddits with visit counts and icons, and your subscriptions. Visit counts can be imported from another app with an `#orm-import=` link, after a confirmation.
- **Comment Threads:** Tapping a comment collapses it and its replies in place, and tapping again expands it. Collapsed comments show the author, score, time and a gold reply count.
- **Comment Headers:** Authors, the original poster ("OP"), moderators, admins, scores, your votes and timestamps each get their own color. Long user flairs are cut off so each header stays on one line, and nesting levels cycle through six colors.
- **Scroll Position:** Going back, forward or reloading returns to the post or comment you were reading, even after previews change the page's height.
- **Reply Box:** The reply box at the top of a thread is a single "Add a comment…" line until you tap it.
