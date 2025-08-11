// ===================================================================================
// 0. 儲存與帳號管理 (原 fgoStorage.js)
// ===================================================================================
const FGO_STORAGE = "FGO_Storage";
const ACCOUNT_KEY = "FGO_Account";

function toggleAccount() {
    const currentAccount = localStorage.getItem(ACCOUNT_KEY) || "account1";
    const newAccount = currentAccount === "account1" ? "account2" : "account1";
    localStorage.setItem(ACCOUNT_KEY, newAccount);
    console.log(`Account switched to: ${newAccount}`);
}
function getCurrentAccount() { return localStorage.getItem(ACCOUNT_KEY) || "account1"; }
function getData(name) { const acc = getCurrentAccount(); const item = localStorage.getItem(`${name}_${acc}`); return item ? JSON.parse(item) : []; }
function setData(name, content) { const acc = getCurrentAccount(); if (content) localStorage.setItem(`${name}_${acc}`, JSON.stringify(content)); }
function deleteData(name) { const acc = getCurrentAccount(); localStorage.removeItem(`${name}_${acc}`); }
function updateData(units) {
  if (!units) return;
  const newData = units.flat(2).filter(x => x);
  const currentData = getData(FGO_STORAGE);
  const storageMap = new Map();
  currentData.forEach(unit => { if (unit.no) storageMap.set(unit.no, unit); });
  newData.forEach(unit => {
      if (unit.no) {
          if (unit.npLv > 0 || unit.mark > 0) storageMap.set(String(unit.no), { npLv: unit.npLv, mark: unit.mark, no: String(unit.no) });
          else storageMap.delete(String(unit.no));
      }
  });
  setData(FGO_STORAGE, Array.from(storageMap.values()));
}
function migrateOldData() { const oldData = localStorage.getItem(FGO_STORAGE); if (oldData && !localStorage.getItem(`${FGO_STORAGE}_account1`)) { localStorage.setItem(`${FGO_STORAGE}_account1`, oldData); console.log("舊資料已成功遷移到帳號1"); } }


// ===================================================================================
// 1. 全域變數與資料定義
// ===================================================================================
var canvas, context;
var CELL_SIZE = 50, caculateField = 70, row_padding = 30, col_padding = 20;
var marginTop = 10, marginLeft = 10;
const FOOTER_HEIGHT = 50;
var country = localStorage.getItem("r_country") || "jp";
var currentLang = getLanguage();
var mode = 0, luckyBag = 0;
var CategoryNum;
var bgcolor = "rgb(176, 176, 176)", mask = "rgb(0, 0, 0, 0.6)", font_color = "rgb(0, 0, 0)";
var init_npLv = 6, npLv = init_npLv;

const Category = ['saber', 'archer', 'lancer', 'rider', 'caster', 'assassin', 'berserker',
				  'ruler', 'avenger', 'alterego', 'foreigner', 'mooncancer', 'pretender', 'beast', 'unbeast', 'shielder'];
const CategoryLen = Category.length;
const Marks = ['hiclipart', 'heart'];

const servents = {'saber': [2, 8, 68, 76, 90, 91, 153, 160, 213, 234, 270, 278, 299, 302, 317, 337, 343, 384, 402, 432],
				'archer': [12, 60, 77, 84, 129, 142, 156, 212, 216, 272, 276, 350, 375, 383, 394, 427],
				'lancer': [70, 85, 88, 119, 128, 143, 196, 232, 280, 300, 312, 329, 368, 381, 433, 442],
				'rider': [65, 99, 108, 118, 144, 179, 205, 206, 241, 253, 274, 277, 296, 331, 342, 349, 397, 406],
				'caster': [37, 62, 113, 127, 136, 150, 169, 175, 201, 215, 237, 284, 307, 327, 385, 415, 435],
				'assassin': [75, 86, 112, 139, 154, 189, 199, 235, 239, 314, 365, 371, 380],
				'berserker': [51, 52, 97, 98, 114, 155, 161, 226, 247, 261, 306, 309, 355, 362, 386, 429, 440],
				'ruler': [59, 93, 173, 229, 265, 292, 305, 346, 357, 374, 390, 400, 438],
				'avenger': [96, 106, 250, 268, 303, 321, 370, 403, 407, 409],
				'alterego': [163, 167, 209, 224, 238, 297, 336, 339, 369, 376, 416, 426],
				'foreigner': [195, 198, 275, 281, 289, 295, 324, 334, 373, 393, 413],
				'mooncancer': [220, 244, 285, 351, 418, 421],
				'pretender': [316, 353, 431, 437, 441],
				'beast': [377, 417],
				'unbeast':[444],
				'shielder': []};
const z_servants = {saber:[8, 2, 76, 278], archer:[84, 60, 212, 77, 350], lancer:[143, 85, 232, 119, 300], rider:[206, 274, 118, 65, 144, 99, 277, 331, 296], caster:[201, 113, 169, 37, 62], assassin:[189, 75, 235, 380], berserker:[52, 226, 97, 98, 306], ruler:[59], avenger:[370], alterego:[224], mooncancer:[244]};
// 福袋新增
const eighth_servants = {saber:[285, 292, 284, 289], archer:[299, 303, 297, 295], lancer:[309, 312, 307, 305], rider:[321, 314, 317], caster:[327, 334, 324], assassin:[337, 339, 349, 336], berserker:[353, 351, 355, 357], ruler:[362, 373, 365, 368], avenger:[374, 376, 384, 383], alterego:[297, 302, 303], foreigner:[342, 329, 316, 343, 346], mooncancer:[369, 375, 371]};
const nineth_up_servants = {saber:[303, 299, 297], archer:[316, 309, 312, 284], lancer:[346, 343, 342, 374], rider:[314, 371, 373], caster:[368, 383, 384, 409], assassin:[393, 324, 295], berserker:[349, 365, 307], ruler:[317, 416, 337], avenger:[369, 334, 402, 302], alterego:[406, 336, 305]};
const nineth_down_servants = {saber:[289, 321, 285], archer:[355, 357, 353], lancer:[386, 390, 385], rider:[292, 329, 327], caster:[375, 362, 397, 400], assassin:[394, 351, 376, 339], berserker:[415, 403, 413]};
const newyear_24_up_servants = {saber:[86, 70, 163, 155, 68], archer:[303, 179, 239, 270], lancer:[384, 393, 336, 327], rider:[276, 297, 324, 317, 305], caster:[362, 368, 365, 357], assassin:[234, 129, 90, 275], berserker:[386, 400, 312, 337], ruler:[284, 241, 215, 229], avenger:[307, 353, 295], alterego:[127, 91, 198, 167, 112], foreigner:[253, 261, 216, 237], mooncancer:[285, 268, 321, 349], pretender:[355, 383, 390, 374], beast:[88, 136, 106, 128], shielder:[292, 195, 339, 153]};
const newyear_24_down_servants = {saber:[142, 139, 175, 114, 196], archer:[220, 238, 209, 199, 250], lancer:[265, 299, 280, 289], rider:[314, 309, 334, 312], caster:[373, 351, 385, 376], assassin:[303, 393, 270], berserker:[297, 375, 96, 343, 281], ruler:[272, 173, 229, 150], avenger:[346, 329, 302], alterego:[369, 394, 371], foreigner:[51, 154, 161, 156], mooncancer:[213, 394, 342], pretender:[205, 12, 93, 160, 108], beast:[247, 397, 280, 316]};
const newyear_25_up_servants = {saber:[68,70,270,276], archer:[317,368,384], lancer:[90, 129, 91,216,234], rider:[337, 312,402,383], caster:[142,88,153,128], assassin:[196,280,312,299], berserker:[327,239,179,86,155], ruler:[415,362,365,406], avenger:[112,127,237,253], alterego:[386,355,349,261], foreigner:[136,175,139,114], mooncancer:[314,385,199,309], pretender:[284,307,241,215], beast:[324,297,163,303,305]};
const newyear_25_down_servants = {saber:[426,416,357,393,403], archer:[167,268,275,198], lancer:[285,374,390,321], rider:[413,421,400], caster:[220,209,195,106], assassin:[250,238,265,289], berserker:[334,351,339,373], ruler:[431,418,376], avenger:[292,295,336,229], alterego:[353,421,413]};
const newyear_25_white_servants = {saber:[270,343,375], archer:[402,427,394,302,329], lancer:[156,12,160], rider:[213,394,280], caster:[96,281,297], assassin:[409,393,303], berserker:[346,371,369], ruler:[51,108,93], avenger:[161,205,154], alterego:[316,397,247], foreigner:[229,173,272,342,150]};
const tenth_up_servants = {saber:[68, 213, 90, 153], archer:[270, 337, 234, 384], lancer:[160, 299, 302, 91], rider:[317, 343, 402, 432], caster:[129, 156, 272, 427, 394], assassin:[142, 12, 216], berserker:[276, 375, 383, 394], ruler:[312, 70, 128, 433, 88], avenger:[196, 280, 312], alterego:[442, 329, 368]};
const tenth_down_servants = {saber:[179, 342, 241], archer:[205, 108, 253], lancer:[406, 349, 397], rider:[136, 215, 150], caster:[284, 327, 307], assassin:[175, 237, 127], berserker:[435, 385, 415], ruler:[239, 86, 154], avenger:[139, 112, 199], alterego:[365, 371, 314], foreigner:[51, 155, 386, 161, 440], mooncancer:[247, 114, 261], pretender:[355, 362, 309]};
const tenth_ex_servants = {saber:[400, 409, 106, 303, 418], archer:[229, 173, 292, 421], lancer:[93, 96, 220], rider:[265, 268, 250], caster:[305, 321, 285], assassin:[374, 357, 346, 351], berserker:[438, 390, 403, 421], ruler:[163, 195, 275], avenger:[339, 393, 431], alterego:[336, 413, 295, 353], foreigner:[209, 167, 198], mooncancer:[238, 289, 281], pretender:[297, 324, 316], beast:[369, 376, 373, 334], unbeast:[416, 426, 413, 441]};
/**
 * Template
 const foo = {'saber': [],
				'archer': [],
				'lancer': [],
				'rider': [],
				'caster': [],
				'assassin': [],
				'berserker': [],
				'ruler': [],
				'avenger': [],
				'alterego': [],
				'foreigner': [],
				'mooncancer': [],
				'pretender': [],
				'beast': [],
				'unbeast':[],
				'shielder': []};
 */
const FGO_DATA = {
    'jp': {servants: servents, type: 'full', isReleased: true, labelKey: 'jp_label'},
	// 台服數量增加變動
    'tw': {servants: servents, type: 'full', isReleased: true, categoryNumOverride: [18, 15, 14, 16, 15, 13, 15, 11, 7, 10, 10, 4, 2, 1], labelKey: 'tw_label'},
    'z': {servants: z_servants, type: 'partial', isReleased: true, labelKey: 'z_label'},
	// 福袋新增
    'eighth': {servants: eighth_servants, type: 'luckyBag', isReleased: true, classIconImg: '888', labelKey: 'eighth_label'},
    'nineth_up': {servants: nineth_up_servants, type: 'luckyBag', isReleased: false, classIconImg: '99', labelKey: 'nineth_up_label'},
    'nineth_down': {servants: nineth_down_servants, type: 'luckyBag', isReleased: false, classIconImg: '99', labelKey: 'nineth_down_label'},
    'newyear_24_up': {servants: newyear_24_up_servants, type: 'luckyBag', isReleased: false, classIconImg: '99', labelKey: 'newyear_24_up_label'},
    'newyear_24_down': {servants: newyear_24_down_servants, type: 'luckyBag', isReleased: false, classIconImg: '99', labelKey: 'newyear_24_down_label'},
    'newyear_25_up': {servants: newyear_25_up_servants, type: 'luckyBag', isReleased: false, classIconImg: '99', labelKey: 'newyear_25_up_label'},
    'newyear_25_down': {servants: newyear_25_down_servants, type: 'luckyBag', isReleased: false, classIconImg: '99', labelKey: 'newyear_25_down_label'},
    'newyear_25_white': {servants: newyear_25_white_servants, type: 'luckyBag', isReleased: false, classIconImg: '99', labelKey: 'newyear_25_white_label'},
    'tenth_up': {servants: tenth_up_servants, type: 'luckyBag', isReleased: true, classIconImg: [1,1,1,1,2,2,2,3,3,3], labelKey: 'tenth_up_label'},
    'tenth_down': {servants: tenth_down_servants, type: 'luckyBag', isReleased: true, classIconImg: [4,4,4,5,5,5,5,6,6,6,7,7,7], labelKey: 'tenth_down_label'},
    'tenth_ex': {servants: tenth_ex_servants, type: 'luckyBag', isReleased: true, classIconImg: '99', labelKey: 'tenth_ex_label'},
};

// ===================================================================================
// 2. 核心邏輯區 (Core Logic)
// ===================================================================================

var units = [], svt = {}, categoryImages = [], markImages = [], allModeButtons = [];

const ImagePreloader = {
    images: {},
    totalImages: 0,
    loadedImages: 0,
    init(callback) {
        // 簡化邏輯：直接從 FGO_DATA 收集所有需要的從者編號
        const allServantNos = new Set();
        Object.values(FGO_DATA).forEach(data => {
            Object.values(data.servants).forEach(noArray => {
                noArray.forEach(no => allServantNos.add(no));
            });
        });

        this.totalImages = allServantNos.size;
        if (this.totalImages === 0) {
            callback();
            return;
        }

        const loadingText = i18n.loadingImages[currentLang];
        this.updateProgress(loadingText);

        // 遍歷所有從者編號，並使用新的統一圖片路徑
        allServantNos.forEach(no => {
            const img = new Image();
            // **修改點 2**: 使用新的圖片路徑
            img.src = `images/servents/${no}.png`;
            this.images[no] = img;
            img.onload = img.onerror = () => {
                this.loadedImages++;
                this.updateProgress(loadingText);
                if (this.loadedImages === this.totalImages) {
                    callback();
                }
            };
        });
    },
    updateProgress(loadingText) {
        const percentage = Math.round((this.loadedImages / this.totalImages) * 100);
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');
        context.fillStyle = bgcolor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = font_color;
        // 使用新的字體函式
        context.font = getFontString(30);
        context.textAlign = "center";
        context.fillText(`${loadingText}${percentage}%`, canvas.width / 2, canvas.height / 2);
        context.textAlign = "start";
    }
};


function getUnit(country) {
    const currentData = FGO_DATA[country];
    if (!currentData) { alert("錯誤的資料代碼：" + country); return []; }
    const sourceServants = currentData.servants;
    CategoryNum = Category.map((className, index) => {
        if (currentData.categoryNumOverride) {
            return currentData.categoryNumOverride[index] || 0;
        }
        return sourceServants[className] ? sourceServants[className].length : 0;
    });

    let newUnits = [];
    for (let i = 0; i < CategoryLen; i++) {
        const className = Category[i];
        newUnits[i] = [];
        if (sourceServants[className] && CategoryNum[i] > 0) {
            for (let j = 0; j < CategoryNum[i]; j++) {
                const no = sourceServants[className][j];
                // 直接從預載入的圖片快取中建立物件
                const unitInstance = {
                    no: no,
                    image: ImagePreloader.images[no],
                    npLv: 0,
                    mark: 0,
                };
                newUnits[i][j] = unitInstance;
            }
        }
    }
    return newUnits;
}

function init(){
    preloadStaticImages(() => {
        ImagePreloader.init(() => {
            mainLogic();
        });
    });
}

function mainLogic(state = 0){
    units = getUnit(country);
    if (!units) return;
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    if (state === 0) {
        migrateOldData();
        Object.keys(FGO_DATA).forEach(modeKey => {
            const modeData = FGO_DATA[modeKey];
            const buttonId = ['jp', 'tw', 'z'].includes(modeKey) ? `${modeKey}-button` : modeKey;
            const button = document.getElementById(buttonId);
            if (button) {
                button.style.display = modeData.isReleased ? '' : 'none';
                allModeButtons.push(button);
                button.onclick = () => { if (country !== modeKey) { country = modeKey; localStorage.setItem("r_country", country); mainLogic(1); } };
            }
        });
        bindActionButtons();
        canvas.onclick = onCanvasClick;
        canvas.addEventListener('contextmenu', e => { e.preventDefault(); rightClick(e); });
    }

    const currentButtonId = ['jp', 'tw', 'z'].includes(country) ? `${country}-button` : country;
    const currentActiveButton = document.getElementById(currentButtonId);
    if (currentActiveButton) Checked(allModeButtons, currentActiveButton);

    const visibleRows = CategoryNum.filter(num => num > 0).length;
    const iconWidth = luckyBag ? (Math.max.apply(null,CategoryNum) + 1) * (CELL_SIZE + col_padding) + caculateField : (Math.max.apply(null,CategoryNum) + 1) * (CELL_SIZE + col_padding);
    const MIN_CANVAS_WIDTH = 850; // 設定一個合理的最小寬度以容納底部文字
    canvas.width = Math.max(iconWidth, MIN_CANVAS_WIDTH);
    canvas.height = visibleRows * (CELL_SIZE + row_padding) + marginTop + FOOTER_HEIGHT;

    applyLanguage(currentLang);
    drawCanvas();
}

function drawCanvas() {
    context.fillStyle = bgcolor;
	context.fillRect (0, 0, canvas.width, canvas.height);
    updateUnitsNPLevel(units);
    const currentData = FGO_DATA[country];
    const classIconInfo = currentData.classIconImg;
    let pass = 0;
    for (let i = 0; i < CategoryLen; i++) {
        if (CategoryNum[i] > 0) {
            const yPos = i - pass;
            let imgIndex = i;
            if (classIconInfo) {
                let iconId = Array.isArray(classIconInfo) ? classIconInfo[i] : classIconInfo;
                const foundIndex = classes.indexOf(parseInt(iconId));
                if (foundIndex !== -1) imgIndex = foundIndex;
            }
            drawImage(0, yPos, categoryImages[imgIndex]);
            for (let j = 0; j < CategoryNum[i]; j++) {
                const unit = units[i][j];
                drawImage(j + 1, yPos, unit.image);
                if (!unit.npLv) fillRect(j, yPos, mask);
                else fillNPText(j, yPos, `${i18n.npLevelPrefix[currentLang]}${unit.npLv}`);
                if (unit.mark) drawImage(j + 1, yPos, markImages[unit.mark - 1]);
            }
        } else {
            pass++;
        }
    }
    fillTotalText();
    if (luckyBag) fillCaculate();
    // 使用新的字體函式
    context.font = getFontString(20);
	context.fillStyle = mask;
	context.fillText("This image was made by mgneko, maintained by LeafLu @ ptt", marginLeft, canvas.height - 15);
}

function bindActionButtons() {
    document.getElementById('switch-account-btn').onclick = switchAccount;
    document.getElementById('set-button').onclick = () => { mode = 0; document.getElementById('set-button').classList.replace("btn--primary", "btn--checked"); document.getElementById('mask-button').classList.replace("btn--checked", "btn--primary"); };
    document.getElementById('mask-button').onclick = () => { mode = 1; document.getElementById('mask-button').classList.replace("btn--primary", "btn--checked"); document.getElementById('set-button').classList.replace("btn--checked", "btn--primary"); };
    document.getElementById('luckyBag-button').onclick = () => { luckyBag = !luckyBag; if(luckyBag){ document.getElementById('luckyBag-button').classList.replace("btn--primary", "btn--checked"); marginLeft += caculateField; } else { document.getElementById('luckyBag-button').classList.replace("btn--checked", "btn--primary"); marginLeft -= caculateField; } mainLogic(2); };
    document.getElementById('reset').onclick = () => { if (confirm(i18n.confirmClearAll[currentLang])) { deleteData(FGO_STORAGE); localStorage.setItem("r_country", country); location.reload(); } };
    document.getElementById('reset-mark').onclick = () => { if (confirm(i18n.confirmResetMark[currentLang])) { let data = getData(FGO_STORAGE); data.forEach(u => u.mark = 0); setData(FGO_STORAGE, data.filter(u => u.npLv > 0)); location.reload(); } };
    document.getElementById('breakthrough').onclick = () => { npLv = (npLv === init_npLv) ? 20 : init_npLv; alert(`${i18n.alertNpLimit[currentLang]}${npLv}`); };
    document.getElementById('open-image-btn').onclick = openImage;
}

// ===================================================================================
// 3. 輔助與繪圖函式區 (Helper & Drawing Functions)
// ===================================================================================

/**
 * **修改點 1**: 新增的共用字體函式
 * 根據當前語言返回對應的字體字串
 * @param {number} size - 字體大小 (預設 20)
 * @returns {string} - CSS 字體字串
 */
function getFontString(size = 20) {
    if (currentLang === 'zh-TW') {
        return `${size}px 'Microsoft JhengHei', '微軟正黑體', sans-serif`;
    }
    return `${size}px 'Noto Sans JP', sans-serif`;
}

function switchAccount() {
    toggleAccount();
    mainLogic(1);
}

function updateUnitsNPLevel(units) {
  const fgoStorage = getData(FGO_STORAGE);
  const storageMap = new Map();
  fgoStorage.forEach(unit => storageMap.set(String(unit.no), unit));

  units.flat().forEach(unit => {
      if(unit) {
          const saved = storageMap.get(String(unit.no));
          if (saved) {
              unit.npLv = saved.npLv;
              unit.mark = saved.mark;
          } else {
              unit.npLv = 0;
              unit.mark = 0;
          }
      }
  });
}

function preloadStaticImages(callback) {
    const classIds = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,19,666,1001,99,888];
    let loadedCount = 0;
    const total = classIds.length + Marks.length;
    const onImageLoad = () => {
        loadedCount++;
        if (loadedCount === total) callback();
    };
    classIds.forEach((id, i) => {
        categoryImages[i] = new Image();
        categoryImages[i].src = `images/class/class_${id}.png`;
        categoryImages[i].onload = onImageLoad;
        categoryImages[i].onerror = onImageLoad;
    });
    window.classes = classIds;
    Marks.forEach((mark, i) => {
        markImages[i] = new Image();
        markImages[i].src = `images/mark/${mark}.png`;
        markImages[i].onload = onImageLoad;
        markImages[i].onerror = onImageLoad;
    });
}

function Checked(btns, ckbtn){
	btns.forEach(btn => { if (btn === ckbtn) { btn.classList.remove('btn--primary'); btn.classList.add('btn--checked'); }
						  else { btn.classList.remove('btn--checked'); btn.classList.add('btn--primary'); } }); }

function drawImage(x, y, image){
    const xPos = x * (CELL_SIZE + col_padding) + marginLeft, yPos = y * (CELL_SIZE + row_padding) + marginTop;
	if(image && image.complete && image.naturalHeight !== 0){
		try{ context.drawImage(image, xPos, yPos, CELL_SIZE, CELL_SIZE); }
        catch(e) { console.error("圖片繪製失敗 (catch):", image.src, e); drawPlaceholder(xPos, yPos); }
	} else {
        drawPlaceholder(xPos, yPos);
	}
}

function drawPlaceholder(xPos, yPos) {
    context.fillStyle = '#AAA'; context.fillRect(xPos, yPos, CELL_SIZE, CELL_SIZE);
    context.fillStyle = '#FFF'; context.font = `bold ${CELL_SIZE * 0.6}px Arial`; context.textAlign = "center"; context.textBaseline = "middle";
    context.fillText("?", xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2);
    context.textAlign = "start"; context.textBaseline = "alphabetic";
}

function fillCaculate(){
    // **修改點 1**: 使用新的字體函式
	context.font = getFontString(12);
	var have = 0, haveFull = 0, like = 0, percent = 0, ex = 0;
	var lucky_bag = (country != 'jp' && country != 'tw' && country != 'z');
	var default_cat1 = lucky_bag ? 14:7, default_cat2 = lucky_bag ? 14:6;
	context.fillStyle = bgcolor; context.fillRect(0, 0, caculateField + 10, canvas.height); context.fillStyle = font_color;
    let pass = 0;
	for(var category = 0; category < CategoryLen; category++){
        if (CategoryNum[category] === 0) { pass++; continue; }
		if (category <= default_cat1) have = 0, haveFull = 0, like = 0;
		for(var attribute = 0; attribute < CategoryNum[category]; attribute++){
			if (units[category][attribute].npLv){ have++; if(units[category][attribute].npLv >= 5) haveFull++; }
			if (units[category][attribute].mark == 2) like++;
		}
		if (category <= default_cat2){
			if(attribute>0){
                const yPos = marginTop + (category - pass) * (CELL_SIZE + row_padding), centerY = yPos + (CELL_SIZE / 2);
                context.textBaseline = 'middle';
				percent = ((1 - (have / attribute)) * 100);
				context.fillText(`${i18n.expectNew[currentLang]}:${percent.toFixed(2)}%`, marginLeft - caculateField, centerY - 15);
				percent = (haveFull / units[category].length * 100);
				context.fillText(`${i18n.expectRegret[currentLang]}:${percent.toFixed(2)}%`, marginLeft - caculateField, centerY);
				percent = (like / units[category].length * 100);
				context.fillText(`${i18n.expectLove[currentLang]}:${percent.toFixed(2)}%`, marginLeft - caculateField, centerY + 15);
                context.textBaseline = 'alphabetic';
			}
		}else { ex += units[category].length; }
	}
	if(!lucky_bag){
        const yPos = marginTop + 7 * (CELL_SIZE + row_padding), centerY = yPos + (CELL_SIZE / 2);
        context.textBaseline = 'middle';
		percent = ((1 - (have / ex)) * 100);
		context.fillText(`${i18n.expectNew[currentLang]}:${percent.toFixed(2)}%`, marginLeft - caculateField, centerY - 15);
		percent = (haveFull / ex * 100);
		context.fillText(`${i18n.expectRegret[currentLang]}:${percent.toFixed(2)}%`, marginLeft - caculateField, centerY);
		percent = (like / ex * 100);
		context.fillText(`${i18n.expectLove[currentLang]}:${percent.toFixed(2)}%`, marginLeft - caculateField, centerY + 15);
        context.textBaseline = 'alphabetic';
	}
}
function fillRect(x, y, color){ context.fillStyle = color; context.fillRect ((x + 1) * (CELL_SIZE + col_padding) + marginLeft, y * (CELL_SIZE + row_padding) + marginTop, CELL_SIZE, CELL_SIZE); }
function fillTextMask(x, y, color){ context.fillStyle = color; context.fillRect(x * (CELL_SIZE + col_padding) + marginLeft, (y + 1) * (CELL_SIZE + row_padding) - row_padding  + marginTop, CELL_SIZE, row_padding); }
function fillNPText(x, y, msg) {
    // 新的字體函式
    context.font = getFontString(20);
    let number = msg.match(/\d+/)[0];
    context.fillStyle = (number == 5) ? "rgb(255, 255, 0)" : (number >= 6) ? "rgb(255, 0, 0)" : font_color;
    context.textBaseline = 'top';
    const textWidth = context.measureText(msg).width;
    const xPos = (x + 1) * (CELL_SIZE + col_padding) + marginLeft + (CELL_SIZE - textWidth) / 2;
    const yPos = y * (CELL_SIZE + row_padding) + marginTop + CELL_SIZE + 5;
    context.fillText(msg, xPos, yPos);
    context.textBaseline = 'alphabetic';
}

function fillTotalText() {
    // 使用新的字體函式
    context.font = getFontString(20);

    // 1. 計算統計數據
    var totalHave = 0, totalNP = 0, total = 0;
    for (let i = 0; i < CategoryLen; i++) {
        total += CategoryNum[i];
        for (let j = 0; j < CategoryNum[i]; j++) {
            if (units[i][j]) {
                totalNP += units[i][j].npLv;
                if (units[i][j].npLv) totalHave++;
            }
        }
    }
    var percent = total > 0 ? (totalHave / total) * 100 : 0;

    // 2. 定義一個固定的繪圖區域，並清除它
    const boxWidth = 250; 
    const boxHeight = 90;
    const boxX = canvas.width - boxWidth;
    const boxY = canvas.height - 120;
    context.fillStyle = bgcolor;
    context.fillRect(boxX, boxY, boxWidth, boxHeight);

    // 3. 設定文字靠左對齊，並在固定區域內繪製
    context.textAlign = 'left';
    context.fillStyle = font_color;
    const xPos = boxX + 10; // 從清除區的左邊界+10px內距開始畫

    // 繪製第一行：英靈持有數
    const line1 = `${i18n.totalOwned[currentLang]}: ${totalHave}/${total}`;
    context.fillText(line1, xPos, canvas.height - 105);

    // 繪製第二行：英靈持有率
    const line2_label = `${i18n.ownedRate[currentLang]}: `;
    const line2_value = `${percent.toFixed(2)}%`;
    
    // 根據百分比設定數值的顏色
    let valueColor = font_color;
    if (percent >= 100) valueColor = "gold";
    else if (percent >= 90) valueColor = "red";
    else if (percent >= 75) valueColor = "purple";
    else if (percent >= 50) valueColor = "blue";
    else if (percent >= 25) valueColor = "green";
    
    // 先畫標籤
    context.fillStyle = font_color;
    context.fillText(line2_label, xPos, canvas.height - 80);
    
    // 接著在標籤右邊畫上色的數值
    const labelWidth = context.measureText(line2_label).width;
    context.fillStyle = valueColor;
    context.fillText(line2_value, xPos + labelWidth, canvas.height - 80);

    // 繪製第三行：總寶數
    context.fillStyle = font_color; // 恢復預設顏色
    const line3 = `${i18n.totalNPLevel[currentLang]}: ${totalNP}`;
    context.fillText(line3, xPos, canvas.height - 55);

    // 恢復預設對齊方式，避免影響其他繪圖函式
    context.textAlign = 'start';
}

function getCoordinates(e){ const rect = e.target.getBoundingClientRect(); const scaleX = canvas.width / rect.width; const scaleY = canvas.height / rect.height; return {'x': (e.clientX - rect.left) * scaleX, 'y': (e.clientY - rect.top) * scaleY}; }
function getCategory(y){ return Math.floor((y - marginTop) / (CELL_SIZE + row_padding)); }
function getAttribute(x){ return Math.floor((x - marginLeft) / (CELL_SIZE + col_padding)); }
function handleUnitInteraction(event, isRightClick = false) {
    const point = getCoordinates(event);
    let categoryIndex = getCategory(point.y), attributeIndex = getAttribute(point.x);
    let visibleCategoryIndex = 0, actualCategoryIndex = -1;
    for (let i = 0; i < CategoryLen; i++) {
        if (CategoryNum[i] > 0) {
            if (visibleCategoryIndex === categoryIndex) { actualCategoryIndex = i; break; }
            visibleCategoryIndex++;
        }
    }
    if (actualCategoryIndex === -1) return;
    categoryIndex = actualCategoryIndex;
    const xInCell = point.x - (attributeIndex * (CELL_SIZE + col_padding) + marginLeft);
    const yInCell = point.y - (getCategory(point.y) * (CELL_SIZE + row_padding) + marginTop);
    if (xInCell < CELL_SIZE && xInCell > 0 && yInCell < CELL_SIZE && yInCell > 0 && attributeIndex > 0 && attributeIndex <= CategoryNum[categoryIndex]) {
        const unit = units[categoryIndex][attributeIndex - 1];
        const yPos = getCategory(point.y);
        switch(mode) {
			case 0:
                if (isRightClick) {
                    if (unit.npLv === 0) unit.npLv = npLv;
                    else unit.npLv--;
                } else {
                    unit.npLv = unit.npLv < npLv ? unit.npLv + 1 : 0;
                }
				break;
		    case 1:
                if (isRightClick) unit.mark = unit.mark > 0 ? unit.mark - 1 : Marks.length;
                else unit.mark = (unit.mark + 1) % (Marks.length + 1);
				break;
		}
        drawImage(attributeIndex, yPos, unit.image);
        if (!unit.npLv) { fillTextMask(attributeIndex, yPos, bgcolor); fillRect(attributeIndex - 1, yPos, mask); }
        else { fillTextMask(attributeIndex, yPos, bgcolor); fillNPText(attributeIndex - 1, yPos, `${i18n.npLevelPrefix[currentLang]}${unit.npLv}`); }
        if (unit.mark) drawImage(attributeIndex, yPos, markImages[unit.mark - 1]);
		fillTotalText();
		if(luckyBag) fillCaculate();
		updateData(units);
    }
}
function rightClick(e){ handleUnitInteraction(e, true); }
function onCanvasClick(e){ handleUnitInteraction(e, false); }
function openImage(){
	try{
		const image = new Image();
		const canvas = document.getElementById("canvas");
		image.src = canvas.toDataURL("image/png");
		window.open().document.write('<img src="' + image.src + '" />');
	}catch(e){
        if (e.name === "SecurityError") alert(i18n.errorSecurity[currentLang]);
        else alert(`${i18n.errorGenerateImage[currentLang]}${e}`);
	}
}
function getLanguage() {
    const savedLang = localStorage.getItem('fgo5s-lang');
    if (savedLang && i18n.pageTitle[savedLang]) return savedLang;
    const browserLang = navigator.language;
    if (browserLang.startsWith('ja')) return 'ja';
    if (browserLang.startsWith('en')) return 'en';
    return 'zh-TW';
}
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('fgo5s-lang', lang);
    applyLanguage(lang);
    drawCanvas();
}
function applyLanguage(lang) {
    document.querySelectorAll('[data-i18n-key]').forEach(el => {
        const key = el.getAttribute('data-i18n-key');
        if (i18n[key] && i18n[key][lang]) {
            el.innerText = i18n[key][lang];
        }
    });
    Object.keys(FGO_DATA).forEach(modeKey => {
        const modeData = FGO_DATA[modeKey];
        if (modeData.labelKey) {
            const buttonId = ['jp', 'tw', 'z'].includes(modeKey) ? `${modeKey}-button` : modeKey;
            const button = document.getElementById(buttonId);
            if (button && i18n[modeData.labelKey] && i18n[modeData.labelKey][lang]) {
                button.innerText = i18n[modeData.labelKey][lang];
            }
        }
    });
}
