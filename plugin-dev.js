(function () {
    'use strict';

    var PLUGIN_NS = 'plex_source';
    var READY_FLAG = 'plugin_plex_source_ready';
    var DEBUG_ALWAYS = false;
    var DEBUG_BUFFER = [];
    var LAST_TRIGGER_ELEMENT = null;
    var OVERLAY_BACK_ACTION = null;
    var OVERLAY_COLUMNS = 1;
    var SELECT_SERVER_COOLDOWN_UNTIL = 0;
    var TARGET_CACHE = { key: '', expiresAt: 0, targets: [] };
    var ACTIVE_PROGRESS_SYNC = null;
    var PROGRESS_SYNC_INSTALLED = false;

    var DEFAULTS = {
        enabled: true,
        plexBase: '',
        plexToken: '',
        plexServerName: '',
        plexConnectionMeta: '',
        plexConnectionRelay: false,
        serverMode: 'single',
        clientId: 'lampa-plex-source',
        matchLimit: 5,
        showOnlyExactYear: false,
        debug: false,
        episodeActionMode: 'play_long_actions',
        syncProgressToPlex: false,
        playbackMode: 'transcode',
        transcodeProfile: 'ios_compat'
    };

    var I18N = {
            "ru": {
                    "component": "Plex Source",
                    "loaded": "Plex Source загружен",
                    "statusTitle": "Статус",
                    "connectionTitle": "Подключение Plex",
                    "searchTitle": "Поиск",
                    "advancedTitle": "Дополнительно",
                    "manualSetupTitle": "Ручная настройка (необязательно)",
                    "infoTitle": "Справка",
                    "enabled": "Плагин включен",
                    "testConnection": "Проверить подключение",
                    "showConfig": "Состояние настроек",
                    "currentServer": "Текущий сервер",
                    "serverMode": "Серверы",
                    "serverModeSelected": "Выбранный сервер",
                    "serverModeAll": "Все серверы",
                    "serverModeDescription": "Выбранный = один сервер Plex. Все = искать на всех доступных серверах; relay может быть медленнее.",
                    "currentServerAllDescription": "Все серверы · лучшая связь для каждого",
                    "notSelected": "не выбран",
                    "plexBase": "Сервер Plex",
                    "plexToken": "Plex Token",
                    "tokenHelp": "Где найти token",
                    "plexLogin": "Войти через Plex",
                    "plexLoginDescription": "Рекомендуется: авторизуйте плагин на plex.tv, token сохранится автоматически.",
                    "plexLoginOpen": "Открыть вход Plex",
                    "plexLoginCode": "Код",
                    "plexLoginWaiting": "Ожидание авторизации Plex…",
                    "plexLoginSuccess": "Вход Plex выполнен",
                    "plexLoginFailed": "Ошибка входа Plex",
                    "plexServerSaved": "Сервер Plex сохранён",
                    "plexServerDiscovering": "Ищу сервер Plex…",
                    "plexServerDiscoverFailed": "Не удалось автоматически найти сервер Plex",
                    "discoverServer": "Найти сервер Plex",
                    "selectServer": "Выбрать сервер Plex",
                    "selectServerHelp": "Выбирайте local/direct, если устройство Lampa находится в той же сети. Remote/direct работает только если удалённый доступ Plex настроен и доступен напрямую. Relay — запасной вариант через серверы Plex: может быть медленнее и не всегда поддерживает воспроизведение.",
                    "serverSelected": "Сервер Plex выбран",
                    "localConnection": "локально",
                    "remoteConnection": "удалённо",
                    "relayConnection": "relay",
                    "remoteDirectWarning": "требуется Plex Remote Access",
                    "relayWarning": "запасной вариант, может быть медленно",
                    "directConnection": "прямое",
                    "recommendedConnection": "Рекомендуется",
                    "clearToken": "Очистить token Plex",
                    "clearTokenDone": "Token Plex очищен",
                    "clearPlexAccess": "Удалить доступ Plex",
                    "clearPlexAccessDone": "Token, сервер и данные подключения очищены",
                    "matchLimit": "Максимум результатов",
                    "exactYear": "Только точный год",
                    "clientId": "Client Identifier",
                    "debug": "Отладка",
                    "debugLogButton": "Лог отладки",
                    "infoText": "Рекомендуется войти через Plex: плагин получит token и предложит выбрать сервер. Ручной ввод адреса сервера и token оставлен как дополнительный вариант.",
                    "baseDescription": "Формат: http://IP:32400. Например: http://192.168.1.10:32400",
                    "tokenDescription": "Личный token доступа Plex. Не публикуйте его.",
                    "tokenHelpText": "Plex Web → открыть фильм/серию → ⋯ → Get Info → View XML → скопировать значение X-Plex-Token.",
                    "clientDescription": "Техническое имя клиента в запросах Plex. Обычно оставьте по умолчанию.",
                    "limitDescription": "Сколько совпадений Plex показывать. Рекомендуется: 5.",
                    "exactYearDescription": "Снижает ложные совпадения, если год известен.",
                    "debugDescription": "Включайте только для диагностики.",
                    "savedBase": "Адрес Plex сохранён",
                    "savedToken": "Token сохранён",
                    "savedClient": "Client Identifier сохранён",
                    "savedLimit": "Максимум результатов обновлён",
                    "on": "ВКЛ",
                    "off": "ВЫКЛ",
                    "tokenPlaceholder": "Введите Plex token",
                    "currentConfigPrefix": "Plex",
                    "notSet": "не задано",
                    "present": "есть",
                    "missing": "нет",
                    "connectionOk": "Подключение Plex OK",
                    "connectionFail": "Ошибка подключения Plex",
                    "debugTitle": "Plex Source debug — последние логи",
                    "debugEmpty": "Логов пока нет. Откройте карточку фильма/сериала и попробуйте снова.",
                    "copyDebugLog": "Скопировать лог",
                    "debugLogCopied": "Лог скопирован",
                    "openGithubIssue": "Открыть GitHub issue",
                    "showBugReportQr": "QR для bug report",
                    "bugReportQrTitle": "Сканируйте QR, чтобы открыть GitHub issue",
                    "bugReportQrHint": "Back/Esc закрывает. Приложите фото debug-экрана или вставьте Copy log.",
                    "debugActions": "Действия debug",
                    "debugPressOk": "Нажмите OK/Enter для действий.",
                    "bugReportFailed": "Не удалось отправить report",
                    "bugReportSent": "Report отправлен",
                    "bugReportPlaceholder": "Кратко опишите проблему",
                    "bugReportDescription": "Описание проблемы",
                    "sendBugReport": "Отправить report",
                    "bugReportGuide": "Как отправить bug report: включите Debug, повторите ошибку, откройте этот лог и нажмите Send report. На TV можно ввести описание голосом/экранной клавиатурой. Если отправка недоступна — используйте Copy log или фото экрана.",
                    "showFallback": "Сериал",
                    "episodeFallback": "Эпизод",
                    "seasonFallback": "Сезон",
                    "notPlayable": "Элемент Plex найден, но не может быть воспроизведён",
                    "emptyList": "Нет доступных элементов",
                    "loadingSeasons": "Загружаю сезоны Plex…",
                    "loadingEpisodes": "Загружаю эпизоды Plex…",
                    "seasonsLoadError": "Ошибка загрузки сезонов Plex",
                    "episodesLoadError": "Ошибка загрузки эпизодов Plex",
                    "tvLibrary": "Сериалы",
                    "episodesSuffix": "эпизодов",
                    "watchedLabel": "Просмотрено",
                    "unwatchedLabel": "Не просмотрено",
                    "progressLabel": "Продолжить",
                    "episodeActionMode": "Действие эпизода",
                    "episodeActionModeDescription": "Выберите, что делать при нажатии на эпизод.",
                    "modePlayLong": "ОК — воспроизвести, долгое нажатие — действия",
                    "modeActions": "ОК — открыть действия",
                    "actionPlay": "Воспроизвести",
                    "actionMarkWatched": "Отметить просмотренным в Plex",
                    "actionMarkUnwatched": "Отметить непросмотренным в Plex",
                    "markedWatched": "Отмечено просмотренным",
                    "markedUnwatched": "Отмечено непросмотренным",
                    "markError": "Ошибка обновления Plex",
                    "syncProgressToPlex": "Синхронизация прогресса с Plex",
                    "syncProgressToPlexDescription": "Экспериментально: отправлять прогресс встроенного плеера Lampa в Plex. Не работает с внешними плеерами.",
                    "optionsTitle": "Опции",
                    "playbackMode": "Режим воспроизведения",
                    "playbackModeAuto": "Авто",
                    "playbackModeDirect": "Прямой файл",
                    "playbackModeTranscode": "Plex transcode HLS",
                    "playbackModeDescription": "Авто = transcode для relay, прямой файл для direct. Transcode помогает встроенному плееру Lampa с кодеками.",
                    "transcodeProfile": "Профиль transcode",
                    "transcodeBrowserCompat": "Совместимость браузера (та же резолюция)",
                    "transcode1080p20": "1080p 20 Mbps",
                    "transcode1080p12": "1080p 12 Mbps",
                    "transcode720p8": "720p 8 Mbps",
                    "transcode720p4": "720p 4 Mbps",
                    "transcode480p2": "480p 2 Mbps",
                    "transcodeProfileDescription": "Используется только в режиме Plex transcode/Auto relay.",
                    "resumePlayback": "Продолжить просмотр",
                    "resumeFrom": "Продолжить с",
                    "playFromStart": "С начала"
            },
            "en": {
                    "component": "Plex Source",
                    "loaded": "Plex Source loaded",
                    "statusTitle": "Status",
                    "connectionTitle": "Plex connection",
                    "searchTitle": "Search",
                    "advancedTitle": "Advanced",
                    "manualSetupTitle": "Manual setup (optional)",
                    "infoTitle": "Help",
                    "enabled": "Plugin enabled",
                    "testConnection": "Check connection",
                    "showConfig": "Configuration status",
                    "currentServer": "Current server",
                    "serverMode": "Servers",
                    "serverModeSelected": "Selected server",
                    "serverModeAll": "All servers",
                    "serverModeDescription": "Selected = one Plex server. All = search every available server; relay may be slower.",
                    "currentServerAllDescription": "All servers · best connection per server",
                    "notSelected": "not selected",
                    "plexBase": "Plex server",
                    "plexToken": "Plex token",
                    "tokenHelp": "Where to find the token",
                    "plexLogin": "Login with Plex",
                    "plexLoginDescription": "Recommended: authorize this plugin on plex.tv and save the token automatically.",
                    "plexLoginOpen": "Open Plex login",
                    "plexLoginCode": "Code",
                    "plexLoginWaiting": "Waiting for Plex authorization…",
                    "plexLoginSuccess": "Plex login successful",
                    "plexLoginFailed": "Plex login failed",
                    "plexServerSaved": "Plex server saved",
                    "plexServerDiscovering": "Looking for Plex server…",
                    "plexServerDiscoverFailed": "Could not auto-detect Plex server",
                    "discoverServer": "Auto-detect Plex server",
                    "selectServer": "Select Plex server",
                    "selectServerHelp": "Choose local/direct when the Lampa device is on the same network. Remote/direct works only when Plex Remote Access is configured and reachable directly. Relay is a Plex fallback: it may be slower and playback may not always work.",
                    "serverSelected": "Plex server selected",
                    "localConnection": "local",
                    "remoteConnection": "remote",
                    "relayConnection": "relay",
                    "remoteDirectWarning": "requires Plex Remote Access",
                    "relayWarning": "fallback, may be slow",
                    "directConnection": "direct",
                    "recommendedConnection": "Recommended",
                    "plexLoginExpired": "Plex login expired",
                    "plexLoginHelp": "Scan the QR code or open the Plex login URL, authorize the plugin, then return to Lampa.",
                    "clearToken": "Clear Plex token",
                    "clearTokenDone": "Plex token cleared",
                    "clearPlexAccess": "Remove Plex access",
                    "clearPlexAccessDone": "Plex token, server and connection data cleared",
                    "matchLimit": "Maximum results",
                    "exactYear": "Exact year only",
                    "clientId": "Client identifier",
                    "debug": "Debug",
                    "debugLogButton": "Debug log",
                    "infoText": "Recommended: log in with Plex. The plugin will get the token and let you choose the server. Manual server URL and token entry are still available as an optional fallback.",
                    "baseDescription": "Format: http://IP:32400. Example: http://192.168.1.10:32400",
                    "tokenDescription": "Personal Plex access token. Do not publish it.",
                    "tokenHelpText": "Plex Web → open a movie/episode → ⋯ → Get Info → View XML → copy X-Plex-Token.",
                    "clientDescription": "Technical client name for Plex requests. Usually keep the default.",
                    "limitDescription": "How many Plex matches to show. Recommended: 5.",
                    "exactYearDescription": "Reduces false matches when the year is known.",
                    "debugDescription": "Enable only for diagnostics.",
                    "savedBase": "Plex server saved",
                    "savedToken": "Token saved",
                    "savedClient": "Client identifier saved",
                    "savedLimit": "Maximum results updated",
                    "on": "ON",
                    "off": "OFF",
                    "tokenPlaceholder": "Enter Plex token",
                    "currentConfigPrefix": "Plex",
                    "notSet": "not set",
                    "present": "present",
                    "missing": "missing",
                    "connectionOk": "Plex connection OK",
                    "connectionFail": "Plex connection failed",
                    "debugTitle": "Plex Source debug — latest logs",
                    "debugEmpty": "No logs yet. Open a movie/show card and try again.",
                    "copyDebugLog": "Copy log",
                    "debugLogCopied": "Log copied",
                    "shareDebugLog": "Share log",
                    "openDebugLogText": "Open log as text",
                    "debugLogOpened": "Log opened in a new tab",
                    "dolbyVisionDirectFallback": "Dolby Vision Profile 5: Plex transcode is disabled, using Direct Play.",
                    "unsafeTranscodeDirectFallback": "Plex HLS transcode is unstable for this item, using Direct Play.",
                    "openGithubIssue": "Open GitHub issue",
                    "showBugReportQr": "Bug report QR",
                    "bugReportQrTitle": "Scan QR to open GitHub issue",
                    "bugReportQrHint": "Back/Esc closes. Attach a photo of the debug screen or paste Copy log.",
                    "debugActions": "Debug actions",
                    "debugPressOk": "Press OK/Enter for actions.",
                    "bugReportFailed": "Report failed",
                    "bugReportSent": "Report sent",
                    "bugReportPlaceholder": "Briefly describe the problem",
                    "bugReportDescription": "Problem description",
                    "sendBugReport": "Send report",
                    "bugReportGuide": "How to report a bug: enable Debug, reproduce the issue, open this log and press Send report. On TV you can enter the description by voice/on-screen keyboard. If sending is unavailable, use Copy log or a photo of the screen.",
                    "showFallback": "Show",
                    "episodeFallback": "Episode",
                    "seasonFallback": "Season",
                    "notPlayable": "Plex item found, but it cannot be played",
                    "emptyList": "No items available",
                    "loadingSeasons": "Loading Plex seasons…",
                    "loadingEpisodes": "Loading Plex episodes…",
                    "seasonsLoadError": "Error loading Plex seasons",
                    "episodesLoadError": "Error loading Plex episodes",
                    "tvLibrary": "TV Shows",
                    "episodesSuffix": "episodes",
                    "watchedLabel": "Watched",
                    "unwatchedLabel": "Unwatched",
                    "progressLabel": "In progress",
                    "episodeActionMode": "Episode action",
                    "episodeActionModeDescription": "Choose what happens when selecting an episode.",
                    "modePlayLong": "OK plays, long press opens actions",
                    "modeActions": "OK opens actions",
                    "actionPlay": "Play",
                    "actionMarkWatched": "Mark watched in Plex",
                    "actionMarkUnwatched": "Mark unwatched in Plex",
                    "markedWatched": "Marked watched",
                    "markedUnwatched": "Marked unwatched",
                    "markError": "Plex update failed",
                    "syncProgressToPlex": "Sync progress to Plex",
                    "syncProgressToPlexDescription": "Experimental: send Lampa integrated-player progress to Plex. Does not work with external players.",
                    "optionsTitle": "Options",
                    "playbackMode": "Playback mode",
                    "playbackModeAuto": "Auto",
                    "playbackModeDirect": "Direct file",
                    "playbackModeTranscode": "Plex HLS transcode",
                    "playbackModeDescription": "Auto = transcode for relay, direct file for direct connections. Transcode helps Lampa integrated player with codecs.",
                    "transcodeProfile": "Transcode profile",
                    "transcodeBrowserCompat": "Browser compatible (same resolution)",
                    "transcode1080p20": "1080p 20 Mbps",
                    "transcode1080p12": "1080p 12 Mbps",
                    "transcode720p8": "720p 8 Mbps",
                    "transcode720p4": "720p 4 Mbps",
                    "transcode480p2": "480p 2 Mbps",
                    "transcodeProfileDescription": "Used only with Plex transcode / Auto relay playback.",
                    "resumePlayback": "Resume playback",
                    "resumeFrom": "Resume from",
                    "playFromStart": "Play from start"
            },
            "uk": {
                    "component": "Plex Source",
                    "loaded": "Plex Source завантажено",
                    "statusTitle": "Стан",
                    "connectionTitle": "Підключення Plex",
                    "searchTitle": "Пошук",
                    "advancedTitle": "Додатково",
                    "manualSetupTitle": "Ручне налаштування (необов’язково)",
                    "infoTitle": "Довідка",
                    "enabled": "Плагін увімкнено",
                    "testConnection": "Перевірити підключення",
                    "showConfig": "Стан налаштувань",
                    "currentServer": "Поточний сервер",
                    "serverMode": "Сервери",
                    "serverModeSelected": "Вибраний сервер",
                    "serverModeAll": "Усі сервери",
                    "serverModeDescription": "Вибраний = один сервер Plex. Усі = пошук на всіх доступних серверах; relay може бути повільнішим.",
                    "currentServerAllDescription": "Усі сервери · найкраще з’єднання для кожного",
                    "notSelected": "не вибрано",
                    "plexBase": "Сервер Plex",
                    "plexToken": "Plex Token",
                    "tokenHelp": "Де знайти token",
                    "plexLogin": "Увійти через Plex",
                    "plexLoginDescription": "Рекомендовано: авторизуйте плагін на plex.tv, token збережеться автоматично.",
                    "plexLoginOpen": "Відкрити вхід Plex",
                    "plexLoginCode": "Код",
                    "plexLoginWaiting": "Очікування авторизації Plex…",
                    "plexLoginSuccess": "Вхід Plex виконано",
                    "plexLoginFailed": "Помилка входу Plex",
                    "plexServerSaved": "Сервер Plex збережено",
                    "plexServerDiscovering": "Шукаю сервер Plex…",
                    "plexServerDiscoverFailed": "Не вдалося автоматично знайти сервер Plex",
                    "discoverServer": "Знайти сервер Plex",
                    "selectServer": "Вибрати сервер Plex",
                    "selectServerHelp": "Вибирайте local/direct, якщо пристрій Lampa у тій самій мережі. Remote/direct працює лише якщо Plex Remote Access налаштовано і доступний напряму. Relay — запасний варіант через сервери Plex: може бути повільніше і відтворення не завжди працює.",
                    "serverSelected": "Сервер Plex вибрано",
                    "localConnection": "локально",
                    "remoteConnection": "віддалено",
                    "relayConnection": "relay",
                    "remoteDirectWarning": "потрібен Plex Remote Access",
                    "relayWarning": "запасний варіант, може бути повільно",
                    "directConnection": "пряме",
                    "recommendedConnection": "Рекомендовано",
                    "clearToken": "Очистити token Plex",
                    "clearTokenDone": "Token Plex очищено",
                    "clearPlexAccess": "Видалити доступ Plex",
                    "clearPlexAccessDone": "Token, сервер і дані підключення очищено",
                    "matchLimit": "Максимум результатів",
                    "exactYear": "Тільки точний рік",
                    "clientId": "Client Identifier",
                    "debug": "Налагодження",
                    "debugLogButton": "Лог налагодження",
                    "infoText": "Рекомендовано увійти через Plex: плагін отримає token і запропонує вибрати сервер. Ручне введення адреси сервера й token залишено як додатковий варіант.",
                    "baseDescription": "Формат: http://IP:32400. Наприклад: http://192.168.1.10:32400",
                    "tokenDescription": "Особистий token доступу Plex. Не публікуйте його.",
                    "tokenHelpText": "Plex Web → відкрийте фільм/епізод → ⋯ → Get Info → View XML → скопіюйте X-Plex-Token.",
                    "clientDescription": "Технічна назва клієнта для запитів Plex. Зазвичай залиште типове значення.",
                    "limitDescription": "Скільки збігів Plex показувати. Рекомендовано: 5.",
                    "exactYearDescription": "Зменшує хибні збіги, якщо відомий рік.",
                    "debugDescription": "Увімкніть лише для діагностики.",
                    "savedBase": "Сервер Plex збережено",
                    "savedToken": "Token збережено",
                    "savedClient": "Client Identifier збережено",
                    "savedLimit": "Максимум результатів оновлено",
                    "on": "УВІМК",
                    "off": "ВИМК",
                    "tokenPlaceholder": "Введіть Plex token",
                    "currentConfigPrefix": "Plex",
                    "notSet": "не задано",
                    "present": "є",
                    "missing": "немає",
                    "connectionOk": "Підключення Plex OK",
                    "connectionFail": "Помилка підключення Plex",
                    "debugTitle": "Plex Source debug — останні логи",
                    "debugEmpty": "Логів ще немає. Відкрийте картку фільму/серіалу і спробуйте ще раз.",
                    "bugReportGuide": "Як надіслати bug report: увімкніть Debug, повторіть проблему, відкрийте цей лог і натисніть Send report. На TV можна ввести опис голосом/екранною клавіатурою. Якщо надсилання недоступне — використайте Copy log або фото екрана.",
                    "bugReportFailed": "Не вдалося надіслати report",
                    "bugReportSent": "Report надіслано",
                    "bugReportPlaceholder": "Коротко опишіть проблему",
                    "bugReportDescription": "Опис проблеми",
                    "sendBugReport": "Надіслати report",
                    "showFallback": "Серіал",
                    "episodeFallback": "Епізод",
                    "seasonFallback": "Сезон",
                    "notPlayable": "Елемент Plex знайдено, але його неможливо відтворити",
                    "emptyList": "Немає доступних елементів",
                    "loadingSeasons": "Завантажую сезони Plex…",
                    "loadingEpisodes": "Завантажую епізоди Plex…",
                    "seasonsLoadError": "Помилка завантаження сезонів Plex",
                    "episodesLoadError": "Помилка завантаження епізодів Plex",
                    "tvLibrary": "Серіали",
                    "episodesSuffix": "епізодів",
                    "watchedLabel": "Переглянуто",
                    "unwatchedLabel": "Не переглянуто",
                    "progressLabel": "Продовжити",
                    "episodeActionMode": "Дія епізоду",
                    "episodeActionModeDescription": "Виберіть, що робити при виборі епізоду.",
                    "modePlayLong": "OK — відтворити, довге натискання — дії",
                    "modeActions": "OK — відкрити дії",
                    "actionPlay": "Відтворити",
                    "actionMarkWatched": "Позначити переглянутим у Plex",
                    "actionMarkUnwatched": "Позначити непереглянутим у Plex",
                    "markedWatched": "Позначено переглянутим",
                    "markedUnwatched": "Позначено непереглянутим",
                    "markError": "Помилка оновлення Plex"
            },
            "be": {
                    "component": "Plex Source",
                    "loaded": "Plex Source загружаны",
                    "statusTitle": "Стан",
                    "connectionTitle": "Падключэнне Plex",
                    "searchTitle": "Пошук",
                    "advancedTitle": "Дадаткова",
                    "manualSetupTitle": "Ручная наладка (неабавязкова)",
                    "infoTitle": "Даведка",
                    "enabled": "Плагін уключаны",
                    "testConnection": "Праверыць падключэнне",
                    "showConfig": "Стан налад",
                    "currentServer": "Бягучы сервер",
                    "serverMode": "Серверы",
                    "serverModeSelected": "Выбраны сервер",
                    "serverModeAll": "Усе серверы",
                    "serverModeDescription": "Выбраны = адзін сервер Plex. Усе = шукаць на ўсіх даступных серверах; relay можа быць павольней.",
                    "currentServerAllDescription": "Усе серверы · лепшае злучэнне для кожнага",
                    "notSelected": "не выбраны",
                    "plexBase": "Сервер Plex",
                    "plexToken": "Plex Token",
                    "tokenHelp": "Дзе знайсці token",
                    "plexLogin": "Увайсці праз Plex",
                    "plexLoginDescription": "Рэкамендуецца: аўтарызуйце плагін на plex.tv, token захаваецца аўтаматычна.",
                    "plexLoginOpen": "Адкрыць уваход Plex",
                    "plexLoginCode": "Код",
                    "plexLoginWaiting": "Чаканне аўтарызацыі Plex…",
                    "plexLoginSuccess": "Уваход Plex выкананы",
                    "plexLoginFailed": "Памылка ўваходу Plex",
                    "plexServerSaved": "Сервер Plex захаваны",
                    "plexServerDiscovering": "Шукаю сервер Plex…",
                    "plexServerDiscoverFailed": "Не ўдалося аўтаматычна знайсці сервер Plex",
                    "discoverServer": "Знайсці сервер Plex",
                    "selectServer": "Выбраць сервер Plex",
                    "selectServerHelp": "Выбірайце local/direct, калі прылада Lampa ў той жа сетцы. Remote/direct працуе толькі калі Plex Remote Access наладжаны і даступны напрамую. Relay — запасны варыянт праз серверы Plex: можа быць павольней і прайграванне не заўсёды працуе.",
                    "serverSelected": "Сервер Plex выбраны",
                    "localConnection": "лакальна",
                    "remoteConnection": "аддалена",
                    "relayConnection": "relay",
                    "remoteDirectWarning": "патрэбны Plex Remote Access",
                    "relayWarning": "запасны варыянт, можа быць павольна",
                    "directConnection": "прамое",
                    "recommendedConnection": "Рэкамендуецца",
                    "clearToken": "Ачысціць token Plex",
                    "clearTokenDone": "Token Plex ачышчаны",
                    "clearPlexAccess": "Выдаліць доступ Plex",
                    "clearPlexAccessDone": "Token, сервер і даныя падключэння ачышчаны",
                    "matchLimit": "Максімум вынікаў",
                    "exactYear": "Толькі дакладны год",
                    "clientId": "Client Identifier",
                    "debug": "Адладка",
                    "debugLogButton": "Лог адладкі",
                    "infoText": "Рэкамендуецца ўвайсці праз Plex: плагін атрымае token і прапануе выбраць сервер. Ручны ўвод адраса сервера і token пакінуты як дадатковы варыянт.",
                    "baseDescription": "Фармат: http://IP:32400. Прыклад: http://192.168.1.10:32400",
                    "tokenDescription": "Асабісты token доступу Plex. Не публікуйце яго.",
                    "tokenHelpText": "Plex Web → адкрыйце фільм/эпізод → ⋯ → Get Info → View XML → скапіруйце X-Plex-Token.",
                    "clientDescription": "Тэхнічная назва кліента для запытаў Plex. Звычайна пакіньце стандартнае значэнне.",
                    "limitDescription": "Колькі супадзенняў Plex паказваць. Рэкамендавана: 5.",
                    "exactYearDescription": "Змяншае памылковыя супадзенні, калі год вядомы.",
                    "debugDescription": "Уключайце толькі для дыягностыкі.",
                    "savedBase": "Сервер Plex захаваны",
                    "savedToken": "Token захаваны",
                    "savedClient": "Client Identifier захаваны",
                    "savedLimit": "Максімум вынікаў абноўлены",
                    "on": "УКЛ",
                    "off": "ВЫКЛ",
                    "tokenPlaceholder": "Увядзіце Plex token",
                    "currentConfigPrefix": "Plex",
                    "notSet": "не зададзена",
                    "present": "ёсць",
                    "missing": "няма",
                    "connectionOk": "Падключэнне Plex OK",
                    "connectionFail": "Памылка падключэння Plex",
                    "debugTitle": "Plex Source debug — апошнія логи",
                    "debugEmpty": "Логаў пакуль няма. Адкрыйце картку фільма/серыяла і паспрабуйце зноў.",
                    "bugReportGuide": "Як адправіць bug report: уключыце Debug, паўтарыце праблему, адкрыйце гэты лог і націсніце Send report. На TV можна ўвесці апісанне голасам/экраннай клавіятурай. Калі адпраўка недаступная — выкарыстоўвайце Copy log або фота экрана.",
                    "bugReportFailed": "Не ўдалося адправіць report",
                    "bugReportSent": "Report адпраўлены",
                    "bugReportPlaceholder": "Коратка апішыце праблему",
                    "bugReportDescription": "Апісанне праблемы",
                    "sendBugReport": "Адправіць report",
                    "showFallback": "Серыял",
                    "episodeFallback": "Эпізод",
                    "seasonFallback": "Сезон",
                    "notPlayable": "Элемент Plex знойдзены, але яго немагчыма прайграць",
                    "emptyList": "Няма даступных элементаў",
                    "loadingSeasons": "Загружаю сезоны Plex…",
                    "loadingEpisodes": "Загружаю эпізоды Plex…",
                    "seasonsLoadError": "Памылка загрузкі сезонаў Plex",
                    "episodesLoadError": "Памылка загрузкі эпізодаў Plex",
                    "tvLibrary": "Серыялы",
                    "episodesSuffix": "эпізодаў",
                    "watchedLabel": "Прагледжана",
                    "unwatchedLabel": "Не прагледжана",
                    "progressLabel": "Працягнуць",
                    "episodeActionMode": "Дзеянне эпізоду",
                    "episodeActionModeDescription": "Выберыце, што рабіць пры выбары эпізоду.",
                    "modePlayLong": "OK — прайграць, доўгае націсканне — дзеянні",
                    "modeActions": "OK — адкрыць дзеянні",
                    "actionPlay": "Прайграць",
                    "actionMarkWatched": "Адзначыць прагледжаным у Plex",
                    "actionMarkUnwatched": "Адзначыць непрагледжаным у Plex",
                    "markedWatched": "Адзначана прагледжаным",
                    "markedUnwatched": "Адзначана непрагледжаным",
                    "markError": "Памылка абнаўлення Plex"
            },
            "zh": {
                    "component": "Plex Source",
                    "loaded": "Plex Source 已加载",
                    "statusTitle": "状态",
                    "connectionTitle": "Plex 连接",
                    "searchTitle": "搜索",
                    "advancedTitle": "高级",
                    "manualSetupTitle": "手动设置（可选）",
                    "infoTitle": "帮助",
                    "enabled": "启用插件",
                    "testConnection": "检查连接",
                    "showConfig": "配置状态",
                    "currentServer": "当前服务器",
                    "serverMode": "服务器",
                    "serverModeSelected": "已选服务器",
                    "serverModeAll": "所有服务器",
                    "serverModeDescription": "已选 = 一个 Plex 服务器。所有 = 搜索所有可用服务器；relay 可能较慢。",
                    "currentServerAllDescription": "所有服务器 · 每个服务器使用最佳连接",
                    "notSelected": "未选择",
                    "plexBase": "Plex 服务器",
                    "plexToken": "Plex Token",
                    "tokenHelp": "在哪里找到 token",
                    "plexLogin": "使用 Plex 登录",
                    "plexLoginDescription": "推荐：在 plex.tv 授权此插件，并自动保存 token。",
                    "plexLoginOpen": "打开 Plex 登录",
                    "plexLoginCode": "代码",
                    "plexLoginWaiting": "正在等待 Plex 授权…",
                    "plexLoginSuccess": "Plex 登录成功",
                    "plexLoginFailed": "Plex 登录失败",
                    "plexServerSaved": "Plex 服务器已保存",
                    "plexServerDiscovering": "正在查找 Plex 服务器…",
                    "plexServerDiscoverFailed": "无法自动检测 Plex 服务器",
                    "discoverServer": "自动检测 Plex 服务器",
                    "selectServer": "选择 Plex 服务器",
                    "selectServerHelp": "如果 Lampa 设备在同一网络中，请选择 local/direct。Remote/direct 只有在 Plex Remote Access 已配置且可直接访问时才可用。Relay 是 Plex 的备用通道：可能较慢，播放不一定总是可用。",
                    "serverSelected": "已选择 Plex 服务器",
                    "localConnection": "本地",
                    "remoteConnection": "远程",
                    "relayConnection": "relay",
                    "remoteDirectWarning": "需要 Plex Remote Access",
                    "relayWarning": "备用通道，可能较慢",
                    "directConnection": "直连",
                    "recommendedConnection": "推荐",
                    "clearToken": "清除 Plex token",
                    "clearTokenDone": "Plex token 已清除",
                    "clearPlexAccess": "移除 Plex 访问",
                    "clearPlexAccessDone": "Plex token、服务器和连接数据已清除",
                    "matchLimit": "最大结果数",
                    "exactYear": "仅精确年份",
                    "clientId": "客户端标识",
                    "debug": "调试",
                    "debugLogButton": "调试日志",
                    "infoText": "建议使用 Plex 登录：插件会自动获取 token，并让你选择服务器。服务器地址和 token 的手动输入保留为备用方案。",
                    "baseDescription": "格式：http://IP:32400。例如：http://192.168.1.10:32400",
                    "tokenDescription": "个人 Plex 访问 token。请勿公开。",
                    "tokenHelpText": "Plex Web → 打开电影/剧集 → ⋯ → Get Info → View XML → 复制 X-Plex-Token。",
                    "clientDescription": "Plex 请求使用的客户端名称。通常保持默认即可。",
                    "limitDescription": "显示多少个 Plex 匹配结果。建议：5。",
                    "exactYearDescription": "已知年份时减少错误匹配。",
                    "debugDescription": "仅用于诊断。",
                    "savedBase": "Plex 服务器已保存",
                    "savedToken": "Token 已保存",
                    "savedClient": "客户端标识已保存",
                    "savedLimit": "最大结果数已更新",
                    "on": "开",
                    "off": "关",
                    "tokenPlaceholder": "输入 Plex token",
                    "currentConfigPrefix": "Plex",
                    "notSet": "未设置",
                    "present": "存在",
                    "missing": "缺失",
                    "connectionOk": "Plex 连接正常",
                    "connectionFail": "Plex 连接失败",
                    "debugTitle": "Plex Source 调试 — 最新日志",
                    "debugEmpty": "暂无日志。打开电影/剧集页面后再试。",
                    "bugReportGuide": "如何报告 bug：启用 Debug，重现问题，打开此日志并按 Send report。在 TV 上可用语音/屏幕键盘输入描述。如果无法发送，请使用 Copy log 或拍屏。",
                    "bugReportFailed": "报告发送失败",
                    "bugReportSent": "报告已发送",
                    "bugReportPlaceholder": "简要描述问题",
                    "bugReportDescription": "问题描述",
                    "sendBugReport": "发送报告",
                    "showFallback": "剧集",
                    "episodeFallback": "集",
                    "seasonFallback": "季",
                    "notPlayable": "已找到 Plex 项目，但无法播放",
                    "emptyList": "没有可用项目",
                    "loadingSeasons": "正在加载 Plex 季…",
                    "loadingEpisodes": "正在加载 Plex 集…",
                    "seasonsLoadError": "加载 Plex 季失败",
                    "episodesLoadError": "加载 Plex 集失败",
                    "tvLibrary": "电视剧",
                    "episodesSuffix": "集",
                    "watchedLabel": "已观看",
                    "unwatchedLabel": "未观看",
                    "progressLabel": "继续观看",
                    "episodeActionMode": "剧集操作",
                    "episodeActionModeDescription": "选择选中单集时的行为。",
                    "modePlayLong": "OK 播放，长按打开操作",
                    "modeActions": "OK 打开操作",
                    "actionPlay": "播放",
                    "actionMarkWatched": "在 Plex 标记已观看",
                    "actionMarkUnwatched": "在 Plex 标记未观看",
                    "markedWatched": "已标记为已观看",
                    "markedUnwatched": "已标记为未观看",
                    "markError": "Plex 更新失败"
            },
            "pt": {
                    "component": "Plex Source",
                    "loaded": "Plex Source carregado",
                    "statusTitle": "Estado",
                    "connectionTitle": "Ligação Plex",
                    "searchTitle": "Pesquisa",
                    "advancedTitle": "Avançado",
                    "manualSetupTitle": "Configuração manual (opcional)",
                    "infoTitle": "Ajuda",
                    "enabled": "Plugin ativo",
                    "testConnection": "Verificar ligação",
                    "showConfig": "Estado da configuração",
                    "currentServer": "Servidor atual",
                    "serverMode": "Servidores",
                    "serverModeSelected": "Servidor selecionado",
                    "serverModeAll": "Todos os servidores",
                    "serverModeDescription": "Selecionado = um servidor Plex. Todos = pesquisar em todos os servidores disponíveis; relay pode ser mais lento.",
                    "currentServerAllDescription": "Todos os servidores · melhor conexão por servidor",
                    "notSelected": "não selecionado",
                    "plexBase": "Servidor Plex",
                    "plexToken": "Plex Token",
                    "tokenHelp": "Onde encontrar o token",
                    "plexLogin": "Entrar com Plex",
                    "plexLoginDescription": "Recomendado: autorize este plugin em plex.tv e salve o token automaticamente.",
                    "plexLoginOpen": "Abrir login Plex",
                    "plexLoginCode": "Código",
                    "plexLoginWaiting": "Aguardando autorização Plex…",
                    "plexLoginSuccess": "Login Plex concluído",
                    "plexLoginFailed": "Falha no login Plex",
                    "plexServerSaved": "Servidor Plex salvo",
                    "plexServerDiscovering": "Procurando servidor Plex…",
                    "plexServerDiscoverFailed": "Não foi possível detectar o servidor Plex",
                    "discoverServer": "Detectar servidor Plex",
                    "selectServer": "Selecionar servidor Plex",
                    "selectServerHelp": "Escolha local/direct quando o dispositivo Lampa estiver na mesma rede. Remote/direct só funciona se o Plex Remote Access estiver configurado e acessível diretamente. Relay é um fallback via servidores Plex: pode ser mais lento e a reprodução pode nem sempre funcionar.",
                    "serverSelected": "Servidor Plex selecionado",
                    "localConnection": "local",
                    "remoteConnection": "remoto",
                    "relayConnection": "relay",
                    "remoteDirectWarning": "requer Plex Remote Access",
                    "relayWarning": "fallback, pode ser lento",
                    "directConnection": "direto",
                    "recommendedConnection": "Recomendado",
                    "clearToken": "Limpar token Plex",
                    "clearTokenDone": "Token Plex limpo",
                    "clearPlexAccess": "Remover acesso Plex",
                    "clearPlexAccessDone": "Token, servidor e dados de conexão Plex limpos",
                    "matchLimit": "Máximo de resultados",
                    "exactYear": "Só ano exato",
                    "clientId": "Identificador do cliente",
                    "debug": "Depuração",
                    "debugLogButton": "Log de depuração",
                    "infoText": "Recomendado: entre com Plex. O plugin obtém o token e permite escolher o servidor. Endereço do servidor e token manuais ficam como alternativa.",
                    "baseDescription": "Formato: http://IP:32400. Exemplo: http://192.168.1.10:32400",
                    "tokenDescription": "Token pessoal de acesso ao Plex. Não o publique.",
                    "tokenHelpText": "Plex Web → abra um filme/episódio → ⋯ → Get Info → View XML → copie X-Plex-Token.",
                    "clientDescription": "Nome técnico do cliente para pedidos Plex. Normalmente mantenha o padrão.",
                    "limitDescription": "Quantas correspondências Plex mostrar. Recomendado: 5.",
                    "exactYearDescription": "Reduz falsos positivos quando o ano é conhecido.",
                    "debugDescription": "Ative apenas para diagnóstico.",
                    "savedBase": "Servidor Plex guardado",
                    "savedToken": "Token guardado",
                    "savedClient": "Identificador guardado",
                    "savedLimit": "Máximo de resultados atualizado",
                    "on": "ON",
                    "off": "OFF",
                    "tokenPlaceholder": "Introduza o Plex token",
                    "currentConfigPrefix": "Plex",
                    "notSet": "não definido",
                    "present": "presente",
                    "missing": "em falta",
                    "connectionOk": "Ligação Plex OK",
                    "connectionFail": "Falha na ligação Plex",
                    "debugTitle": "Plex Source debug — logs recentes",
                    "debugEmpty": "Ainda não há logs. Abra um filme/série e tente de novo.",
                    "bugReportGuide": "Como reportar bug: ative Debug, reproduza o problema, abra este log e pressione Send report. Na TV você pode usar voz/teclado na tela. Se o envio não estiver disponível, use Copy log ou foto da tela.",
                    "bugReportFailed": "Falha ao enviar relatório",
                    "bugReportSent": "Relatório enviado",
                    "bugReportPlaceholder": "Descreva brevemente o problema",
                    "bugReportDescription": "Descrição do problema",
                    "sendBugReport": "Enviar relatório",
                    "showFallback": "Série",
                    "episodeFallback": "Episódio",
                    "seasonFallback": "Temporada",
                    "notPlayable": "Item Plex encontrado, mas não pode ser reproduzido",
                    "emptyList": "Sem itens disponíveis",
                    "loadingSeasons": "A carregar temporadas Plex…",
                    "loadingEpisodes": "A carregar episódios Plex…",
                    "seasonsLoadError": "Erro ao carregar temporadas Plex",
                    "episodesLoadError": "Erro ao carregar episódios Plex",
                    "tvLibrary": "Séries",
                    "episodesSuffix": "episódios",
                    "watchedLabel": "Visto",
                    "unwatchedLabel": "Não visto",
                    "progressLabel": "Em progresso",
                    "episodeActionMode": "Ação do episódio",
                    "episodeActionModeDescription": "Escolha o que acontece ao selecionar um episódio.",
                    "modePlayLong": "OK reproduz, pressão longa abre ações",
                    "modeActions": "OK abre ações",
                    "actionPlay": "Reproduzir",
                    "actionMarkWatched": "Marcar visto no Plex",
                    "actionMarkUnwatched": "Marcar não visto no Plex",
                    "markedWatched": "Marcado como visto",
                    "markedUnwatched": "Marcado como não visto",
                    "markError": "Falha ao atualizar Plex"
            },
            "bg": {
                    "component": "Plex Source",
                    "loaded": "Plex Source е зареден",
                    "statusTitle": "Състояние",
                    "connectionTitle": "Plex връзка",
                    "searchTitle": "Търсене",
                    "advancedTitle": "Разширени",
                    "manualSetupTitle": "Ръчна настройка (по избор)",
                    "infoTitle": "Помощ",
                    "enabled": "Плъгинът е включен",
                    "testConnection": "Провери връзката",
                    "showConfig": "Състояние на настройките",
                    "currentServer": "Текущ сървър",
                    "serverMode": "Сървъри",
                    "serverModeSelected": "Избран сървър",
                    "serverModeAll": "Всички сървъри",
                    "serverModeDescription": "Избран = един Plex сървър. Всички = търсене във всички достъпни сървъри; relay може да е по-бавен.",
                    "currentServerAllDescription": "Всички сървъри · най-добра връзка за всеки",
                    "notSelected": "не е избран",
                    "plexBase": "Plex сървър",
                    "plexToken": "Plex Token",
                    "tokenHelp": "Къде да намерите token",
                    "plexLogin": "Вход с Plex",
                    "plexLoginDescription": "Препоръчително: разрешете този плъгин в plex.tv и token ще се запази автоматично.",
                    "plexLoginOpen": "Отвори Plex вход",
                    "plexLoginCode": "Код",
                    "plexLoginWaiting": "Изчакване на Plex разрешение…",
                    "plexLoginSuccess": "Plex вход успешен",
                    "plexLoginFailed": "Plex вход неуспешен",
                    "plexServerSaved": "Plex сървърът е запазен",
                    "plexServerDiscovering": "Търся Plex сървър…",
                    "plexServerDiscoverFailed": "Неуспешно автоматично откриване на Plex сървър",
                    "discoverServer": "Открий Plex сървър",
                    "selectServer": "Избери Plex сървър",
                    "selectServerHelp": "Изберете local/direct, ако устройството с Lampa е в същата мрежа. Remote/direct работи само ако Plex Remote Access е настроен и достъпен директно. Relay е резервен вариант през сървърите на Plex: може да е по-бавен и възпроизвеждането не винаги работи.",
                    "serverSelected": "Plex сървър избран",
                    "localConnection": "локално",
                    "remoteConnection": "отдалечено",
                    "relayConnection": "relay",
                    "remoteDirectWarning": "изисква Plex Remote Access",
                    "relayWarning": "резервен вариант, може да е бавно",
                    "directConnection": "директно",
                    "recommendedConnection": "Препоръчано",
                    "clearToken": "Изчисти Plex token",
                    "clearTokenDone": "Plex token изчистен",
                    "clearPlexAccess": "Премахни Plex достъп",
                    "clearPlexAccessDone": "Plex token, сървър и данни за връзка са изчистени",
                    "matchLimit": "Максимум резултати",
                    "exactYear": "Само точна година",
                    "clientId": "Client Identifier",
                    "debug": "Debug",
                    "debugLogButton": "Debug log",
                    "infoText": "Препоръчително е влизане чрез Plex: плъгинът получава token и предлага избор на сървър. Ръчното въвеждане на адрес и token остава като резервен вариант.",
                    "baseDescription": "Формат: http://IP:32400. Пример: http://192.168.1.10:32400",
                    "tokenDescription": "Личен Plex token. Не го публикувайте.",
                    "tokenHelpText": "Plex Web → отворете филм/епизод → ⋯ → Get Info → View XML → копирайте X-Plex-Token.",
                    "clientDescription": "Техническо име на клиента за Plex заявки. Обикновено оставете стандартното.",
                    "limitDescription": "Колко Plex съвпадения да се показват. Препоръчително: 5.",
                    "exactYearDescription": "Намалява грешни съвпадения, когато годината е известна.",
                    "debugDescription": "Включвайте само за диагностика.",
                    "savedBase": "Plex сървърът е запазен",
                    "savedToken": "Token е запазен",
                    "savedClient": "Client Identifier е запазен",
                    "savedLimit": "Максимумът е обновен",
                    "on": "ВКЛ",
                    "off": "ИЗКЛ",
                    "tokenPlaceholder": "Въведете Plex token",
                    "currentConfigPrefix": "Plex",
                    "notSet": "не е зададено",
                    "present": "наличен",
                    "missing": "липсва",
                    "connectionOk": "Plex връзката е OK",
                    "connectionFail": "Грешка при Plex връзката",
                    "debugTitle": "Plex Source debug — последни логове",
                    "debugEmpty": "Все още няма логове. Отворете филм/сериал и опитайте пак.",
                    "bugReportGuide": "Как да изпратите bug report: включете Debug, повторете проблема, отворете този лог и натиснете Send report. На TV може да въведете описание с глас/екранна клавиатура. Ако изпращането не е достъпно — използвайте Copy log или снимка.",
                    "bugReportFailed": "Неуспешно изпращане",
                    "bugReportSent": "Report изпратен",
                    "bugReportPlaceholder": "Опишете накратко проблема",
                    "bugReportDescription": "Описание на проблема",
                    "sendBugReport": "Изпрати report",
                    "showFallback": "Сериал",
                    "episodeFallback": "Епизод",
                    "seasonFallback": "Сезон",
                    "notPlayable": "Plex елементът е намерен, но не може да се възпроизведе",
                    "emptyList": "Няма налични елементи",
                    "loadingSeasons": "Зареждам Plex сезони…",
                    "loadingEpisodes": "Зареждам Plex епизоди…",
                    "seasonsLoadError": "Грешка при зареждане на Plex сезони",
                    "episodesLoadError": "Грешка при зареждане на Plex епизоди",
                    "tvLibrary": "Сериали",
                    "episodesSuffix": "епизода",
                    "watchedLabel": "Гледано",
                    "unwatchedLabel": "Негледано",
                    "progressLabel": "В процес",
                    "episodeActionMode": "Действие за епизод",
                    "episodeActionModeDescription": "Изберете какво става при избор на епизод.",
                    "modePlayLong": "OK пуска, дълго натискане отваря действия",
                    "modeActions": "OK отваря действия",
                    "actionPlay": "Пусни",
                    "actionMarkWatched": "Маркирай гледано в Plex",
                    "actionMarkUnwatched": "Маркирай негледано в Plex",
                    "markedWatched": "Маркирано като гледано",
                    "markedUnwatched": "Маркирано като негледано",
                    "markError": "Грешка при обновяване на Plex"
            },
            "he": {
                    "component": "Plex Source",
                    "loaded": "Plex Source נטען",
                    "statusTitle": "סטטוס",
                    "connectionTitle": "חיבור Plex",
                    "searchTitle": "חיפוש",
                    "advancedTitle": "מתקדם",
                    "manualSetupTitle": "הגדרה ידנית (אופציונלי)",
                    "infoTitle": "עזרה",
                    "enabled": "הפלאגין פעיל",
                    "testConnection": "בדיקת חיבור",
                    "showConfig": "מצב הגדרות",
                    "currentServer": "שרת נוכחי",
                    "serverMode": "שרתים",
                    "serverModeSelected": "שרת נבחר",
                    "serverModeAll": "כל השרתים",
                    "serverModeDescription": "נבחר = שרת Plex אחד. הכל = חיפוש בכל השרתים הזמינים; relay עלול להיות איטי יותר.",
                    "currentServerAllDescription": "כל השרתים · החיבור הטוב ביותר לכל שרת",
                    "notSelected": "לא נבחר",
                    "plexBase": "שרת Plex",
                    "plexToken": "Plex Token",
                    "tokenHelp": "איפה למצוא את ה-token",
                    "plexLogin": "התחברות עם Plex",
                    "plexLoginDescription": "מומלץ: אשר את התוסף ב-plex.tv ושמור את ה-token אוטומטית.",
                    "plexLoginOpen": "פתח התחברות Plex",
                    "plexLoginCode": "קוד",
                    "plexLoginWaiting": "ממתין לאישור Plex…",
                    "plexLoginSuccess": "התחברות Plex הצליחה",
                    "plexLoginFailed": "התחברות Plex נכשלה",
                    "plexServerSaved": "שרת Plex נשמר",
                    "plexServerDiscovering": "מחפש שרת Plex…",
                    "plexServerDiscoverFailed": "לא ניתן לזהות שרת Plex אוטומטית",
                    "discoverServer": "זיהוי שרת Plex",
                    "selectServer": "בחר שרת Plex",
                    "selectServerHelp": "בחר local/direct כאשר מכשיר Lampa באותה רשת. Remote/direct עובד רק אם Plex Remote Access מוגדר וזמין ישירות. Relay הוא גיבוי דרך שרתי Plex: עלול להיות איטי והניגון לא תמיד יעבוד.",
                    "serverSelected": "שרת Plex נבחר",
                    "localConnection": "מקומי",
                    "remoteConnection": "מרוחק",
                    "relayConnection": "relay",
                    "remoteDirectWarning": "דורש Plex Remote Access",
                    "relayWarning": "גיבוי, עלול להיות איטי",
                    "directConnection": "ישיר",
                    "recommendedConnection": "מומלץ",
                    "clearToken": "נקה Plex token",
                    "clearTokenDone": "Plex token נוקה",
                    "clearPlexAccess": "הסר גישת Plex",
                    "clearPlexAccessDone": "Plex token, שרת ונתוני חיבור נוקו",
                    "matchLimit": "מספר תוצאות מרבי",
                    "exactYear": "שנה מדויקת בלבד",
                    "clientId": "מזהה לקוח",
                    "debug": "ניפוי שגיאות",
                    "debugLogButton": "יומן ניפוי",
                    "infoText": "מומלץ להתחבר עם Plex: התוסף יקבל token ויאפשר לבחור שרת. הזנה ידנית של כתובת שרת ו-token נשארת כאפשרות גיבוי.",
                    "baseDescription": "פורמט: http://IP:32400. לדוגמה: http://192.168.1.10:32400",
                    "tokenDescription": "token אישי לגישה ל-Plex. אל תפרסם אותו.",
                    "tokenHelpText": "Plex Web → פתח סרט/פרק → ⋯ → Get Info → View XML → העתק X-Plex-Token.",
                    "clientDescription": "שם טכני של הלקוח בבקשות Plex. בדרך כלל השאר ברירת מחדל.",
                    "limitDescription": "כמה התאמות Plex להציג. מומלץ: 5.",
                    "exactYearDescription": "מפחית התאמות שגויות כאשר השנה ידועה.",
                    "debugDescription": "הפעל רק לאבחון.",
                    "savedBase": "שרת Plex נשמר",
                    "savedToken": "Token נשמר",
                    "savedClient": "מזהה לקוח נשמר",
                    "savedLimit": "מספר התוצאות עודכן",
                    "on": "פעיל",
                    "off": "כבוי",
                    "tokenPlaceholder": "הכנס Plex token",
                    "currentConfigPrefix": "Plex",
                    "notSet": "לא הוגדר",
                    "present": "קיים",
                    "missing": "חסר",
                    "connectionOk": "חיבור Plex תקין",
                    "connectionFail": "חיבור Plex נכשל",
                    "debugTitle": "Plex Source debug — לוגים אחרונים",
                    "debugEmpty": "אין לוגים עדיין. פתח סרט/סדרה ונסה שוב.",
                    "bugReportGuide": "איך לדווח על באג: הפעל Debug, שחזר את הבעיה, פתח את הלוג ולחץ Send report. בטלוויזיה אפשר להזין תיאור בקול/מקלדת מסך. אם שליחה לא זמינה — השתמש ב-Copy log או צילום מסך.",
                    "bugReportFailed": "שליחת הדוח נכשלה",
                    "bugReportSent": "הדוח נשלח",
                    "bugReportPlaceholder": "תאר בקצרה את הבעיה",
                    "bugReportDescription": "תיאור הבעיה",
                    "sendBugReport": "שלח דוח",
                    "showFallback": "סדרה",
                    "episodeFallback": "פרק",
                    "seasonFallback": "עונה",
                    "notPlayable": "פריט Plex נמצא, אך אי אפשר לנגן אותו",
                    "emptyList": "אין פריטים זמינים",
                    "loadingSeasons": "טוען עונות Plex…",
                    "loadingEpisodes": "טוען פרקי Plex…",
                    "seasonsLoadError": "שגיאה בטעינת עונות Plex",
                    "episodesLoadError": "שגיאה בטעינת פרקי Plex",
                    "tvLibrary": "סדרות",
                    "episodesSuffix": "פרקים",
                    "watchedLabel": "נצפה",
                    "unwatchedLabel": "לא נצפה",
                    "progressLabel": "בהתקדמות",
                    "episodeActionMode": "פעולת פרק",
                    "episodeActionModeDescription": "בחר מה קורה בבחירת פרק.",
                    "modePlayLong": "OK מנגן, לחיצה ארוכה פותחת פעולות",
                    "modeActions": "OK פותח פעולות",
                    "actionPlay": "נגן",
                    "actionMarkWatched": "סמן כנצפה ב-Plex",
                    "actionMarkUnwatched": "סמן כלא נצפה ב-Plex",
                    "markedWatched": "סומן כנצפה",
                    "markedUnwatched": "סומן כלא נצפה",
                    "markError": "עדכון Plex נכשל"
            },
            "cs": {
                    "component": "Plex Source",
                    "loaded": "Plex Source načten",
                    "statusTitle": "Stav",
                    "connectionTitle": "Plex připojení",
                    "searchTitle": "Hledání",
                    "advancedTitle": "Pokročilé",
                    "manualSetupTitle": "Ruční nastavení (volitelné)",
                    "infoTitle": "Nápověda",
                    "enabled": "Plugin zapnutý",
                    "testConnection": "Zkontrolovat připojení",
                    "showConfig": "Stav nastavení",
                    "currentServer": "Aktuální server",
                    "serverMode": "Servery",
                    "serverModeSelected": "Vybraný server",
                    "serverModeAll": "Všechny servery",
                    "serverModeDescription": "Vybraný = jeden Plex server. Všechny = hledat na všech dostupných serverech; relay může být pomalejší.",
                    "currentServerAllDescription": "Všechny servery · nejlepší připojení pro každý",
                    "notSelected": "nevybráno",
                    "plexBase": "Plex server",
                    "plexToken": "Plex Token",
                    "tokenHelp": "Kde najít token",
                    "plexLogin": "Přihlásit přes Plex",
                    "plexLoginDescription": "Doporučeno: autorizujte plugin na plex.tv a token se uloží automaticky.",
                    "plexLoginOpen": "Otevřít přihlášení Plex",
                    "plexLoginCode": "Kód",
                    "plexLoginWaiting": "Čekám na autorizaci Plex…",
                    "plexLoginSuccess": "Přihlášení Plex úspěšné",
                    "plexLoginFailed": "Přihlášení Plex selhalo",
                    "plexServerSaved": "Server Plex uložen",
                    "plexServerDiscovering": "Hledám server Plex…",
                    "plexServerDiscoverFailed": "Server Plex se nepodařilo automaticky zjistit",
                    "discoverServer": "Najít server Plex",
                    "selectServer": "Vybrat server Plex",
                    "selectServerHelp": "Vyberte local/direct, pokud je zařízení Lampa ve stejné síti. Remote/direct funguje jen tehdy, když je Plex Remote Access nastavený a přímo dostupný. Relay je záložní cesta přes servery Plex: může být pomalejší a přehrávání nemusí vždy fungovat.",
                    "serverSelected": "Server Plex vybrán",
                    "localConnection": "lokální",
                    "remoteConnection": "vzdálené",
                    "relayConnection": "relay",
                    "remoteDirectWarning": "vyžaduje Plex Remote Access",
                    "relayWarning": "záloha, může být pomalé",
                    "directConnection": "přímé",
                    "recommendedConnection": "Doporučeno",
                    "clearToken": "Vymazat Plex token",
                    "clearTokenDone": "Plex token vymazán",
                    "clearPlexAccess": "Odebrat přístup Plex",
                    "clearPlexAccessDone": "Plex token, server a údaje připojení byly vymazány",
                    "matchLimit": "Maximum výsledků",
                    "exactYear": "Pouze přesný rok",
                    "clientId": "Identifikátor klienta",
                    "debug": "Ladění",
                    "debugLogButton": "Ladicí log",
                    "infoText": "Doporučeno: přihlaste se přes Plex. Plugin získá token a nabídne výběr serveru. Ruční zadání serveru a tokenu zůstává jako záložní možnost.",
                    "baseDescription": "Formát: http://IP:32400. Příklad: http://192.168.1.10:32400",
                    "tokenDescription": "Osobní přístupový token Plex. Nezveřejňujte ho.",
                    "tokenHelpText": "Plex Web → otevřete film/epizodu → ⋯ → Get Info → View XML → zkopírujte X-Plex-Token.",
                    "clientDescription": "Technický název klienta pro Plex požadavky. Obvykle ponechte výchozí.",
                    "limitDescription": "Kolik shod Plex zobrazit. Doporučeno: 5.",
                    "exactYearDescription": "Snižuje falešné shody, když je znám rok.",
                    "debugDescription": "Zapínejte jen pro diagnostiku.",
                    "savedBase": "Plex server uložen",
                    "savedToken": "Token uložen",
                    "savedClient": "Identifikátor uložen",
                    "savedLimit": "Maximum výsledků aktualizováno",
                    "on": "ZAP",
                    "off": "VYP",
                    "tokenPlaceholder": "Zadejte Plex token",
                    "currentConfigPrefix": "Plex",
                    "notSet": "nenastaveno",
                    "present": "přítomen",
                    "missing": "chybí",
                    "connectionOk": "Plex připojení OK",
                    "connectionFail": "Plex připojení selhalo",
                    "debugTitle": "Plex Source debug — poslední logy",
                    "debugEmpty": "Zatím žádné logy. Otevřete kartu filmu/seriálu a zkuste znovu.",
                    "bugReportGuide": "Jak nahlásit chybu: zapněte Debug, zopakujte problém, otevřete tento log a stiskněte Send report. Na TV lze zadat popis hlasem/klávesnicí na obrazovce. Pokud odeslání není dostupné, použijte Copy log nebo fotku obrazovky.",
                    "bugReportFailed": "Odeslání selhalo",
                    "bugReportSent": "Report odeslán",
                    "bugReportPlaceholder": "Krátce popište problém",
                    "bugReportDescription": "Popis problému",
                    "sendBugReport": "Odeslat report",
                    "showFallback": "Seriál",
                    "episodeFallback": "Epizoda",
                    "seasonFallback": "Sezóna",
                    "notPlayable": "Položka Plex nalezena, ale nelze ji přehrát",
                    "emptyList": "Žádné dostupné položky",
                    "loadingSeasons": "Načítám sezóny Plex…",
                    "loadingEpisodes": "Načítám epizody Plex…",
                    "seasonsLoadError": "Chyba načítání sezón Plex",
                    "episodesLoadError": "Chyba načítání epizod Plex",
                    "tvLibrary": "Seriály",
                    "episodesSuffix": "epizod",
                    "watchedLabel": "Zhlédnuto",
                    "unwatchedLabel": "Nezhlédnuto",
                    "progressLabel": "Rozkoukáno",
                    "episodeActionMode": "Akce epizody",
                    "episodeActionModeDescription": "Vyberte, co se stane při výběru epizody.",
                    "modePlayLong": "OK přehraje, dlouhý stisk otevře akce",
                    "modeActions": "OK otevře akce",
                    "actionPlay": "Přehrát",
                    "actionMarkWatched": "Označit jako zhlédnuté v Plex",
                    "actionMarkUnwatched": "Označit jako nezhlédnuté v Plex",
                    "markedWatched": "Označeno jako zhlédnuté",
                    "markedUnwatched": "Označeno jako nezhlédnuté",
                    "markError": "Aktualizace Plex selhala"
            },
            "ro": {
                    "component": "Plex Source",
                    "loaded": "Plex Source încărcat",
                    "statusTitle": "Stare",
                    "connectionTitle": "Conexiune Plex",
                    "searchTitle": "Căutare",
                    "advancedTitle": "Avansat",
                    "manualSetupTitle": "Configurare manuală (opțional)",
                    "infoTitle": "Ajutor",
                    "enabled": "Plugin activ",
                    "testConnection": "Verifică conexiunea",
                    "showConfig": "Starea configurării",
                    "currentServer": "Server curent",
                    "serverMode": "Servere",
                    "serverModeSelected": "Server selectat",
                    "serverModeAll": "Toate serverele",
                    "serverModeDescription": "Selectat = un server Plex. Toate = caută pe toate serverele disponibile; relay poate fi mai lent.",
                    "currentServerAllDescription": "Toate serverele · cea mai bună conexiune pentru fiecare",
                    "notSelected": "neselectat",
                    "plexBase": "Server Plex",
                    "plexToken": "Plex Token",
                    "tokenHelp": "Unde găsești tokenul",
                    "plexLogin": "Autentificare cu Plex",
                    "plexLoginDescription": "Recomandat: autorizează pluginul pe plex.tv și tokenul se salvează automat.",
                    "plexLoginOpen": "Deschide login Plex",
                    "plexLoginCode": "Cod",
                    "plexLoginWaiting": "Se așteaptă autorizarea Plex…",
                    "plexLoginSuccess": "Autentificare Plex reușită",
                    "plexLoginFailed": "Autentificare Plex eșuată",
                    "plexServerSaved": "Server Plex salvat",
                    "plexServerDiscovering": "Caut server Plex…",
                    "plexServerDiscoverFailed": "Serverul Plex nu a putut fi detectat automat",
                    "discoverServer": "Detectează server Plex",
                    "selectServer": "Selectează server Plex",
                    "selectServerHelp": "Alege local/direct când dispozitivul Lampa este în aceeași rețea. Remote/direct funcționează doar dacă Plex Remote Access este configurat și accesibil direct. Relay este o variantă de rezervă prin serverele Plex: poate fi mai lentă și redarea poate să nu meargă mereu.",
                    "serverSelected": "Server Plex selectat",
                    "localConnection": "local",
                    "remoteConnection": "remote",
                    "relayConnection": "relay",
                    "remoteDirectWarning": "necesită Plex Remote Access",
                    "relayWarning": "fallback, poate fi lent",
                    "directConnection": "direct",
                    "recommendedConnection": "Recomandat",
                    "clearToken": "Șterge token Plex",
                    "clearTokenDone": "Token Plex șters",
                    "clearPlexAccess": "Elimină accesul Plex",
                    "clearPlexAccessDone": "Tokenul, serverul și datele conexiunii Plex au fost șterse",
                    "matchLimit": "Număr maxim rezultate",
                    "exactYear": "Doar anul exact",
                    "clientId": "Identificator client",
                    "debug": "Debug",
                    "debugLogButton": "Jurnal debug",
                    "infoText": "Recomandat: autentificare cu Plex. Pluginul obține tokenul și permite alegerea serverului. Introducerea manuală a serverului și tokenului rămâne ca alternativă.",
                    "baseDescription": "Format: http://IP:32400. Exemplu: http://192.168.1.10:32400",
                    "tokenDescription": "Token personal de acces Plex. Nu îl publica.",
                    "tokenHelpText": "Plex Web → deschide un film/episod → ⋯ → Get Info → View XML → copiază X-Plex-Token.",
                    "clientDescription": "Numele tehnic al clientului pentru cereri Plex. De obicei păstrează valoarea implicită.",
                    "limitDescription": "Câte potriviri Plex să fie afișate. Recomandat: 5.",
                    "exactYearDescription": "Reduce potrivirile greșite când anul este cunoscut.",
                    "debugDescription": "Activează doar pentru diagnostic.",
                    "savedBase": "Server Plex salvat",
                    "savedToken": "Token salvat",
                    "savedClient": "Identificator salvat",
                    "savedLimit": "Numărul maxim actualizat",
                    "on": "PORNIT",
                    "off": "OPRIT",
                    "tokenPlaceholder": "Introdu Plex token",
                    "currentConfigPrefix": "Plex",
                    "notSet": "nesetat",
                    "present": "prezent",
                    "missing": "lipsește",
                    "connectionOk": "Conexiune Plex OK",
                    "connectionFail": "Conexiune Plex eșuată",
                    "debugTitle": "Plex Source debug — ultimele loguri",
                    "debugEmpty": "Nu există loguri încă. Deschide un film/serial și încearcă din nou.",
                    "bugReportGuide": "Cum raportezi un bug: activează Debug, reprodu problema, deschide logul și apasă Send report. Pe TV poți introduce descrierea vocal/cu tastatura pe ecran. Dacă trimiterea nu e disponibilă, folosește Copy log sau o poză a ecranului.",
                    "bugReportFailed": "Trimiterea a eșuat",
                    "bugReportSent": "Report trimis",
                    "bugReportPlaceholder": "Descrie pe scurt problema",
                    "bugReportDescription": "Descriere problemă",
                    "sendBugReport": "Trimite report",
                    "showFallback": "Serial",
                    "episodeFallback": "Episod",
                    "seasonFallback": "Sezon",
                    "notPlayable": "Elementul Plex a fost găsit, dar nu poate fi redat",
                    "emptyList": "Nu există elemente disponibile",
                    "loadingSeasons": "Se încarcă sezoanele Plex…",
                    "loadingEpisodes": "Se încarcă episoadele Plex…",
                    "seasonsLoadError": "Eroare la încărcarea sezoanelor Plex",
                    "episodesLoadError": "Eroare la încărcarea episoadelor Plex",
                    "tvLibrary": "Seriale",
                    "episodesSuffix": "episoade",
                    "watchedLabel": "Văzut",
                    "unwatchedLabel": "Nevăzut",
                    "progressLabel": "În progres",
                    "episodeActionMode": "Acțiune episod",
                    "episodeActionModeDescription": "Alege ce se întâmplă la selectarea unui episod.",
                    "modePlayLong": "OK redă, apăsare lungă deschide acțiuni",
                    "modeActions": "OK deschide acțiuni",
                    "actionPlay": "Redă",
                    "actionMarkWatched": "Marchează văzut în Plex",
                    "actionMarkUnwatched": "Marchează nevăzut în Plex",
                    "markedWatched": "Marcat ca văzut",
                    "markedUnwatched": "Marcat ca nevăzut",
                    "markError": "Actualizarea Plex a eșuat"
            },
            "fr": {
                    "component": "Plex Source",
                    "loaded": "Plex Source chargé",
                    "statusTitle": "État",
                    "connectionTitle": "Connexion Plex",
                    "searchTitle": "Recherche",
                    "advancedTitle": "Avancé",
                    "manualSetupTitle": "Configuration manuelle (optionnelle)",
                    "infoTitle": "Aide",
                    "enabled": "Plugin activé",
                    "testConnection": "Vérifier la connexion",
                    "showConfig": "État de la configuration",
                    "currentServer": "Serveur actuel",
                    "serverMode": "Serveurs",
                    "serverModeSelected": "Serveur sélectionné",
                    "serverModeAll": "Tous les serveurs",
                    "serverModeDescription": "Sélectionné = un serveur Plex. Tous = chercher sur tous les serveurs disponibles ; le relay peut être plus lent.",
                    "currentServerAllDescription": "Tous les serveurs · meilleure connexion par serveur",
                    "notSelected": "non sélectionné",
                    "plexBase": "Serveur Plex",
                    "plexToken": "Plex Token",
                    "tokenHelp": "Où trouver le token",
                    "plexLogin": "Connexion avec Plex",
                    "plexLoginDescription": "Recommandé : autorisez ce plugin sur plex.tv et enregistrez le token automatiquement.",
                    "plexLoginOpen": "Ouvrir la connexion Plex",
                    "plexLoginCode": "Code",
                    "plexLoginWaiting": "En attente de l’autorisation Plex…",
                    "plexLoginSuccess": "Connexion Plex réussie",
                    "plexLoginFailed": "Échec de la connexion Plex",
                    "plexServerSaved": "Serveur Plex enregistré",
                    "plexServerDiscovering": "Recherche du serveur Plex…",
                    "plexServerDiscoverFailed": "Impossible de détecter automatiquement le serveur Plex",
                    "discoverServer": "Détecter le serveur Plex",
                    "selectServer": "Choisir le serveur Plex",
                    "selectServerHelp": "Choisissez local/direct si l’appareil Lampa est sur le même réseau. Remote/direct fonctionne seulement si Plex Remote Access est configuré et joignable directement. Relay est un secours via les serveurs Plex : cela peut être plus lent et la lecture peut ne pas toujours fonctionner.",
                    "serverSelected": "Serveur Plex sélectionné",
                    "localConnection": "local",
                    "remoteConnection": "distant",
                    "relayConnection": "relay",
                    "remoteDirectWarning": "nécessite Plex Remote Access",
                    "relayWarning": "secours, peut être lent",
                    "directConnection": "direct",
                    "recommendedConnection": "Recommandé",
                    "clearToken": "Effacer le token Plex",
                    "clearTokenDone": "Token Plex effacé",
                    "clearPlexAccess": "Supprimer l’accès Plex",
                    "clearPlexAccessDone": "Token, serveur et données de connexion Plex effacés",
                    "matchLimit": "Nombre maximal de résultats",
                    "exactYear": "Année exacte uniquement",
                    "clientId": "Identifiant client",
                    "debug": "Débogage",
                    "debugLogButton": "Journal de débogage",
                    "infoText": "Recommandé : connectez-vous avec Plex. Le plugin récupère le token et propose de choisir le serveur. La saisie manuelle du serveur et du token reste disponible en secours.",
                    "baseDescription": "Format : http://IP:32400. Exemple : http://192.168.1.10:32400",
                    "tokenDescription": "Token personnel d’accès Plex. Ne le publiez pas.",
                    "tokenHelpText": "Plex Web → ouvrez un film/épisode → ⋯ → Get Info → View XML → copiez X-Plex-Token.",
                    "clientDescription": "Nom technique du client pour les requêtes Plex. Gardez généralement la valeur par défaut.",
                    "limitDescription": "Nombre de correspondances Plex à afficher. Recommandé : 5.",
                    "exactYearDescription": "Réduit les faux résultats lorsque l’année est connue.",
                    "debugDescription": "À activer uniquement pour le diagnostic.",
                    "savedBase": "Serveur Plex enregistré",
                    "savedToken": "Token enregistré",
                    "savedClient": "Identifiant client enregistré",
                    "savedLimit": "Nombre maximal mis à jour",
                    "on": "ON",
                    "off": "OFF",
                    "tokenPlaceholder": "Saisissez le Plex token",
                    "currentConfigPrefix": "Plex",
                    "notSet": "non défini",
                    "present": "présent",
                    "missing": "manquant",
                    "connectionOk": "Connexion Plex OK",
                    "connectionFail": "Échec de connexion Plex",
                    "debugTitle": "Plex Source debug — derniers journaux",
                    "debugEmpty": "Aucun journal pour le moment. Ouvrez une fiche film/série puis réessayez.",
                    "bugReportGuide": "Comment signaler un bug : activez Debug, reproduisez le problème, ouvrez ce log et appuyez sur Send report. Sur TV vous pouvez saisir la description à la voix/clavier écran. Si l’envoi est indisponible, utilisez Copy log ou une photo de l’écran.",
                    "bugReportFailed": "Échec de l’envoi",
                    "bugReportSent": "Report envoyé",
                    "bugReportPlaceholder": "Décrivez brièvement le problème",
                    "bugReportDescription": "Description du problème",
                    "sendBugReport": "Envoyer report",
                    "showFallback": "Série",
                    "episodeFallback": "Épisode",
                    "seasonFallback": "Saison",
                    "notPlayable": "Élément Plex trouvé, mais impossible à lire",
                    "emptyList": "Aucun élément disponible",
                    "loadingSeasons": "Chargement des saisons Plex…",
                    "loadingEpisodes": "Chargement des épisodes Plex…",
                    "seasonsLoadError": "Erreur de chargement des saisons Plex",
                    "episodesLoadError": "Erreur de chargement des épisodes Plex",
                    "tvLibrary": "Séries",
                    "episodesSuffix": "épisodes",
                    "watchedLabel": "Vu",
                    "unwatchedLabel": "Non vu",
                    "progressLabel": "En cours",
                    "episodeActionMode": "Action épisode",
                    "episodeActionModeDescription": "Choisissez l’action lors de la sélection d’un épisode.",
                    "modePlayLong": "OK lit, appui long ouvre les actions",
                    "modeActions": "OK ouvre les actions",
                    "actionPlay": "Lire",
                    "actionMarkWatched": "Marquer vu dans Plex",
                    "actionMarkUnwatched": "Marquer non vu dans Plex",
                    "markedWatched": "Marqué comme vu",
                    "markedUnwatched": "Marqué comme non vu",
                    "markError": "Échec de mise à jour Plex"
            },
            "it": {
                    "component": "Plex Source",
                    "loaded": "Plex Source caricato",
                    "statusTitle": "Stato",
                    "connectionTitle": "Connessione Plex",
                    "searchTitle": "Ricerca",
                    "advancedTitle": "Avanzate",
                    "manualSetupTitle": "Configurazione manuale (opzionale)",
                    "infoTitle": "Aiuto",
                    "enabled": "Plugin attivo",
                    "testConnection": "Verifica connessione",
                    "showConfig": "Stato configurazione",
                    "currentServer": "Server attuale",
                    "serverMode": "Server",
                    "serverModeSelected": "Server selezionato",
                    "serverModeAll": "Tutti i server",
                    "serverModeDescription": "Selezionato = un server Plex. Tutti = cerca su tutti i server disponibili; relay può essere più lento.",
                    "currentServerAllDescription": "Tutti i server · miglior connessione per server",
                    "notSelected": "non selezionato",
                    "plexBase": "Server Plex",
                    "plexToken": "Token Plex",
                    "tokenHelp": "Dove trovare il token",
                    "plexLogin": "Login con Plex",
                    "plexLoginDescription": "Consigliato: autorizza questo plugin su plex.tv e salva automaticamente il token.",
                    "plexLoginOpen": "Apri login Plex",
                    "plexLoginCode": "Codice",
                    "plexLoginWaiting": "In attesa autorizzazione Plex…",
                    "plexLoginSuccess": "Login Plex riuscito",
                    "plexLoginFailed": "Login Plex fallito",
                    "plexServerSaved": "Server Plex salvato",
                    "plexServerDiscovering": "Cerco server Plex…",
                    "plexServerDiscoverFailed": "Server Plex non rilevato automaticamente",
                    "discoverServer": "Rileva server Plex",
                    "selectServer": "Scegli server Plex",
                    "selectServerHelp": "Scegli local/direct se il dispositivo Lampa è nella stessa rete. Remote/direct funziona solo se Plex Remote Access è configurato e raggiungibile direttamente. Relay è un fallback tramite server Plex: può essere più lento e la riproduzione potrebbe non funzionare sempre.",
                    "serverSelected": "Server Plex selezionato",
                    "localConnection": "locale",
                    "remoteConnection": "remoto",
                    "relayConnection": "relay",
                    "remoteDirectWarning": "richiede Plex Remote Access",
                    "relayWarning": "fallback, può essere lento",
                    "directConnection": "diretta",
                    "recommendedConnection": "Consigliato",
                    "plexLoginExpired": "Login Plex scaduto",
                    "plexLoginHelp": "Scansiona il QR code o apri l’URL di login Plex, autorizza il plugin, poi torna in Lampa.",
                    "clearToken": "Cancella token Plex",
                    "clearTokenDone": "Token Plex cancellato",
                    "clearPlexAccess": "Rimuovi accesso Plex",
                    "clearPlexAccessDone": "Token, server e dati connessione Plex cancellati",
                    "matchLimit": "Numero massimo risultati",
                    "exactYear": "Solo anno esatto",
                    "clientId": "Identificatore client",
                    "debug": "Debug",
                    "debugLogButton": "Log debug",
                    "infoText": "Consigliato: accedi con Plex. Il plugin ottiene il token e ti fa scegliere il server. URL server e token manuali restano disponibili come fallback opzionale.",
                    "baseDescription": "Formato: http://IP:32400. Esempio: http://192.168.1.10:32400",
                    "tokenDescription": "Token personale Plex. Non pubblicarlo.",
                    "tokenHelpText": "Plex Web → apri film/episodio → ⋯ → Get Info → View XML → copia X-Plex-Token.",
                    "clientDescription": "Nome tecnico del client per richieste Plex. Di solito lascia il default.",
                    "limitDescription": "Quanti match Plex mostrare. Consigliato: 5.",
                    "exactYearDescription": "Riduce falsi positivi quando l’anno è noto.",
                    "debugDescription": "Attivalo solo per diagnostica.",
                    "savedBase": "Server Plex salvato",
                    "savedToken": "Token salvato",
                    "savedClient": "Identificatore salvato",
                    "savedLimit": "Numero massimo aggiornato",
                    "on": "ON",
                    "off": "OFF",
                    "tokenPlaceholder": "Inserisci token Plex",
                    "currentConfigPrefix": "Plex",
                    "notSet": "non impostato",
                    "present": "presente",
                    "missing": "mancante",
                    "connectionOk": "Connessione Plex OK",
                    "connectionFail": "Connessione Plex fallita",
                    "debugTitle": "Plex Source debug — ultimi log",
                    "debugEmpty": "Nessun log ancora. Apri una scheda film/serie e riprova.",
                    "copyDebugLog": "Copia log",
                    "debugLogCopied": "Log copiato",
                    "shareDebugLog": "Condividi log",
                    "openDebugLogText": "Apri log come testo",
                    "debugLogOpened": "Log aperto in una nuova scheda",
                    "dolbyVisionDirectFallback": "Dolby Vision Profile 5: transcode Plex disattivato, uso Direct Play.",
                    "unsafeTranscodeDirectFallback": "Transcode HLS Plex instabile per questo video, uso Direct Play.",
                    "openGithubIssue": "Apri issue GitHub",
                    "showBugReportQr": "QR bug report",
                    "bugReportQrTitle": "Scansiona il QR per aprire una issue GitHub",
                    "bugReportQrHint": "Back/Esc chiude. Allega una foto della schermata debug o incolla Copy log.",
                    "debugActions": "Azioni debug",
                    "debugPressOk": "Premi OK/Enter per le azioni.",
                    "bugReportFailed": "Invio report fallito",
                    "bugReportSent": "Report inviato",
                    "bugReportPlaceholder": "Descrivi brevemente il problema",
                    "bugReportDescription": "Descrizione problema",
                    "sendBugReport": "Invia report",
                    "bugReportGuide": "Come inviare un bug report: attiva Debug, riproduci il problema, apri questo log e premi Send report. Da TV puoi inserire la descrizione con comando vocale/tastiera a schermo. Se l’invio non è disponibile, usa Copia log o una foto dello schermo.",
                    "showFallback": "Serie",
                    "episodeFallback": "Episodio",
                    "seasonFallback": "Stagione",
                    "notPlayable": "Voce Plex trovata ma non riproducibile",
                    "emptyList": "Nessun elemento disponibile",
                    "loadingSeasons": "Carico stagioni Plex…",
                    "loadingEpisodes": "Carico episodi Plex…",
                    "seasonsLoadError": "Errore caricamento stagioni Plex",
                    "episodesLoadError": "Errore caricamento episodi Plex",
                    "tvLibrary": "Serie TV",
                    "episodesSuffix": "episodi",
                    "watchedLabel": "Visto",
                    "unwatchedLabel": "Non visto",
                    "progressLabel": "In corso",
                    "episodeActionMode": "Azione episodio",
                    "episodeActionModeDescription": "Scegli cosa succede quando selezioni un episodio.",
                    "modePlayLong": "OK riproduce, pressione lunga apre azioni",
                    "modeActions": "OK apre azioni",
                    "actionPlay": "Riproduci",
                    "actionMarkWatched": "Segna visto su Plex",
                    "actionMarkUnwatched": "Segna non visto su Plex",
                    "markedWatched": "Segnato visto",
                    "markedUnwatched": "Segnato non visto",
                    "markError": "Aggiornamento Plex fallito",
                    "syncProgressToPlex": "Sincronizza progresso su Plex",
                    "syncProgressToPlexDescription": "Sperimentale: invia a Plex il progresso del player integrato Lampa. Non funziona con player esterni.",
                    "optionsTitle": "Opzioni",
                    "playbackMode": "Modalità riproduzione",
                    "playbackModeAuto": "Auto",
                    "playbackModeDirect": "File diretto",
                    "playbackModeTranscode": "Transcodifica Plex HLS",
                    "playbackModeDescription": "Auto = transcodifica per relay, file diretto per connessioni direct. La transcodifica aiuta il player integrato Lampa con i codec.",
                    "transcodeProfile": "Profilo transcodifica",
                    "transcodeBrowserCompat": "Compatibilità browser (stessa risoluzione)",
                    "transcode1080p20": "1080p 20 Mbps",
                    "transcode1080p12": "1080p 12 Mbps",
                    "transcode720p8": "720p 8 Mbps",
                    "transcode720p4": "720p 4 Mbps",
                    "transcode480p2": "480p 2 Mbps",
                    "transcodeProfileDescription": "Usato solo con transcodifica Plex / Auto relay.",
                    "resumePlayback": "Continua riproduzione",
                    "resumeFrom": "Continua da",
                    "playFromStart": "Riproduci dall'inizio"
            }
    };

    function langCode() {
        var raw = '';
        try { raw = Lampa.Storage.get('language', '') || Lampa.Storage.get('lang', '') || ''; } catch (e) {}
        try { raw = raw || (window.lampa_settings && (window.lampa_settings.lang || window.lampa_settings.language)) || ''; } catch (e2) {}
        raw = String(raw || '').toLowerCase().split('-')[0];
        return I18N[raw] ? raw : 'en';
    }

    function t(key) {
        var pack = I18N[langCode()] || I18N.en;
        return pack[key] || I18N.en[key] || key;
    }

    function settings() {
        function get(key, fallback) {
            try {
                var value = Lampa.Storage.get(PLUGIN_NS + '_' + key, fallback);
                return value === undefined || value === null ? fallback : value;
            }
            catch (e) { return fallback; }
        }
        function boolValue(key, fallback) {
            var value = get(key, fallback);
            if (value === true || value === 'true' || value === '1' || value === 1) return true;
            if (value === false || value === 'false' || value === '0' || value === 0) return false;
            return !!fallback;
        }
        return {
            enabled: boolValue('enabled', DEFAULTS.enabled),
            plexBase: String(get('plexBase', DEFAULTS.plexBase) || '').trim().replace(/\/$/, ''),
            plexToken: String(get('plexToken', DEFAULTS.plexToken) || '').trim(),
            plexServerName: String(get('plexServerName', DEFAULTS.plexServerName) || '').trim(),
            plexConnectionMeta: String(get('plexConnectionMeta', DEFAULTS.plexConnectionMeta) || '').trim(),
            plexConnectionRelay: boolValue('plexConnectionRelay', DEFAULTS.plexConnectionRelay),
            serverMode: String(get('serverMode', DEFAULTS.serverMode) || DEFAULTS.serverMode),
            clientId: String(get('clientId', DEFAULTS.clientId) || DEFAULTS.clientId).trim(),
            matchLimit: parseInt(get('matchLimit', DEFAULTS.matchLimit), 10) || DEFAULTS.matchLimit,
            showOnlyExactYear: boolValue('showOnlyExactYear', DEFAULTS.showOnlyExactYear),
            debug: boolValue('debug', DEFAULTS.debug),
            episodeActionMode: String(get('episodeActionMode', DEFAULTS.episodeActionMode) || DEFAULTS.episodeActionMode),
            syncProgressToPlex: boolValue('syncProgressToPlex', DEFAULTS.syncProgressToPlex),
            playbackMode: 'transcode',
            transcodeProfile: DEFAULTS.transcodeProfile
        };
    }

    function save(next) {
        Object.keys(next).forEach(function (key) {
            try { Lampa.Storage.set(PLUGIN_NS + '_' + key, next[key]); }
            catch (e) {}
        });
    }

    function refreshSettingsSoon() {
        setTimeout(function () { try { addSettings(); } catch (e) {} }, 80);
    }

    function clearPlexAccess() {
        save({
            plexBase: '',
            plexToken: '',
            plexServerName: '',
            plexConnectionMeta: '',
            plexConnectionRelay: false
        });
        refreshSettingsSoon();
        noty(t('clearPlexAccessDone'));
    }

    function maskTokenUrl(url) {
        return String(url || '').replace(/(X-Plex-Token=)[^&]+/g, '$1***');
    }

    function boolFromParam(value, fallback) {
        if (value === true || value === 'true' || value === '1' || value === 1) return true;
        if (value === false || value === 'false' || value === '0' || value === 0) return false;
        return !!fallback;
    }

    function redactDebugValue(key, value) {
        var k = String(key || '').toLowerCase();
        if (k === 'plextoken' || k === 'token' || k === 'x-plex-token' || k.indexOf('auth') >= 0) return value ? '***' : value;
        if (typeof value === 'string') {
            return value.replace(/([?&]X-Plex-Token=)[^&\s]+/ig, '$1***')
                .replace(/(X-Plex-Token[=:]\s*)[^&\s,}]+/ig, '$1***');
        }
        return value;
    }

    function debugString(item) {
        if (typeof item === 'string') return redactDebugValue('', item);
        try { return JSON.stringify(item, redactDebugValue, 2); }
        catch (e) { return String(item); }
    }

    function log() {
        if (!DEBUG_ALWAYS && !settings().debug) return;
        var args = [].slice.call(arguments);
        try {
            DEBUG_BUFFER.push({ time: new Date().toLocaleTimeString(), args: args.map(debugString) });
            if (DEBUG_BUFFER.length > 80) DEBUG_BUFFER.shift();
            window.PlexSourceDebug = DEBUG_BUFFER;
        }
        catch (e) {}
        if (!window.console) return;
        console.log.apply(console, ['[plex-source]'].concat(args));
    }

    function debugText() {
        return DEBUG_BUFFER.length ? DEBUG_BUFFER.map(function (row) {
            return '[' + row.time + '] ' + row.args.join(' ');
        }).join('\n\n') : t('debugEmpty');
    }


    function defaultReportEndpoint() {
        try {
            if (window.location && window.location.hostname) {
                return window.location.protocol + '//' + window.location.hostname + ':8090/report';
            }
        }
        catch (e) {}
        return '';
    }

    function sendBugReport(description) {
        var endpoint = defaultReportEndpoint();
        if (!endpoint) return Promise.reject(new Error('missing-report-endpoint'));
        var cfg = settings();
        var payload = {
            plugin: 'plex-source',
            kind: 'bug-report',
            version: '0.2.32-beta-dev',
            createdAt: new Date().toISOString(),
            description: String(description || ''),
            connection: {
                base: cfg.plexBase,
                serverName: cfg.plexServerName,
                meta: cfg.plexConnectionMeta,
                relay: cfg.plexConnectionRelay
            },
            lampa: {
                href: (window.location && window.location.href) || '',
                userAgent: (window.navigator && window.navigator.userAgent) || ''
            },
            debugLog: debugText()
        };
        return fetch(endpoint, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(function (resp) {
            if (!resp.ok && resp.status !== 204) throw new Error('HTTP ' + resp.status);
            return true;
        });
    }

    function askAndSendBugReport() {
        promptText(t('bugReportDescription'), t('bugReportPlaceholder'), '', function (value) {
            sendBugReport(value).then(function () { noty(t('bugReportSent')); })
                .catch(function (err) { log('bug report send failed', err && (err.stack || err.message || err)); noty(t('bugReportFailed')); });
        });
    }

    function bugReportIssueUrl() {
        return 'https://github.com/boiler4/lampa-plex-source/issues/new?template=bug_report.yml';
    }

    function showBugReportQr() {
        var old = document.querySelector('.plex-source-qr-overlay');
        if (old) old.remove();
        var overlay = document.createElement('div');
        overlay.className = 'plex-source-overlay plex-source-qr-overlay';
        var box = document.createElement('div');
        box.className = 'plex-source-box';
        box.style.textAlign = 'center';
        box.style.maxWidth = '520px';
        var title = document.createElement('div');
        title.textContent = t('bugReportQrTitle');
        title.className = 'plex-source-title';
        title.style.marginBottom = '16px';
        var img = document.createElement('img');
        img.src = qrCodeUrl(bugReportIssueUrl());
        img.style.cssText = 'width:280px;height:280px;background:#fff;border-radius:12px;padding:10px;';
        var url = document.createElement('div');
        url.textContent = bugReportIssueUrl();
        url.style.cssText = 'font-size:12px;opacity:.75;margin-top:14px;word-break:break-all;';
        var hint = document.createElement('div');
        hint.textContent = t('bugReportQrHint');
        hint.className = 'plex-source-subtitle';
        hint.style.marginTop = '12px';
        function closeQr(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
                if (event.stopImmediatePropagation) event.stopImmediatePropagation();
            }
            document.removeEventListener('keydown', keyHandler, true);
            overlay.remove();
        }
        function keyHandler(event) {
            var key = event.key || event.code || '';
            var code = event.keyCode || event.which;
            if (key === 'Backspace' || key === 'Escape' || key === 'Esc' || key === 'BrowserBack' || key === 'Enter' || code === 8 || code === 13 || code === 27 || code === 461 || code === 10009) closeQr(event);
        }
        overlay.onclick = closeQr;
        box.onclick = function (event) { event.stopPropagation(); };
        box.appendChild(title);
        box.appendChild(img);
        box.appendChild(url);
        box.appendChild(hint);
        overlay.appendChild(box);
        document.addEventListener('keydown', keyHandler, true);
        document.body.appendChild(overlay);
    }

    function copyDebugLog() {
        var text = debugText();
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text);
            else window.prompt(t('copyDebugLog'), text);
            noty(t('debugLogCopied'));
        } catch (e) { window.prompt(t('copyDebugLog'), text); }
    }

    function shareDebugLog() {
        var text = debugText();
        var title = t('debugTitle');
        try {
            if (navigator.share) {
                navigator.share({ title: title, text: text }).catch(function (err) { log('debug share failed', err && (err.message || err)); });
                return;
            }
        }
        catch (e) { log('debug share unavailable', e && (e.message || e)); }
        openDebugLogText();
    }

    function openDebugLogText() {
        var text = debugText();
        try {
            var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            var url = URL.createObjectURL(blob);
            var opened = window.open(url, '_blank');
            if (opened) {
                noty(t('debugLogOpened'));
                setTimeout(function () { try { URL.revokeObjectURL(url); } catch (e) {} }, 60000);
                return;
            }
        }
        catch (e) { log('debug open text failed', e && (e.message || e)); }
        try {
            window.location.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
        }
        catch (e2) { window.prompt(t('copyDebugLog'), text); }
    }

    function showDebugActions(closeDebug) {
        var items = [
            { title: t('copyDebugLog'), action: 'copy' },
            { title: t('shareDebugLog'), action: 'share' },
            { title: t('openDebugLogText'), action: 'openText' },
            { title: t('showBugReportQr'), action: 'qr' },
            { title: t('openGithubIssue'), action: 'issue' },
            { title: t('sendBugReport'), action: 'send' },
            { title: 'Close', action: 'close' }
        ];
        function run(item) {
            if (item.action === 'copy') copyDebugLog();
            else if (item.action === 'share') shareDebugLog();
            else if (item.action === 'openText') openDebugLogText();
            else if (item.action === 'qr') showBugReportQr();
            else if (item.action === 'issue') { try { window.open(bugReportIssueUrl(), '_blank'); } catch (e) {} }
            else if (item.action === 'send') askAndSendBugReport();
            else if (item.action === 'close' && closeDebug) closeDebug();
        }
        if (showNativeSelect(t('debugTitle'), items, run, function () {})) return;
        showList(t('debugTitle'), t('debugActions'), items.map(function (item) { return { title: item.title, onClick: function () { closeOverlay(false); run(item); } }; }), { back: function () { closeOverlay(false); } });
    }

    function showDebugPanel() {
        var old = document.querySelector('.plex-source-debug-overlay');
        if (old) old.remove();
        var overlay = document.createElement('div');
        overlay.className = 'plex-source-debug-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:9999999;background:rgba(0,0,0,.86);display:flex;align-items:stretch;justify-content:stretch;color:#fff;font-family:Arial,sans-serif;';
        var box = document.createElement('div');
        box.className = 'plex-source-box';
        box.style.cssText = 'width:100%;max-width:none;max-height:none;margin:24px;box-sizing:border-box;overflow:auto;background:#171717;border-radius:18px;padding:22px;box-shadow:0 20px 80px rgba(0,0,0,.55);';
        function closeDebug() {
            document.removeEventListener('keydown', debugKeyHandler, true);
            overlay.remove();
        }
        function debugKeyHandler(event) {
            var key = event.key || event.code || '';
            var code = event.keyCode || event.which;
            var handled = false;
            if (key === 'Backspace' || key === 'Escape' || key === 'Esc' || key === 'BrowserBack' || code === 8 || code === 27 || code === 461 || code === 10009) { closeDebug(); handled = true; }
            else if (key === 'ArrowDown' || key === 'Down' || code === 40) { box.scrollTop += Math.max(80, Math.round(window.innerHeight * 0.25)); handled = true; }
            else if (key === 'ArrowUp' || key === 'Up' || code === 38) { box.scrollTop -= Math.max(80, Math.round(window.innerHeight * 0.25)); handled = true; }
            else if (key === 'Enter' || key === 'OK' || code === 13) { showDebugActions(closeDebug); handled = true; }
            if (handled) {
                event.preventDefault();
                event.stopPropagation();
                if (event.stopImmediatePropagation) event.stopImmediatePropagation();
                return false;
            }
        }
        var title = document.createElement('div');
        title.className = 'plex-source-title';
        title.textContent = t('debugTitle');
        box.appendChild(title);
        var guide = document.createElement('div');
        guide.className = 'plex-source-subtitle';
        guide.textContent = t('bugReportGuide') + ' ' + t('debugPressOk');
        box.appendChild(guide);
        var actions = document.createElement('div');
        actions.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;margin:14px 0 18px;';
        [
            { title: t('copyDebugLog'), run: copyDebugLog },
            { title: t('shareDebugLog'), run: shareDebugLog },
            { title: t('openDebugLogText'), run: openDebugLogText }
        ].forEach(function (action) {
            var btn = document.createElement('button');
            btn.textContent = action.title;
            btn.style.cssText = 'border:0;border-radius:10px;padding:10px 12px;background:#2b6cff;color:#fff;font-weight:600;';
            btn.onclick = function (event) { event.preventDefault(); event.stopPropagation(); action.run(); };
            actions.appendChild(btn);
        });
        box.appendChild(actions);
        var body = document.createElement('pre');
        body.textContent = debugText();
        body.style.cssText = 'font-family:monospace;font-size:12px;line-height:1.45;white-space:pre-wrap;margin:0;';
        box.appendChild(body);
        overlay.appendChild(box);
        overlay.addEventListener('click', function (event) { if (event.target === overlay) closeDebug(); });
        document.addEventListener('keydown', debugKeyHandler, true);
        document.body.appendChild(overlay);
    }

    function noty(text) {
        if (window.Lampa && Lampa.Noty) Lampa.Noty.show(text);
    }

    function plexAuthHeaders() {
        var s = settings();
        return {
            'Accept': 'application/json, application/xml;q=0.9, */*;q=0.8',
            'X-Plex-Product': 'Plex Source for Lampa',
            'X-Plex-Version': '0.2.32-beta-dev',
            'X-Plex-Client-Identifier': s.clientId || DEFAULTS.clientId,
            'X-Plex-Platform': 'Web',
            'X-Plex-Platform-Version': (window.navigator && window.navigator.userAgent) ? window.navigator.userAgent.slice(0, 80) : 'Lampa',
            'X-Plex-Device': 'Lampa',
            'X-Plex-Device-Name': 'Lampa Plex Source'
        };
    }

    function parsePlexAuthResponse(text) {
        try { return JSON.parse(text); }
        catch (jsonError) {
            var doc = new DOMParser().parseFromString(text, 'application/xml');
            var root = doc.documentElement;
            if (!root) return {};
            return {
                id: root.getAttribute('id'),
                code: root.getAttribute('code'),
                authToken: root.getAttribute('authToken'),
                qr: root.getAttribute('qr')
            };
        }
    }

    function createPlexPin() {
        return fetch('https://plex.tv/api/v2/pins', {
            method: 'POST',
            mode: 'cors',
            headers: plexAuthHeaders()
        }).then(function (resp) {
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            return resp.text();
        }).then(parsePlexAuthResponse);
    }

    function checkPlexPin(id) {
        return fetch('https://plex.tv/api/v2/pins/' + encodeURIComponent(id), {
            method: 'GET',
            mode: 'cors',
            headers: plexAuthHeaders()
        }).then(function (resp) {
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            return resp.text();
        }).then(parsePlexAuthResponse);
    }

    function plexAuthHeadersWithToken(token) {
        var headers = plexAuthHeaders();
        headers['Accept'] = 'application/xml, application/json;q=0.9, */*;q=0.8';
        headers['X-Plex-Token'] = token;
        return headers;
    }

    function parsePlexResources(text) {
        var doc = new DOMParser().parseFromString(text, 'application/xml');
        return Array.prototype.slice.call(doc.querySelectorAll('Device')).filter(function (device) {
            return String(device.getAttribute('provides') || '').indexOf('server') >= 0;
        }).map(function (device) {
            return {
                name: device.getAttribute('name') || device.getAttribute('clientIdentifier') || 'Plex',
                machineIdentifier: device.getAttribute('clientIdentifier') || device.getAttribute('machineIdentifier') || device.getAttribute('name') || '',
                owned: device.getAttribute('owned') === '1' || device.getAttribute('owned') === 'true',
                connections: Array.prototype.slice.call(device.querySelectorAll('Connection')).map(function (c) {
                    return {
                        uri: String(c.getAttribute('uri') || '').replace(/\/$/, ''),
                        local: c.getAttribute('local') === '1' || c.getAttribute('local') === 'true',
                        relay: c.getAttribute('relay') === '1' || c.getAttribute('relay') === 'true',
                        protocol: c.getAttribute('protocol') || ''
                    };
                }).filter(function (c) { return !!c.uri; })
            };
        }).filter(function (server) { return server.connections.length > 0; });
    }

    function bestPlexConnection(servers) {
        if (!servers || !servers.length) return null;
        servers.sort(function (a, b) { return (b.owned ? 1 : 0) - (a.owned ? 1 : 0); });
        var prefs = [
            function (c) { return c.local && !c.relay && c.protocol === 'https'; },
            function (c) { return c.local && !c.relay; },
            function (c) { return !c.relay && c.protocol === 'https'; },
            function (c) { return !c.relay; },
            function (c) { return true; }
        ];
        for (var sidx = 0; sidx < servers.length; sidx += 1) {
            for (var pidx = 0; pidx < prefs.length; pidx += 1) {
                for (var cidx = 0; cidx < servers[sidx].connections.length; cidx += 1) {
                    var candidate = servers[sidx].connections[cidx];
                    if (prefs[pidx](candidate)) return { server: servers[sidx], connection: candidate };
                }
            }
        }
        return null;
    }

    function bestConnectionForServer(server) {
        if (!server || !server.connections || !server.connections.length) return null;
        var choices = server.connections.map(function (connection) { return { server: server, connection: connection }; });
        choices.sort(function (a, b) { return connectionScore(b) - connectionScore(a); });
        return choices[0] || null;
    }

    function cacheKeyForToken(token) {
        token = String(token || '');
        return token ? (token.length + ':' + token.slice(-6)) : '';
    }

    function testPlexTarget(target) {
        return fetchXmlFrom(target, '/identity', {}, 1800).then(function (doc) {
            var m = doc.querySelector('MediaContainer');
            return {
                ok: true,
                target: target,
                machineIdentifier: attr(m, 'machineIdentifier'),
                friendlyName: attr(m, 'friendlyName')
            };
        });
    }

    function pickWorkingTargets(candidates, cacheKey) {
        var byServer = {};
        candidates.forEach(function (target) {
            var key = target.serverKey || target.serverName || target.base;
            if (!byServer[key]) byServer[key] = [];
            byServer[key].push(target);
        });

        return Promise.all(Object.keys(byServer).map(function (key) {
            var list = byServer[key];
            function fallbackTarget() {
                for (var i = 0; i < list.length; i += 1) {
                    if (list[i].relay) return list[i];
                }
                return list[0] || null;
            }
            function tryAt(index) {
                if (index >= list.length) {
                    var fallback = fallbackTarget();
                    if (fallback) {
                        fallback.validationFallback = true;
                        log('target validation fallback', { server: fallback.serverName, base: fallback.base, relay: fallback.relay });
                    }
                    return Promise.resolve(fallback);
                }
                return testPlexTarget(list[index]).then(function (result) {
                    log('target validated', { server: list[index].serverName, base: list[index].base, relay: list[index].relay, machineIdentifier: result.machineIdentifier });
                    return list[index];
                }).catch(function (err) {
                    log('target validation failed', { server: list[index].serverName, base: list[index].base, relay: list[index].relay, error: err && (err.message || err) });
                    return tryAt(index + 1);
                });
            }
            return tryAt(0);
        })).then(function (targets) {
            targets = targets.filter(Boolean);
            if (targets.length) TARGET_CACHE = { key: cacheKey, expiresAt: Date.now() + 10 * 60 * 1000, targets: targets };
            return targets;
        });
    }

    function activePlexTargets() {
        var s = settings();
        if (s.serverMode !== 'all') {
            if (!s.plexBase || !s.plexToken) return Promise.reject(new Error('missing-config'));
            return Promise.resolve([{ base: s.plexBase, token: s.plexToken, serverName: s.plexServerName || 'Plex', relay: !!s.plexConnectionRelay, meta: s.plexConnectionMeta || s.plexBase }]);
        }
        if (!s.plexToken) return Promise.reject(new Error('missing-token'));
        var cacheKey = cacheKeyForToken(s.plexToken);
        if (TARGET_CACHE.key === cacheKey && TARGET_CACHE.expiresAt > Date.now() && TARGET_CACHE.targets.length) {
            log('active Plex targets from cache', TARGET_CACHE.targets.map(function (target) { return { name: target.serverName, base: target.base, relay: target.relay, meta: target.meta }; }));
            return Promise.resolve(TARGET_CACHE.targets);
        }
        return listPlexServers(s.plexToken).then(function (servers) {
            var targets = [];
            var seen = {};
            servers.forEach(function (server) {
                var key = server.machineIdentifier || server.name || '';
                if (!key) key = server.connections && server.connections[0] && server.connections[0].uri;
                if (!key || seen[key]) return;
                seen[key] = true;
                var choices = (server.connections || []).map(function (connection) { return { server: server, connection: connection }; });
                choices.sort(function (a, b) { return connectionScore(b) - connectionScore(a); });
                choices.forEach(function (choice) {
                    if (!choice.connection || !choice.connection.uri) return;
                    targets.push({
                        base: choice.connection.uri.replace(/\/$/, ''),
                        token: s.plexToken,
                        serverName: server.name || 'Plex',
                        serverKey: key,
                        relay: !!choice.connection.relay,
                        meta: connectionMeta(choice.connection, false)
                    });
                });
            });
            if (!targets.length && s.plexBase) targets.push({ base: s.plexBase, token: s.plexToken, serverName: s.plexServerName || 'Plex', relay: !!s.plexConnectionRelay, meta: s.plexConnectionMeta || s.plexBase });
            if (!targets.length) throw new Error('no-server');
            log('active Plex target candidates', targets.map(function (target) { return { name: target.serverName, base: target.base, relay: target.relay, meta: target.meta }; }));
            return pickWorkingTargets(targets, cacheKey).then(function (working) {
                if (working.length) return working;
                log('target validation found no working targets; falling back to candidates');
                return targets;
            });
        });
    }

    function listPlexServers(token) {
        token = String(token || settings().plexToken || '').trim();
        if (!token) return Promise.reject(new Error('missing-token'));
        return fetch('https://plex.tv/api/resources?includeHttps=1&includeRelay=1', {
            method: 'GET',
            mode: 'cors',
            headers: plexAuthHeadersWithToken(token)
        }).then(function (resp) {
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            return resp.text();
        }).then(parsePlexResources);
    }

    function connectionScore(choice) {
        var c = choice.connection || {};
        var score = 0;
        if (c.local) score += 100;
        if (!c.relay) score += 30;
        if (c.protocol === 'https') score += 10;
        if (choice.server && choice.server.owned) score += 5;
        return score;
    }

    function shortUri(uri) {
        try {
            var u = new URL(uri);
            return u.protocol + '//' + u.host;
        }
        catch (e) { return String(uri || '').replace(/^https?:\/\//, '').slice(0, 60); }
    }

    function connectionMeta(connection, recommended) {
        var parts = [];
        if (recommended) parts.push(t('recommendedConnection'));
        parts.push(connection.local ? t('localConnection') : t('remoteConnection'));
        parts.push(connection.relay ? t('relayConnection') : t('directConnection'));
        if (!connection.local && !connection.relay) parts.push(t('remoteDirectWarning'));
        if (connection.relay) parts.push(t('relayWarning'));
        if (connection.protocol) parts.push(connection.protocol.toUpperCase());
        parts.push(shortUri(connection.uri));
        return parts.join(' · ');
    }

    function savePlexServerChoice(choice) {
        if (!choice || !choice.connection || !choice.connection.uri) throw new Error('no-server');
        save({ plexBase: choice.connection.uri.replace(/\/$/, ''), plexServerName: choice.server.name || 'Plex', plexConnectionMeta: connectionMeta(choice.connection, false), plexConnectionRelay: !!choice.connection.relay });
        log('Plex server selected', { name: choice.server.name, uri: choice.connection.uri, local: choice.connection.local, relay: choice.connection.relay, meta: connectionMeta(choice.connection, false) });
        refreshSettingsSoon();
        return choice;
    }

    function choosePlexServer(token) {
        return listPlexServers(token).then(function (servers) {
            var choices = [];
            servers.forEach(function (server) {
                server.connections.forEach(function (connection) {
                    choices.push({ server: server, connection: connection });
                });
            });
            choices.sort(function (a, b) { return connectionScore(b) - connectionScore(a); });
            if (!choices.length) throw new Error('no-server');
            if (choices.length === 1) return savePlexServerChoice(choices[0]);
            return new Promise(function (resolve, reject) {
                showList(t('selectServer'), t('selectServerHelp'), choices.map(function (choice, index) {
                    return {
                        title: (index === 0 ? '★ ' : '') + (choice.server.name || 'Plex'),
                        meta: connectionMeta(choice.connection, index === 0),
                        onClick: function () {
                            closeOverlay(false);
                            SELECT_SERVER_COOLDOWN_UNTIL = Date.now ? Date.now() + 1200 : 0; try { resolve(savePlexServerChoice(choice)); }
                            catch (e) { reject(e); }
                        }
                    };
                }), { back: function () { closeOverlay(false); reject(new Error('cancelled')); } });
            });
        });
    }

    function discoverPlexServer(token) {
        return listPlexServers(token).then(function (servers) {
            var best = bestPlexConnection(servers);
            return savePlexServerChoice(best);
        });
    }

    function plexOauthUrl(code) {
        var h = plexAuthHeaders();
        var params = new URLSearchParams();
        params.set('clientID', h['X-Plex-Client-Identifier']);
        params.set('context[device][product]', h['X-Plex-Product']);
        params.set('context[device][version]', h['X-Plex-Version']);
        params.set('context[device][platform]', h['X-Plex-Platform']);
        params.set('context[device][platformVersion]', h['X-Plex-Platform-Version']);
        params.set('context[device][device]', h['X-Plex-Device']);
        params.set('context[device][deviceName]', h['X-Plex-Device-Name']);
        params.set('code', code);
        return 'https://app.plex.tv/auth/#!?' + params.toString();
    }

    function qrCodeUrl(value) {
        return 'https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=' + encodeURIComponent(value);
    }

    function showPlexLoginOverlay(pin, url, onClose) {
        var old = document.querySelector('.plex-source-login-overlay');
        if (old) old.remove();
        var closed = false;
        var overlay = document.createElement('div');
        overlay.className = 'plex-source-login-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:9999999;background:rgba(0,0,0,.86);color:#fff;font-family:Arial,sans-serif;padding:24px;overflow:auto;text-align:center;';
        function finishClose() {
            if (closed) return;
            closed = true;
            document.removeEventListener('keydown', loginKeyHandler, true);
            overlay.remove();
            if (onClose) onClose();
        }
        function loginKeyHandler(event) {
            var key = event.key || event.code || '';
            var code = event.keyCode || event.which;
            if (key === 'Backspace' || key === 'Escape' || key === 'Esc' || key === 'BrowserBack' || code === 8 || code === 27 || code === 461 || code === 10009) {
                event.preventDefault();
                event.stopPropagation();
                if (event.stopImmediatePropagation) event.stopImmediatePropagation();
                finishClose();
                return false;
            }
        }
        var close = document.createElement('button');
        close.textContent = 'Close';
        close.setAttribute('tabindex', '0');
        close.style.cssText = 'position:fixed;top:14px;right:14px;z-index:2;padding:14px 18px;border-radius:8px;border:0;font-size:18px;font-weight:bold;';
        close.onclick = finishClose;
        overlay.appendChild(close);
        var title = document.createElement('div');
        title.textContent = t('plexLogin');
        title.style.cssText = 'font-size:26px;font-weight:bold;margin:18px 0 10px;';
        overlay.appendChild(title);
        var help = document.createElement('div');
        help.textContent = t('plexLoginHelp');
        help.style.cssText = 'font-size:16px;opacity:.9;max-width:760px;margin:0 auto 20px;line-height:1.35;';
        overlay.appendChild(help);
        var img = document.createElement('img');
        img.src = qrCodeUrl(url);
        img.alt = 'Plex QR';
        img.style.cssText = 'width:240px;height:240px;background:#fff;padding:10px;border-radius:10px;margin:10px auto;display:block;';
        img.onerror = function () {
            if (pin.qr && img.src !== pin.qr) img.src = pin.qr;
            else img.style.display = 'none';
        };
        overlay.appendChild(img);
        var linkShort = document.createElement('div');
        linkShort.textContent = 'https://plex.tv/link';
        linkShort.style.cssText = 'font-size:20px;font-weight:bold;margin:10px 0 2px;';
        overlay.appendChild(linkShort);
        var code = document.createElement('div');
        code.textContent = t('plexLoginCode') + ': ' + (pin.code || '');
        code.style.cssText = 'font-size:22px;font-weight:bold;letter-spacing:1px;margin:16px 0;';
        overlay.appendChild(code);
        var link = document.createElement('div');
        link.textContent = url;
        link.style.cssText = 'font-size:13px;word-break:break-all;opacity:.85;max-width:900px;margin:12px auto;';
        overlay.appendChild(link);
        var open = document.createElement('button');
        open.textContent = t('plexLoginOpen');
        open.style.cssText = 'padding:12px 18px;border-radius:8px;border:0;margin:12px;font-weight:bold;';
        open.onclick = function () { try { window.open(url, '_blank'); } catch (e) {} };
        overlay.appendChild(open);
        var status = document.createElement('div');
        status.className = 'plex-source-login-status';
        status.textContent = t('plexLoginWaiting');
        status.style.cssText = 'margin-top:18px;font-size:16px;';
        overlay.appendChild(status);
        overlay.addEventListener('click', function (event) { if (event.target === overlay) finishClose(); });
        document.addEventListener('keydown', loginKeyHandler, true);
        document.body.appendChild(overlay);
        try { close.focus(); } catch (e) {}
        return {
            close: finishClose,
            status: function (text) { status.textContent = text; }
        };
    }

    function startPlexLogin() {
        var cancelled = false;
        noty(t('plexLoginWaiting'));
        createPlexPin().then(function (pin) {
            if (!pin || !pin.id || !pin.code) throw new Error('missing-pin');
            var url = 'https://plex.tv/link';
            var ui = showPlexLoginOverlay(pin, url, function () { cancelled = true; });
            var started = Date.now();
            function poll() {
                if (cancelled) return;
                if (Date.now() - started > 120000) {
                    ui.status(t('plexLoginExpired'));
                    noty(t('plexLoginExpired'));
                    return;
                }
                checkPlexPin(pin.id).then(function (state) {
                    if (state && state.authToken) {
                        var token = String(state.authToken || '').trim();
                        save({ plexToken: token });
                        ui.status(t('plexServerDiscovering'));
                        ui.close();
                        noty(t('plexServerDiscovering'));
                        choosePlexServer(token).then(function (best) {
                            noty(t('serverSelected') + ': ' + best.connection.uri);
                        }).catch(function (discoverErr) {
                            log('Plex server select failed', discoverErr && (discoverErr.stack || discoverErr.message || discoverErr));
                            noty(t('plexLoginSuccess') + ' / ' + t('plexServerDiscoverFailed'));
                        });
                        return;
                    }
                    setTimeout(poll, 2000);
                }).catch(function (err) {
                    log('Plex login poll failed', err && (err.stack || err.message || err));
                    setTimeout(poll, 3000);
                });
            }
            poll();
        }).catch(function (err) {
            log('Plex login failed', err && (err.stack || err.message || err));
            noty(t('plexLoginFailed'));
        });
    }

    function plexHeaders(s) {
        return {
            'Accept': 'application/xml',
            'X-Plex-Token': s.plexToken,
            'X-Plex-Product': 'Plex Source for Lampa',
            'X-Plex-Version': '0.2.32-beta-dev',
            'X-Plex-Client-Identifier': s.clientId || DEFAULTS.clientId
        };
    }

    function targetSettings(target) {
        var s = settings();
        return {
            plexBase: (target && target.base) || s.plexBase,
            plexToken: (target && target.token) || s.plexToken,
            plexConnectionRelay: target && typeof target.relay !== 'undefined' ? !!target.relay : !!s.plexConnectionRelay,
            clientId: s.clientId || DEFAULTS.clientId
        };
    }

    function plexUrl(path, params) {
        var s = settings();
        var query = new URLSearchParams(params || {});
        query.set('X-Plex-Token', s.plexToken);
        return s.plexBase + path + (query.toString() ? '?' + query.toString() : '');
    }

    function fetchXml(path, params) {
        var s = settings();
        if (!s.plexBase || !s.plexToken) return Promise.reject(new Error('missing-config'));
        return fetchXmlFrom({ base: s.plexBase, token: s.plexToken }, path, params);
    }

    function fetchXmlFrom(target, path, params, timeoutMs) {
        var s = targetSettings(target);
        if (!s.plexBase || !s.plexToken) return Promise.reject(new Error('missing-config'));
        var query = new URLSearchParams(params || {});
        var url = s.plexBase + path + (query.toString() ? '?' + query.toString() : '');
        var controller = window.AbortController ? new AbortController() : null;
        var timer = controller ? setTimeout(function () { try { controller.abort(); } catch (e) {} }, timeoutMs || 4500) : null;
        var options = { method: 'GET', mode: 'cors', headers: plexHeaders(s) };
        if (controller) options.signal = controller.signal;
        var request = fetch(url, options);
        if (request.finally) request = request.finally(function () { if (timer) clearTimeout(timer); });
        return request.then(function (resp) {
                if (!resp.ok) throw new Error('HTTP ' + resp.status);
                return resp.text();
            })
            .then(function (text) {
                return new DOMParser().parseFromString(text, 'application/xml');
            });
    }

    function plexCommand(path, params) {
        var s = settings();
        if (!s.plexBase || !s.plexToken) return Promise.reject(new Error('missing-config'));
        return plexCommandFrom({ base: s.plexBase, token: s.plexToken }, path, params);
    }

    function plexCommandFrom(target, path, params) {
        var s = targetSettings(target);
        if (!s.plexBase || !s.plexToken) return Promise.reject(new Error('missing-config'));
        var query = new URLSearchParams(params || {});
        query.set('X-Plex-Token', s.plexToken);
        var url = s.plexBase + path + (query.toString() ? '?' + query.toString() : '');
        return fetch(url, { method: 'GET', mode: 'cors', headers: plexHeaders(s) }).then(function (resp) {
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            return resp.text();
        });
    }

    function nodes(root, selector) {
        return Array.prototype.slice.call(root.querySelectorAll(selector));
    }

    function attr(node, name) {
        return node ? (node.getAttribute(name) || '') : '';
    }

    function cleanTitle(value) {
        return String(value || '').toLowerCase().replace(/[^\w]+/g, ' ').replace(/\s+/g, ' ').trim();
    }

    function isShow(card) {
        if (!card) return false;
        if (card.media_type === 'tv' || card.method === 'tv' || card.type === 'tv') return true;
        if (card.original_name || card.first_air_date || card.number_of_seasons || card.number_of_episodes) return true;
        return false;
    }

    function titleFrom(card) {
        return (card && (card.original_title || card.original_name || card.title || card.name)) || '';
    }

    function localTitleFrom(card) {
        return (card && (card.title || card.name || card.original_title || card.original_name)) || '';
    }

    function yearFrom(card) {
        var raw = (card && (card.release_date || card.first_air_date)) || '';
        return raw ? String(raw).slice(0, 4) : '';
    }

    function guidList(video) {
        return nodes(video, 'Guid').map(function (g) { return attr(g, 'id'); }).filter(Boolean);
    }

    function scoreVideo(video, card) {
        var guids = guidList(video);
        var score = 0;
        var wanted = cleanTitle(localTitleFrom(card));
        var original = cleanTitle(titleFrom(card));
        var found = cleanTitle(attr(video, 'title'));
        var year = yearFrom(card);

        if (card.imdb_id && guids.indexOf('imdb://' + card.imdb_id) >= 0) score += 100;
        if (card.id && guids.indexOf('tmdb://' + card.id) >= 0) score += 90;
        if (card.tvdb_id && guids.indexOf('tvdb://' + card.tvdb_id) >= 0) score += 80;
        if (wanted && found === wanted) score += 40;
        else if (original && found === original) score += 35;
        else if (wanted && found.indexOf(wanted) >= 0) score += 15;
        else if (original && found.indexOf(original) >= 0) score += 12;
        if (year && attr(video, 'year')) {
            var diff = Math.abs(parseInt(attr(video, 'year'), 10) - parseInt(year, 10));
            if (diff === 0) score += 20;
            else if (diff === 1) score += 8;
            else if (settings().showOnlyExactYear) score -= 100;
        }
        return score;
    }

    function mapStreams(part, type) {
        if (!part) return [];
        return nodes(part, 'Stream').map(function (stream) {
            return {
                id: attr(stream, 'id'),
                index: attr(stream, 'index'),
                streamType: attr(stream, 'streamType'),
                codec: attr(stream, 'codec'),
                language: attr(stream, 'language'),
                languageCode: attr(stream, 'languageCode'),
                title: attr(stream, 'title'),
                displayTitle: attr(stream, 'displayTitle'),
                selected: attr(stream, 'selected'),
                forced: attr(stream, 'forced'),
                format: attr(stream, 'format'),
                key: attr(stream, 'key'),
                channels: attr(stream, 'channels'),
                DOVIPresent: attr(stream, 'DOVIPresent'),
                DOVIProfile: attr(stream, 'DOVIProfile')
            };
        }).filter(function (stream) { return !type || stream.streamType === String(type); });
    }

    function mediaVersionLabel(media, part, index) {
        var bits = [];
        if (media && attr(media, 'optimizedForStreaming') === '1') bits.push('Optimized');
        if (media && attr(media, 'videoResolution')) bits.push(String(attr(media, 'videoResolution')).toUpperCase());
        if (media && attr(media, 'videoCodec')) bits.push(String(attr(media, 'videoCodec')).toUpperCase());
        if (media && attr(media, 'audioCodec')) bits.push(String(attr(media, 'audioCodec')).toUpperCase());
        if (media && attr(media, 'bitrate')) bits.push(formatBitrate(attr(media, 'bitrate')));
        if (!bits.length && typeof index !== 'undefined') bits.push('Version ' + (index + 1));
        return bits.join(' · ');
    }

    function mapVideoMedia(video, card, target, media, part, mediaIndex, partIndex) {
        var videoStreams = mapStreams(part, 1);
        var audioStreams = mapStreams(part, 2);
        var subtitleStreams = mapStreams(part, 3);
        return {
            score: scoreVideo(video, card),
            ratingKey: attr(video, 'ratingKey'),
            title: attr(video, 'title'),
            originalTitle: attr(video, 'originalTitle'),
            year: attr(video, 'year'),
            type: attr(video, 'type'),
            sectionTitle: attr(video, 'librarySectionTitle') || 'Library',
            parentRatingKey: attr(video, 'parentRatingKey'),
            parentTitle: attr(video, 'parentTitle'),
            parentIndex: attr(video, 'parentIndex'),
            grandparentRatingKey: attr(video, 'grandparentRatingKey'),
            grandparentTitle: attr(video, 'grandparentTitle'),
            index: attr(video, 'index'),
            thumb: attr(video, 'thumb'),
            duration: attr(video, 'duration'),
            viewCount: attr(video, 'viewCount'),
            viewOffset: attr(video, 'viewOffset'),
            lastViewedAt: attr(video, 'lastViewedAt'),
            resolution: media ? attr(media, 'videoResolution') : '',
            videoCodec: media ? attr(media, 'videoCodec') : '',
            audioCodec: media ? attr(media, 'audioCodec') : '',
            bitrate: media ? attr(media, 'bitrate') : '',
            container: media ? attr(media, 'container') : '',
            partKey: part ? attr(part, 'key') : '',
            file: part ? attr(part, 'file') : '',
            partId: part ? attr(part, 'id') : '',
            mediaId: media ? attr(media, 'id') : '',
            mediaIndex: typeof mediaIndex !== 'undefined' ? String(mediaIndex) : '0',
            partIndex: typeof partIndex !== 'undefined' ? String(partIndex) : '0',
            versionLabel: mediaVersionLabel(media, part, mediaIndex),
            optimizedForStreaming: (media && attr(media, 'optimizedForStreaming') === '1') || (part && attr(part, 'optimizedForStreaming') === '1') ? '1' : '',
            videoStreams: videoStreams,
            audioStreams: audioStreams,
            subtitleStreams: subtitleStreams,
            guids: guidList(video),
            plexBase: target && target.base,
            plexToken: target && target.token,
            plexServerName: target && target.serverName,
            plexServerKey: target && target.serverKey,
            plexConnectionRelay: target && target.relay,
            plexConnectionMeta: target && target.meta
        };
    }

    function mapVideo(video, card, target) {
        var media = video.querySelector('Media');
        var part = media ? media.querySelector('Part') : null;
        return mapVideoMedia(video, card, target, media, part, 0, 0);
    }

    function mapVideoVersions(video, card, target) {
        var medias = nodes(video, 'Media');
        if (!medias.length) return [mapVideo(video, card, target)];
        var out = [];
        medias.forEach(function (media, mediaIndex) {
            var parts = nodes(media, 'Part');
            if (!parts.length) out.push(mapVideoMedia(video, card, target, media, null, mediaIndex, 0));
            parts.forEach(function (part, partIndex) {
                out.push(mapVideoMedia(video, card, target, media, part, mediaIndex, partIndex));
            });
        });
        return out;
    }

    function findMatches(card) {
        var type = isShow(card) ? '2' : '1';
        var titles = [];
        [titleFrom(card), localTitleFrom(card)].forEach(function (t) {
            t = String(t || '').trim();
            if (t && titles.indexOf(t) < 0) titles.push(t);
        });
        if (!titles.length) { log('findMatches: no titles', debugCard(card)); return Promise.resolve([]); }
        log('findMatches:start', { type: type, titles: titles, card: debugCard(card) });

        return activePlexTargets().then(function (targets) {
            var jobs = [];
            targets.forEach(function (target) {
                titles.forEach(function (title) {
                    jobs.push(fetchXmlFrom(target, '/library/all', { type: type, title: title, includeGuids: '1' })
                        .then(function (doc) {
                            var selector = type === '2' ? 'Directory,Video' : 'Video';
                            var mapped = []; nodes(doc, selector).forEach(function (v) { mapped = mapped.concat(mapVideoVersions(v, card, target)); });
                            log('findMatches:query result', { server: target.serverName, base: target.base, title: title, type: type, selector: selector, count: mapped.length, mapped: mapped });
                            return mapped;
                        })
                        .catch(function (err) { log('match query failed', { server: target.serverName, title: title, error: err && (err.stack || err.message || err) }); return []; }));
                });
            });
            return Promise.all(jobs);
        }).then(function (groups) {
            var byKey = {};
            groups.forEach(function (items) {
                items.forEach(function (item) {
                    if (!item.ratingKey) return;
                    var key = (item.plexServerKey || item.plexBase || 'plex') + ':' + item.ratingKey + ':' + (item.mediaId || '') + ':' + (item.partId || item.partKey || '');
                    if (!byKey[key] || item.score > byKey[key].score) byKey[key] = item;
                });
            });
            return Object.keys(byKey).map(function (key) { return byKey[key]; })
                .filter(function (item) { return item.score > 0; })
                .sort(function (a, b) { return b.score - a.score; })
                .slice(0, settings().matchLimit);
        });
    }

    function itemTarget(item) {
        return item ? { base: item.plexBase, token: item.plexToken, serverName: item.plexServerName, serverKey: item.plexServerKey, relay: item.plexConnectionRelay, meta: item.plexConnectionMeta } : null;
    }

    function fetchSeasons(show) {
        var showRatingKey = show && show.ratingKey ? show.ratingKey : show;
        return fetchXmlFrom(itemTarget(show), '/library/metadata/' + encodeURIComponent(showRatingKey) + '/children', {})
            .then(function (doc) {
                return nodes(doc, 'Directory').map(function (season) {
                    return {
                        ratingKey: attr(season, 'ratingKey'),
                        title: attr(season, 'title') || (t('seasonFallback') + ' ' + attr(season, 'index')),
                        index: attr(season, 'index'),
                        leafCount: attr(season, 'leafCount'),
                        viewedLeafCount: attr(season, 'viewedLeafCount'),
                        thumb: attr(season, 'thumb'),
                        art: attr(season, 'art'),
                        plexBase: show && show.plexBase,
                        plexToken: show && show.plexToken,
                        plexServerName: show && show.plexServerName,
                        plexServerKey: show && show.plexServerKey,
                        plexConnectionRelay: show && show.plexConnectionRelay,
                        plexConnectionMeta: show && show.plexConnectionMeta
                    };
                }).filter(function (season) { return season.ratingKey; });
            });
    }

    function fetchEpisodes(season) {
        var seasonRatingKey = season && season.ratingKey ? season.ratingKey : season;
        return fetchXmlFrom(itemTarget(season), '/library/metadata/' + encodeURIComponent(seasonRatingKey) + '/children', { includeGuids: '1' })
            .then(function (doc) {
                var episodes = [];
                nodes(doc, 'Video').forEach(function (ep) { episodes = episodes.concat(mapVideoVersions(ep, {}, itemTarget(season))); });
                return episodes
                    .filter(function (ep) { return ep.ratingKey && ep.partKey; })
                    .sort(function (a, b) { return (parseInt(a.index, 10) || 0) - (parseInt(b.index, 10) || 0); });
            });
    }

    function enrichItemStreams(item) {
        if (!item || !item.ratingKey || (item._streamsEnriched || ((item.audioStreams || []).length || (item.subtitleStreams || []).length))) return Promise.resolve(item);
        return fetchXmlFrom(itemTarget(item), '/library/metadata/' + encodeURIComponent(item.ratingKey), {}).then(function (doc) {
            var videos = nodes(doc, 'Video');
            var variants = [];
            videos.forEach(function (video) { variants = variants.concat(mapVideoVersions(video, {}, itemTarget(item))); });
            var found = variants.find(function (v) {
                return (item.partId && v.partId === item.partId) || (item.partKey && v.partKey === item.partKey) || (item.mediaId && v.mediaId === item.mediaId);
            }) || variants[0];
            if (found) {
                ['videoStreams', 'audioStreams', 'subtitleStreams', 'partId', 'mediaId', 'mediaIndex', 'partIndex', 'optimizedForStreaming', 'versionLabel'].forEach(function (key) {
                    if (typeof found[key] !== 'undefined') item[key] = found[key];
                });
            }
            item._streamsEnriched = true;
            log('enriched Plex streams', { ratingKey: item.ratingKey, partId: item.partId, audio: (item.audioStreams || []).length, subtitles: (item.subtitleStreams || []).length });
            return item;
        }).catch(function (err) {
            log('enrich Plex streams failed', { ratingKey: item.ratingKey, error: err && (err.stack || err.message || err) });
            item._streamsEnriched = true;
            return item;
        });
    }

    function transcodeProfileParams(profile) {
        var profiles = {
            ios_compat: { directPlay: '0', directStream: '0', videoCodec: 'h264', audioCodec: 'aac', protocol: 'hls', maxVideoBitrate: '4000', videoBitrate: '4000', maxVideoWidth: '1280', maxVideoHeight: '720', mediaBufferSize: '102400', location: 'lan' },
            audio_compat: { directPlay: '0', directStream: '1', videoCodec: 'h264', audioCodec: 'mp3', protocol: 'hls' },
            browser_compat: { directPlay: '0', directStream: '0', videoCodec: 'h264', audioCodec: 'aac', protocol: 'hls' },
            p1080_20: { directPlay: '0', directStream: '0', videoCodec: 'h264', audioCodec: 'aac', maxVideoBitrate: '20000', videoBitrate: '20000', videoResolution: '1080', protocol: 'hls' },
            p1080_12: { directPlay: '0', directStream: '0', videoCodec: 'h264', audioCodec: 'aac', maxVideoBitrate: '12000', videoBitrate: '12000', videoResolution: '1080', protocol: 'hls' },
            p720_8: { directPlay: '0', directStream: '0', videoCodec: 'h264', audioCodec: 'aac', maxVideoBitrate: '8000', videoBitrate: '8000', videoResolution: '720', protocol: 'hls' },
            p720_4: { directPlay: '0', directStream: '0', videoCodec: 'h264', audioCodec: 'aac', maxVideoBitrate: '4000', videoBitrate: '4000', videoResolution: '720', protocol: 'hls' },
            p480_2: { directPlay: '0', directStream: '0', videoCodec: 'h264', audioCodec: 'aac', maxVideoBitrate: '2000', videoBitrate: '2000', videoResolution: '480', protocol: 'hls' }
        };
        return profiles[profile] || profiles.ios_compat;
    }

    function transcodeUrl(item, target, options) {
        if (!item || !item.ratingKey) return '';
        options = options || {};
        var cfg = settings();
        var profile = (options && options.transcodeProfile) || cfg.transcodeProfile;
        var sessionParts = [
            'lps',
            item.ratingKey || 'item',
            profile || 'browser',
            options.audioStreamID || 'a0',
            options.subtitleStreamID || 's0',
            options.sessionNonce || 'n0'
        ];
        var params = new URLSearchParams(Object.assign({
            path: '/library/metadata/' + item.ratingKey,
            mediaIndex: String(item.mediaIndex || '0'),
            partIndex: String(item.partIndex || '0'),
            fastSeek: '1',
            copyts: '1',
            subtitles: 'auto',
            session: sessionParts.join('-').replace(/[^a-zA-Z0-9_-]/g, ''),
            'X-Plex-Token': target.plexToken,
            'X-Plex-Client-Identifier': target.clientId || DEFAULTS.clientId,
            'X-Plex-Product': 'Plex Web',
            'X-Plex-Version': '0.2.32-beta-dev',
            'X-Plex-Platform': 'Chrome',
            'X-Plex-Platform-Version': '120',
            'X-Plex-Model': 'standalone',
            'X-Plex-Device': 'Chrome',
            'X-Plex-Device-Name': 'Lampa Plex Source',
            'X-Plex-Device-Screen-Resolution': '1920x1080,1920x1080'
        }, transcodeProfileParams(profile)));
        if (options.startOffsetMs && options.startOffsetMs > 0) params.set('offset', Math.round(options.startOffsetMs));
        if (options.audioStreamID) params.set('audioStreamID', options.audioStreamID);
        if (options.subtitleStreamID) params.set('subtitleStreamID', options.subtitleStreamID);
        log('Plex HLS web profile params', { ratingKey: item.ratingKey, mediaIndex: params.get('mediaIndex'), partIndex: params.get('partIndex'), directStream: params.get('directStream'), videoCodec: params.get('videoCodec'), audioCodec: params.get('audioCodec'), maxVideoBitrate: params.get('maxVideoBitrate'), videoBitrate: params.get('videoBitrate') || '', maxVideoWidth: params.get('maxVideoWidth') || '', maxVideoHeight: params.get('maxVideoHeight') || '', platform: params.get('X-Plex-Platform'), device: params.get('X-Plex-Device'), audioStreamID: params.get('audioStreamID') || '' });
        return target.plexBase + '/video/:/transcode/universal/start.m3u8?' + params.toString();
    }

    function currentPlayerOffsetMs() {
        try {
            var video = Lampa.PlayerVideo && Lampa.PlayerVideo.video ? Lampa.PlayerVideo.video() : null;
            if (video && video.currentTime) return Math.max(0, Math.round(video.currentTime * 1000));
        }
        catch (e) {}
        return 0;
    }

    function switchPlexTranscodeStream(item, target, options) {
        options = Object.assign({}, options || {});
        var liveOffset = currentPlayerOffsetMs();
        if (liveOffset > 0) options.startOffsetMs = liveOffset;
        var url = transcodeUrl(item, target, options);
        log('switch Plex transcode stream', { ratingKey: item && item.ratingKey, audioStreamID: options.audioStreamID, subtitleStreamID: options.subtitleStreamID, offset: options.startOffsetMs || 0 });
        try {
            if (Lampa.PlayerVideo && Lampa.PlayerVideo.destroy) Lampa.PlayerVideo.destroy(true);
            if (Lampa.PlayerVideo && Lampa.PlayerVideo.url) Lampa.PlayerVideo.url(url, true);
        }
        catch (e) { log('switch Plex transcode stream failed', e && (e.stack || e.message || e)); }
    }

    function shouldExposePlexTranscodeControls(target) {
        return !!target;
    }

    function plexAudioTracks(item, target, options) {
        if (!shouldExposePlexTranscodeControls(target) || shouldAvoidPlexTranscode(item) || !item || !item.audioStreams || !item.audioStreams.length) return null;
        return item.audioStreams.filter(function (stream) { return stream.id; }).map(function (stream, idx) {
            var label = stream.displayTitle || stream.title || stream.language || stream.languageCode || ('Audio ' + (idx + 1));
            return {
                index: idx,
                id: stream.id,
                language: stream.language || stream.languageCode || '',
                label: label,
                selected: stream.selected === '1',
                extra: { fourCC: stream.codec || '', channels: stream.channels || '' },
                onSelect: function () {
                    switchPlexTranscodeStream(item, target, Object.assign({}, options || {}, { audioStreamID: stream.id }));
                }
            };
        });
    }

    function plexSubtitleTracks(item, target) {
        if (!item || !item.subtitleStreams || !item.subtitleStreams.length) return null;
        var out = item.subtitleStreams.filter(function (stream) {
            return stream.key && /^(srt|ass|ssa|vtt)$/i.test(stream.codec || stream.format || '');
        }).map(function (stream, idx) {
            var label = stream.displayTitle || stream.title || stream.language || stream.languageCode || ('Subtitle ' + (idx + 1));
            return {
                index: idx,
                language: stream.language || stream.languageCode || '',
                label: label + (stream.forced === '1' ? ' forced' : ''),
                selected: stream.selected === '1',
                url: target.plexBase + stream.key + (stream.key.indexOf('?') >= 0 ? '&' : '?') + 'X-Plex-Token=' + encodeURIComponent(target.plexToken)
            };
        });
        return out.length ? out : null;
    }

    function dolbyVisionProfile(item) {
        var streams = item && item.videoStreams ? item.videoStreams : [];
        for (var i = 0; i < streams.length; i++) {
            if (streams[i].DOVIPresent === '1' || streams[i].DOVIProfile) return String(streams[i].DOVIProfile || '1');
        }
        return '';
    }

    function isKnownDirectFriendly(item) {
        var codec = String(item && item.videoCodec || '').toLowerCase();
        return codec === 'h264' || codec === 'avc1';
    }

    function shouldAvoidPlexTranscode(item) {
        return dolbyVisionProfile(item) === '5';
    }

    function shouldAudioCompatTranscode(item) {
        return isKnownDirectFriendly(item);
    }

    function transcodeAvoidReason(item) {
        if (dolbyVisionProfile(item) === '5') return 'dolby_vision_profile_5';
        return '';
    }

    function directStreamUrl(item, target) {
        if (!item || !item.partKey) return '';
        var s = targetSettings(target || itemTarget(item));
        return s.plexBase + item.partKey + (item.partKey.indexOf('?') >= 0 ? '&' : '?') + 'download=0&X-Plex-Token=' + encodeURIComponent(s.plexToken);
    }

    function setActiveTranscodeProfile(profile, label) {
        if (!profile) return;
        try { Lampa.Storage.set('plex_source_transcodeProfile', profile); }
        catch (e) { try { localStorage.setItem('plex_source_transcodeProfile', profile); } catch (e2) {} }
        log('Plex transcode profile selected', { profile: profile, label: label || '' });
    }

    function plexQualityMap(item, target, options) {
        options = options || {};
        if (!item || !item.ratingKey) return null;
        if (!shouldExposePlexTranscodeControls(target) || shouldAvoidPlexTranscode(item)) return qualityMap(item);
        return {
            'iOS HLS': {
                url: transcodeUrl(item, target, Object.assign({}, options, { transcodeProfile: 'ios_compat' })),
                label: 'ios_compat',
                profile: 'ios_compat',
                trigger: function () { setActiveTranscodeProfile('ios_compat', 'iOS HLS'); }
            }
        };
    }


    function streamUrl(item, options) {
        if (!item || !item.partKey) return '';
        var target = targetSettings(itemTarget(item));
        if (shouldExposePlexTranscodeControls(target) && !shouldAvoidPlexTranscode(item)) {
            return transcodeUrl(item, target, Object.assign({}, options || {}, { transcodeProfile: 'ios_compat' }));
        }
        return directStreamUrl(item, itemTarget(item));
    }

    function thumbUrl(path) {
        if (!path) return '';
        var item = arguments.length > 1 ? arguments[1] : null;
        var s = targetSettings(itemTarget(item));
        return s.plexBase + path + '?X-Plex-Token=' + encodeURIComponent(s.plexToken);
    }

    function formatBitrate(value) {
        var num = parseInt(value, 10);
        if (!num || isNaN(num)) return '';
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + ' Mbps';
    }

    function watchedInfo(item) {
        var duration = parseInt(item.duration || '0', 10) || 0;
        var offset = parseInt(item.viewOffset || '0', 10) || 0;
        var percent = duration && offset ? Math.round(offset / duration * 100) : 0;
        if (parseInt(item.viewCount || '0', 10) > 0) return { state: 'watched', label: '✓ ' + t('watchedLabel'), percent: 100 };
        if (percent > 0) return { state: 'progress', label: '◐ ' + t('progressLabel') + ' ' + percent + '%', percent: percent };
        return { state: 'unwatched', label: '○ ' + t('unwatchedLabel'), percent: 0 };
    }

    function qualityMap(item) {
        var url = streamUrl(item);
        if (!url) return null;
        var label = String(item.resolution || '1080').replace(/[^0-9]/g, '');
        var out = {};
        out[(label || '1080') + 'p'] = url;
        return out;
    }

    function timelineFor(card, item) {
        if (!Lampa.Timeline || !Lampa.Timeline.view || !Lampa.Utils || !Lampa.Utils.hash) return null;
        var mediaType = isShow(card) ? 'show' : 'movie';
        var id = item.ratingKey || card.id || titleFrom(card) || 'plex';
        try {
            return Lampa.Timeline.view(Lampa.Utils.hash(['plex-source', mediaType, id].join(':')));
        }
        catch (e) {
            log('timeline lookup failed', e && (e.message || e));
            return null;
        }
    }


    function plexProgressFrom(item, state, timeMs, durationMs) {
        if (!item || !item.ratingKey) return Promise.resolve(false);
        var ratingKey = String(item.ratingKey);
        var params = {
            ratingKey: ratingKey,
            key: '/library/metadata/' + ratingKey,
            identifier: 'com.plexapp.plugins.library',
            state: state || 'playing',
            time: Math.max(0, Math.round(timeMs || 0)),
            duration: Math.max(0, Math.round(durationMs || item.duration || 0))
        };
        return plexCommandFrom(itemTarget(item), '/:/timeline', params).then(function () { return true; });
    }

    function startPlexProgressSync(item) {
        if (!settings().syncProgressToPlex || !item || !item.ratingKey) return;
        ACTIVE_PROGRESS_SYNC = {
            item: item,
            lastSentAt: 0,
            lastTimeMs: 0,
            durationMs: parseInt(item.duration || '0', 10) || 0,
            startedAt: Date.now(),
            maxRealTimeMs: 0,
            scrobbled: false,
            stopped: false
        };
        log('Plex timeline sync started', { ratingKey: item.ratingKey, durationMs: ACTIVE_PROGRESS_SYNC.durationMs, title: item.title || item.grandparentTitle });
        sendPlexProgress('playing', 0, true);
    }

    function clearPlexProgressSync() {
        ACTIVE_PROGRESS_SYNC = null;
    }

    function sendPlexProgress(state, timeMs, force) {
        var sync = ACTIVE_PROGRESS_SYNC;
        if (!sync || !sync.item || !sync.item.ratingKey) return;
        var now = Date.now();
        timeMs = Math.max(0, Math.round(timeMs || sync.lastTimeMs || 0));
        sync.lastTimeMs = timeMs;
        if (!force && state === 'playing' && now - sync.lastSentAt < 10000) return;
        sync.lastSentAt = now;
        plexProgressFrom(sync.item, state, timeMs, sync.durationMs).then(function () {
            log('Plex timeline sync sent', { state: state, timeMs: timeMs, durationMs: sync.durationMs, ratingKey: sync.item.ratingKey });
        }).catch(function (err) {
            log('Plex timeline sync failed', { state: state, timeMs: timeMs, error: err && (err.stack || err.message || err) });
        });
    }

    function maybeScrobblePlexProgress(timeMs, durationMs) {
        var sync = ACTIVE_PROGRESS_SYNC;
        if (!sync || sync.scrobbled || !sync.item || !sync.item.ratingKey) return;
        durationMs = durationMs || sync.durationMs || 0;
        if (!durationMs || timeMs < Math.max(durationMs * 0.85, durationMs - 5 * 60 * 1000)) return;
        sync.scrobbled = true;
        plexCommandFrom(itemTarget(sync.item), '/:/scrobble', {
            key: sync.item.ratingKey,
            identifier: 'com.plexapp.plugins.library'
        }).then(function () {
            log('Plex progress sync scrobbled', { ratingKey: sync.item.ratingKey });
        }).catch(function (err) {
            log('Plex progress sync scrobble failed', err && (err.stack || err.message || err));
        });
    }

    function installPlexProgressSync() {
        if (PROGRESS_SYNC_INSTALLED || !Lampa.PlayerVideo || !Lampa.PlayerVideo.listener) return;
        PROGRESS_SYNC_INSTALLED = true;
        Lampa.PlayerVideo.listener.follow('timeupdate', function (e) {
            if (!ACTIVE_PROGRESS_SYNC) return;
            var currentMs = Math.round((e && e.current ? e.current : 0) * 1000);
            var durationMs = Math.round((e && e.duration ? e.duration : 0) * 1000) || ACTIVE_PROGRESS_SYNC.durationMs;
            ACTIVE_PROGRESS_SYNC.durationMs = durationMs || ACTIVE_PROGRESS_SYNC.durationMs;
            var elapsed = Date.now() - (ACTIVE_PROGRESS_SYNC.startedAt || Date.now());
            var suspiciousInstantEnd = durationMs && currentMs >= durationMs * 0.98 && (ACTIVE_PROGRESS_SYNC.maxRealTimeMs || 0) < 30000 && elapsed < 60000;
            if (suspiciousInstantEnd) {
                log('Plex progress ignored suspicious instant end', { ratingKey: ACTIVE_PROGRESS_SYNC.item && ACTIVE_PROGRESS_SYNC.item.ratingKey, currentMs: currentMs, durationMs: durationMs, maxRealTimeMs: ACTIVE_PROGRESS_SYNC.maxRealTimeMs || 0, elapsedMs: elapsed });
                return;
            }
            if (currentMs > (ACTIVE_PROGRESS_SYNC.maxRealTimeMs || 0) && (!durationMs || currentMs < durationMs * 0.98)) ACTIVE_PROGRESS_SYNC.maxRealTimeMs = currentMs;
            sendPlexProgress('playing', currentMs, false);
            maybeScrobblePlexProgress(currentMs, ACTIVE_PROGRESS_SYNC.durationMs);
        });
        Lampa.PlayerVideo.listener.follow('play', function () {
            if (ACTIVE_PROGRESS_SYNC) sendPlexProgress('playing', ACTIVE_PROGRESS_SYNC.lastTimeMs, true);
        });
        Lampa.PlayerVideo.listener.follow('pause', function () {
            if (ACTIVE_PROGRESS_SYNC) sendPlexProgress('paused', ACTIVE_PROGRESS_SYNC.lastTimeMs, true);
        });
        Lampa.PlayerVideo.listener.follow('ended', function () {
            if (!ACTIVE_PROGRESS_SYNC) return;
            var sync = ACTIVE_PROGRESS_SYNC;
            var lastMs = Math.max(0, sync.maxRealTimeMs || sync.lastTimeMs || 0);
            var durationMs = sync.durationMs || 0;
            var elapsed = Date.now() - (sync.startedAt || Date.now());
            var nearEnd = durationMs && lastMs >= Math.max(durationMs * 0.85, durationMs - 5 * 60 * 1000) && elapsed > 60000;
            var endMs = nearEnd ? durationMs : lastMs;
            if (nearEnd) maybeScrobblePlexProgress(endMs, durationMs);
            else log('Plex scrobble skipped: ended before real progress', { ratingKey: sync.item && sync.item.ratingKey, lastTimeMs: lastMs, durationMs: durationMs, elapsedMs: elapsed });
            sendPlexProgress('stopped', endMs, true);
            clearPlexProgressSync();
        });
        Lampa.Player.listener && Lampa.Player.listener.follow && Lampa.Player.listener.follow('destroy', function () {
            if (!ACTIVE_PROGRESS_SYNC) return;
            sendPlexProgress('stopped', ACTIVE_PROGRESS_SYNC.lastTimeMs, true);
            clearPlexProgressSync();
        });
        Lampa.Player.listener && Lampa.Player.listener.follow && Lampa.Player.listener.follow('external', function () {
            if (!ACTIVE_PROGRESS_SYNC) return;
            log('Plex timeline sync disabled for external player');
            clearPlexProgressSync();
        });
    }

    var NATIVE_TRACK_DIAGNOSTICS_INSTALLED = false;
    function installNativeTrackDiagnostics() {
        if (NATIVE_TRACK_DIAGNOSTICS_INSTALLED || !Lampa.PlayerVideo || !Lampa.PlayerVideo.listener) return;
        NATIVE_TRACK_DIAGNOSTICS_INSTALLED = true;
        function countList(list) {
            try { return list ? list.length || 0 : 0; } catch (e) { return 0; }
        }
        function readNativeTracks(reason) {
            try {
                var video = Lampa.PlayerVideo && Lampa.PlayerVideo.video ? Lampa.PlayerVideo.video() : null;
                log('native player tracks probe', {
                    reason: reason,
                    audioTracks: video ? countList(video.audioTracks) : 0,
                    textTracks: video ? countList(video.textTracks) : 0,
                    hasAudioTracksApi: !!(video && video.audioTracks),
                    hasTextTracksApi: !!(video && video.textTracks)
                });
            }
            catch (e) { log('native player tracks probe failed', e && (e.stack || e.message || e)); }
        }
        Lampa.PlayerVideo.listener.follow('tracks', function (e) {
            log('native player tracks event', { tracks: countList(e && e.tracks) });
        });
        Lampa.PlayerVideo.listener.follow('webos_tracks', function (e) {
            log('webos player tracks event', { tracks: countList(e && e.tracks) });
        });
        Lampa.PlayerVideo.listener.follow('subs', function (e) {
            log('native player subs event', { subs: countList(e && e.subs) });
        });
        Lampa.PlayerVideo.listener.follow('canplay', function () { readNativeTracks('canplay'); });
        Lampa.PlayerVideo.listener.follow('loadeddata', function () { readNativeTracks('loadeddata'); });
    }

    function probePlaybackUrl(url) {
        var cfg = settings();
        if (!cfg.debug || !cfg.plexConnectionRelay || !url) return;
        fetch(url, { method: 'GET', mode: 'cors' }).then(function (resp) {
            return resp.text().then(function (text) {
                log('playback manifest probe', {
                    ok: resp.ok,
                    status: resp.status,
                    contentType: resp.headers && resp.headers.get ? resp.headers.get('content-type') : '',
                    firstLine: String(text || '').split('\n').slice(0, 3).join(' / ').slice(0, 300)
                });
            });
        }).catch(function (err) {
            log('playback manifest probe failed', err && (err.stack || err.message || err));
        });
    }

    function formatResumeTime(ms) {
        var total = Math.max(0, Math.floor((parseInt(ms || '0', 10) || 0) / 1000));
        var h = Math.floor(total / 3600);
        var m = Math.floor((total % 3600) / 60);
        var sec = total % 60;
        function pad(n) { return n < 10 ? '0' + n : String(n); }
        return h ? (h + ':' + pad(m) + ':' + pad(sec)) : (m + ':' + pad(sec));
    }

    function hasResumeOffset(item) {
        var offset = parseInt(item && item.viewOffset || '0', 10) || 0;
        if (parseInt(item && item.viewCount || '0', 10) > 0) return false;
        return offset > 10000;
    }

    function playlistTitleFor(card, item) {
        return (item.grandparentTitle || localTitleFrom(card) || t('showFallback')) + ' — S' + (item.parentIndex || '?') + 'E' + (item.index || '?') + ' — ' + (item.title || t('episodeFallback'));
    }

    function playlistEntryFor(card, item) {
        var url = streamUrl(item, {});
        var timeline = timelineFor(card, item) || {};
        return {
            title: playlistTitleFor(card, item).replace(/<[^>]*>?/gm, ''),
            url: url,
            timeline: timeline,
            thumbnail: thumbUrl(item.thumb, item) || (card && card.poster_path && Lampa.Api ? Lampa.Api.img(card.poster_path) : ''),
            torrent_hash: 'plex-source:' + (item.ratingKey || item.partKey || 'stream') + ':' + (item.partId || item.mediaId || ''),
            callback: function () {
                startPlexProgressSync(item);
            }
        };
    }

    function isHlsTranscodeActive(item) {
        var target = targetSettings(itemTarget(item));
        return shouldExposePlexTranscodeControls(target) && !shouldAvoidPlexTranscode(item);
    }

    function seasonPlaylistFor(card, selectedItem) {
        if (isHlsTranscodeActive(selectedItem)) {
            log('season playlist disabled for HLS transcode to avoid parallel Plex sessions', { ratingKey: selectedItem && selectedItem.ratingKey });
            return null;
        }
        var groups = selectedItem && selectedItem.seasonEpisodeGroups;
        if (!groups || !groups.length) return null;
        var selectedKey = selectedItem && selectedItem.playlistGroupKey;
        var selectedPart = selectedItem && (selectedItem.partId || selectedItem.partKey || selectedItem.mediaId);
        var list = [];
        groups.forEach(function (group) {
            var ep = group.main;
            if (group.key === selectedKey && group.versions && group.versions.length) {
                ep = group.versions.find(function (v) {
                    return (v.partId || v.partKey || v.mediaId) === selectedPart;
                }) || ep;
            }
            if (ep && ep.partKey) list.push(playlistEntryFor(card, ep));
        });
        return list.length > 1 ? list : null;
    }

    function attachSeasonPlaylistMeta(ep, groups, group) {
        var copy = Object.assign({}, ep);
        copy.seasonEpisodeGroups = groups;
        copy.playlistGroupKey = group && group.key || episodeVersionKey(ep);
        return copy;
    }

    function playItemWithChoice(card, item) {
        if (!hasResumeOffset(item)) return playItem(card, item, { startOffsetMs: 0 });
        var offset = parseInt(item.viewOffset || '0', 10) || 0;
        var state = watchedInfo(item);
        var title = item.title || item.grandparentTitle || localTitleFrom(card) || 'Plex';
        if (showNativeSelect(t('resumePlayback'), [
            { title: t('resumeFrom') + ' ' + formatResumeTime(offset), subtitle: state && state.label ? state.label : '', offset: offset },
            { title: t('playFromStart'), offset: 0 }
        ], function (choice) {
            playItem(card, item, { startOffsetMs: choice.offset || 0 });
        }, function () {
            restoreFocusAfterOverlay();
        })) return;
        var useResume = window.confirm ? window.confirm(t('resumeFrom') + ' ' + formatResumeTime(offset) + '?') : true;
        playItem(card, item, { startOffsetMs: useResume ? offset : 0 });
    }

    function playItem(card, item, options) {
        options = options || {};
        if (!options.streamsEnriched) {
            enrichItemStreams(item).then(function (enriched) {
                playItem(card, enriched, Object.assign({}, options, { streamsEnriched: true }));
            });
            return;
        }
        if (isShow(card) && item && item.type === 'movie') {
            log('blocked stale Plex movie item for show card', { card: debugCard(card), item: { ratingKey: item.ratingKey, title: item.title, type: item.type } });
            noty(t('notPlayable'));
            return;
        }
        if (!options.sessionNonce) options.sessionNonce = String(Date.now()) + Math.floor(Math.random() * 10000);
        var url = streamUrl(item, options);
        if (!url) {
            noty(t('notPlayable'));
            return;
        }
        var timeline = timelineFor(card, item) || {};
        var startOffsetMs = parseInt(options.startOffsetMs || '0', 10) || 0;
        var durationMs = parseInt(item.duration || '0', 10) || 0;
        if (startOffsetMs > 0) {
            timeline.time = startOffsetMs / 1000;
            if (durationMs) timeline.percent = Math.max(1, Math.min(89, Math.round(startOffsetMs / durationMs * 100)));
            timeline.duration = durationMs ? durationMs / 1000 : timeline.duration;
            timeline.continued = false;
            timeline.stop_recording = true;
        }
        else {
            timeline.time = 0;
            timeline.percent = 0;
            timeline.continued = true;
            timeline.stop_recording = true;
        }
        var title = isShow(card)
            ? ((item.grandparentTitle || localTitleFrom(card) || t('showFallback')) + ' — S' + (item.parentIndex || '?') + 'E' + (item.index || '?') + ' — ' + (item.title || t('episodeFallback')))
            : ((localTitleFrom(card) || item.title || 'Plex') + ' / Plex — ' + (item.sectionTitle || 'Library'));

        var target = targetSettings(itemTarget(item));
        if (shouldExposePlexTranscodeControls(target) && !shouldAvoidPlexTranscode(item)) setActiveTranscodeProfile((settings().transcodeProfile || DEFAULTS.transcodeProfile), 'startup');
        var data = {
            url: url,
            title: title.replace(/<[^>]*>?/gm, ''),
            quality: plexQualityMap(item, target, options),
            voiceovers: plexAudioTracks(item, target, options),
            subtitles: plexSubtitleTracks(item, target),
            timeline: timeline,
            card: card,
            thumbnail: thumbUrl(item.thumb, item) || (card && card.poster_path && Lampa.Api ? Lampa.Api.img(card.poster_path) : ''),
            torrent_hash: 'plex-source:' + (item.ratingKey || item.partKey || 'stream'),
            plex: { ratingKey: item.ratingKey, sectionTitle: item.sectionTitle }
        };

        log('play item', { relay: targetSettings(itemTarget(item)).plexConnectionRelay, base: targetSettings(itemTarget(item)).plexBase, server: item.plexServerName, ratingKey: item.ratingKey, partKey: item.partKey, url: maskTokenUrl(data.url), syncProgressToPlex: settings().syncProgressToPlex, playbackMode: settings().playbackMode, transcodeProfile: settings().transcodeProfile });
        probePlaybackUrl(data.url);
        startPlexProgressSync(item);
        if (ACTIVE_PROGRESS_SYNC && startOffsetMs > 0) ACTIVE_PROGRESS_SYNC.lastTimeMs = startOffsetMs;
        var playlist = seasonPlaylistFor(card, item) || [{ title: data.title, url: data.url, timeline: timeline, thumbnail: data.thumbnail, torrent_hash: data.torrent_hash }];
        Lampa.Player.play(data);
        Lampa.Player.playlist(playlist);
    }

    function ensureStyle() {
        if (document.getElementById('plex-source-style')) return;
        var style = document.createElement('style');
        style.id = 'plex-source-style';
        style.textContent = [
            '.full-start__button.view--plex-source svg{width:1.35em;height:1.35em}',
            '.plex-source-overlay{position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;color:#fff;font-family:Arial,sans-serif}',
            '.plex-source-box{width:min(92vw,760px);max-height:82vh;overflow:auto;background:#171717;border-radius:18px;padding:22px;box-shadow:0 20px 80px rgba(0,0,0,.55)}',
            '.plex-source-title{font-size:24px;font-weight:700;margin-bottom:8px}',
            '.plex-source-subtitle{opacity:.72;margin-bottom:18px}',
            '.plex-source-row{padding:14px 16px;border-radius:12px;background:#252525;margin:8px 0;cursor:pointer}',
            '.plex-source-row:hover,.plex-source-row.focus,.plex-source-row.active{background:#383838;box-shadow:inset 0 0 0 2px rgba(255,255,255,.45)}',
            '.plex-source-meta{display:block;opacity:.72;font-size:13px;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
            '.plex-source-row-title{display:block;font-size:16px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
            '.plex-source-close{float:right;cursor:pointer;opacity:.8;font-size:22px}',
            '.plex-source-overlay.shots{align-items:stretch;justify-content:stretch;background:linear-gradient(110deg,rgba(28,18,16,.96),rgba(40,30,28,.82))}',
            '.plex-source-shots{display:grid;grid-template-columns:300px 1fr;gap:28px;width:100%;height:100%;padding:34px;box-sizing:border-box;overflow:hidden}',
            '.plex-source-shots-info{padding-top:34px;overflow:hidden}',
            '.plex-source-shots-poster{width:115px;height:170px;object-fit:cover;border-radius:7px;margin-bottom:22px;background:#333}',
            '.plex-source-shots-title{font-size:36px;font-weight:800;margin:12px 0}',
            '.plex-source-shots-meta{font-size:16px;opacity:.82;margin-bottom:18px}',
            '.plex-source-shots-desc{font-size:16px;line-height:1.45;opacity:.78;max-height:260px;overflow:hidden}',
            '.plex-source-grid{display:grid;grid-template-columns:repeat(3,minmax(210px,1fr));gap:18px;align-content:start;overflow:auto;padding:44px 6px 44px 0}',
            '.plex-source-card{position:relative;height:132px;border-radius:14px;background:#252525;overflow:hidden;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.32)}',
            '.plex-source-card img{width:100%;height:100%;object-fit:cover;display:block}',
            '.plex-source-card__shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.72))}',
            '.plex-source-card__badge{position:absolute;left:10px;bottom:38px;background:rgba(0,0,0,.58);border-radius:7px;padding:4px 8px;font-size:14px}',
            '.plex-source-card__title{position:absolute;left:10px;right:10px;bottom:9px;background:rgba(0,0,0,.45);border-radius:7px;padding:5px 8px;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
            '.plex-source-card.active,.plex-source-card.focus{box-shadow:0 0 0 3px #fff,0 0 0 6px rgba(245,197,66,.9);transform:scale(1.018)}'
        ].join('');
        document.head.appendChild(style);
    }

    function overlayRows() {
        return Array.prototype.slice.call(document.querySelectorAll('.plex-source-overlay .plex-source-row[data-action="true"]'));
    }

    function overlayFocus(index) {
        var rows = overlayRows();
        if (!rows.length) return;
        var current = rows.findIndex(function (row) { return row.classList.contains('active'); });
        if (index === undefined || index === null) index = current >= 0 ? current : 0;
        if (index < 0) index = rows.length - 1;
        if (index >= rows.length) index = 0;
        rows.forEach(function (row) {
            row.classList.remove('active', 'focus');
            row.setAttribute('tabindex', '-1');
            row.style.background = '';
            row.style.outline = '';
            row.style.boxShadow = '';
            row.style.color = '';
            row.style.transform = '';
            row.style.borderLeft = '';
            row.style.border = '';
            row.style.borderRadius = '';
        });
        rows[index].classList.add('active', 'focus');
        rows[index].setAttribute('tabindex', '0');
        rows[index].style.background = '#383838';
        rows[index].style.color = '';
        rows[index].style.outline = 'none';
        rows[index].style.boxShadow = 'inset 0 0 0 2px rgba(255,255,255,.55)';
        rows[index].style.transform = '';
        rows[index].style.borderLeft = '4px solid rgba(255,255,255,.65)';
        try { rows[index].focus({ preventScroll: true }); } catch (e) { try { rows[index].focus(); } catch (e2) {} }
        try { rows[index].scrollIntoView({ block: 'nearest' }); } catch (e3) {}
        try { $(rows[index]).trigger('hover:focus').trigger('hover:hover').trigger('hover:touch'); } catch (e4) {}
    }

    function overlayMove(delta) {
        var rows = overlayRows();
        if (!rows.length) return;
        var current = rows.findIndex(function (row) { return row.classList.contains('active'); });
        overlayFocus((current < 0 ? 0 : current) + delta);
    }

    function overlaySelect() {
        var rows = overlayRows();
        if (!rows.length) return;
        var current = rows.findIndex(function (row) { return row.classList.contains('active'); });
        if (current < 0) current = 0;
        rows[current].click();
    }

    function overlayKeyHandler(event) {
        if (!document.querySelector('.plex-source-overlay')) return;
        var key = event.key || event.code || '';
        var code = event.keyCode || event.which;
        var handled = false;
        if (key === 'Backspace' || key === 'Escape' || key === 'Esc' || key === 'BrowserBack' || code === 8 || code === 27 || code === 461 || code === 10009) {
            if (typeof OVERLAY_BACK_ACTION === 'function') {
                var back = OVERLAY_BACK_ACTION;
                OVERLAY_BACK_ACTION = null;
                back();
            }
            else {
                closeOverlay(true);
            }
            handled = true;
        }
        else if (key === 'ArrowDown' || key === 'Down' || code === 40) {
            overlayMove(OVERLAY_COLUMNS || 1);
            handled = true;
        }
        else if (key === 'ArrowUp' || key === 'Up' || code === 38) {
            overlayMove(-(OVERLAY_COLUMNS || 1));
            handled = true;
        }
        else if (key === 'ArrowRight' || key === 'Right' || code === 39) {
            overlayMove(1);
            handled = true;
        }
        else if (key === 'ArrowLeft' || key === 'Left' || code === 37) {
            overlayMove(-1);
            handled = true;
        }
        else if (key === 'Enter' || key === 'OK' || code === 13) {
            overlaySelect();
            handled = true;
        }
        if (handled) {
            event.preventDefault();
            event.stopPropagation();
            if (event.stopImmediatePropagation) event.stopImmediatePropagation();
            return false;
        }
    }

    function restoreFocusAfterOverlay() {
        try {
            if (LAST_TRIGGER_ELEMENT && document.body.contains(LAST_TRIGGER_ELEMENT)) {
                var target = $(LAST_TRIGGER_ELEMENT);
                target.trigger('hover:focus').trigger('hover:hover').trigger('hover:touch');
                if (window.Lampa && Lampa.Controller) Lampa.Controller.toggle('content');
            }
        }
        catch (e) {
            log('restore focus failed', e && (e.stack || e.message || e));
        }
    }

    function closeOverlay(restore) {
        var old = document.querySelector('.plex-source-overlay');
        if (old) old.remove();
        document.removeEventListener('keydown', overlayKeyHandler, true);
        OVERLAY_BACK_ACTION = null;
        if (restore !== false) setTimeout(restoreFocusAfterOverlay, 50);
    }

    function showList(title, subtitle, rows, options) {
        options = options || {};
        OVERLAY_COLUMNS = options.columns || 1;
        closeOverlay(false);
        OVERLAY_BACK_ACTION = typeof options.back === 'function' ? options.back : null;
        var overlay = document.createElement('div');
        overlay.className = 'plex-source-overlay';
        var box = document.createElement('div');
        box.className = 'plex-source-box';
        overlay.appendChild(box);

        var close = document.createElement('div');
        close.className = 'plex-source-close';
        close.textContent = '×';
        close.onclick = function () { closeOverlay(true); };
        box.appendChild(close);

        var h = document.createElement('div');
        h.className = 'plex-source-title';
        h.textContent = title;
        box.appendChild(h);

        var sub = document.createElement('div');
        sub.className = 'plex-source-subtitle';
        sub.textContent = subtitle || '';
        box.appendChild(sub);

        if (!rows.length) {
            var empty = document.createElement('div');
            empty.className = 'plex-source-row';
            empty.textContent = t('emptyList');
            box.appendChild(empty);
        }

        rows.forEach(function (row) {
            var el = document.createElement('div');
            el.className = 'plex-source-row selector';
            el.setAttribute('data-action', 'true');
            el.setAttribute('tabindex', '-1');
            el.textContent = row.title;
            if (row.meta) {
                var meta = document.createElement('span');
                meta.className = 'plex-source-meta';
                meta.textContent = row.meta;
                el.appendChild(meta);
            }
            if (el.firstChild && el.firstChild.nodeType === 3) {
                var titleWrap = document.createElement('span');
                titleWrap.className = 'plex-source-row-title';
                titleWrap.textContent = row.title;
                el.textContent = '';
                el.appendChild(titleWrap);
                if (meta) el.appendChild(meta);
            }
            el.onclick = function (event) {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
                }
                row.onClick();
            };
            box.appendChild(el);
        });

        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) closeOverlay(true);
        });
        overlay.addEventListener('keydown', function (event) {
            event.stopPropagation();
        }, true);
        document.addEventListener('keydown', overlayKeyHandler, true);
        document.body.appendChild(overlay);
        overlayFocus(0);
        setTimeout(function () { overlayFocus(0); }, 0);
        setTimeout(function () { overlayFocus(0); }, 120);
    }

    function selectApi() {
        return (window.Lampa && Lampa.Select) || window.Select || null;
    }

    function imageIcon(path, fallback, item) {
        var url = thumbUrl(path, item) || fallback || '';
        return url ? '<img src="' + url.replace(/"/g, '&quot;') + '" />' : icon();
    }

    function showNativeSelect(title, items, onSelect, onBack, onLong) {
        var api = selectApi();
        if (!api || !api.show) return false;
        try {
            api.show({
                title: title,
                items: items,
                onSelect: onSelect,
                onLong: onLong,
                onBack: function () {
                    if (typeof onBack === 'function') onBack();
                    else restoreFocusAfterOverlay();
                }
            });
            return true;
        }
        catch (e) {
            log('native select failed', e && (e.stack || e.message || e));
            return false;
        }
    }

    function openShow(card, show, selectedSeasonKey) {
        noty(t('loadingSeasons'));
        fetchSeasons(show).then(function (seasons) {
            var title = 'Plex — ' + (show.title || localTitleFrom(card));
            var nativeItems = seasons.map(function (season) {
                return {
                    title: season.title,
                    subtitle: season.leafCount ? (season.leafCount + ' ' + t('episodesSuffix')) : '',
                    template: 'selectbox_icon',
                    icon: imageIcon(season.thumb || show.thumb || card.poster_path, card.poster_path && Lampa.Api ? Lampa.Api.img(card.poster_path) : '', season),
                    selected: selectedSeasonKey && String(season.ratingKey) === String(selectedSeasonKey),
                    season: season
                };
            });
            if (showNativeSelect(title, nativeItems, function (item) {
                openSeason(card, show, item.season);
            }, function () {
                restoreFocusAfterOverlay();
            })) return;

            showList(title, show.sectionTitle || t('tvLibrary'), seasons.map(function (season) {
                return {
                    title: season.title,
                    meta: season.leafCount ? (season.leafCount + ' ' + t('episodesSuffix')) : '',
                    onClick: function () { openSeason(card, show, season); }
                };
            }));
        }).catch(function (err) {
            log('seasons failed', err);
            noty(t('seasonsLoadError'));
        });
    }

    function refreshSeason(card, show, season) {
        openSeason(card, show, season);
    }

    function markEpisode(card, show, season, ep, watched) {
        var endpoint = watched ? '/:/scrobble' : '/:/unscrobble';
        return plexCommandFrom(itemTarget(ep) || itemTarget(season) || itemTarget(show), endpoint, {
            key: ep.ratingKey,
            identifier: 'com.plexapp.plugins.library'
        }).then(function () {
            noty(watched ? t('markedWatched') : t('markedUnwatched'));
            refreshSeason(card, show, season);
        }).catch(function (err) {
            log('mark episode failed', err && (err.stack || err.message || err));
            noty(t('markError'));
        });
    }

    function episodeVersionKey(ep) {
        return [ep.ratingKey || '', ep.parentIndex || '', ep.index || '', ep.title || ''].join(':');
    }

    function groupEpisodeVersions(episodes) {
        var groups = [];
        var byKey = {};
        (episodes || []).forEach(function (ep) {
            var key = episodeVersionKey(ep);
            if (!byKey[key]) {
                byKey[key] = { key: key, main: ep, versions: [] };
                groups.push(byKey[key]);
            }
            byKey[key].versions.push(ep);
            if (ep.optimizedForStreaming === '1' || (!byKey[key].main.partKey && ep.partKey)) byKey[key].main = ep;
        });
        return groups;
    }

    function versionBits(item) {
        var bits = [];
        if (item.optimizedForStreaming === '1') bits.push('Optimized');
        else bits.push('Original');
        if (item.resolution) bits.push(String(item.resolution).toUpperCase());
        if (item.videoCodec) bits.push(String(item.videoCodec).toUpperCase());
        if (item.audioCodec) bits.push(String(item.audioCodec).toUpperCase());
        if (item.bitrate) bits.push(formatBitrate(item.bitrate));
        return bits;
    }

    function showVersionSelect(card, show, season, item, onBack) {
        var versions = item && item.versions ? item.versions : [item && item.episode ? item.episode : item];
        if (!versions || versions.length <= 1) return playItemWithChoice(card, versions && versions[0]);
        var groups = item && item.seasonEpisodeGroups;
        var group = { key: item && item.playlistGroupKey };
        var title = 'E' + (versions[0].index || '?') + ' — ' + (versions[0].title || t('episodeFallback'));
        var rows = versions.map(function (ep) {
            var episode = attachSeasonPlaylistMeta(ep, groups, group);
            return { title: versionBits(ep).join(' · '), subtitle: ep.file ? String(ep.file).split(/[\\/]/).pop() : '', episode: episode };
        });
        if (showNativeSelect(title, rows, function (row) {
            playItemWithChoice(card, row.episode);
        }, function () {
            if (onBack) onBack(); else openSeason(card, show, season);
        })) return true;
        showList(title, t('selectVersion') || 'Version', rows.map(function (row) {
            return { title: row.title, meta: row.subtitle, onClick: function () { closeOverlay(true); playItemWithChoice(card, row.episode); } };
        }), { back: function () { if (onBack) onBack(); else openSeason(card, show, season); } });
        return true;
    }

    function showEpisodeActions(card, show, season, ep) {
        showNativeSelect(ep.title || t('episodeFallback'), [
            { title: t('actionPlay'), episode: ep, action: 'play' },
            { title: t('actionMarkWatched'), episode: ep, action: 'watched' },
            { title: t('actionMarkUnwatched'), episode: ep, action: 'unwatched' }
        ], function (item) {
            if (item.action === 'play') playItemWithChoice(card, ep);
            else if (item.action === 'watched') markEpisode(card, show, season, ep, true);
            else if (item.action === 'unwatched') markEpisode(card, show, season, ep, false);
        }, function () {
            openSeason(card, show, season);
        });
    }

    function handleEpisodeSelect(card, show, season, ep) {
        if (ep && ep.versions && ep.versions.length > 1) return showVersionSelect(card, show, season, ep);
        if (settings().episodeActionMode === 'actions') showEpisodeActions(card, show, season, ep);
        else playItemWithChoice(card, ep);
    }

    function showEpisodeGrid(card, show, season, episodes) {
        closeOverlay(false);
        OVERLAY_COLUMNS = 3;
        OVERLAY_BACK_ACTION = function () { openShow(card, show, season.ratingKey); };

        var overlay = document.createElement('div');
        overlay.className = 'plex-source-overlay shots';
        var wrap = document.createElement('div');
        wrap.className = 'plex-source-shots';
        overlay.appendChild(wrap);

        var info = document.createElement('div');
        info.className = 'plex-source-shots-info';
        var poster = document.createElement('img');
        poster.className = 'plex-source-shots-poster';
        poster.src = thumbUrl(show.thumb || season.thumb, show) || (card.poster_path && Lampa.Api ? Lampa.Api.img(card.poster_path) : '');
        info.appendChild(poster);

        var meta = document.createElement('div');
        meta.className = 'plex-source-shots-meta';
        meta.textContent = [show.year, show.sectionTitle].filter(Boolean).join(' · ');
        info.appendChild(meta);

        var title = document.createElement('div');
        title.className = 'plex-source-shots-title';
        title.textContent = show.title || localTitleFrom(card) || 'Plex';
        info.appendChild(title);

        var seasonTitle = document.createElement('div');
        seasonTitle.className = 'plex-source-shots-meta';
        seasonTitle.textContent = season.title || '';
        info.appendChild(seasonTitle);

        var desc = document.createElement('div');
        desc.className = 'plex-source-shots-desc';
        desc.textContent = card.overview || card.tagline || '';
        info.appendChild(desc);
        wrap.appendChild(info);

        var grid = document.createElement('div');
        grid.className = 'plex-source-grid';
        episodes.forEach(function (ep) {
            var item = document.createElement('div');
            item.className = 'plex-source-card selector';
            item.setAttribute('data-action', 'true');
            item.setAttribute('tabindex', '-1');
            var img = document.createElement('img');
            img.src = thumbUrl(ep.thumb || season.thumb || show.thumb, ep) || (card.backdrop_path && Lampa.Api ? Lampa.Api.img(card.backdrop_path) : '');
            item.appendChild(img);
            var shade = document.createElement('div');
            shade.className = 'plex-source-card__shade';
            item.appendChild(shade);
            var badge = document.createElement('div');
            badge.className = 'plex-source-card__badge';
            badge.textContent = watchedInfo(ep).label + ' · S-' + (ep.parentIndex || season.index || '?') + '  E-' + (ep.index || '?');
            item.appendChild(badge);
            var titleEl = document.createElement('div');
            titleEl.className = 'plex-source-card__title';
            titleEl.textContent = ep.title || t('episodeFallback');
            item.appendChild(titleEl);
            item.onclick = function () { closeOverlay(true); playItemWithChoice(card, ep); };
            grid.appendChild(item);
        });
        wrap.appendChild(grid);

        overlay.addEventListener('click', function (event) { if (event.target === overlay) closeOverlay(true); });
        overlay.addEventListener('keydown', function (event) { event.stopPropagation(); }, true);
        document.addEventListener('keydown', overlayKeyHandler, true);
        document.body.appendChild(overlay);
        overlayFocus(0);
        setTimeout(function () { overlayFocus(0); }, 0);
        setTimeout(function () { overlayFocus(0); }, 120);
    }

    function openSeason(card, show, season) {
        noty(t('loadingEpisodes'));
        fetchEpisodes(season).then(function (episodes) {
            var title = 'Plex — ' + season.title;
            var episodeGroups = groupEpisodeVersions(episodes);
            var nativeItems = episodeGroups.map(function (group) {
                var ep = group.main;
                var bits = [];
                if (ep.resolution) bits.push(String(ep.resolution).toUpperCase());
                if (ep.videoCodec) bits.push(ep.videoCodec.toUpperCase());
                if (ep.bitrate) bits.push(formatBitrate(ep.bitrate));
                if (group.versions.length > 1) bits.push(group.versions.length + ' versions');
                bits.unshift(watchedInfo(ep).label);
                return {
                    title: 'E' + (ep.index || '?') + ' — ' + (ep.title || t('episodeFallback')),
                    subtitle: bits.join(' · '),
                    template: 'selectbox_icon',
                    icon: imageIcon(ep.thumb || season.thumb || show.thumb || card.backdrop_path || card.poster_path, card.backdrop_path && Lampa.Api ? Lampa.Api.img(card.backdrop_path) : '', ep),
                    episode: attachSeasonPlaylistMeta(Object.assign({}, ep, { versions: group.versions }), episodeGroups, group)
                };
            });
            if (showNativeSelect(title, nativeItems, function (item) {
                handleEpisodeSelect(card, show, season, item.episode);
            }, function () {
                openShow(card, show, season.ratingKey);
            }, function (item) {
                showEpisodeActions(card, show, season, item.episode);
            })) return;

            showList(title, show.title || localTitleFrom(card), episodeGroups.map(function (group) {
                var ep = group.main;
                var bits = [];
                if (ep.resolution) bits.push(String(ep.resolution).toUpperCase());
                if (ep.videoCodec) bits.push(ep.videoCodec.toUpperCase());
                if (ep.bitrate) bits.push(formatBitrate(ep.bitrate));
                if (group.versions.length > 1) bits.push(group.versions.length + ' versions');
                bits.unshift(watchedInfo(ep).label);
                return {
                    title: 'E' + (ep.index || '?') + ' — ' + (ep.title || t('episodeFallback')),
                    meta: bits.join(' · '),
                    onClick: function () { closeOverlay(true); handleEpisodeSelect(card, show, season, attachSeasonPlaylistMeta(Object.assign({}, ep, { versions: group.versions }), episodeGroups, group)); }
                };
            }), {
                back: function () { openShow(card, show, season.ratingKey); }
            });
        }).catch(function (err) {
            log('episodes failed', err);
            noty(t('episodesLoadError'));
        });
    }

    function icon() {
        return [
            '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">',
            '<rect x="6" y="6" width="52" height="52" rx="14" fill="#171717"/>',
            '<rect x="6" y="6" width="52" height="52" rx="14" stroke="#F5C542" stroke-width="3" opacity="0.95"/>',
            '<path d="M24 17L43 32L24 47V17Z" fill="#F5C542"/>',
            '<path d="M19 18V46" stroke="#F5C542" stroke-width="5" stroke-linecap="round" opacity="0.85"/>',
            '<circle cx="46" cy="18" r="4" fill="#F5C542" opacity="0.95"/>',
            '<path d="M42 22C38 18 31 17 25 20" stroke="white" stroke-width="2.4" stroke-linecap="round" opacity="0.35"/>',
            '</svg>'
        ].join('');
    }

    function buildButton(card, match) {
        var subtitle = [];
        if (match.year) subtitle.push(match.year);
        if (!isShow(card)) {
            var state = watchedInfo(match);
            if (state && state.label) subtitle.push(state.label);
        }
        if (!isShow(card) && match.versionLabel) subtitle.push(match.versionLabel);
        else {
            if (!isShow(card) && match.resolution) subtitle.push(String(match.resolution).toUpperCase());
            if (!isShow(card) && match.videoCodec) subtitle.push(match.videoCodec.toUpperCase());
            if (!isShow(card) && match.bitrate) subtitle.push(formatBitrate(match.bitrate));
        }

        var sourceLabel = match.sectionTitle || 'Library';
        if (settings().serverMode === 'all' && match.plexServerName) sourceLabel += ' — ' + match.plexServerName;
        var button = $([
            '<div class="full-start__button selector view--plex-source" data-subtitle="', subtitle.join(' · '), '">',
            icon(), '<span>Plex — ', sourceLabel, '</span>', '</div>'
        ].join(''));

        button.on('hover:enter', function () {
            LAST_TRIGGER_ELEMENT = button[0];
            if (isShow(card)) openShow(card, match);
            else playItemWithChoice(card, match);
        });
        return button;
    }

    var ACTIVE_SOURCE_SELECT = null;

    function regroup(object) {
        try {
            if (object && object.items && object.items[0] && object.items[0].emit) object.items[0].emit('groupButtons');
        }
        catch (e) { log('groupButtons failed', e); }
    }

    function isSourceSelect(active) {
        if (!active || !Array.isArray(active.items)) return false;
        return active.items.some(function (item) {
            return item && item.btn && item.btn.hasClass && item.btn.hasClass('full-start__button');
        });
    }

    function installSourceSelectWatcher() {
        try {
            if (!Lampa.Select || !Lampa.Select.listener || installSourceSelectWatcher.installed) return;
            installSourceSelectWatcher.installed = true;
            Lampa.Select.listener.follow('fullshow', function (event) {
                ACTIVE_SOURCE_SELECT = isSourceSelect(event && event.active) ? event.active : null;
            });
            Lampa.Select.listener.follow('hide', function () { ACTIVE_SOURCE_SELECT = null; });
            Lampa.Select.listener.follow('close', function () { ACTIVE_SOURCE_SELECT = null; });
        }
        catch (e) { log('source select watcher failed', e && (e.stack || e.message || e)); }
    }

    function sourceItemsFromButtons(root) {
        var items = [];
        root.find('.buttons--container > .full-start__button').not('.hide').each(function () {
            var btn = $(this);
            var iconHtml = btn.find('svg').prop('outerHTML');
            items.push({
                title: btn.text(),
                subtitle: btn.data('subtitle'),
                template: typeof iconHtml == 'undefined' || iconHtml == 'undefined' ? 'selectbox_item' : 'selectbox_icon',
                icon: iconHtml,
                btn: btn
            });
        });
        return items;
    }

    function refreshOpenSourceSelect(root) {
        try {
            if (!ACTIVE_SOURCE_SELECT || !Lampa.Select || !Lampa.Select.show || !document.body.classList.contains('selectbox--open')) return;
            var nextItems = sourceItemsFromButtons(root);
            var hasPlex = nextItems.some(function (item) { return item && item.btn && item.btn.hasClass && item.btn.hasClass('view--plex-source'); });
            ACTIVE_SOURCE_SELECT.items = nextItems;
            log('refresh open source select', { items: nextItems.length, hasPlex: hasPlex, forced: true });
            Lampa.Select.show(ACTIVE_SOURCE_SELECT);
        }
        catch (e) { log('refresh open source select failed', e && (e.stack || e.message || e)); }
    }

    function attachButtons(e, matches) {
        var root = e.object && e.object.activity && e.object.activity.render ? e.object.activity.render() : null;
        if (!root || !root.length) { log('attachButtons: no root'); return; }
        var container = root.find('.buttons--container');
        log('attachButtons: containers', { rootLength: root.length, containerLength: container.length, matches: (matches || []).length });
        if (!container.length) { log('attachButtons: no .buttons--container'); return; }
        root.find('.view--plex-source').remove();
        (matches || []).forEach(function (match) {
            if (!isShow(e.data.movie) && !match.partKey) return;
            log('attachButtons: append match', match);
            container.append(buildButton(e.data.movie, match));
        });
        log('attachButtons: final button count', root.find('.view--plex-source').length);
        regroup(e.object);
        refreshOpenSourceSelect(root);
    }

    function debugCard(card) {
        if (!card) return null;
        return {
            title: card.title,
            name: card.name,
            original_title: card.original_title,
            original_name: card.original_name,
            id: card.id,
            imdb_id: card.imdb_id,
            tvdb_id: card.tvdb_id,
            media_type: card.media_type,
            method: card.method,
            type: card.type,
            release_date: card.release_date,
            first_air_date: card.first_air_date,
            number_of_seasons: card.number_of_seasons,
            number_of_episodes: card.number_of_episodes,
            keys: Object.keys(card || {}).slice(0, 80)
        };
    }

    function loadForCard(e) {
        log('full event', { type: e && e.type, hasMovie: !!(e && e.data && e.data.movie), eventKeys: e ? Object.keys(e).slice(0, 40) : [] });
        if (!e || e.type !== 'complite' || !e.data || !e.data.movie || !e.object) return;
        var s = settings();
        var card = e.data.movie;
        log('card detected', debugCard(card));
        log('settings state', { enabled: s.enabled, serverMode: s.serverMode, hasBase: !!s.plexBase, plexBase: s.plexBase, hasToken: !!s.plexToken, isShow: isShow(card), queryTitle: titleFrom(card), localTitle: localTitleFrom(card), year: yearFrom(card) });
        if (!s.enabled) { log('plugin disabled'); return; }
        if (!s.plexToken || (s.serverMode !== 'all' && !s.plexBase)) { log('skip: missing Plex config'); return; }
        findMatches(card).then(function (matches) {
            log('matches result', { count: matches.length, matches: matches });
            attachButtons(e, matches);
        }).catch(function (err) {
            log('lookup failed', err && (err.stack || err.message || err));
            attachButtons(e, []);
        });
    }

    function promptText(title, placeholder, currentValue, onSave) {
        if (Lampa.Input && Lampa.Input.edit) {
            Lampa.Input.edit({ title: title, value: currentValue || '', placeholder: placeholder || '' }, function (value) {
                if (value === undefined || value === null) return;
                onSave(String(value || ''));
            });
            return;
        }
        var result = window.prompt(title, currentValue || placeholder || '');
        if (result !== null) onSave(String(result || ''));
    }

    function addSettings() {
        if (!Lampa.SettingsApi) return;
        var component = 'plex_source';
        var counter = 0;
        Lampa.SettingsApi.removeParams && Lampa.SettingsApi.removeParams(component);
        Lampa.SettingsApi.addComponent({ component: component, icon: icon(), name: t('component') });

        function add(spec) {
            counter += 1;
            var type = spec.type || 'trigger';
            var param = {
                name: spec.name || (component + '_param_' + counter),
                type: type,
                values: spec.values,
                placeholder: spec.placeholder || '',
                "default": spec.default !== undefined ? spec.default : true
            };
            Lampa.SettingsApi.addParam({
                component: component,
                param: param,
                field: spec.field || { name: spec.title || spec.name || ('Param ' + counter) },
                onChange: spec.onChange,
                onRender: spec.onRender
            });
        }

        add({ type: 'title', name: component + '_title_status', field: { name: t('statusTitle') } });
        add({ type: 'trigger', name: component + '_enabled', default: settings().enabled, field: { name: t('enabled') }, onChange: function (value) { var next = boolFromParam(value, DEFAULTS.enabled); save({ enabled: next }); noty(t('enabled') + ': ' + (next ? t('on') : t('off'))); } });

        add({ type: 'title', name: component + '_title_connection', field: { name: t('connectionTitle') } });
        add({ type: 'static', name: component + '_info', field: { name: t('infoTitle'), description: t('infoText') } });
        add({ type: 'select', name: component + '_server_mode', values: { single: t('serverModeSelected'), all: t('serverModeAll') }, default: settings().serverMode, field: { name: t('serverMode'), description: t('serverModeDescription') }, onChange: function (value) { save({ serverMode: value === 'all' ? 'all' : 'single' }); noty(t('serverMode') + ': ' + (value === 'all' ? t('serverModeAll') : t('serverModeSelected'))); refreshSettingsSoon(); } });
        add({ type: 'button', name: component + '_current_server', field: { name: t('currentServer'), description: (settings().serverMode === 'all' ? t('currentServerAllDescription') : (settings().plexBase ? ((settings().plexServerName || 'Plex') + ' — ' + (settings().plexConnectionMeta || settings().plexBase)) : t('notSelected'))) }, onChange: function () { var s = settings(); noty(t('currentServer') + ': ' + (s.serverMode === 'all' ? t('serverModeAll') : (s.plexBase ? ((s.plexServerName || 'Plex') + ' — ' + (s.plexConnectionMeta || s.plexBase)) : t('notSelected')))); } });
        add({ type: 'button', name: component + '_plex_login', field: { name: t('plexLogin'), description: t('plexLoginDescription') }, onChange: function () { startPlexLogin(); } });
        add({ type: 'button', name: component + '_discover_server', field: { name: t('selectServer') }, onChange: function () { if (Date.now && Date.now() < SELECT_SERVER_COOLDOWN_UNTIL) return; noty(t('plexServerDiscovering')); choosePlexServer().then(function (best) { noty(t('serverSelected') + ': ' + best.connection.uri); }).catch(function (err) { log('manual server select failed', err && (err.stack || err.message || err)); noty(t('plexServerDiscoverFailed')); }); } });
        add({ type: 'button', name: component + '_test_connection', field: { name: t('testConnection') }, onChange: function () { fetchXml('/identity', {}).then(function (doc) { var m = doc.querySelector('MediaContainer'); log('connection test ok', { friendlyName: attr(m, 'friendlyName'), machineIdentifier: attr(m, 'machineIdentifier') }); noty(t('connectionOk') + ': ' + (attr(m, 'friendlyName') || attr(m, 'machineIdentifier') || 'Plex')); }).catch(function (err) { log('test failed', err && (err.stack || err.message || err)); noty(t('connectionFail')); }); } });
        add({ type: 'button', name: component + '_show_config', field: { name: t('showConfig') }, onChange: function () { var s = settings(); noty(t('currentConfigPrefix') + ': ' + (s.plexBase || t('notSet')) + ' / token ' + (s.plexToken ? t('present') : t('missing'))); } });

        add({ type: 'title', name: component + '_title_manual', field: { name: t('manualSetupTitle') } });
        add({ type: 'button', name: component + '_plex_base', field: { name: t('plexBase'), description: t('baseDescription') }, onChange: function () { promptText(t('plexBase'), 'http://192.168.1.10:32400', settings().plexBase, function (v) { save({ plexBase: v.trim().replace(/\/$/, '') }); noty(t('savedBase')); }); } });
        add({ type: 'button', name: component + '_plex_token', field: { name: t('plexToken'), description: t('tokenDescription') }, onChange: function () { promptText(t('plexToken'), t('tokenPlaceholder'), settings().plexToken, function (v) { save({ plexToken: v.trim() }); noty(t('savedToken')); }); } });
        add({ type: 'button', name: component + '_clear_token', field: { name: t('clearToken') }, onChange: function () { save({ plexToken: '' }); noty(t('clearTokenDone')); refreshSettingsSoon(); } });
        add({ type: 'button', name: component + '_clear_plex_access', field: { name: t('clearPlexAccess') }, onChange: function () { clearPlexAccess(); } });
        add({ type: 'static', name: component + '_token_help', field: { name: t('tokenHelp'), description: t('tokenHelpText') } });

        add({ type: 'title', name: component + '_title_search', field: { name: t('searchTitle') } });
        add({ type: 'button', name: component + '_match_limit', field: { name: t('matchLimit'), description: t('limitDescription') }, onChange: function () { promptText(t('matchLimit'), String(DEFAULTS.matchLimit), String(settings().matchLimit), function (v) { var n = parseInt(v, 10); save({ matchLimit: n > 0 ? n : DEFAULTS.matchLimit }); noty(t('savedLimit')); }); } });
        add({ type: 'trigger', name: component + '_exact_year', default: settings().showOnlyExactYear, field: { name: t('exactYear'), description: t('exactYearDescription') }, onChange: function (value) { var next = boolFromParam(value, DEFAULTS.showOnlyExactYear); save({ showOnlyExactYear: next }); noty(t('exactYear') + ': ' + (next ? t('on') : t('off'))); } });
        add({ type: 'select', name: component + '_episode_action_mode', values: { play_long_actions: t('modePlayLong'), actions: t('modeActions') }, default: settings().episodeActionMode, field: { name: t('episodeActionMode'), description: t('episodeActionModeDescription') }, onChange: function (value) { save({ episodeActionMode: value || DEFAULTS.episodeActionMode }); } });
        add({ type: 'trigger', name: component + '_sync_progress_to_plex', default: settings().syncProgressToPlex, field: { name: t('syncProgressToPlex'), description: t('syncProgressToPlexDescription') }, onChange: function (value) { var next = boolFromParam(value, DEFAULTS.syncProgressToPlex); save({ syncProgressToPlex: next }); noty(t('syncProgressToPlex') + ': ' + (next ? t('on') : t('off'))); } });

        add({ type: 'title', name: component + '_title_options', field: { name: t('optionsTitle') } });

        add({ type: 'title', name: component + '_title_advanced', field: { name: t('advancedTitle') } });
        add({ type: 'button', name: component + '_client_id', field: { name: t('clientId'), description: t('clientDescription') }, onChange: function () { promptText(t('clientId'), DEFAULTS.clientId, settings().clientId, function (v) { save({ clientId: v.trim() || DEFAULTS.clientId }); noty(t('savedClient')); }); } });
        add({ type: 'trigger', name: component + '_debug', default: settings().debug, field: { name: t('debug'), description: t('debugDescription') }, onChange: function (value) { var next = boolFromParam(value, DEFAULTS.debug); save({ debug: next }); noty(t('debug') + ': ' + (next ? t('on') : t('off'))); } });
        add({ type: 'button', name: component + '_show_debug', field: { name: t('debugLogButton') }, onChange: function () { showDebugPanel(); } });
    }



    function annotateInstalledPluginDom() {
        try {
            var cards = Array.prototype.slice.call(document.querySelectorAll('.extensions__item'));
            cards.forEach(function (card) {
                var text = card.textContent || '';
                if (text.indexOf('lampa-plex-source') < 0 && text.indexOf('cdn.jsdelivr.net/gh/boiler4') < 0) return;
                var name = card.querySelector('.extensions__item-name');
                var author = card.querySelector('.extensions__item-author');
                var descr = card.querySelector('.extensions__item-descr');
                if (name) name.textContent = 'Plex Source';
                if (author) author.textContent = 'boiler4';
                if (descr) descr.textContent = 'Frontend-only Plex source for Lampa';
            });
        }
        catch (e) {}
    }

    function observeInstalledPluginDom() {
        annotateInstalledPluginDom();
        if (window.PlexSourcePluginDomObserver || typeof MutationObserver === 'undefined') return;
        try {
            window.PlexSourcePluginDomObserver = new MutationObserver(function () { annotateInstalledPluginDom(); });
            window.PlexSourcePluginDomObserver.observe(document.body, { childList: true, subtree: true });
        }
        catch (e) {}
    }

    function annotateInstalledPlugin() {
        try {
            var changed = false;
            var currentSrc = '';
            try {
                if (document && document.currentScript && document.currentScript.src) currentSrc = String(document.currentScript.src || '');
            } catch (e) {}
            var markers = [
                'lampa-plex-source',
                'plugin.js',
                currentSrc
            ].filter(Boolean);
            function patchList(list) {
                if (!Array.isArray(list)) return false;
                var touched = false;
                list.forEach(function (plug) {
                    var url = String((plug && (plug.url || plug.link)) || '');
                    if (!plug || !url) return;
                    var matched = markers.some(function (part) { return part && url.indexOf(part) >= 0; });
                    if (!matched) return;
                    if (plug.name !== 'Plex Source') { plug.name = 'Plex Source'; touched = true; }
                    if (plug.author !== 'boiler4') { plug.author = 'boiler4'; touched = true; }
                    if (plug.descr !== 'Frontend-only Plex source for Lampa') { plug.descr = 'Frontend-only Plex source for Lampa'; touched = true; }
                });
                return touched;
            }
            if (Lampa.Plugins && Lampa.Plugins.get && Lampa.Plugins.save) {
                changed = patchList(Lampa.Plugins.get()) || changed;
                if (changed) Lampa.Plugins.save();
            }
            try {
                var stored = Lampa.Storage.get('plugins', '[]');
                if (patchList(stored)) {
                    Lampa.Storage.set('plugins', stored);
                    changed = true;
                }
            } catch (storageError) {}
            log('annotate installed plugin', { changed: changed, src: currentSrc });
        }
        catch (e) { log('annotate installed plugin failed', e && (e.stack || e.message || e)); }
    }

    function start() {
        if (window[READY_FLAG] || !window.Lampa || !Lampa.Listener || !Lampa.Player || !Lampa.Storage) return;
        window[READY_FLAG] = true;
        ensureStyle();
        addSettings();
        installSourceSelectWatcher();
        installPlexProgressSync();
        installNativeTrackDiagnostics();
        Lampa.Listener.follow('full', loadForCard);
        noty(t('loaded'));
        log('ready');
    }

    (function wait() {
        if (window[READY_FLAG]) return;
        if (window.Lampa && Lampa.Listener && Lampa.Player && Lampa.Storage && Lampa.Noty) {
            start();
            return;
        }
        setTimeout(wait, 300);
    })();
})();
