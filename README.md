# Plex Source for Lampa

**Plex Source** is a frontend-only [Lampa](https://github.com/yumata/lampa) plugin that adds Plex as a playable source on movie and TV show cards.

It does **not** require a backend bridge. Users install one JavaScript URL in Lampa, configure their Plex server and token in Lampa settings, and play matching Plex items directly.

> Status: `0.1.0-beta` — usable, but still recommended for private/testing use before a public release.

## Features

- Frontend-only plugin: no server, proxy, or bridge required.
- In-app settings for Plex server URL, token, matching options, debug, and episode action behavior.
- Movie support: match current Lampa movie to Plex and play it.
- TV support: match current Lampa show to Plex, then browse Plex seasons and episodes.
- Native Lampa menus for seasons and episodes where available.
- Plex watch state in episode lists:
  - watched
  - unwatched
  - in progress with percentage
- Manual episode actions:
  - play
  - mark watched in Plex
  - mark unwatched in Plex
- Original Plex-inspired icon; not the official Plex logo.
- Localized settings/UI strings for: `ru`, `en`, `uk`, `be`, `zh`, `pt`, `bg`, `he`, `cs`, `ro`, `fr`, plus `it`.

## Installation

Host `plugin.js` somewhere reachable by the device running Lampa, then add the URL in Lampa plugin settings.

Example raw GitHub URL after publishing:

```text
https://raw.githubusercontent.com/boiler4/lampa-plex-source/main/plugin.js
```

In Lampa:

1. Open **Settings**.
2. Open **Plugins / Extensions**.
3. Add a plugin by URL.
4. Paste the `plugin.js` URL.
5. Restart/reload Lampa if needed.
6. Open **Settings → Plex Source**.
7. Configure:
   - Plex server URL, e.g. `http://192.168.1.10:32400`
   - Plex token
   - optional matching/debug settings
8. Use **Check connection**.

## How to get a Plex token

Plex documents the official method here:

[Finding an authentication token / X-Plex-Token](https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/)

Short version:

1. Open Plex Web.
2. Open any movie or episode.
3. Choose **⋯ → Get Info → View XML**.
4. Copy the `X-Plex-Token` value from the URL.

Keep this token private. The plugin stores it in Lampa local storage and sends it directly from Lampa to your Plex server.

## Usage

Open a movie or TV show card in Lampa. If Plex Source finds matches in your Plex libraries, it adds a **Plex** source button.

For TV shows:

```text
Lampa show card → Plex source → seasons → episodes → play
```

Episode action behavior is configurable:

- **OK plays, long press opens actions** — default.
- **OK opens actions** — useful if long press is inconvenient on your remote.

The action menu includes:

- Play
- Mark watched in Plex
- Mark unwatched in Plex

## Known limitations

Because Plex Source is frontend-only, the Lampa device must be able to reach the Plex server directly.

Possible limitations:

- Plex server CORS or network restrictions.
- Mixed-content issues if Lampa is loaded via HTTPS and Plex is HTTP.
- Device/webview/player differences across TVs, Android boxes, browsers, etc.
- Playback position is **not automatically synced back to Plex**.
- The plugin does **not** write watched state into Lampa’s own timeline/history.
- Matching depends on titles, year, and IDs exposed by Lampa/Plex; unusual anime/special-order libraries may need manual care.

## Privacy and security

- Your Plex token is entered in Lampa and stored locally by Lampa.
- There is no backend service operated by this plugin.
- Do not publish screenshots, logs, or config files containing your Plex token.
- For public hosting, serve the plugin over a trustworthy URL you control.

## Development

Primary file:

```text
plugin.js
```

Before release, `plugin.js` should be the canonical install file.

Recommended checks before publishing:

```bash
node -e "new Function(require('fs').readFileSync('plugin.js','utf8')); console.log('syntax ok')"
grep -RInE "password|secret|private_key|gho_|X-Plex-Token=" .
```

## Support development

If Plex Source is useful to you, you can support development here:

<a href="https://paypal.me/YuryShapovalov"><img src="assets/support-paypal.svg" alt="Support development via PayPal" width="240" height="48"></a>

<details>
<summary>Crypto donations</summary>

Bitcoin:

```text
bc1qxjwlz3h7z5ec3nv7t5qr788v9km7cykxqz5wg2
```

Toncoin (TON):

```text
UQCJIqP1Enc2OCanwi0BOijd6JZq0Ik2T0PxayswKGVHYkbH
```

</details>

## License

MIT — see [LICENSE](LICENSE).

## Disclaimer

This project is not affiliated with Plex, Inc. Plex is a trademark of Plex, Inc. The icon used by this plugin is original and Plex-inspired, not the official Plex logo.
