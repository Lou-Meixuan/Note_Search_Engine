/**
 * translations.js - 多语言翻译文件
 * 
 * Created by: C (Cheng)
 * Date: 2026-01-07
 * 
 * 支持语言:
 * - en: English
 * - zh: 中文 (简体)
 * - ja: 日本語
 * - ko: 한국어
 * - es: Español
 * - fr: Français
 * - de: Deutsch
 * 
 * 注意: 文件标题 (title) 和用户设置的 tag 不翻译
 */

const translations = {
    // ===== English =====
    en: {
        // Common
        home: "Home",
        search: "Search",
        settings: "Settings",
        account: "Account",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        upload: "Upload",
        close: "Close",
        saved: "Saved ✔",
        
        // Search Page
        searchPlaceholder: "Search your notes...",
        remote: "Remote",
        local: "Local",
        remoteHint: "Search engine results",
        localHint: "Local documents",
        newDocument: "+ New",
        scopeAll: "Search All",
        scopeRemote: "Remote Only",
        scopeLocal: "Local Only",
        
        // Upload Modal
        uploadTitle: "Upload Document",
        dragDrop: "Drag & drop your file here",
        or: "or",
        browseFiles: "Browse Files",
        supportedTypes: "Supported: TXT, MD, PDF, DOCX",
        documentTitle: "Document Title",
        titlePlaceholder: "Enter document title...",
        tags: "Tags",
        tagsPlaceholder: "Add tags (comma separated)",
        uploading: "Uploading...",
        uploadSuccess: "Upload successful!",
        uploadError: "Upload failed",
        
        // Settings Page
        settingsTitle: "Settings",
        colorTheme: "Color Theme",
        colorThemeHint: "Choose a theme - each includes Light and Dark variants",
        themeColor: "Theme Color",
        language: "Language",
        layoutPreference: "Layout Preference",
        splitView: "Split View",
        focusRemote: "Focus Remote",
        focusLocal: "Focus Local",
        dangerZone: "Danger Zone",
        resetDefault: "Reset to Default",
        resetHint: "Clear local settings and restore defaults",
        
        // Theme
        appearance: "Appearance",
        darkMode: "Dark Mode",
        lightMode: "Light Mode",
        darkThemesHint: "Dark themes",
        lightThemesHint: "Light themes",
        switchToDark: "Switch to dark mode",
        switchToLight: "Switch to light mode",
        
        // Account Page
        accountTitle: "Account",
        profile: "Profile",
        username: "Username",
        email: "Email",
        logout: "Log Out",
        
        // Document Page
        documentDetails: "Document Details",
        content: "Content",
        metadata: "Metadata",
        createdAt: "Created At",
        fileType: "File Type",
        viewOriginal: "View Original",
        
        // Errors
        errorOccurred: "An error occurred",
        tryAgain: "Try Again",
        noResults: "No results found",
    },
    
    // ===== 中文 (简体) =====
    zh: {
        // Common
        home: "首页",
        search: "搜索",
        settings: "设置",
        account: "账户",
        save: "保存",
        cancel: "取消",
        delete: "删除",
        upload: "上传",
        close: "关闭",
        saved: "已保存 ✔",
        
        // Search Page
        searchPlaceholder: "搜索你的笔记...",
        remote: "远程",
        local: "本地",
        remoteHint: "搜索引擎结果",
        localHint: "本地文档",
        newDocument: "+ 新建",
        scopeAll: "搜索全部",
        scopeRemote: "仅远程",
        scopeLocal: "仅本地",
        
        // Upload Modal
        uploadTitle: "上传文档",
        dragDrop: "拖拽文件到这里",
        or: "或",
        browseFiles: "浏览文件",
        supportedTypes: "支持格式: TXT, MD, PDF, DOCX",
        documentTitle: "文档标题",
        titlePlaceholder: "输入文档标题...",
        tags: "标签",
        tagsPlaceholder: "添加标签 (逗号分隔)",
        uploading: "上传中...",
        uploadSuccess: "上传成功！",
        uploadError: "上传失败",
        
        // Settings Page
        settingsTitle: "设置",
        colorTheme: "颜色主题",
        colorThemeHint: "选择一个主题 - 每个主题都有浅色和深色版本",
        themeColor: "主题颜色",
        language: "语言",
        layoutPreference: "布局偏好",
        splitView: "分屏视图",
        focusRemote: "专注远程",
        focusLocal: "专注本地",
        dangerZone: "危险区域",
        resetDefault: "重置为默认",
        resetHint: "清除本地设置并恢复默认值",
        
        // Theme
        appearance: "外观",
        darkMode: "深色模式",
        lightMode: "浅色模式",
        darkThemesHint: "深色主题",
        lightThemesHint: "浅色主题",
        switchToDark: "切换到深色模式",
        switchToLight: "切换到浅色模式",
        
        // Account Page
        accountTitle: "账户",
        profile: "个人资料",
        username: "用户名",
        email: "邮箱",
        logout: "退出登录",
        
        // Document Page
        documentDetails: "文档详情",
        content: "内容",
        metadata: "元数据",
        createdAt: "创建时间",
        fileType: "文件类型",
        viewOriginal: "查看原文件",
        
        // Errors
        errorOccurred: "发生错误",
        tryAgain: "重试",
        noResults: "未找到结果",
    },
    
    // ===== 日本語 =====
    ja: {
        // Common
        home: "ホーム",
        search: "検索",
        settings: "設定",
        account: "アカウント",
        save: "保存",
        cancel: "キャンセル",
        delete: "削除",
        upload: "アップロード",
        close: "閉じる",
        saved: "保存しました ✔",
        
        // Search Page
        searchPlaceholder: "ノートを検索...",
        remote: "リモート",
        local: "ローカル",
        remoteHint: "検索エンジンの結果",
        localHint: "ローカルドキュメント",
        newDocument: "+ 新規",
        scopeAll: "すべて検索",
        scopeRemote: "リモートのみ",
        scopeLocal: "ローカルのみ",
        
        // Upload Modal
        uploadTitle: "ドキュメントをアップロード",
        dragDrop: "ファイルをここにドラッグ＆ドロップ",
        or: "または",
        browseFiles: "ファイルを選択",
        supportedTypes: "対応形式: TXT, MD, PDF, DOCX",
        documentTitle: "ドキュメントタイトル",
        titlePlaceholder: "タイトルを入力...",
        tags: "タグ",
        tagsPlaceholder: "タグを追加 (カンマ区切り)",
        uploading: "アップロード中...",
        uploadSuccess: "アップロード完了！",
        uploadError: "アップロード失敗",
        
        // Settings Page
        settingsTitle: "設定",
        colorTheme: "カラーテーマ",
        colorThemeHint: "テーマを選択 - 各テーマにライトとダークのバリエーションがあります",
        themeColor: "テーマカラー",
        language: "言語",
        layoutPreference: "レイアウト設定",
        splitView: "分割ビュー",
        focusRemote: "リモート重視",
        focusLocal: "ローカル重視",
        dangerZone: "危険ゾーン",
        resetDefault: "デフォルトにリセット",
        resetHint: "ローカル設定をクリアしてデフォルトに戻す",
        
        // Theme
        appearance: "外観",
        darkMode: "ダークモード",
        lightMode: "ライトモード",
        darkThemesHint: "ダークテーマ",
        lightThemesHint: "ライトテーマ",
        switchToDark: "ダークモードに切り替え",
        switchToLight: "ライトモードに切り替え",
        
        // Account Page
        accountTitle: "アカウント",
        profile: "プロフィール",
        username: "ユーザー名",
        email: "メール",
        logout: "ログアウト",
        
        // Document Page
        documentDetails: "ドキュメント詳細",
        content: "内容",
        metadata: "メタデータ",
        createdAt: "作成日",
        fileType: "ファイルタイプ",
        viewOriginal: "元ファイルを表示",
        
        // Errors
        errorOccurred: "エラーが発生しました",
        tryAgain: "再試行",
        noResults: "結果が見つかりません",
    },
    
    // ===== 한국어 =====
    ko: {
        // Common
        home: "홈",
        search: "검색",
        settings: "설정",
        account: "계정",
        save: "저장",
        cancel: "취소",
        delete: "삭제",
        upload: "업로드",
        close: "닫기",
        saved: "저장됨 ✔",
        
        // Search Page
        searchPlaceholder: "노트 검색...",
        remote: "원격",
        local: "로컬",
        remoteHint: "검색 엔진 결과",
        localHint: "로컬 문서",
        newDocument: "+ 새로 만들기",
        scopeAll: "전체 검색",
        scopeRemote: "원격만",
        scopeLocal: "로컬만",
        
        // Upload Modal
        uploadTitle: "문서 업로드",
        dragDrop: "파일을 여기에 드래그 앤 드롭",
        or: "또는",
        browseFiles: "파일 찾아보기",
        supportedTypes: "지원 형식: TXT, MD, PDF, DOCX",
        documentTitle: "문서 제목",
        titlePlaceholder: "제목 입력...",
        tags: "태그",
        tagsPlaceholder: "태그 추가 (쉼표로 구분)",
        uploading: "업로드 중...",
        uploadSuccess: "업로드 성공!",
        uploadError: "업로드 실패",
        
        // Settings Page
        settingsTitle: "설정",
        colorTheme: "색상 테마",
        colorThemeHint: "테마 선택 - 각 테마에는 라이트 및 다크 버전이 있습니다",
        themeColor: "테마 색상",
        language: "언어",
        layoutPreference: "레이아웃 설정",
        splitView: "분할 보기",
        focusRemote: "원격 집중",
        focusLocal: "로컬 집중",
        dangerZone: "위험 구역",
        resetDefault: "기본값으로 재설정",
        resetHint: "로컬 설정을 지우고 기본값으로 복원",
        
        // Theme
        appearance: "외관",
        darkMode: "다크 모드",
        lightMode: "라이트 모드",
        darkThemesHint: "다크 테마",
        lightThemesHint: "라이트 테마",
        switchToDark: "다크 모드로 전환",
        switchToLight: "라이트 모드로 전환",
        
        // Account Page
        accountTitle: "계정",
        profile: "프로필",
        username: "사용자 이름",
        email: "이메일",
        logout: "로그아웃",
        
        // Document Page
        documentDetails: "문서 상세",
        content: "내용",
        metadata: "메타데이터",
        createdAt: "생성일",
        fileType: "파일 유형",
        viewOriginal: "원본 보기",
        
        // Errors
        errorOccurred: "오류가 발생했습니다",
        tryAgain: "다시 시도",
        noResults: "결과를 찾을 수 없습니다",
    },
    
    // ===== Español =====
    es: {
        // Common
        home: "Inicio",
        search: "Buscar",
        settings: "Configuración",
        account: "Cuenta",
        save: "Guardar",
        cancel: "Cancelar",
        delete: "Eliminar",
        upload: "Subir",
        close: "Cerrar",
        saved: "Guardado ✔",
        
        // Search Page
        searchPlaceholder: "Buscar tus notas...",
        remote: "Remoto",
        local: "Local",
        remoteHint: "Resultados del motor de búsqueda",
        localHint: "Documentos locales",
        newDocument: "+ Nuevo",
        scopeAll: "Buscar Todo",
        scopeRemote: "Solo Remoto",
        scopeLocal: "Solo Local",
        
        // Upload Modal
        uploadTitle: "Subir Documento",
        dragDrop: "Arrastra y suelta tu archivo aquí",
        or: "o",
        browseFiles: "Explorar Archivos",
        supportedTypes: "Soportado: TXT, MD, PDF, DOCX",
        documentTitle: "Título del Documento",
        titlePlaceholder: "Ingresa el título...",
        tags: "Etiquetas",
        tagsPlaceholder: "Agregar etiquetas (separadas por coma)",
        uploading: "Subiendo...",
        uploadSuccess: "¡Subida exitosa!",
        uploadError: "Error al subir",
        
        // Settings Page
        settingsTitle: "Configuración",
        colorTheme: "Tema de Color",
        colorThemeHint: "Elige un tema - cada uno incluye variantes claro y oscuro",
        themeColor: "Color del Tema",
        language: "Idioma",
        layoutPreference: "Preferencia de Diseño",
        splitView: "Vista Dividida",
        focusRemote: "Enfoque Remoto",
        focusLocal: "Enfoque Local",
        dangerZone: "Zona de Peligro",
        resetDefault: "Restablecer por Defecto",
        resetHint: "Limpiar configuración local y restaurar valores predeterminados",
        
        // Theme
        appearance: "Apariencia",
        darkMode: "Modo Oscuro",
        lightMode: "Modo Claro",
        darkThemesHint: "Temas oscuros",
        lightThemesHint: "Temas claros",
        switchToDark: "Cambiar a modo oscuro",
        switchToLight: "Cambiar a modo claro",
        
        // Account Page
        accountTitle: "Cuenta",
        profile: "Perfil",
        username: "Usuario",
        email: "Correo",
        logout: "Cerrar Sesión",
        
        // Document Page
        documentDetails: "Detalles del Documento",
        content: "Contenido",
        metadata: "Metadatos",
        createdAt: "Creado",
        fileType: "Tipo de Archivo",
        viewOriginal: "Ver Original",
        
        // Errors
        errorOccurred: "Ocurrió un error",
        tryAgain: "Intentar de Nuevo",
        noResults: "No se encontraron resultados",
    },
    
    // ===== Français =====
    fr: {
        // Common
        home: "Accueil",
        search: "Rechercher",
        settings: "Paramètres",
        account: "Compte",
        save: "Enregistrer",
        cancel: "Annuler",
        delete: "Supprimer",
        upload: "Télécharger",
        close: "Fermer",
        saved: "Enregistré ✔",
        
        // Search Page
        searchPlaceholder: "Rechercher vos notes...",
        remote: "Distant",
        local: "Local",
        remoteHint: "Résultats du moteur de recherche",
        localHint: "Documents locaux",
        newDocument: "+ Nouveau",
        scopeAll: "Rechercher Tout",
        scopeRemote: "Distant Seulement",
        scopeLocal: "Local Seulement",
        
        // Upload Modal
        uploadTitle: "Télécharger un Document",
        dragDrop: "Glissez-déposez votre fichier ici",
        or: "ou",
        browseFiles: "Parcourir les Fichiers",
        supportedTypes: "Formats: TXT, MD, PDF, DOCX",
        documentTitle: "Titre du Document",
        titlePlaceholder: "Entrez le titre...",
        tags: "Tags",
        tagsPlaceholder: "Ajouter des tags (séparés par virgule)",
        uploading: "Téléchargement...",
        uploadSuccess: "Téléchargement réussi!",
        uploadError: "Échec du téléchargement",
        
        // Settings Page
        settingsTitle: "Paramètres",
        colorTheme: "Thème de Couleur",
        colorThemeHint: "Choisir un thème - chacun inclut des variantes clair et foncé",
        themeColor: "Couleur du Thème",
        language: "Langue",
        layoutPreference: "Préférence de Mise en Page",
        splitView: "Vue Divisée",
        focusRemote: "Focus Distant",
        focusLocal: "Focus Local",
        dangerZone: "Zone Dangereuse",
        resetDefault: "Réinitialiser par Défaut",
        resetHint: "Effacer les paramètres locaux et restaurer les valeurs par défaut",
        
        // Theme
        appearance: "Apparence",
        darkMode: "Mode Sombre",
        lightMode: "Mode Clair",
        darkThemesHint: "Thèmes sombres",
        lightThemesHint: "Thèmes clairs",
        switchToDark: "Passer en mode sombre",
        switchToLight: "Passer en mode clair",
        
        // Account Page
        accountTitle: "Compte",
        profile: "Profil",
        username: "Utilisateur",
        email: "Email",
        logout: "Déconnexion",
        
        // Document Page
        documentDetails: "Détails du Document",
        content: "Contenu",
        metadata: "Métadonnées",
        createdAt: "Créé le",
        fileType: "Type de Fichier",
        viewOriginal: "Voir l'Original",
        
        // Errors
        errorOccurred: "Une erreur est survenue",
        tryAgain: "Réessayer",
        noResults: "Aucun résultat trouvé",
    },
    
    // ===== Deutsch =====
    de: {
        // Common
        home: "Startseite",
        search: "Suchen",
        settings: "Einstellungen",
        account: "Konto",
        save: "Speichern",
        cancel: "Abbrechen",
        delete: "Löschen",
        upload: "Hochladen",
        close: "Schließen",
        saved: "Gespeichert ✔",
        
        // Search Page
        searchPlaceholder: "Notizen durchsuchen...",
        remote: "Remote",
        local: "Lokal",
        remoteHint: "Suchmaschinenergebnisse",
        localHint: "Lokale Dokumente",
        newDocument: "+ Neu",
        scopeAll: "Alles durchsuchen",
        scopeRemote: "Nur Remote",
        scopeLocal: "Nur Lokal",
        
        // Upload Modal
        uploadTitle: "Dokument hochladen",
        dragDrop: "Datei hierher ziehen",
        or: "oder",
        browseFiles: "Dateien durchsuchen",
        supportedTypes: "Unterstützt: TXT, MD, PDF, DOCX",
        documentTitle: "Dokumenttitel",
        titlePlaceholder: "Titel eingeben...",
        tags: "Tags",
        tagsPlaceholder: "Tags hinzufügen (durch Komma getrennt)",
        uploading: "Wird hochgeladen...",
        uploadSuccess: "Upload erfolgreich!",
        uploadError: "Upload fehlgeschlagen",
        
        // Settings Page
        settingsTitle: "Einstellungen",
        colorTheme: "Farbthema",
        colorThemeHint: "Wählen Sie ein Thema - jedes enthält helle und dunkle Varianten",
        themeColor: "Themenfarbe",
        language: "Sprache",
        layoutPreference: "Layout-Einstellung",
        splitView: "Geteilte Ansicht",
        focusRemote: "Remote-Fokus",
        focusLocal: "Lokal-Fokus",
        dangerZone: "Gefahrenzone",
        resetDefault: "Auf Standard zurücksetzen",
        resetHint: "Lokale Einstellungen löschen und Standardwerte wiederherstellen",
        
        // Theme
        appearance: "Aussehen",
        darkMode: "Dunkelmodus",
        lightMode: "Hellmodus",
        darkThemesHint: "Dunkle Themen",
        lightThemesHint: "Helle Themen",
        switchToDark: "Zu Dunkelmodus wechseln",
        switchToLight: "Zu Hellmodus wechseln",
        
        // Account Page
        accountTitle: "Konto",
        profile: "Profil",
        username: "Benutzername",
        email: "E-Mail",
        logout: "Abmelden",
        
        // Document Page
        documentDetails: "Dokumentdetails",
        content: "Inhalt",
        metadata: "Metadaten",
        createdAt: "Erstellt am",
        fileType: "Dateityp",
        viewOriginal: "Original anzeigen",
        
        // Errors
        errorOccurred: "Ein Fehler ist aufgetreten",
        tryAgain: "Erneut versuchen",
        noResults: "Keine Ergebnisse gefunden",
    },
};

// 语言列表 (用于 Settings 页面显示)
export const LANGUAGES = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "zh", name: "Chinese", nativeName: "中文" },
    { code: "ja", name: "Japanese", nativeName: "日本語" },
    { code: "ko", name: "Korean", nativeName: "한국어" },
    { code: "es", name: "Spanish", nativeName: "Español" },
    { code: "fr", name: "French", nativeName: "Français" },
    { code: "de", name: "German", nativeName: "Deutsch" },
];

export default translations;

