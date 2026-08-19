// ============================================================================
// BERTHOPLAY — MOTEUR D'INTERNATIONALISATION MULTILINGUE (22 LANGUES EXHAUSTIVES)
// ============================================================================

class I18nEngine {
  constructor() {
    this.currentLang = this.detectLanguage();
    this.translations = {
      // 1. FRANÇAIS (FR)
      fr: {
        navHome: "Accueil", navActus: "Actus", navTop: "Top", navAccount: "Compte", navSettings: "Réglages",
        gameVictories: "Victoires :", gameStage: "Étape :", gameProgression: "Progression :", gameBest: "Best :",
        coins: "COINS", btnConnexion: "Connexion", btnEco: "Infrastructures Bertho",
        btnPlay: "Jouer", btnReviews: "Avis", btnResume: "Reprendre",
        btnInstallPWA: "Installer l'application", pwaBannerText: "Installez l'application BerthoPlay pour une expérience 100% fluide et plein écran",
        pwaStatus: "Statut PWA", pwaInstalled: "Application Installée", pwaBrowser: "Navigateur Web",
        settingsTitle: "Réglages de la Console", soundLabel: "Sons & Bruitages", rulesLabel: "Règlements & Confidentialité",
        rulesRead: "Consulter", cacheLabel: "Vider le Cache Local", cacheAction: "Réinitialiser", edgeLabel: "Serveur Edge",
        logout: "Se Déconnecter", langLabel: "Langue de la Console",
        voiceMessage: "Message vocal", audioCall: "Appel Audio", videoCall: "Appel Vidéo",
        followers: "Abonnés", following: "Abonnements", commonFollowers: "Abonnés en commun",
        searchPlaceholder: "Rechercher un joueur...", searchNoResult: "Aucun joueur trouvé.",
        requestMic: "Microphone requis", requestNotif: "Notifications Push",
        confirmClearCacheTitle: "VIDER LE CACHE", confirmClearCacheMsg: "Voulez-vous réinitialiser le cache local de la console ?",
        cacheSuccess: "Cache réinitialisé avec succès !"
      },

      // 2. LINGALA (LN)
      ln: {
        navHome: "Mbosu", navActus: "Sango", navTop: "Bale", navAccount: "Kompte", navSettings: "Bipale",
        gameVictories: "Bipale :", gameStage: "Etape :", gameProgression: "Kende liboso :", gameBest: "Malama :",
        coins: "MBONGO", btnConnexion: "Kota", btnEco: "Ndako Bertho",
        btnInstallPWA: "Tia App", pwaBannerText: "Tia App BerthoPlay mpo na kosana malamu mpenza",
        pwaStatus: "Eza PWA", pwaInstalled: "App Etiami", pwaBrowser: "Internet",
        settingsTitle: "Bipale ya Console", soundLabel: "Lokito", rulesLabel: "Mibeko ya kimya",
        rulesRead: "Tanga", cacheLabel: "Penza cache", cacheAction: "Zongisa", edgeLabel: "Server Edge",
        logout: "Bima", langLabel: "Lokota ya Console",
        voiceMessage: "Mongongo", audioCall: "Benga mongongo", videoCall: "Benga video",
        followers: "Baninga", following: "Balandi", commonFollowers: "Baninga na bino",
        searchPlaceholder: "Luka mosani...", searchNoResult: "Mosani amonanaki te.",
        requestMic: "Microphone esengeli", requestNotif: "Sango ya PWA",
        confirmClearCacheTitle: "PENZA CACHE", confirmClearCacheMsg: "Olingi olongola bapapye ya kala ?",
        cacheSuccess: "Epenzami malamu !"
      },

      // 3. KIKONGO (KG)
      kg: {
        navHome: "Lufutu", navActus: "Sango", navTop: "Ntandu", navAccount: "Kompte", navSettings: "Sobula",
        gameVictories: "Akeni :", gameStage: "Yinsi :", gameProgression: "Kwendesila :", gameBest: "Kete :",
        coins: "MBONGO", btnConnexion: "Kota", btnEco: "Kikuku Bertho",
        btnInstallPWA: "Tulula App", pwaBannerText: "Tulula App BerthoPlay mpo nasakila kyese",
        pwaStatus: "Kifu PWA", pwaInstalled: "App Itudimini", pwaBrowser: "Internet",
        settingsTitle: "Mambu ya Console", soundLabel: "Ngana", rulesLabel: "Mibeko",
        rulesRead: "Tanga", cacheLabel: "Katula cache", cacheAction: "Vutula", edgeLabel: "Server Edge",
        logout: "Vaika", langLabel: "Ndinga ya Console",
        voiceMessage: "Ndinga", audioCall: "Benga ndinga", videoCall: "Benga video",
        followers: "Kanda", following: "Balandi", commonFollowers: "Kanda ya mpangi",
        searchPlaceholder: "Sosa muntu...", searchNoResult: "Muntu amonanaki ko.",
        requestMic: "Microphone", requestNotif: "Sango",
        confirmClearCacheTitle: "KATULA CACHE", confirmClearCacheMsg: "Zolele katula cache ?",
        cacheSuccess: "Ikatudimini !"
      },

      // 4. SWAHILI (SW)
      sw: {
        navHome: "Mwanzo", navActus: "Habari", navTop: "Juu", navAccount: "Akaunti", navSettings: "Mipangilio",
        gameVictories: "Ushindi:", gameStage: "Hatua:", gameProgression: "Maendeleo:", gameBest: "Bora:",
        coins: "SARAFU", btnConnexion: "Ingia", btnEco: "Mfumo wa Bertho",
        btnInstallPWA: "Sakinisha App", pwaBannerText: "Sakinisha BerthoPlay kwa uchezaji bora zaidi",
        pwaStatus: "Hali ya PWA", pwaInstalled: "Imesakinishwa", pwaBrowser: "Kivinjari cha Tovuti",
        settingsTitle: "Mipangilio ya Console", soundLabel: "Sauti na Athari", rulesLabel: "Sheria na Faragha",
        rulesRead: "Soma", cacheLabel: "Futa Kumbukumbu", cacheAction: "Weka Upya", edgeLabel: "Seva ya Edge",
        logout: "Toka", langLabel: "Lugha ya Console",
        voiceMessage: "Ujumbe wa Sauti", audioCall: "Piga Sauti", videoCall: "Piga Video",
        followers: "Wafuasi", following: "Unaowafuata", commonFollowers: "Wafuasi wa Pamoja",
        searchPlaceholder: "Tafuta mchezaji...", searchNoResult: "Hakuna mchezaji aliyepatikana.",
        requestMic: "Kipaza sauti Kinahitajika", requestNotif: "Arifa za Push",
        confirmClearCacheTitle: "FUTA KUMBUKUMBU", confirmClearCacheMsg: "Je, unataka kufuta kumbukumbu ya hapa?",
        cacheSuccess: "Kumbukumbu imefutwa kwa mafanikio!"
      },

      // 5. YORUBA (YO)
      yo: {
        navHome: "Ile", navActus: "Iroyin", navTop: "Oke", navAccount: "Akaunti", navSettings: "Eto",
        gameVictories: "Asegun:", gameStage: "Ipele:", gameProgression: "Itesiwaju:", gameBest: "Giga julo:",
        coins: "OWO", btnConnexion: "Wole", btnEco: "Aaye Bertho",
        btnInstallPWA: "Fi App Sori", pwaBannerText: "Fi BerthoPlay sori ẹrọ rẹ fun ere ti o dara julọ",
        pwaStatus: "Eto PWA", pwaInstalled: "A ti fi sori ẹrọ", pwaBrowser: "Ero ayelujara",
        settingsTitle: "Awon Eto Console", soundLabel: "Iro & Soro", rulesLabel: "Ofin & Aseji",
        rulesRead: "Ka a", cacheLabel: "Mule Cache Kuro", cacheAction: "Tún se", edgeLabel: "Seva Edge",
        logout: "Jade", langLabel: "Ede Console",
        voiceMessage: "Iroyin Ohun", audioCall: "Ipe Ohun", videoCall: "Ipe Bidio",
        followers: "Awon ti o tele o", following: "Awon ti o tele", commonFollowers: "Awon ti e joo tele",
        searchPlaceholder: "Wa elere...", searchNoResult: "Kosi elere kankan.",
        requestMic: "Maikirofoni Gbon", requestNotif: "Awon Ibi Iroyin",
        confirmClearCacheTitle: "MULE CACHE KURO", confirmClearCacheMsg: "Se o fe mu cache kuro?",
        cacheSuccess: "A ti mu cache kuro ni reere!"
      },

      // 6. IGBO (IG)
      ig: {
        navHome: "Lọ ụlọ", navActus: "Akụkọ", navTop: "Elu", navAccount: "Akaụntụ", navSettings: "Ntọala",
        gameVictories: "Mmeri:", gameStage: "Ọkwa:", gameProgression: "Mmepe:", gameBest: "Ka mma:",
        coins: "EGO", btnConnexion: "Banye", btnEco: "Ebe Bertho",
        btnInstallPWA: "Kụnye App", pwaBannerText: "Kụnye BerthoPlay maka egwuregwu kachasị mma",
        pwaStatus: "Ọnọdụ PWA", pwaInstalled: "A kụnyere App", pwaBrowser: "Injin webụ",
        settingsTitle: "Ntọala Console", soundLabel: "Ụda & Okwu", rulesLabel: "Mpaghara & Nzuzo",
        rulesRead: "Gụọ", cacheLabel: "Kpochapụ Cache", cacheAction: "Ntọala ọhụrụ", edgeLabel: "Seva Edge",
        logout: "Pụọ", langLabel: "Asụsụ Console",
        voiceMessage: "Ozi Ụda", audioCall: "Anya Ụda", videoCall: "Anya Video",
        followers: "Ndị na-eso gị", following: "Ndị ị na-eso", commonFollowers: "Ndị so gị abụọ",
        searchPlaceholder: "Chọọ onye egwuregwu...", searchNoResult: "Enweghị onye ahụrụ.",
        requestMic: "Mikrofon Dị Mkpa", requestNotif: "Ọkwa Push",
        confirmClearCacheTitle: "KPOCHAPỤ CACHE", confirmClearCacheMsg: "Ị chọrọ ikpochapụ cache?",
        cacheSuccess: "Ikpochapụrụ cache nke ọma!"
      },

      // 7. HAUSA (HA)
      ha: {
        navHome: "Gida", navActus: "Labarai", navTop: "Mafi Girma", navAccount: "Asusu", navSettings: "Saituna",
        gameVictories: "Nasara:", gameStage: "Mataki:", gameProgression: "Cigaba:", gameBest: "Mafi Kyau:",
        coins: "KUDI", btnConnexion: "Shiga", btnEco: "Tsitso Bertho",
        btnInstallPWA: "Shigar da App", pwaBannerText: "Shigar da BerthoPlay don kwarewa mafi kyau",
        pwaStatus: "Matsayin PWA", pwaInstalled: "An Shigar", pwaBrowser: "Sakataren Web",
        settingsTitle: "Saitunan Console", soundLabel: "Saututtuka", rulesLabel: "Dokoki da Sirri",
        rulesRead: "Karanta", cacheLabel: "Goge Cache", cacheAction: "Sake Saita", edgeLabel: "Uwar Gida Edge",
        logout: "Fita", langLabel: "Harshen Console",
        voiceMessage: "Sakon Muryar", audioCall: "Kiran Murya", videoCall: "Kiran Bidiyo",
        followers: "Masu Biyo Ka", following: "Masu Biyowa", commonFollowers: "Abokan Biyo Na Tsaro",
        searchPlaceholder: "Nema dan wasa...", searchNoResult: "Ba a sami dan wasa ba.",
        requestMic: "Ana Bukatar Na'urar Murya", requestNotif: "Sankon Tura",
        confirmClearCacheTitle: "GOGE CACHE", confirmClearCacheMsg: "Kuna son goge cache?",
        cacheSuccess: "An goge cache cikin nasara!"
      },

      // 8. ZULU (ZU)
      zu: {
        navHome: "Ikhaya", navActus: "Izindaba", navTop: "Phezulu", navAccount: "I-Akhawunti", navSettings: "Izilungiselelo",
        gameVictories: "Izinqobo:", gameStage: "Isigaba:", gameProgression: "Inqubekelaphambili:", gameBest: "Okungcono kakhulu:",
        coins: "IZINHLANHLA", btnConnexion: "Ngena", btnEco: "Bertho Ecosystem",
        btnInstallPWA: "Faka Uhlelo", pwaBannerText: "Faka i-BerthoPlay ukuze uthole okuhlangenwe nakho okugcwele",
        pwaStatus: "Isimo se-PWA", pwaInstalled: "Kufakwe kuhlelo", pwaBrowser: "Isiphequluli Solvebu",
        settingsTitle: "Izilungiselelo ze-Console", soundLabel: "Umsindo Nezilwakazi", rulesLabel: "Imithetho Nokuyimfihlo",
        rulesRead: "Funda", cacheLabel: "Susa i-Cache", cacheAction: "Phinda uqalise", edgeLabel: "Iseva ye-Edge",
        logout: "Phuma", langLabel: "Ulimi lwe-Console",
        voiceMessage: "Ulayezo Womsindo", audioCall: "Ucingo Lwomsindo", videoCall: "Ucingo Lwevidiyo",
        followers: "Abalandeli", following: "Abo Bafundi", commonFollowers: "Abalandeli Ababelana Nabo",
        searchPlaceholder: "Dinga umdlali...", searchNoResult: "Akukho mdlali utholakeleyo.",
        requestMic: "Kudingeka Imakrofoni", requestNotif: "Izaziso ze-Push",
        confirmClearCacheTitle: "SUSA I-CACHE", confirmClearCacheMsg: "Ingabe ufuna ukususa i-cache yendawo?",
        cacheSuccess: "I-cache isuswe ngempumelelo!"
      },

      // 9. ENGLISH (EN)
      en: {
        btnPlay: "Play", btnReviews: "Reviews", btnResume: "Resume",
        navHome: "Home", navActus: "Feed", navTop: "Top", navAccount: "Account", navSettings: "Settings",
        gameVictories: "Wins:", gameStage: "Stage:", gameProgression: "Progress:", gameBest: "Best:",
        coins: "COINS", btnConnexion: "Sign In", btnEco: "Bertho Ecosystem",
        btnInstallPWA: "Install App", pwaBannerText: "Install BerthoPlay App for a smooth full-screen experience",
        pwaStatus: "PWA Status", pwaInstalled: "App Installed", pwaBrowser: "Web Browser",
        settingsTitle: "Console Settings", soundLabel: "Sound & Audio", rulesLabel: "Rules & Privacy",
        rulesRead: "Read", cacheLabel: "Clear Local Cache", cacheAction: "Reset", edgeLabel: "Edge Server",
        logout: "Log Out", langLabel: "Console Language",
        voiceMessage: "Voice Note", audioCall: "Audio Call", videoCall: "Video Call",
        followers: "Followers", following: "Following", commonFollowers: "Mutual Followers",
        searchPlaceholder: "Search player...", searchNoResult: "No player found.",
        requestMic: "Microphone Required", requestNotif: "Push Notifications",
        confirmClearCacheTitle: "CLEAR CACHE", confirmClearCacheMsg: "Do you want to clear local cache?",
        cacheSuccess: "Cache cleared successfully!"
      },

      // 10. ESPAÑOL (ES)
      es: {
        navHome: "Inicio", navActus: "Noticias", navTop: "Top", navAccount: "Cuenta", navSettings: "Ajustes",
        gameVictories: "Victorias:", gameStage: "Etapa:", gameProgression: "Progresión:", gameBest: "Mejor:",
        coins: "MONEDAS", btnConnexion: "Iniciar sesión", btnEco: "Ecosistema Bertho",
        btnInstallPWA: "Instalar App", pwaBannerText: "Instala la app BerthoPlay para una experiencia fluida a pantalla completa",
        pwaStatus: "Estado PWA", pwaInstalled: "Aplicación Instalada", pwaBrowser: "Navegador Web",
        settingsTitle: "Ajustes de la Consola", soundLabel: "Sonidos y Efectos", rulesLabel: "Reglas y Privacidad",
        rulesRead: "Consultar", cacheLabel: "Borrar Caché Local", cacheAction: "Restablecer", edgeLabel: "Servidor Edge",
        logout: "Cerrar sesión", langLabel: "Idioma de la Consola",
        voiceMessage: "Mensaje de Voz", audioCall: "Llamada de Audio", videoCall: "Llamada de Video",
        followers: "Seguidores", following: "Siguiendo", commonFollowers: "Seguidores en Común",
        searchPlaceholder: "Buscar jugador...", searchNoResult: "Jugador no encontrado.",
        requestMic: "Micrófono Requerido", requestNotif: "Notificaciones Push",
        confirmClearCacheTitle: "BORRAR CACHÉ", confirmClearCacheMsg: "¿Deseas borrar la caché local?",
        cacheSuccess: "¡Caché borrada con éxito!"
      },

      // 11. PORTUGUÊS (PT)
      pt: {
        navHome: "Início", navActus: "Feed", navTop: "Top", navAccount: "Conta", navSettings: "Ajustes",
        gameVictories: "Vitórias:", gameStage: "Etapa:", gameProgression: "Progresso:", gameBest: "Melhor:",
        coins: "MOEDAS", btnConnexion: "Entrar", btnEco: "Ecossistema Bertho",
        btnInstallPWA: "Instalar App", pwaBannerText: "Instale o app BerthoPlay para uma experiência em tela cheia",
        pwaStatus: "Status PWA", pwaInstalled: "App Instalado", pwaBrowser: "Navegador Web",
        settingsTitle: "Configurações da Consola", soundLabel: "Sons e Efeitos", rulesLabel: "Regras e Privacidade",
        rulesRead: "Ler", cacheLabel: "Limpar Cache Local", cacheAction: "Reiniciar", edgeLabel: "Servidor Edge",
        logout: "Sair", langLabel: "Idioma da Consola",
        voiceMessage: "Mensagem de Voz", audioCall: "Chamada de Voz", videoCall: "Chamada de Vídeo",
        followers: "Seguidores", following: "Seguindo", commonFollowers: "Seguidores em Comum",
        searchPlaceholder: "Buscar jogador...", searchNoResult: "Nenhum jogador encontrado.",
        requestMic: "Microfone Necessário", requestNotif: "Notificações Push",
        confirmClearCacheTitle: "LIMPAR CACHE", confirmClearCacheMsg: "Deseja limpar o cache local?",
        cacheSuccess: "Cache limpo com sucesso!"
      },

      // 12. DEUTSCH (DE)
      de: {
        navHome: "Startseite", navActus: "News", navTop: "Top", navAccount: "Konto", navSettings: "Einstellungen",
        gameVictories: "Siege:", gameStage: "Stufe:", gameProgression: "Fortschritt:", gameBest: "Beste:",
        coins: "MÜNZEN", btnConnexion: "Anmelden", btnEco: "Bertho Ökosystem",
        btnInstallPWA: "App Installieren", pwaBannerText: "Installieren Sie die BerthoPlay App für Vollbildmodus",
        pwaStatus: "PWA-Status", pwaInstalled: "App Installiert", pwaBrowser: "Web-Browser",
        settingsTitle: "Konsolen-Einstellungen", soundLabel: "Sounds & Effekte", rulesLabel: "Regeln & Datenschutz",
        rulesRead: "Lesen", cacheLabel: "Lokalen Cache Leeren", cacheAction: "Zurücksetzen", edgeLabel: "Edge-Server",
        logout: "Abmelden", langLabel: "Konsolensprache",
        voiceMessage: "Sprachnachricht", audioCall: "Audioanruf", videoCall: "Videoanruf",
        followers: "Follower", following: "Folgt", commonFollowers: "Gemeinsame Follower",
        searchPlaceholder: "Spieler suchen...", searchNoResult: "Kein Spieler gefunden.",
        requestMic: "Mikrofon Erforderlich", requestNotif: "Push-Benachrichtigungen",
        confirmClearCacheTitle: "CACHE LEEREN", confirmClearCacheMsg: "Möchten Sie den lokalen Cache leeren?",
        cacheSuccess: "Cache erfolgreich geleert!"
      },

      // 13. ITALIANO (IT)
      it: {
        navHome: "Home", navActus: "Notizie", navTop: "Top", navAccount: "Account", navSettings: "Impostazioni",
        gameVictories: "Vittorie:", gameStage: "Tappa:", gameProgression: "Progresso:", gameBest: "Migliore:",
        coins: "MONETE", btnConnexion: "Accedi", btnEco: "Ecosistema Bertho",
        btnInstallPWA: "Installa App", pwaBannerText: "Installa l'app BerthoPlay per un'esperienza a schermo intero",
        pwaStatus: "Stato PWA", pwaInstalled: "App Installata", pwaBrowser: "Browser Web",
        settingsTitle: "Impostazioni Console", soundLabel: "Suoni ed Effetti", rulesLabel: "Regole e Privacy",
        rulesRead: "Leggi", cacheLabel: "Svuota Cache Locale", cacheAction: "Ripristina", edgeLabel: "Server Edge",
        logout: "Disconnetti", langLabel: "Lingua Console",
        voiceMessage: "Messaggio Vocale", audioCall: "Chiamata Audio", videoCall: "Chiamata Video",
        followers: "Follower", following: "Seguiti", commonFollowers: "Follower in Comune",
        searchPlaceholder: "Cerca giocatore...", searchNoResult: "Nessun giocatore trovato.",
        requestMic: "Microfono Richiesto", requestNotif: "Notifiche Push",
        confirmClearCacheTitle: "SVUOTA CACHE", confirmClearCacheMsg: "Vuoi svuotare la cache locale?",
        cacheSuccess: "Cache svuotata con successo!"
      },

      // 14. NEDERLANDS (NL)
      nl: {
        navHome: "Home", navActus: "Nieuws", navTop: "Top", navAccount: "Account", navSettings: "Instellingen",
        gameVictories: "Overwinningen:", gameStage: "Fase:", gameProgression: "Voortgang:", gameBest: "Beste:",
        coins: "MUNTEN", btnConnexion: "Inloggen", btnEco: "Bertho Ecosysteem",
        btnInstallPWA: "App Installeren", pwaBannerText: "Installeer BerthoPlay App voor volledige schermervaring",
        pwaStatus: "PWA Status", pwaInstalled: "App Geïnstalleerd", pwaBrowser: "Webbrowser",
        settingsTitle: "Console Instellingen", soundLabel: "Geluid & Effecten", rulesLabel: "Regels & Privacy",
        rulesRead: "Lezen", cacheLabel: "Lokele Cache Wissen", cacheAction: "Resetten", edgeLabel: "Edge Server",
        logout: "Uitloggen", langLabel: "Console Taal",
        voiceMessage: "Spraakbericht", audioCall: "Audio Oproep", videoCall: "Video Oproep",
        followers: "Volgers", following: "Volgend", commonFollowers: "Gemeenschappelijke Volgers",
        searchPlaceholder: "Zoek speler...", searchNoResult: "Geen speler gevonden.",
        requestMic: "Microfoon Vereist", requestNotif: "Push Meldingen",
        confirmClearCacheTitle: "CACHE WISSEN", confirmClearCacheMsg: "Wilt u de lokale cache wissen?",
        cacheSuccess: "Cache succesvol gewist!"
      },

      // 15. РUSSKIY (RU)
      ru: {
        navHome: "Главная", navActus: "Новости", navTop: "Топ", navAccount: "Аккаунт", navSettings: "Настройки",
        gameVictories: "Победы:", gameStage: "Этап:", gameProgression: "Прогресс:", gameBest: "Рекорд:",
        coins: "МОНЕТЫ", btnConnexion: "Войти", btnEco: "Экосистема Bertho",
        btnInstallPWA: "Установить App", pwaBannerText: "Установите BerthoPlay для работы в полноэкранном режиме",
        pwaStatus: "Статус PWA", pwaInstalled: "Приложение Установлено", pwaBrowser: "Веб-браузер",
        settingsTitle: "Настройки Консоли", soundLabel: "Звуки и Эффекты", rulesLabel: "Правила и Конфиденциальность",
        rulesRead: "Читать", cacheLabel: "Очистить Кэш", cacheAction: "Сбросить", edgeLabel: "Edge Сервер",
        logout: "Выйти", langLabel: "Язык Консоли",
        voiceMessage: "Голосовое сообщение", audioCall: "Аудиозвонок", videoCall: "Видеозвонок",
        followers: "Подписчики", following: "Подписки", commonFollowers: "Общие подписчики",
        searchPlaceholder: "Найти игрока...", searchNoResult: "Игрок не найден.",
        requestMic: "Требуется Микрофон", requestNotif: "Push-уведомления",
        confirmClearCacheTitle: "ОЧИСТИТЬ КЭШ", confirmClearCacheMsg: "Вы хотите очистить локальный кэш?",
        cacheSuccess: "Кэш успешно очищен!"
      },

      // 16. ZHONGWEN (ZH)
      zh: {
        navHome: "首页", navActus: "动态", navTop: "排行", navAccount: "账户", navSettings: "设置",
        gameVictories: "获胜:", gameStage: "关卡:", gameProgression: "进度:", gameBest: "最高:",
        coins: "金币", btnConnexion: "登录", btnEco: "Bertho 生态系统",
        btnInstallPWA: "安装应用", pwaBannerText: "安装 BerthoPlay 以获得全屏流畅体验",
        pwaStatus: "PWA 状态", pwaInstalled: "应用已安装", pwaBrowser: "网页浏览器",
        settingsTitle: "控制台设置", soundLabel: "声音与音效", rulesLabel: "规则与隐私",
        rulesRead: "查看", cacheLabel: "清除本地缓存", cacheAction: "重置", edgeLabel: "Edge 服务器",
        logout: "退出登录", langLabel: "控制台语言",
        voiceMessage: "语音消息", audioCall: "语音通话", videoCall: "视频通话",
        followers: "粉丝", following: "关注", commonFollowers: "共同关注",
        searchPlaceholder: "搜索玩家...", searchNoResult: "未找到玩家。",
        requestMic: "需要麦克风", requestNotif: "推送通知",
        confirmClearCacheTitle: "清除缓存", confirmClearCacheMsg: "您要清除本地缓存吗？",
        cacheSuccess: "缓存已成功清除！"
      },

      // 17. JAPANESE (JA)
      ja: {
        navHome: "ホーム", navActus: "ニュース", navTop: "ランキング", navAccount: "アカウント", navSettings: "設定",
        gameVictories: "勝利数:", gameStage: "ステージ:", gameProgression: "進行度:", gameBest: "ベスト:",
        coins: "コイン", btnConnexion: "ログイン", btnEco: "Bertho エコシステム",
        btnInstallPWA: "アプリをインストール", pwaBannerText: "BerthoPlayアプリをインストールして全画面で快適にプレイ",
        pwaStatus: "PWA ステータス", pwaInstalled: "アプリインストール済み", pwaBrowser: "Webブラウザ",
        settingsTitle: "コンソール設定", soundLabel: "効果音与音声", rulesLabel: "利用規約とプライバシー",
        rulesRead: "確認", cacheLabel: "ローカルキャッシュを消去", cacheAction: "リセット", edgeLabel: "Edge サーバー",
        logout: "ログアウト", langLabel: "コンソール言語",
        voiceMessage: "ボイスメッセージ", audioCall: "音声通話", videoCall: "ビデオ通話",
        followers: "フォロワー", following: "フォロー中", commonFollowers: "共通のフォロワー",
        searchPlaceholder: "プレイヤーを検索...", searchNoResult: "プレイヤーが見つかりません。",
        requestMic: "マイクが必要", requestNotif: "プッシュ通知",
        confirmClearCacheTitle: "キャッシュ消去", confirmClearCacheMsg: "ローカルキャッシュを消去しますか？",
        cacheSuccess: "キャッシュが正常に消去されました！"
      },

      // 18. KOREAN (KO)
      ko: {
        navHome: "홈", navActus: "피드", navTop: "랭킹", navAccount: "계정", navSettings: "설정",
        gameVictories: "승리:", gameStage: "단계:", gameProgression: "진행률:", gameBest: "최고:",
        coins: "코인", btnConnexion: "로그인", btnEco: "Bertho 생태계",
        btnInstallPWA: "앱 설치", pwaBannerText: "원활한 전체 화면 경험을 위해 BerthoPlay 앱을 설치하세요",
        pwaStatus: "PWA 상태", pwaInstalled: "앱 설치됨", pwaBrowser: "웹 브라우저",
        settingsTitle: "콘솔 설정", soundLabel: "사운드 및 효과음", rulesLabel: "규칙 및 개인정보",
        rulesRead: "보기", cacheLabel: "로컬 캐시 삭제", cacheAction: "재설정", edgeLabel: "Edge 서버",
        logout: "로그아웃", langLabel: "콘솔 언어",
        voiceMessage: "음성 메시지", audioCall: "음성 통화", videoCall: "영상 통화",
        followers: "팔로워", following: "팔로잉", commonFollowers: "함께 아는 팔로워",
        searchPlaceholder: "플레이어 검색...", searchNoResult: "플레이어를 찾을 수 없습니다.",
        requestMic: "마이크 필요", requestNotif: "푸시 알림",
        confirmClearCacheTitle: "캐시 삭제", confirmClearCacheMsg: "로컬 캐시를 삭제하시겠습니까?",
        cacheSuccess: "캐시가 성공적으로 삭제되었습니다!"
      },

      // 19. ARABIC (AR)
      ar: {
        navHome: "الرئيسية", navActus: "الأخبار", navTop: "الأعلى", navAccount: "الحساب", navSettings: "الإعدادات",
        gameVictories: "الانتصارات:", gameStage: "المرحلة:", gameProgression: "التقدم:", gameBest: "الأفضل:",
        coins: "عملات", btnConnexion: "تسجيل الدخول", btnEco: "نظام Bertho",
        btnInstallPWA: "تثبيت التطبيق", pwaBannerText: "قم بتثبيت تطبيق BerthoPlay للحصول على تجربة ملء الشاشة سلسة",
        pwaStatus: "حالة PWA", pwaInstalled: "التطبيق مثبّت", pwaBrowser: "متصفح الويب",
        settingsTitle: "إعدادات المنصة", soundLabel: "الأصوات والتأثيرات", rulesLabel: "القواعد والخصوصية",
        rulesRead: "قراءة", cacheLabel: "مسح الذاكرة المؤقتة", cacheAction: "إعادة ضبط", edgeLabel: "خادم Edge",
        logout: "تسجيل الخروج", langLabel: "لغة المنصة",
        voiceMessage: "رسالة صوتية", audioCall: "مكالمة صوتية", videoCall: "مكالمة فيديو",
        followers: "المتابعون", following: "يتابع", commonFollowers: "متابعون مشتركون",
        searchPlaceholder: "البحث عن لاعب...", searchNoResult: "لم يتم العثور على أي لاعب.",
        requestMic: "الميكروفون مطلوب", requestNotif: "إشعارات المنصة",
        confirmClearCacheTitle: "مسح الذاكرة", confirmClearCacheMsg: "هل تريد مسح الذاكرة المؤقتة؟",
        cacheSuccess: "تم مسح الذاكرة المؤقتة بنجاح!"
      },

      // 20. HINDI (HI)
      hi: {
        navHome: "होम", navActus: "फ़ीड", navTop: "टॉप", navAccount: "खाता", navSettings: "सेटिंग्स",
        gameVictories: "जीत:", gameStage: "चरण:", gameProgression: "प्रगति:", gameBest: "सर्वश्रेष्ठ:",
        coins: "सिक्के", btnConnexion: "साइन इन", btnEco: "Bertho इकोसिस्टम",
        btnInstallPWA: "ऐप इंस्टॉल करें", pwaBannerText: "पूर्ण स्क्रीन अनुभव के लिए BerthoPlay ऐप इंस्टॉल करें",
        pwaStatus: "PWA स्थिति", pwaInstalled: "ऐप इंस्टॉल हो गया", pwaBrowser: "वेब ब्राउज़र",
        settingsTitle: "कंसोल सेटिंग्स", soundLabel: "ध्वनि और प्रभाव", rulesLabel: "नियम और गोपनीयता",
        rulesRead: "पढ़ें", cacheLabel: "लोकल कैश साफ़ करें", cacheAction: "रीसेट", edgeLabel: "Edge सर्वर",
        logout: "साइन आउट", langLabel: "कंसोल भाषा",
        voiceMessage: "वॉयस मैसेज", audioCall: "ऑडियो कॉल", videoCall: "वीडियो कॉल",
        followers: "फ़ॉलोअर्स", following: "फ़ॉलो कर रहे हैं", commonFollowers: "कॉमन फ़ॉलोअर्स",
        searchPlaceholder: "खिलाड़ी खोजें...", searchNoResult: "कोई खिलाड़ी नहीं मिला।",
        requestMic: "माइक्रोफ़ोन आवश्यक है", requestNotif: "पुश नोटिफिकेशन",
        confirmClearCacheTitle: "कैश साफ़ करें", confirmClearCacheMsg: "क्या आप कैश साफ़ करना चाहते हैं?",
        cacheSuccess: "कैश सफलतापूर्वक साफ़ किया गया!"
      },

      // 21. TÜRKÇE (TR)
      tr: {
        navHome: "Ana Sayfa", navActus: "Haberler", navTop: "Liderler", navAccount: "Hesap", navSettings: "Ayarlar",
        gameVictories: "Galibiyet:", gameStage: "Aşama:", gameProgression: "İlerleme:", gameBest: "En İyi:",
        coins: "JETON", btnConnexion: "Giriş Yap", btnEco: "Bertho Ekosistemi",
        btnInstallPWA: "Uygulamayı Yükle", pwaBannerText: "Akıcı tam ekran deneyimi için BerthoPlay uygulamasını yükleyin",
        pwaStatus: "PWA Durumu", pwaInstalled: "Uygulama Yüklendi", pwaBrowser: "Web Tarayıcısı",
        settingsTitle: "Konsol Ayarları", soundLabel: "Ses ve Efektler", rulesLabel: "Kurallar ve Gizlilik",
        rulesRead: "Oku", cacheLabel: "Yerel Önbelleği Temizle", cacheAction: "Sıfırla", edgeLabel: "Edge Sunucusu",
        logout: "Çıkış Yap", langLabel: "Konsol Dili",
        voiceMessage: "Sesli Mesaj", audioCall: "Sesli Arama", videoCall: "Görüntülü Arama",
        followers: "Takipçiler", following: "Takip Edilenler", commonFollowers: "Ortak Takipçiler",
        searchPlaceholder: "Oyuncu ara...", searchNoResult: "Oyuncu bulunamadı.",
        requestMic: "Mikrofon Gerekli", requestNotif: "Anlık Bildirimler",
        confirmClearCacheTitle: "ÖNBELLEĞİ TEMİZLE", confirmClearCacheMsg: "Yerel önbelleği temizlemek istiyor musunuz?",
        cacheSuccess: "Önbellek başarıyla temizlendi!"
      },

      // 22. TIẾNG VIỆT (VI)
      vi: {
        navHome: "Trang chủ", navActus: "Bảng tin", navTop: "Xếp hạng", navAccount: "Tài khoản", navSettings: "Cài đặt",
        gameVictories: "Chiến thắng:", gameStage: "Giai đoạn:", gameProgression: "Tiến trình:", gameBest: "Tốt nhất:",
        coins: "XU", btnConnexion: "Đăng nhập", btnEco: "Hệ sinh thái Bertho",
        btnInstallPWA: "Cài đặt Ứng dụng", pwaBannerText: "Cài đặt BerthoPlay để có trải nghiệm toàn màn hình mượt mà",
        pwaStatus: "Trạng thái PWA", pwaInstalled: "Đã cài đặt", pwaBrowser: "Trình duyệt Web",
        settingsTitle: "Cài đặt Console", soundLabel: "Âm thanh & Hiệu ứng", rulesLabel: "Quy tắc & Quyền riêng tư",
        rulesRead: "Đọc", cacheLabel: "Xóa Cache", cacheAction: "Đặt lại", edgeLabel: "Máy chủ Edge",
        logout: "Đăng xuất", langLabel: "Ngôn ngữ Console",
        voiceMessage: "Tin nhắn thoại", audioCall: "Cuộc gọi thoại", videoCall: "Cuộc gọi Video",
        followers: "Người theo dõi", following: "Đang theo dõi", commonFollowers: "Người theo dõi chung",
        searchPlaceholder: "Tìm người chơi...", searchNoResult: "Không tìm thấy người chơi.",
        requestMic: "Yêu cầu Micro", requestNotif: "Thông báo Push",
        confirmClearCacheTitle: "XÓA CACHE", confirmClearCacheMsg: "Bạn có muốn xóa cache cục bộ?",
        cacheSuccess: "Xóa cache thành công!"
      }
    };
  }

  detectLanguage() {
    try {
      const data = localStorage.getItem('BERTHOPLAY_V1');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.language) return parsed.language;
      }
    } catch(e) {}
    
    const browserLang = (navigator.language || 'fr').substring(0, 2).toLowerCase();
    const supportedLangs = ['fr', 'ln', 'kg', 'sw', 'yo', 'ig', 'ha', 'zu', 'en', 'es', 'pt', 'de', 'it', 'nl', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'tr', 'vi'];
    return supportedLangs.includes(browserLang) ? browserLang : 'fr';
  }

  getLang() {
    return this.currentLang;
  }

  setLang(langCode) {
    this.currentLang = langCode;
    try {
      const data = JSON.parse(localStorage.getItem('BERTHOPLAY_V1') || '{}');
      data.language = langCode;
      localStorage.setItem('BERTHOPLAY_V1', JSON.stringify(data));
    } catch(e) {}

    this.applyDocumentLang();
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: langCode } }));
  }

  /**
   * @param {string} key
   * @param {string} [fallback] texte affiché si la clé n'existe dans aucune
   *        langue. Sans lui, une clé manquante s'affichait telle quelle à
   *        l'écran (« btnPlay » en plein milieu d'un bouton).
   */
  t(key, fallback) {
    const langObj = this.translations[this.currentLang] || this.translations.fr;
    const value = langObj[key] ?? this.translations.fr[key];
    if (value !== undefined) return value;

    if (import.meta.env?.DEV) {
      console.warn(`[i18n] clé manquante : ${key}`);
    }
    return fallback ?? key;
  }

  /**
   * Aligne <html lang> et <html dir> sur la langue active : sans ça, les
   * lecteurs d'écran prononcent le français avec l'accent anglais et l'arabe
   * s'affiche de gauche à droite.
   */
  applyDocumentLang() {
    const rtl = ['ar', 'he', 'fa', 'ur'];
    document.documentElement.lang = this.currentLang;
    document.documentElement.dir = rtl.includes(this.currentLang) ? 'rtl' : 'ltr';
  }
}

export const i18n = new I18nEngine();

// Le document doit porter la bonne langue dès le premier rendu.
i18n.applyDocumentLang();