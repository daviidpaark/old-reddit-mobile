# Old Reddit Mobile

A userscript that gives old.reddit.com a mobile view. It turns old reddit's desktop layout into one built for a phone, with a dark theme, without switching to the new site or a third-party app.

- **Feed:** each post is a card with a full-width preview. Tap a card to open its comments.
- **Comments:** tap a comment to collapse its thread in place.
- **Drawer:** the ☰ button opens your most visited subreddits, your subscriptions and a subreddit search.

## Install

1. Install [Firefox for Android](https://www.mozilla.org/firefox/browsers/mobile/android/) and add the [Violentmonkey](https://addons.mozilla.org/firefox/addon/violentmonkey/) extension. Tampermonkey works too.
2. Open [`old-reddit-mobile.user.js`](https://raw.githubusercontent.com/daviidpaark/old-reddit-mobile/main/old-reddit-mobile.user.js) and confirm the install.
3. Browse to [old.reddit.com](https://old.reddit.com/).

[Reddit Enhancement Suite](https://addons.mozilla.org/firefox/addon/reddit-enhancement-suite/) is optional. The script was built alongside it and themes its subreddit bar, expand buttons, expanded media and "load more comments" links, but works without it.

Updates install from this repository through the userscript manager.

## Feed

| Element | Behavior |
| --- | --- |
| Card | Subreddit, author and time, then the title and flair. Tap anywhere that isn't a button to open the comments. |
| Preview | Image posts show a full-width preview that opens the image. Galleries show a "▦ N images" badge and videos a "▶ video" badge, and both open the post. |
| Text posts | The first three lines of the post, with markdown and links stripped. |
| NSFW and spoilers | The preview stays blurred until you tap it, and text posts show no preview lines. |
| Vote pill | Upvote and downvote arrows around the score. Your vote colors the score. |
| Comments pill | The comment count, with "N new" since your last visit when RES tracks it. |
| Expand button | RES's expand button, on the right, opens the post's media or text inline. |

## Comments

| Action | Result |
| --- | --- |
| Tap a comment | Collapses it and its replies into one line with the author, score, time and a gold reply count. Tap again to expand. The page stays where it is. |
| Tap "load more comments" | Loads the hidden replies, as on old reddit. |
| Go back or forward | Returns to the post or comment you were reading, in the feed and in threads, even after previews load. |

Comment headers color each part:

| Part | Color |
| --- | --- |
| Author | Lavender |
| Original poster | Pink, with "OP" after the name |
| Moderator | Teal |
| Admin | Red |
| Score | Grey, or red and lavender after you upvote or downvote |
| Time and edits | Dim grey |
| Reply count when collapsed | Gold |

Nesting levels cycle through six colors. Long user flairs are cut off with "…" so each header stays on one line.

## Subreddit drawer

The ☰ button in the bottom-right corner opens a bottom sheet:

- **Search:** type to filter the list below, or press Enter to go to any subreddit.
- **Shortcuts:** Home, Popular, All, Saved and Inbox, plus **Sidebar** when the current subreddit has one.
- **Most visited:** subreddits ranked by how often you open their listings, with their icons and visit counts. Reloads, going back and later pages of a listing don't count as visits.
- **Subscribed:** subscriptions brought in with an import (see below).

Visit counts and subscriptions stay in the userscript manager's storage on that device. The 100 most visited subreddits are kept, and subscriptions are kept separately.

### Importing visit counts

To carry over counts from another app, open a link of this form in the browser where the script runs:

```
https://old.reddit.com/#orm-import=<base64url JSON>
```

The JSON lists visit counts and subscriptions:

```json
{ "visits": [["indieheads", 58], ["selfhosted", 90]], "subscribed": ["books", "movies"] }
```

Encode it with `node -e "console.log(Buffer.from(JSON.stringify(require('./subs.json'))).toString('base64url'))"`. The script asks before importing and skips anything that isn't a valid subreddit name. Imported counts add to the existing ones, and a toast confirms how many subreddits were imported.

## What's hidden

The username, karma, mail and preferences bar; the footer; the multireddit panel; sign-up and premium banners; RES's floating inbox and scroll-to-top icons; the user and subreddit cards that RES and reddit open on hover, which stay stuck open after a tap; reddit's "[S]", "[M]" and "[A]" author tags (the author colors show the same thing); the share, save, hide and report links under each post; and the vote arrows and reply, save and report links on comments.

## Privacy

The script only talks to old.reddit.com, using your existing session: `/api/info.json` for preview images (one request per page of posts) and each subreddit's `/about.json` once for its drawer icon. Nothing is sent anywhere else.

## Limitations

- **old.reddit.com only.** It doesn't change www.reddit.com or the new site.
- **No fullscreen app.** A web app manifest injected by a userscript lets Firefox offer "Add app to Home screen", but the shortcut still opens in a Firefox window with its toolbars, so the script doesn't add one. A site needs to serve its own manifest for a fullscreen app.
- **Subreddit styles.** Subreddits with heavy custom CSS may override parts of the theme. RES's per-subreddit "use subreddit style" toggle turns their CSS off.

## AI Disclosure

> [!NOTE]
> This is a personal project developed with the assistance of **Claude Code (Claude Opus)**. It is shared publicly for anyone who still prefers old reddit on their phone. Feedback and issue reports are welcome.

## License

[MIT License](LICENSE) © 2026 David Park
