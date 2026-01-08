/**
 * translations.js - Multi-language translations
 * 
 * Supported: English, Chinese, Japanese, Korean, Spanish, French, German
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
        or: "or",
        
        // Login Page
        loginSubtitle: "Search, organize, and sync your notes seamlessly",
        continueWithoutSignIn: "Continue without signing in",
        guestWarning: "Without signing in, your files won't be saved after you leave",
        loginError: "Sign in failed. Please try again.",
        featureSearch: "Smart Search",
        featureUpload: "Upload Notes",
        featureSync: "Cloud Sync",
        
        // Search Page
        searchPlaceholder: "Search your notes... (use #tag to filter by tag)",
        remote: "Remote",
        local: "Local",
        remoteHint: "Search engine results",
        localHint: "Local documents",
        newDocument: "+ New",
        scopeAll: "Search All",
        scopeRemote: "Remote Only",
        scopeLocal: "Local Only",
        searchToSeeResults: "Search to see Google results",
        
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
        resetSettings: "Reset Settings",
        resetDefault: "Reset to Default",
        resetHint: "Clear all uploaded files and restore default theme settings",
        
        // Theme Names
        themeDefault: "Default",
        themeDracula: "Dracula",
        themeNord: "Nord",
        themeCatppuccin: "Catppuccin",
        themeSolarized: "Solarized",
        themeMonokai: "Monokai",
        
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
        notSignedIn: "Not signed in",
        signInHint: "Sign in to sync your documents across devices.",
        signInWithGoogle: "Sign in with Google",
        signInWithGithub: "Sign in with GitHub",
        signInWithEmail: "Sign in with Email",
        continueAnonymously: "Continue Anonymously",
        displayName: "Display Name",
        password: "Password",
        signUp: "Sign Up",
        signIn: "Sign In",
        haveAccount: "Already have an account? Sign In",
        needAccount: "Don't have an account? Sign Up",
        emailInUse: "This email is already in use",
        invalidEmail: "Invalid email address",
        weakPassword: "Password must be at least 6 characters",
        invalidCredentials: "Invalid email or password",
        signedInHint: "Your documents are synced with your Google account.",
        privacyHint: "We only use your email for authentication. Your data stays private.",
        plan: "Plan",
        memberSince: "Member since",
        storage: "Storage",
        sync: "Sync",
        connected: "Connected",
        loading: "Loading...",
        
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
        or: "或",
        
        // Login Page
        loginSubtitle: "智能搜索、整理并同步你的笔记",
        continueWithoutSignIn: "不登录继续使用",
        guestWarning: "不登录的情况下，你的文件在离开后将不会被保存",
        loginError: "登录失败，请重试。",
        featureSearch: "智能搜索",
        featureUpload: "上传笔记",
        featureSync: "云端同步",
        
        // Search Page
        searchPlaceholder: "搜索笔记... (输入 #标签 可按标签筛选)",
        remote: "远程",
        local: "本地",
        remoteHint: "搜索引擎结果",
        localHint: "本地文档",
        newDocument: "+ 新建",
        scopeAll: "搜索全部",
        scopeRemote: "仅远程",
        scopeLocal: "仅本地",
        searchToSeeResults: "搜索以查看 Google 结果",
        
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
        resetSettings: "恢复设置",
        resetDefault: "恢复默认设置",
        resetHint: "清除所有上传的文件并恢复默认主题设置",
        
        // Theme Names
        themeDefault: "默认",
        themeDracula: "德古拉",
        themeNord: "北欧",
        themeCatppuccin: "奶茶",
        themeSolarized: "日晒",
        themeMonokai: "Monokai",
        
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
        notSignedIn: "未登录",
        signInHint: "登录以在多设备间同步你的文档。",
        signInWithGoogle: "使用 Google 登录",
        signInWithGithub: "使用 GitHub 登录",
        signInWithEmail: "使用邮箱登录",
        continueAnonymously: "匿名登录",
        displayName: "显示名称",
        password: "密码",
        signUp: "注册",
        signIn: "登录",
        haveAccount: "已有账户？立即登录",
        needAccount: "没有账户？立即注册",
        emailInUse: "该邮箱已被使用",
        invalidEmail: "邮箱地址无效",
        weakPassword: "密码至少需要6个字符",
        invalidCredentials: "邮箱或密码错误",
        signedInHint: "你的文档已与 Google 账户同步。",
        privacyHint: "我们仅使用你的邮箱进行身份验证，你的数据将保持私密。",
        plan: "方案",
        memberSince: "注册时间",
        storage: "存储",
        sync: "同步",
        connected: "已连接",
        loading: "加载中...",
        
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
        or: "または",
        
        // Login Page
        loginSubtitle: "ノートをシームレスに検索、整理、同期",
        continueWithoutSignIn: "ログインせずに続ける",
        guestWarning: "ログインしないと、離れた後にファイルは保存されません",
        loginError: "ログインに失敗しました。もう一度お試しください。",
        featureSearch: "スマート検索",
        featureUpload: "ノートのアップロード",
        featureSync: "クラウド同期",
        
        // Search Page
        searchPlaceholder: "ノートを検索... (#タグで絞り込み)",
        remote: "リモート",
        local: "ローカル",
        remoteHint: "検索エンジンの結果",
        localHint: "ローカルドキュメント",
        newDocument: "+ 新規",
        scopeAll: "すべて検索",
        scopeRemote: "リモートのみ",
        scopeLocal: "ローカルのみ",
        searchToSeeResults: "検索してGoogle結果を表示",
        
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
        resetSettings: "設定をリセット",
        resetDefault: "デフォルトに戻す",
        resetHint: "アップロードしたファイルをすべて削除し、デフォルトのテーマ設定に戻す",
        
        // Theme Names
        themeDefault: "デフォルト",
        themeDracula: "ドラキュラ",
        themeNord: "ノルド",
        themeCatppuccin: "カプチーノ",
        themeSolarized: "ソラライズド",
        themeMonokai: "モノカイ",
        
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
        notSignedIn: "ログインしていません",
        signInHint: "デバイス間でドキュメントを同期するにはログインしてください。",
        signInWithGoogle: "Googleでログイン",
        signedInHint: "ドキュメントはGoogleアカウントと同期されています。",
        privacyHint: "認証にのみメールを使用します。データはプライベートに保たれます。",
        plan: "プラン",
        memberSince: "登録日",
        storage: "ストレージ",
        sync: "同期",
        connected: "接続済み",
        loading: "読み込み中...",
        
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
        or: "또는",
        
        // Login Page
        loginSubtitle: "노트를 원활하게 검색, 정리 및 동기화",
        continueWithoutSignIn: "로그인 없이 계속",
        guestWarning: "로그인하지 않으면 나간 후 파일이 저장되지 않습니다",
        loginError: "로그인에 실패했습니다. 다시 시도하세요.",
        featureSearch: "스마트 검색",
        featureUpload: "노트 업로드",
        featureSync: "클라우드 동기화",
        
        // Search Page
        searchPlaceholder: "노트 검색... (#태그로 필터링)",
        remote: "원격",
        local: "로컬",
        remoteHint: "검색 엔진 결과",
        localHint: "로컬 문서",
        newDocument: "+ 새로 만들기",
        scopeAll: "전체 검색",
        scopeRemote: "원격만",
        scopeLocal: "로컬만",
        searchToSeeResults: "검색하여 Google 결과 보기",
        
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
        resetSettings: "설정 초기화",
        resetDefault: "기본값으로 복원",
        resetHint: "업로드된 모든 파일을 삭제하고 기본 테마 설정으로 복원",
        
        // Theme Names
        themeDefault: "기본",
        themeDracula: "드라큘라",
        themeNord: "노르드",
        themeCatppuccin: "카푸치노",
        themeSolarized: "솔라라이즈드",
        themeMonokai: "모노카이",
        
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
        notSignedIn: "로그인하지 않음",
        signInHint: "기기 간 문서를 동기화하려면 로그인하세요.",
        signInWithGoogle: "Google로 로그인",
        signedInHint: "문서가 Google 계정과 동기화됩니다.",
        privacyHint: "인증에만 이메일을 사용합니다. 데이터는 비공개로 유지됩니다.",
        plan: "플랜",
        memberSince: "가입일",
        storage: "저장소",
        sync: "동기화",
        connected: "연결됨",
        loading: "로딩 중...",
        
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
        or: "o",
        
        // Login Page
        loginSubtitle: "Busca, organiza y sincroniza tus notas sin problemas",
        continueWithoutSignIn: "Continuar sin iniciar sesión",
        guestWarning: "Sin iniciar sesión, tus archivos no se guardarán cuando te vayas",
        loginError: "Error al iniciar sesión. Inténtalo de nuevo.",
        featureSearch: "Búsqueda Inteligente",
        featureUpload: "Subir Notas",
        featureSync: "Sincronización en la Nube",
        
        // Search Page
        searchPlaceholder: "Buscar notas... (usa #etiqueta para filtrar)",
        remote: "Remoto",
        local: "Local",
        remoteHint: "Resultados del motor de búsqueda",
        localHint: "Documentos locales",
        newDocument: "+ Nuevo",
        scopeAll: "Buscar Todo",
        scopeRemote: "Solo Remoto",
        scopeLocal: "Solo Local",
        searchToSeeResults: "Busca para ver resultados de Google",
        
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
        resetSettings: "Restablecer Configuración",
        resetDefault: "Restablecer por Defecto",
        resetHint: "Eliminar todos los archivos subidos y restaurar la configuración de tema predeterminada",
        
        // Theme Names
        themeDefault: "Predeterminado",
        themeDracula: "Drácula",
        themeNord: "Nord",
        themeCatppuccin: "Catppuccin",
        themeSolarized: "Solarizado",
        themeMonokai: "Monokai",
        
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
        notSignedIn: "No has iniciado sesión",
        signInHint: "Inicia sesión para sincronizar tus documentos entre dispositivos.",
        signInWithGoogle: "Iniciar sesión con Google",
        signedInHint: "Tus documentos están sincronizados con tu cuenta de Google.",
        privacyHint: "Solo usamos tu correo para autenticación. Tus datos se mantienen privados.",
        plan: "Plan",
        memberSince: "Miembro desde",
        storage: "Almacenamiento",
        sync: "Sincronización",
        connected: "Conectado",
        loading: "Cargando...",
        
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
        or: "ou",
        
        // Login Page
        loginSubtitle: "Recherchez, organisez et synchronisez vos notes facilement",
        continueWithoutSignIn: "Continuer sans vous connecter",
        guestWarning: "Sans connexion, vos fichiers ne seront pas sauvegardés après votre départ",
        loginError: "Échec de la connexion. Veuillez réessayer.",
        featureSearch: "Recherche Intelligente",
        featureUpload: "Télécharger des Notes",
        featureSync: "Sync Cloud",
        
        // Search Page
        searchPlaceholder: "Rechercher... (utilisez #tag pour filtrer)",
        remote: "Distant",
        local: "Local",
        remoteHint: "Résultats du moteur de recherche",
        localHint: "Documents locaux",
        newDocument: "+ Nouveau",
        scopeAll: "Rechercher Tout",
        scopeRemote: "Distant Seulement",
        scopeLocal: "Local Seulement",
        searchToSeeResults: "Recherchez pour voir les résultats Google",
        
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
        resetSettings: "Réinitialiser les Paramètres",
        resetDefault: "Réinitialiser par Défaut",
        resetHint: "Supprimer tous les fichiers téléchargés et restaurer les paramètres de thème par défaut",
        
        // Theme Names
        themeDefault: "Par défaut",
        themeDracula: "Dracula",
        themeNord: "Nord",
        themeCatppuccin: "Catppuccin",
        themeSolarized: "Solarisé",
        themeMonokai: "Monokai",
        
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
        notSignedIn: "Non connecté",
        signInHint: "Connectez-vous pour synchroniser vos documents sur tous vos appareils.",
        signInWithGoogle: "Se connecter avec Google",
        signedInHint: "Vos documents sont synchronisés avec votre compte Google.",
        privacyHint: "Nous utilisons uniquement votre email pour l'authentification. Vos données restent privées.",
        plan: "Forfait",
        memberSince: "Membre depuis",
        storage: "Stockage",
        sync: "Synchronisation",
        connected: "Connecté",
        loading: "Chargement...",
        
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
        or: "oder",
        
        // Login Page
        loginSubtitle: "Suchen, organisieren und synchronisieren Sie Ihre Notizen nahtlos",
        continueWithoutSignIn: "Ohne Anmeldung fortfahren",
        guestWarning: "Ohne Anmeldung werden Ihre Dateien nach dem Verlassen nicht gespeichert",
        loginError: "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.",
        featureSearch: "Intelligente Suche",
        featureUpload: "Notizen Hochladen",
        featureSync: "Cloud-Sync",
        
        // Search Page
        searchPlaceholder: "Notizen suchen... (#Tag zum Filtern)",
        remote: "Remote",
        local: "Lokal",
        remoteHint: "Suchmaschinenergebnisse",
        localHint: "Lokale Dokumente",
        newDocument: "+ Neu",
        scopeAll: "Alles durchsuchen",
        scopeRemote: "Nur Remote",
        scopeLocal: "Nur Lokal",
        searchToSeeResults: "Suchen Sie, um Google-Ergebnisse zu sehen",
        
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
        resetSettings: "Einstellungen zurücksetzen",
        resetDefault: "Auf Standard zurücksetzen",
        resetHint: "Alle hochgeladenen Dateien löschen und Standard-Themeneinstellungen wiederherstellen",
        
        // Theme Names
        themeDefault: "Standard",
        themeDracula: "Dracula",
        themeNord: "Nord",
        themeCatppuccin: "Catppuccin",
        themeSolarized: "Solarisiert",
        themeMonokai: "Monokai",
        
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
        notSignedIn: "Nicht angemeldet",
        signInHint: "Melden Sie sich an, um Ihre Dokumente geräteübergreifend zu synchronisieren.",
        signInWithGoogle: "Mit Google anmelden",
        signedInHint: "Ihre Dokumente werden mit Ihrem Google-Konto synchronisiert.",
        privacyHint: "Wir verwenden Ihre E-Mail nur zur Authentifizierung. Ihre Daten bleiben privat.",
        plan: "Plan",
        memberSince: "Mitglied seit",
        storage: "Speicher",
        sync: "Synchronisierung",
        connected: "Verbunden",
        loading: "Laden...",
        
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

