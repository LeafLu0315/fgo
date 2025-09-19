// ===================================================================================
// 多國語言資料庫 (i18n)
// ===================================================================================
const i18n = {
    // HTML Elements
    pageTitle: {
        "zh-TW": "FGO持有五星英靈一覽表",
        "ja": "FGO所持星5サーヴァント一覧",
        "en": "FGO 5-Star Servant Checklist"
    },
    mainTitle: {
        "zh-TW": "FGO持有五星英靈一覽表",
        "ja": "FGO所持星5サーヴァント一覧",
        "en": "FGO 5-Star Servant Checklist"
    },
    switchAccount: {
        "zh-TW": "切換帳號",
        "ja": "アカウント切替",
        "en": "Switch Account"
    },
    setAmount: {
        "zh-TW": "設定數量",
        "ja": "宝具Lv設定",
        "en": "Set NP Level"
    },
    breakthroughBtn: {
        "zh-TW": "突破按鈕",
        "ja": "限界突破",
        "en": "Max Limit"
    },
    setMark: {
        "zh-TW": "設定標記",
        "ja": "マーク設定",
        "en": "Set Mark"
    },
    resetMark: {
        "zh-TW": "重設標記",
        "ja": "マークリセット",
        "en": "Reset Marks"
    },
    luckyBagValue: {
        "zh-TW": "福袋期望值",
        "ja": "福袋期待値",
        "en": "GSSR Calculator"
    },
    clearAll: {
        "zh-TW": "清空",
        "ja": "リセット",
        "en": "Clear All"
    },
    generateImage: {
        "zh-TW": "產出圖片",
        "ja": "画像生成",
        "en": "Generate Image"
    },
    importData: {
        "zh-TW": "匯入資料",
        "ja": "インポート",
        "en": "Import Data"
    },
    exportData: {
        "zh-TW": "匯出資料",
        "ja": "エクスポート",
        "en": "Export Data"
    },
    fourStarLink: {
        "zh-TW": "FGO持有四星英靈一覽表",
        "ja": "FGO所持星4サーヴァント一覧",
        "en": "FGO 4-Star Servant Checklist"
    },
    reportProblem: {
        "zh-TW": "問題回報",
        "ja": "問題報告",
        "en": "Report Issue"
    },
    latestUpdate: {
        "zh-TW": "最近更新: 新增匯入匯出功能",
        "ja": "最近の更新: インポート・エクスポート機能追加",
        "en": "Recent Updates: Added Import & Export feature"
    },
    // Mode Button Labels
    jp_label: { "zh-TW": "日GO", "ja": "日GO", "en": "JP Server" },
    tw_label: { "zh-TW": "台GO", "ja": "台GO", "en": "TW Server" },
    z_label: { "zh-TW": "五星自選(含3000DL)", "ja": "星5選択(3000DL含)", "en": "SSR Ticket (30M DL)" },
    // 福袋新增
    eighth_label: { "zh-TW": "[台]八週年福袋", "ja": "[台]8周年福袋", "en": "8th Anniv. GSSR" },
    nineth_up_label: { "zh-TW": "九週年福袋(上)", "ja": "9周年福袋(上)", "en": "9th Anniv. GSSR (1)" },
    nineth_down_label: { "zh-TW": "九週年福袋(下)", "ja": "9周年福袋(下)", "en": "9th Anniv. GSSR (2)" },
    newyear_24_up_label: { "zh-TW": "[台]24'新年福袋(上)", "ja": "[台]24'正月福袋(上)", "en": "NY 24 GSSR (1)" },
    newyear_24_down_label: { "zh-TW": "[台]24'新年福袋(下)", "ja": "[台]24'正月福袋(下)", "en": "NY 24 GSSR (2)" },
    newyear_25_up_label: { "zh-TW": "25'新年福袋(紅上)", "ja": "25'正月福袋(赤上)", "en": "NY 25 GSSR (Red 1)" },
    newyear_25_down_label: { "zh-TW": "25'新年福袋(紅下)", "ja": "25'正月福袋(赤下)", "en": "NY 25 GSSR (Red 2)" },
    newyear_25_white_label: { "zh-TW": "25'新年福袋(白)", "ja": "25'正月福袋(白)", "en": "NY 25 GSSR (White)" },
    tenth_up_label: { "zh-TW": "十週年福袋(上三)", "ja": "10周年福袋(上三)", "en": "10th Anniv. GSSR (1)" },
    tenth_down_label: { "zh-TW": "十週年福袋(下四)", "ja": "10周年福袋(下四)", "en": "10th Anniv. GSSR (2)" },
    tenth_ex_label: { "zh-TW": "十週年福袋(EXTRA)", "ja": "10周年福袋(EXTRA)", "en": "10th Anniv. GSSR (Extra)" },
    // Canvas Dynamic Text
    npLevelPrefix: { "zh-TW": "寶", "ja": "宝具", "en": "NP" },
    expectNew: { "zh-TW": "新", "ja": "新", "en": "New" },
    expectRegret: { "zh-TW": "盤", "ja": "皿", "en": "Plate" },
    expectLove: { "zh-TW": "婆", "ja": "嫁", "en": "Wife" },
    totalOwned: { "zh-TW": "英靈持有數", "ja": "サーヴァント所持数", "en": "Servants Owned" },
    ownedRate: { "zh-TW": "英靈持有率", "ja": "サーヴァント所持率", "en": "Ownership Rate" },
    totalNPLevel: { "zh-TW": "總寶數", "ja": "宝具レベル合計", "en": "Total NP Levels" },
    totalNP5Owned: { "zh-TW": "寶五持有數", "ja": "宝具5所持数", "en": "NP5 Owned" },
    ownedNP5Rate: { "zh-TW": "寶五持有率", "ja": "宝具5所持率", "en": "NP5 Rate" },
    // Alerts & Prompts
    confirmImport: {
        "zh-TW": "確定要匯入資料嗎？這將會覆寫目前帳號的所有持有和標記資料！此操作無法復原。",
        "ja": "データをインポートしますか？現在のアカウントのすべての所持データとマークが上書きされます！この操作は元に戻せません。",
        "en": "Are you sure you want to import data? This will overwrite all servant data and marks for the current account! This action cannot be undone."
    },
    errorImport: {
        "zh-TW": "檔案讀取或解析失敗，請確認檔案格式是否為正確的 .json 備份檔。",
        "ja": "ファイルの読み込みまたは解析に失敗しました。ファイルが正しい.jsonバックアップファイルであることを確認してください。",
        "en": "Failed to read or parse the file. Please ensure it is a correct .json backup file."
    },
    successImport: {
        "zh-TW": "資料匯入成功！頁面將會重新整理。",
        "ja": "データのインポートが成功しました！ページがリロードされます。",
        "en": "Data imported successfully! The page will now reload."
    },
    alertNpLimit: {
        "zh-TW": "寶具等級上限已切換為: ",
        "ja": "宝具レベルの上限を切り替えました: ",
        "en": "NP level limit has been switched to: "
    },
    confirmClearAll: {
        "zh-TW": "確定要清空這個帳號的所有持有和標記資料嗎？此操作無法復原。",
        "ja": "このアカウントのすべての所持データとマークをリセットしますか？この操作は元に戻せません。",
        "en": "Are you sure you want to clear all servant data and marks for this account? This action cannot be undone."
    },
    confirmResetMark: {
        "zh-TW": "確定要清空這個帳號的所有標記嗎？",
        "ja": "このアカウントのすべてのマークをリセットしますか？",
        "en": "Are you sure you want to clear all marks for this account?"
    },
    errorGenerateImage: {
        "zh-TW": "產出圖片時發生未知錯誤：",
        "ja": "画像生成中に不明なエラーが発生しました：",
        "en": "An unknown error occurred while generating the image: "
    },
    errorSecurity: {
        "zh-TW": "錯誤：無法在本地端直接產出圖片。\n\n原因：瀏覽器基於安全考量，禁止讀取本地圖片檔案後再匯出。\n\n解決方案：請透過本地伺服器 (例如 VS Code 的 'Live Server' 擴充功能) 來瀏覽您的網頁，即可正常使用此功能。",
        "ja": "エラー：ローカル環境で画像を直接生成することはできません。\n\n原因：ブラウザのセキュリティ上の理由により、ローカルファイルの読み込みとエクスポートが制限されています。\n\n解決策：ローカルサーバー（例：VS Codeの「Live Server」拡張機能）経由でページを閲覧すると、この機能が正常に動作します。",
        "en": "Error: Cannot generate image directly from local file system.\n\nReason: For security reasons, browsers restrict reading local files and then exporting them.\n\nSolution: Please view this page via a local server (e.g., the 'Live Server' extension in VS Code) to use this feature correctly."
    },
    loadingImages: {
        "zh-TW": "圖片資源載入中... ",
        "ja": "画像リソースを読み込み中... ",
        "en": "Loading image assets... "
    },
    howToUseNp: {
        "zh-TW": "設定寶具等級: 左鍵增加，右鍵減少。 (從者為寶具0時，右鍵點擊會設為最高等級)",
        "ja": "宝具レベル設定: 左クリックで増加、右クリックで減少します。(宝具Lv.0の場合、右クリックで最大レベルに設定されます)",
        "en": "Set NP Level: Left-click to increase, right-click to decrease. (If NP0, right-click sets to max level)"
    },
};
