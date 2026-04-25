(function () {
    'use strict';

    var PLUGIN_NS = 'plex_source';
    var READY_FLAG = 'plugin_plex_source_ready';
    var DEBUG_ALWAYS = false;
    var DEBUG_BUFFER = [];
    var LAST_TRIGGER_ELEMENT = null;
    var OVERLAY_BACK_ACTION = null;
    var OVERLAY_COLUMNS = 1;

    var DEFAULTS = {
        enabled: true,
        plexBase: '',
        plexToken: '',
        clientId: 'lampa-plex-source',
        matchLimit: 5,
        showOnlyExactYear: false,
        debug: false,
        episodeActionMode: 'play_long_actions'
    };

    var I18N = {
            "ru": {
                    "component": "Plex Source",
                    "loaded": "Plex Source загружен",
                    "statusTitle": "Статус",
                    "connectionTitle": "Подключение Plex",
                    "searchTitle": "Поиск",
                    "advancedTitle": "Дополнительно",
                    "infoTitle": "Справка",
                    "enabled": "Плагин включен",
                    "testConnection": "Проверить подключение",
                    "showConfig": "Состояние настроек",
                    "plexBase": "Сервер Plex",
                    "plexToken": "Plex Token",
                    "tokenHelp": "Где найти token",
                    "matchLimit": "Максимум результатов",
                    "exactYear": "Только точный год",
                    "clientId": "Client Identifier",
                    "debug": "Отладка",
                    "debugLogButton": "Лог отладки",
                    "infoText": "Укажите адрес сервера Plex и личный token. После проверки Plex появится как источник в карточке фильма или сериала.",
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
                    "markError": "Ошибка обновления Plex"
            },
            "en": {
                    "component": "Plex Source",
                    "loaded": "Plex Source loaded",
                    "statusTitle": "Status",
                    "connectionTitle": "Plex connection",
                    "searchTitle": "Search",
                    "advancedTitle": "Advanced",
                    "infoTitle": "Help",
                    "enabled": "Plugin enabled",
                    "testConnection": "Check connection",
                    "showConfig": "Configuration status",
                    "plexBase": "Plex server",
                    "plexToken": "Plex token",
                    "tokenHelp": "Where to find the token",
                    "matchLimit": "Maximum results",
                    "exactYear": "Exact year only",
                    "clientId": "Client identifier",
                    "debug": "Debug",
                    "debugLogButton": "Debug log",
                    "infoText": "Set your Plex server address and personal token. After the check, Plex appears as a source on movie and TV show cards.",
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
                    "markError": "Plex update failed"
            },
            "uk": {
                    "component": "Plex Source",
                    "loaded": "Plex Source завантажено",
                    "statusTitle": "Стан",
                    "connectionTitle": "Підключення Plex",
                    "searchTitle": "Пошук",
                    "advancedTitle": "Додатково",
                    "infoTitle": "Довідка",
                    "enabled": "Плагін увімкнено",
                    "testConnection": "Перевірити підключення",
                    "showConfig": "Стан налаштувань",
                    "plexBase": "Сервер Plex",
                    "plexToken": "Plex Token",
                    "tokenHelp": "Де знайти token",
                    "matchLimit": "Максимум результатів",
                    "exactYear": "Тільки точний рік",
                    "clientId": "Client Identifier",
                    "debug": "Налагодження",
                    "debugLogButton": "Лог налагодження",
                    "infoText": "Вкажіть адресу сервера Plex і особистий token. Після перевірки Plex з’явиться як джерело у картці фільму або серіалу.",
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
                    "infoTitle": "Даведка",
                    "enabled": "Плагін уключаны",
                    "testConnection": "Праверыць падключэнне",
                    "showConfig": "Стан налад",
                    "plexBase": "Сервер Plex",
                    "plexToken": "Plex Token",
                    "tokenHelp": "Дзе знайсці token",
                    "matchLimit": "Максімум вынікаў",
                    "exactYear": "Толькі дакладны год",
                    "clientId": "Client Identifier",
                    "debug": "Адладка",
                    "debugLogButton": "Лог адладкі",
                    "infoText": "Укажыце адрас сервера Plex і асабісты token. Пасля праверкі Plex з’явіцца як крыніца ў картцы фільма або серыяла.",
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
                    "infoTitle": "帮助",
                    "enabled": "启用插件",
                    "testConnection": "检查连接",
                    "showConfig": "配置状态",
                    "plexBase": "Plex 服务器",
                    "plexToken": "Plex Token",
                    "tokenHelp": "在哪里找到 token",
                    "matchLimit": "最大结果数",
                    "exactYear": "仅精确年份",
                    "clientId": "客户端标识",
                    "debug": "调试",
                    "debugLogButton": "调试日志",
                    "infoText": "设置 Plex 服务器地址和个人 token。检查成功后，Plex 会显示为电影或剧集的来源。",
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
                    "infoTitle": "Ajuda",
                    "enabled": "Plugin ativo",
                    "testConnection": "Verificar ligação",
                    "showConfig": "Estado da configuração",
                    "plexBase": "Servidor Plex",
                    "plexToken": "Plex Token",
                    "tokenHelp": "Onde encontrar o token",
                    "matchLimit": "Máximo de resultados",
                    "exactYear": "Só ano exato",
                    "clientId": "Identificador do cliente",
                    "debug": "Depuração",
                    "debugLogButton": "Log de depuração",
                    "infoText": "Configure o endereço do servidor Plex e o token pessoal. Depois do teste, o Plex aparece como fonte nos filmes e séries.",
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
                    "infoTitle": "Помощ",
                    "enabled": "Плъгинът е включен",
                    "testConnection": "Провери връзката",
                    "showConfig": "Състояние на настройките",
                    "plexBase": "Plex сървър",
                    "plexToken": "Plex Token",
                    "tokenHelp": "Къде да намерите token",
                    "matchLimit": "Максимум резултати",
                    "exactYear": "Само точна година",
                    "clientId": "Client Identifier",
                    "debug": "Debug",
                    "debugLogButton": "Debug log",
                    "infoText": "Въведете адреса на Plex сървъра и личния token. След проверка Plex ще се появи като източник.",
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
                    "infoTitle": "עזרה",
                    "enabled": "הפלאגין פעיל",
                    "testConnection": "בדיקת חיבור",
                    "showConfig": "מצב הגדרות",
                    "plexBase": "שרת Plex",
                    "plexToken": "Plex Token",
                    "tokenHelp": "איפה למצוא את ה-token",
                    "matchLimit": "מספר תוצאות מרבי",
                    "exactYear": "שנה מדויקת בלבד",
                    "clientId": "מזהה לקוח",
                    "debug": "ניפוי שגיאות",
                    "debugLogButton": "יומן ניפוי",
                    "infoText": "הגדר כתובת שרת Plex ו-token אישי. לאחר בדיקה Plex יופיע כמקור בסרטים וסדרות.",
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
                    "infoTitle": "Nápověda",
                    "enabled": "Plugin zapnutý",
                    "testConnection": "Zkontrolovat připojení",
                    "showConfig": "Stav nastavení",
                    "plexBase": "Plex server",
                    "plexToken": "Plex Token",
                    "tokenHelp": "Kde najít token",
                    "matchLimit": "Maximum výsledků",
                    "exactYear": "Pouze přesný rok",
                    "clientId": "Identifikátor klienta",
                    "debug": "Ladění",
                    "debugLogButton": "Ladicí log",
                    "infoText": "Nastavte adresu Plex serveru a osobní token. Po kontrole se Plex zobrazí jako zdroj u filmů a seriálů.",
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
                    "infoTitle": "Ajutor",
                    "enabled": "Plugin activ",
                    "testConnection": "Verifică conexiunea",
                    "showConfig": "Starea configurării",
                    "plexBase": "Server Plex",
                    "plexToken": "Plex Token",
                    "tokenHelp": "Unde găsești tokenul",
                    "matchLimit": "Număr maxim rezultate",
                    "exactYear": "Doar anul exact",
                    "clientId": "Identificator client",
                    "debug": "Debug",
                    "debugLogButton": "Jurnal debug",
                    "infoText": "Setează adresa serverului Plex și tokenul personal. După verificare, Plex apare ca sursă la filme și seriale.",
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
                    "infoTitle": "Aide",
                    "enabled": "Plugin activé",
                    "testConnection": "Vérifier la connexion",
                    "showConfig": "État de la configuration",
                    "plexBase": "Serveur Plex",
                    "plexToken": "Plex Token",
                    "tokenHelp": "Où trouver le token",
                    "matchLimit": "Nombre maximal de résultats",
                    "exactYear": "Année exacte uniquement",
                    "clientId": "Identifiant client",
                    "debug": "Débogage",
                    "debugLogButton": "Journal de débogage",
                    "infoText": "Configurez l’adresse du serveur Plex et le token personnel. Après vérification, Plex apparaît comme source pour les films et séries.",
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
                    "infoTitle": "Aiuto",
                    "enabled": "Plugin attivo",
                    "testConnection": "Verifica connessione",
                    "showConfig": "Stato configurazione",
                    "plexBase": "Server Plex",
                    "plexToken": "Token Plex",
                    "tokenHelp": "Dove trovare il token",
                    "matchLimit": "Numero massimo risultati",
                    "exactYear": "Solo anno esatto",
                    "clientId": "Identificatore client",
                    "debug": "Debug",
                    "debugLogButton": "Log debug",
                    "infoText": "Imposta indirizzo del server Plex e token personale. Dopo la verifica, Plex appare come sorgente in film e serie.",
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
                    "markError": "Aggiornamento Plex fallito"
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
            clientId: String(get('clientId', DEFAULTS.clientId) || DEFAULTS.clientId).trim(),
            matchLimit: parseInt(get('matchLimit', DEFAULTS.matchLimit), 10) || DEFAULTS.matchLimit,
            showOnlyExactYear: boolValue('showOnlyExactYear', DEFAULTS.showOnlyExactYear),
            debug: boolValue('debug', DEFAULTS.debug),
            episodeActionMode: String(get('episodeActionMode', DEFAULTS.episodeActionMode) || DEFAULTS.episodeActionMode)
        };
    }

    function save(next) {
        Object.keys(next).forEach(function (key) {
            try { Lampa.Storage.set(PLUGIN_NS + '_' + key, next[key]); }
            catch (e) {}
        });
    }

    function boolFromParam(value, fallback) {
        if (value === true || value === 'true' || value === '1' || value === 1) return true;
        if (value === false || value === 'false' || value === '0' || value === 0) return false;
        return !!fallback;
    }

    function log() {
        if (!DEBUG_ALWAYS && !settings().debug) return;
        var args = [].slice.call(arguments);
        try {
            DEBUG_BUFFER.push({ time: new Date().toLocaleTimeString(), args: args.map(function (item) {
                if (typeof item === 'string') return item;
                try { return JSON.stringify(item, null, 2); }
                catch (e) { return String(item); }
            }) });
            if (DEBUG_BUFFER.length > 80) DEBUG_BUFFER.shift();
            window.PlexSourceDebug = DEBUG_BUFFER;
        }
        catch (e) {}
        if (!window.console) return;
        console.log.apply(console, ['[plex-source]'].concat(args));
    }

    function showDebugPanel() {
        var old = document.querySelector('.plex-source-debug-overlay');
        if (old) old.remove();
        var overlay = document.createElement('div');
        overlay.className = 'plex-source-debug-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:9999999;background:rgba(0,0,0,.82);color:#fff;font-family:monospace;padding:18px;overflow:auto;white-space:pre-wrap;font-size:12px;';
        var close = document.createElement('button');
        close.textContent = 'Close';
        close.style.cssText = 'position:sticky;top:0;float:right;z-index:2;padding:8px 12px;';
        close.onclick = function () { overlay.remove(); };
        overlay.appendChild(close);
        var title = document.createElement('div');
        title.textContent = t('debugTitle');
        title.style.cssText = 'font-size:18px;font-weight:bold;margin-bottom:12px;';
        overlay.appendChild(title);
        var body = document.createElement('div');
        body.textContent = DEBUG_BUFFER.length ? DEBUG_BUFFER.map(function (row) {
            return '[' + row.time + '] ' + row.args.join(' ');
        }).join('\n\n') : t('debugEmpty');
        overlay.appendChild(body);
        document.body.appendChild(overlay);
        overlayFocus(0);
        setTimeout(function () { overlayFocus(0); }, 0);
        setTimeout(function () { overlayFocus(0); }, 120);
    }

    function noty(text) {
        if (window.Lampa && Lampa.Noty) Lampa.Noty.show(text);
    }

    function plexHeaders(s) {
        return {
            'Accept': 'application/xml',
            'X-Plex-Token': s.plexToken,
            'X-Plex-Product': 'Plex Source for Lampa',
            'X-Plex-Version': '0.1.0-beta',
            'X-Plex-Client-Identifier': s.clientId || DEFAULTS.clientId
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
        var query = new URLSearchParams(params || {});
        var url = s.plexBase + path + (query.toString() ? '?' + query.toString() : '');
        return fetch(url, { method: 'GET', mode: 'cors', headers: plexHeaders(s) })
            .then(function (resp) {
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

    function mapVideo(video, card) {
        var media = video.querySelector('Media');
        var part = media ? media.querySelector('Part') : null;
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
            guids: guidList(video)
        };
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

        return Promise.all(titles.map(function (title) {
            return fetchXml('/library/all', { type: type, title: title, includeGuids: '1' })
                .then(function (doc) {
                    var selector = type === '2' ? 'Directory,Video' : 'Video';
                    var mapped = nodes(doc, selector).map(function (v) { return mapVideo(v, card); });
                    log('findMatches:query result', { title: title, type: type, selector: selector, count: mapped.length, mapped: mapped });
                    return mapped;
                })
                .catch(function (err) { log('match query failed', title, err); return []; });
        })).then(function (groups) {
            var byKey = {};
            groups.forEach(function (items) {
                items.forEach(function (item) {
                    if (!item.ratingKey) return;
                    if (!byKey[item.ratingKey] || item.score > byKey[item.ratingKey].score) byKey[item.ratingKey] = item;
                });
            });
            return Object.keys(byKey).map(function (key) { return byKey[key]; })
                .filter(function (item) { return item.score > 0; })
                .sort(function (a, b) { return b.score - a.score; })
                .slice(0, settings().matchLimit);
        });
    }

    function fetchSeasons(showRatingKey) {
        return fetchXml('/library/metadata/' + encodeURIComponent(showRatingKey) + '/children', {})
            .then(function (doc) {
                return nodes(doc, 'Directory').map(function (season) {
                    return {
                        ratingKey: attr(season, 'ratingKey'),
                        title: attr(season, 'title') || (t('seasonFallback') + ' ' + attr(season, 'index')),
                        index: attr(season, 'index'),
                        leafCount: attr(season, 'leafCount'),
                        viewedLeafCount: attr(season, 'viewedLeafCount'),
                        thumb: attr(season, 'thumb'),
                        art: attr(season, 'art')
                    };
                }).filter(function (season) { return season.ratingKey; });
            });
    }

    function fetchEpisodes(seasonRatingKey) {
        return fetchXml('/library/metadata/' + encodeURIComponent(seasonRatingKey) + '/children', { includeGuids: '1' })
            .then(function (doc) {
                return nodes(doc, 'Video').map(function (ep) { return mapVideo(ep, {}); })
                    .filter(function (ep) { return ep.ratingKey && ep.partKey; })
                    .sort(function (a, b) { return (parseInt(a.index, 10) || 0) - (parseInt(b.index, 10) || 0); });
            });
    }

    function streamUrl(item) {
        if (!item || !item.partKey) return '';
        var s = settings();
        return s.plexBase + item.partKey + (item.partKey.indexOf('?') >= 0 ? '&' : '?') + 'download=0&X-Plex-Token=' + encodeURIComponent(s.plexToken);
    }

    function thumbUrl(path) {
        if (!path) return '';
        var s = settings();
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
        return Lampa.Timeline.view(Lampa.Utils.hash(['plex-source', mediaType, id].join(':')));
    }

    function playItem(card, item) {
        var url = streamUrl(item);
        if (!url) {
            noty(t('notPlayable'));
            return;
        }
        var timeline = timelineFor(card, item);
        var title = isShow(card)
            ? ((item.grandparentTitle || localTitleFrom(card) || t('showFallback')) + ' — S' + (item.parentIndex || '?') + 'E' + (item.index || '?') + ' — ' + (item.title || t('episodeFallback')))
            : ((localTitleFrom(card) || item.title || 'Plex') + ' / Plex — ' + (item.sectionTitle || 'Library'));

        var data = {
            url: url,
            title: title.replace(/<[^>]*>?/gm, ''),
            quality: qualityMap(item),
            timeline: timeline,
            card: card,
            thumbnail: thumbUrl(item.thumb) || (card && card.poster_path && Lampa.Api ? Lampa.Api.img(card.poster_path) : ''),
            torrent_hash: 'plex-source:' + (item.ratingKey || item.partKey || 'stream'),
            plex: { ratingKey: item.ratingKey, sectionTitle: item.sectionTitle }
        };

        Lampa.Player.play(data);
        Lampa.Player.playlist([{ title: data.title, url: data.url, timeline: timeline, thumbnail: data.thumbnail, torrent_hash: data.torrent_hash }]);
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
            '.plex-source-meta{display:block;opacity:.65;font-size:13px;margin-top:4px}',
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
            el.onclick = row.onClick;
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

    function imageIcon(path, fallback) {
        var url = thumbUrl(path) || fallback || '';
        return url ? '<img src="' + url.replace(/"/g, '&quot;') + '" />' : icon();
    }

    function showNativeSelect(title, items, onSelect, onBack, onLong) {
        var api = selectApi();
        if (!api || !api.show) return false;
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

    function openShow(card, show, selectedSeasonKey) {
        noty(t('loadingSeasons'));
        fetchSeasons(show.ratingKey).then(function (seasons) {
            var title = 'Plex — ' + (show.title || localTitleFrom(card));
            var nativeItems = seasons.map(function (season) {
                return {
                    title: season.title,
                    subtitle: season.leafCount ? (season.leafCount + ' ' + t('episodesSuffix')) : '',
                    template: 'selectbox_icon',
                    icon: imageIcon(season.thumb || show.thumb || card.poster_path, card.poster_path && Lampa.Api ? Lampa.Api.img(card.poster_path) : ''),
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
        return plexCommand(endpoint, {
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

    function showEpisodeActions(card, show, season, ep) {
        showNativeSelect(ep.title || t('episodeFallback'), [
            { title: t('actionPlay'), episode: ep, action: 'play' },
            { title: t('actionMarkWatched'), episode: ep, action: 'watched' },
            { title: t('actionMarkUnwatched'), episode: ep, action: 'unwatched' }
        ], function (item) {
            if (item.action === 'play') playItem(card, ep);
            else if (item.action === 'watched') markEpisode(card, show, season, ep, true);
            else if (item.action === 'unwatched') markEpisode(card, show, season, ep, false);
        }, function () {
            openSeason(card, show, season);
        });
    }

    function handleEpisodeSelect(card, show, season, ep) {
        if (settings().episodeActionMode === 'actions') showEpisodeActions(card, show, season, ep);
        else playItem(card, ep);
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
        poster.src = thumbUrl(show.thumb || season.thumb) || (card.poster_path && Lampa.Api ? Lampa.Api.img(card.poster_path) : '');
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
            img.src = thumbUrl(ep.thumb || season.thumb || show.thumb) || (card.backdrop_path && Lampa.Api ? Lampa.Api.img(card.backdrop_path) : '');
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
            item.onclick = function () { closeOverlay(true); playItem(card, ep); };
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
        fetchEpisodes(season.ratingKey).then(function (episodes) {
            var title = 'Plex — ' + season.title;
            var nativeItems = episodes.map(function (ep) {
                var bits = [];
                if (ep.resolution) bits.push(String(ep.resolution).toUpperCase());
                if (ep.videoCodec) bits.push(ep.videoCodec.toUpperCase());
                if (ep.bitrate) bits.push(formatBitrate(ep.bitrate));
                bits.unshift(watchedInfo(ep).label);
                return {
                    title: 'E' + (ep.index || '?') + ' — ' + (ep.title || t('episodeFallback')),
                    subtitle: bits.join(' · '),
                    template: 'selectbox_icon',
                    icon: imageIcon(ep.thumb || season.thumb || show.thumb || card.backdrop_path || card.poster_path, card.backdrop_path && Lampa.Api ? Lampa.Api.img(card.backdrop_path) : ''),
                    episode: ep
                };
            });
            if (showNativeSelect(title, nativeItems, function (item) {
                handleEpisodeSelect(card, show, season, item.episode);
            }, function () {
                openShow(card, show, season.ratingKey);
            }, function (item) {
                showEpisodeActions(card, show, season, item.episode);
            })) return;

            showList(title, show.title || localTitleFrom(card), episodes.map(function (ep) {
                var bits = [];
                if (ep.resolution) bits.push(String(ep.resolution).toUpperCase());
                if (ep.videoCodec) bits.push(ep.videoCodec.toUpperCase());
                if (ep.bitrate) bits.push(formatBitrate(ep.bitrate));
                bits.unshift(watchedInfo(ep).label);
                return {
                    title: 'E' + (ep.index || '?') + ' — ' + (ep.title || t('episodeFallback')),
                    meta: bits.join(' · '),
                    onClick: function () { closeOverlay(true); playItem(card, ep); }
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
        if (!isShow(card) && match.resolution) subtitle.push(String(match.resolution).toUpperCase());
        if (!isShow(card) && match.videoCodec) subtitle.push(match.videoCodec.toUpperCase());
        if (!isShow(card) && match.bitrate) subtitle.push(formatBitrate(match.bitrate));

        var button = $([
            '<div class="full-start__button selector view--plex-source" data-subtitle="', subtitle.join(' · '), '">',
            icon(), '<span>Plex — ', match.sectionTitle || 'Library', '</span>', '</div>'
        ].join(''));

        button.on('hover:enter', function () {
            LAST_TRIGGER_ELEMENT = button[0];
            if (isShow(card)) openShow(card, match);
            else playItem(card, match);
        });
        return button;
    }

    function regroup(object) {
        try {
            if (object && object.items && object.items[0] && object.items[0].emit) object.items[0].emit('groupButtons');
        }
        catch (e) { log('groupButtons failed', e); }
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
        log('settings state', { enabled: s.enabled, hasBase: !!s.plexBase, plexBase: s.plexBase, hasToken: !!s.plexToken, isShow: isShow(card), queryTitle: titleFrom(card), localTitle: localTitleFrom(card), year: yearFrom(card) });
        if (!s.enabled) { log('plugin disabled'); return; }
        if (!s.plexBase || !s.plexToken) { log('skip: missing Plex config'); return; }
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
        add({ type: 'button', name: component + '_test_connection', field: { name: t('testConnection') }, onChange: function () { fetchXml('/identity', {}).then(function (doc) { var m = doc.querySelector('MediaContainer'); log('connection test ok', { friendlyName: attr(m, 'friendlyName'), machineIdentifier: attr(m, 'machineIdentifier') }); noty(t('connectionOk') + ': ' + (attr(m, 'friendlyName') || attr(m, 'machineIdentifier') || 'Plex')); }).catch(function (err) { log('test failed', err && (err.stack || err.message || err)); noty(t('connectionFail')); }); } });
        add({ type: 'button', name: component + '_show_config', field: { name: t('showConfig') }, onChange: function () { var s = settings(); noty(t('currentConfigPrefix') + ': ' + (s.plexBase || t('notSet')) + ' / token ' + (s.plexToken ? t('present') : t('missing'))); } });

        add({ type: 'title', name: component + '_title_connection', field: { name: t('connectionTitle') } });
        add({ type: 'static', name: component + '_info', field: { name: t('infoTitle'), description: t('infoText') } });
        add({ type: 'button', name: component + '_plex_base', field: { name: t('plexBase'), description: t('baseDescription') }, onChange: function () { promptText(t('plexBase'), 'http://192.168.1.10:32400', settings().plexBase, function (v) { save({ plexBase: v.trim().replace(/\/$/, '') }); noty(t('savedBase')); }); } });
        add({ type: 'button', name: component + '_plex_token', field: { name: t('plexToken'), description: t('tokenDescription') }, onChange: function () { promptText(t('plexToken'), t('tokenPlaceholder'), settings().plexToken, function (v) { save({ plexToken: v.trim() }); noty(t('savedToken')); }); } });
        add({ type: 'static', name: component + '_token_help', field: { name: t('tokenHelp'), description: t('tokenHelpText') } });

        add({ type: 'title', name: component + '_title_search', field: { name: t('searchTitle') } });
        add({ type: 'button', name: component + '_match_limit', field: { name: t('matchLimit'), description: t('limitDescription') }, onChange: function () { promptText(t('matchLimit'), String(DEFAULTS.matchLimit), String(settings().matchLimit), function (v) { var n = parseInt(v, 10); save({ matchLimit: n > 0 ? n : DEFAULTS.matchLimit }); noty(t('savedLimit')); }); } });
        add({ type: 'trigger', name: component + '_exact_year', default: settings().showOnlyExactYear, field: { name: t('exactYear'), description: t('exactYearDescription') }, onChange: function (value) { var next = boolFromParam(value, DEFAULTS.showOnlyExactYear); save({ showOnlyExactYear: next }); noty(t('exactYear') + ': ' + (next ? t('on') : t('off'))); } });
        add({ type: 'select', name: component + '_episode_action_mode', values: { play_long_actions: t('modePlayLong'), actions: t('modeActions') }, default: settings().episodeActionMode, field: { name: t('episodeActionMode'), description: t('episodeActionModeDescription') }, onChange: function (value) { save({ episodeActionMode: value || DEFAULTS.episodeActionMode }); } });

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

    function annotateInstalledPlugin() {        try {
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
