# Plex Source for Lampa

**Plex Source** adds Plex as a first-class playback source inside [Lampa](https://github.com/yumata/lampa): sign in with Plex, select a server, open movies or TV episodes from Lampa cards, and play your Plex media directly from the Lampa interface.

It is frontend-only: there is no bridge, proxy, or hosted backend. The plugin runs in Lampa, stores settings locally, and talks directly to Plex / your Plex server.

> Status: `0.3.0-beta` — beta release, ready for broader testing.

## Highlights

- Plex login from Lampa settings with PIN/OAuth flow.
- Smart Plex server discovery and connection picker.
- Offline Plex servers are hidden from recommendations.
- Movie matching and playback from Lampa movie cards.
- TV show support with Plex seasons, episodes, watched state, and progress labels.
- Direct Play by default, plus Plex HLS/transcode fallback for relay or codec-limited clients.
- HLS pre-play audio/subtitle selection where available.
- Optional Plex progress sync from Lampa’s integrated player.
- Single-server mode or all-server matching mode.
- TV-friendly debug log tools and GitHub bug-report helper.
- Localized settings/UI strings for: `ru`, `en`, `uk`, `be`, `zh`, `pt`, `bg`, `he`, `cs`, `ro`, `fr`, plus `it`.

## Installation

Recommended install URL:

```text
https://cdn.jsdelivr.net/gh/boiler4/lampa-plex-source@main/plugin.js
```

Alternative raw GitHub URL:

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
7. Use **Login with Plex** and select the recommended reachable server/connection.

Manual server URL + Plex token entry remains available as an advanced fallback.

## Playback modes

- **Direct** — plays Plex file URLs directly through Lampa’s normal playback flow.
- **Auto** — uses direct playback for direct connections and Plex HLS/transcode for relay connections.
- **Plex HLS transcode** — forces Plex HLS/transcode and exposes quality/client-profile options.

For best results, choose **local/direct** when the Lampa device is on the same network as your Plex server. Relay is slower and may not support every playback scenario.

## How to get a Plex token manually

Plex documents the official method here:

[Finding an authentication token / X-Plex-Token](https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/)

Keep this token private. Plex Source stores it in Lampa local storage and sends it directly to Plex / your Plex server.

## Known limitations

Because Plex Source is frontend-only, the Lampa device must be able to reach the selected Plex server connection.

Possible limitations:

- Plex server CORS or network restrictions.
- Mixed-content issues if Lampa is loaded via HTTPS and Plex is HTTP.
- Device/webview/player differences across TVs, Android boxes, browsers, etc.
- External players may not report progress back to Lampa, so Plex progress sync works best with the integrated player.
- Matching depends on titles, year, and IDs exposed by Lampa/Plex.

## Debugging and bug reports

In **Settings → Plex Source**:

1. Enable **Debug**.
2. Reproduce the problem.
3. Open **Debug log**.
4. Copy/export the log or use the GitHub bug-report helper.

Logs mask Plex tokens where possible, but still avoid publishing screenshots or config that expose private server details.

## Privacy and security

- No backend service is operated by this plugin.
- Plex credentials/tokens stay in Lampa local storage.
- Playback and metadata requests go from the Lampa device directly to Plex / your Plex server.
- Do not publish logs containing private server URLs or Plex tokens.

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
