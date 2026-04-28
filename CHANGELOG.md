# Changelog

## Unreleased

## 0.3.0-beta - 2026-04-28

- Add Plex HLS/transcode playback flow with selectable client/quality profiles.
- Add pre-play HLS audio/subtitle selection and remember selected track choices.
- Add Plex resume handling and optional integrated-player progress sync back to Plex.
- Improve direct playback resume/seek behavior and reduce noisy debug logging.
- Validate Plex server connections before recommending them.
- Hide Plex servers that are offline in Plex resources, avoiding stale recommendations.
- Keep installed plugin metadata annotated so Lampa shows the plugin name/version correctly.

## 0.2.1-beta - 2026-04-27

- Fix installed plugin card metadata so Lampa shows `Plex Source` instead of `Без названия` / unnamed plugin.

## 0.2.0-beta - 2026-04-27

- Add optional Plex PIN/OAuth login flow from Lampa settings.
- Add Plex server discovery and explicit server/connection selection.
- Keep manual Plex token entry as an advanced/fallback option.
- Add clear-token / remove Plex access actions.
- Add optional all-server matching mode with server names in Plex buttons.
- Cache validated Plex server targets to reduce repeated connection probing.
- Add timeout/fallback handling for unreachable Plex server connections.
- Use Plex HLS/transcode URLs for relay playback attempts instead of direct file URLs.
- Add dynamic refresh for Lampa's already-open source picker when Plex matches arrive late.
- Add TV-friendly debug actions and QR link for GitHub bug reports.
- Guard Lampa timeline lookup so playback is not blocked by timeline errors.
- Expand localized settings/UI strings, including Italian.

## 0.1.0-beta

Initial beta prepared for private GitHub testing.

- Frontend-only Plex source for Lampa.
- Plex settings inside Lampa.
- Movie matching and playback.
- TV show matching with seasons and episodes.
- Native Lampa menus where available.
- Plex watched/progress labels in episode lists.
- Manual mark watched/unwatched actions for episodes.
- Configurable episode action behavior.
- Multilingual UI/settings strings.
