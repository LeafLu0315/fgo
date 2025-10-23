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

// 移除所有福袋的 const 變數，只保留 jp, tw, z 的基本資料
const servents = {'saber': [2, 8, 68, 76, 90, 91, 153, 160, 213, 234, 270, 278, 299, 302, 317, 337, 343, 384, 402, 432, 445, 456],
				'archer': [12, 60, 77, 84, 129, 142, 156, 212, 216, 272, 276, 350, 375, 383, 394, 427, 450],
				'lancer': [70, 85, 88, 119, 128, 143, 196, 232, 280, 300, 312, 329, 368, 381, 433, 442, 457],
				'rider': [65, 99, 108, 118, 144, 179, 205, 206, 241, 253, 274, 277, 296, 331, 342, 349, 397, 406, 452],
				'caster': [37, 62, 113, 127, 136, 150, 169, 175, 201, 215, 237, 284, 307, 327, 385, 415, 435],
				'assassin': [75, 86, 112, 139, 154, 189, 199, 235, 239, 314, 365, 371, 380, 453],
				'berserker': [51, 52, 97, 98, 114, 155, 161, 226, 247, 261, 306, 309, 355, 362, 386, 429, 440],
				'ruler': [59, 93, 173, 229, 265, 292, 305, 346, 357, 374, 390, 400, 438],
				'avenger': [96, 106, 250, 268, 303, 321, 370, 403, 407, 409],
				'alterego': [163, 167, 209, 224, 238, 297, 336, 339, 369, 376, 416, 426],
				'foreigner': [195, 198, 275, 281, 289, 295, 324, 334, 373, 393, 413],
				'mooncancer': [220, 244, 285, 351, 418, 421, 448],
				'pretender': [316, 353, 431, 437, 441],
				'beast': [377, 417],
				'unbeast':[444],
				'shielder': []};
const z_servants = {saber:[8, 2, 76, 278], archer:[84, 60, 212, 77, 350], lancer:[143, 85, 232, 119, 300], rider:[206, 274, 118, 65, 144, 99, 277, 331, 296], caster:[201, 113, 169, 37, 62], assassin:[189, 75, 235, 380], berserker:[52, 226, 97, 98, 306], ruler:[59], avenger:[370], alterego:[224], mooncancer:[244]};

// 福袋資料改用字串當作 key，稍後會從 luckybag.json 載入並填充
const FGO_DATA = {
    'jp': {servants: servents, type: 'full', isReleased: true, labelKey: 'jp_label'},
    // 台服數量增加變動                                                              [劍, 弓, 槍, 騎, 術, 殺, 狂, 裁, 仇, 丑, 外, 月, 偽, 獸, 非獸, 盾]
    'tw': {servants: servents, type: 'full', isReleased: true, categoryNumOverride: [19, 15, 14, 17, 15, 13, 15, 12, 7, 10, 10, 4, 2, 1], labelKey: 'tw_label'},
    'z': {servants: z_servants, type: 'partial', isReleased: true, labelKey: 'z_label'},
    'eighth': {servants: "eighth_servants", type: 'luckyBag', isReleased: false, classIconImg: '888', labelKey: 'eighth_label'},
    'nineth_up': {servants: "nineth_up_servants", type: 'luckyBag', isReleased: true, classIconImg: '99', labelKey: 'nineth_up_label'},
    'nineth_down': {servants: "nineth_down_servants", type: 'luckyBag', isReleased: true, classIconImg: '99', labelKey: 'nineth_down_label'},
    'newyear_24_up': {servants: "newyear_24_up_servants", type: 'luckyBag', isReleased: false, classIconImg: '99', labelKey: 'newyear_24_up_label'},
    'newyear_24_down': {servants: "newyear_24_down_servants", type: 'luckyBag', isReleased: false, classIconImg: '99', labelKey: 'newyear_24_down_label'},
    'newyear_25_up': {servants: "newyear_25_up_servants", type: 'luckyBag', isReleased: false, classIconImg: '99', labelKey: 'newyear_25_up_label'},
    'newyear_25_down': {servants: "newyear_25_down_servants", type: 'luckyBag', isReleased: false, classIconImg: '99', labelKey: 'newyear_25_down_label'},
    'newyear_25_white': {servants: "newyear_25_white_servants", type: 'luckyBag', isReleased: false, classIconImg: '99', labelKey: 'newyear_25_white_label'},
    'tenth_up': {servants: "tenth_up_servants", type: 'luckyBag', isReleased: false, classIconImg: [1,1,1,1,2,2,2,3,3,3], labelKey: 'tenth_up_label'},
    'tenth_down': {servants: "tenth_down_servants", type: 'luckyBag', isReleased: false, classIconImg: [4,4,4,5,5,5,5,6,6,6,7,7,7], labelKey: 'tenth_down_label'},
    'tenth_ex': {servants: "tenth_ex_servants", type: 'luckyBag', isReleased: false, classIconImg: '99', labelKey: 'tenth_ex_label'},
};

// ===================================================================================
// 2. 核心邏輯區 (Core Logic)
// ===================================================================================

var units = [], svt = {}, categoryImages = [], markImages = [], allModeButtons = [];
var selectedClasses = new Set(); // 用來儲存被選取行的集合

const ImagePreloader = {
    images: {},
    totalImages: 0,
    loadedImages: 0,
    init(callback) {
        const allServantNos = new Set();
        Object.values(FGO_DATA).forEach(data => {
            if (typeof data.servants === 'object') { // 確保 servants 資料已載入
                Object.values(data.servants).forEach(noArray => {
                    noArray.forEach(no => allServantNos.add(no));
                });
            }
        });

        this.totalImages = allServantNos.size;
        if (this.totalImages === 0) {
            callback();
            return;
        }

        const loadingText = i18n.loadingImages[currentLang];
        this.updateProgress(loadingText);

        allServantNos.forEach(no => {
            const img = new Image();
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
        context.font = getFontString(30);
        context.textAlign = "center";
        context.fillText(`${loadingText}${percentage}%`, canvas.width / 2, canvas.height / 2);
        context.textAlign = "start";
    }
};


function getUnit(country) {
    const currentData = FGO_DATA[country];
    if (!currentData || typeof currentData.servants !== 'object') { // 檢查資料是否已載入
         alert("資料載入錯誤或尚未完成，請稍後再試： " + country);
         return [];
    }
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

// 載入福袋 JSON 資料
async function loadLuckyBagData() {
    try {
        const response = await fetch('luckybag.json'); // 發出請求
        if (!response.ok) {
            throw new Error('無法載入 luckybag.json: ' + response.statusText);
        }
        const luckyBags = await response.json(); // 解析 JSON

        // 將載入的資料填回 FGO_DATA 物件中
        Object.keys(FGO_DATA).forEach(key => {
            const modeData = FGO_DATA[key];
            const servantsKey = modeData.servants;
            if (typeof servantsKey === 'string' && luckyBags[servantsKey]) {
                modeData.servants = luckyBags[servantsKey];
            }
        });
        console.log("福袋資料載入成功！");
    } catch (error) {
        console.error("載入福袋資料失敗:", error);
        alert("錯誤：無法載入福袋資料，部分福袋模式可能無法使用。");
    }
}

// 將 init 函式改為 async，以便使用 await
async function init() {
    // 靜態圖片（職階圖示）可以先載入
    preloadStaticImages(async () => {
        // 在載入英靈圖片前，先等待福袋資料載入完成
        await loadLuckyBagData();

        // 接著，根據完整的 FGO_DATA 載入所有需要的英靈圖片
        ImagePreloader.init(() => {
            // 所有資料和圖片都準備好後，才執行主邏輯
            mainLogic();
        });
    });
}


function mainLogic(state = 0){
    if (state === 1) {
        selectedClasses.clear();
    }
    const currentCountryData = FGO_DATA[country];
    if (!currentCountryData || !currentCountryData.isReleased) {
        console.log(`Saved mode "${country}" is not available. Defaulting to "jp".`);
        country = 'jp';
        localStorage.setItem("r_country", 'jp');
    }

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
                const listItem = button.parentElement;
                if (listItem) {
                    listItem.style.display = modeData.isReleased ? '' : 'none';
                }

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
    const MIN_CANVAS_WIDTH = 850;
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
            const rowTopY = yPos * (CELL_SIZE + row_padding) + marginTop;

            if (selectedClasses.has(i)) {
                context.fillStyle = 'rgba(255, 0, 0, 0.3)';
                const highlightX = marginLeft - col_padding / 2;
                const highlightY = rowTopY - (row_padding / 2) + 10;
                const highlightWidth = (CategoryNum[i] + 1) * (CELL_SIZE + col_padding);
                const highlightHeight = CELL_SIZE + row_padding;
                context.fillRect(highlightX, highlightY, highlightWidth, highlightHeight);
            }

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
    const importFile = document.getElementById('import-file');
    document.getElementById('import-button').onclick = () => importFile.click();
    document.getElementById('export-button').onclick = exportData;
    importFile.onchange = importData;
}

// ===================================================================================
// 3. 輔助與繪圖函式區 (Helper & Drawing Functions)
// ===================================================================================

function getFontString(size = 20) {
    switch (currentLang) {
        case 'ja':
            return `${size}px -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', '游ゴシック Medium', 'Yu Gothic Medium', 'メイリオ', Meiryo, sans-serif`;
        case 'en':
            return `${size}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;
        case 'zh-TW':
        default:
            return `${size}px -apple-system, BlinkMacSystemFont, 'PingFang TC', 'Microsoft JhengHei', '微軟正黑體', sans-serif`;
    }
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
    context.font = getFontString(18);

    var totalHave = 0, totalNP = 0, total = 0, totalNP5 = 0;
    for (let i = 0; i < CategoryLen; i++) {
        total += CategoryNum[i];
        for (let j = 0; j < CategoryNum[i]; j++) {
            if (units[i][j]) {
                const unit = units[i][j];
                totalNP += unit.npLv;
                if (unit.npLv > 0) totalHave++;
                if (unit.npLv >= 5) totalNP5++;
            }
        }
    }
    var percent = total > 0 ? (totalHave / total) * 100 : 0;
    var percentNP5 = total > 0 ? (totalNP5 / total) * 100 : 0;

    let boxWidth;
    switch (currentLang) {
        case 'zh-TW': boxWidth = 220; break;
        case 'en': boxWidth = 260; break;
        case 'ja': boxWidth = 300; break;
        default: boxWidth = 220;
    }

    const boxHeight = 140;
    const boxX = canvas.width - boxWidth;
    const boxY = canvas.height - 170;
    context.fillStyle = bgcolor;
    context.fillRect(boxX, boxY, boxWidth, boxHeight);

    context.textAlign = 'left';
    context.fillStyle = font_color;
    const xPos = boxX + 10;
    const lineSpacing = 25;

    let currentY = boxY + 15;

    const line_np5_owned = `${i18n.totalNP5Owned[currentLang]}: ${totalNP5}/${total}`;
    context.fillText(line_np5_owned, xPos, currentY);
    currentY += lineSpacing;

    const line_np5_rate_label = `${i18n.ownedNP5Rate[currentLang]}: `;
    const line_np5_rate_value = `${percentNP5.toFixed(2)}%`;
    let valueColorNP5 = font_color;
    if (percentNP5 >= 100) valueColorNP5 = "gold";
    else if (percentNP5 >= 90) valueColorNP5 = "red";
    else if (percentNP5 >= 75) valueColorNP5 = "purple";
    else if (percentNP5 >= 50) valueColorNP5 = "blue";
    else if (percentNP5 >= 25) valueColorNP5 = "green";

    context.fillStyle = font_color;
    context.fillText(line_np5_rate_label, xPos, currentY);
    const labelWidthNP5 = context.measureText(line_np5_rate_label).width;
    context.fillStyle = valueColorNP5;
    context.fillText(line_np5_rate_value, xPos + labelWidthNP5, currentY);
    currentY += lineSpacing;

    context.fillStyle = font_color;
    const line_total_owned = `${i18n.totalOwned[currentLang]}: ${totalHave}/${total}`;
    context.fillText(line_total_owned, xPos, currentY);
    currentY += lineSpacing;

    const line_owned_rate_label = `${i18n.ownedRate[currentLang]}: `;
    const line_owned_rate_value = `${percent.toFixed(2)}%`;
    let valueColor = font_color;
    if (percent >= 100) valueColor = "gold";
    else if (percent >= 90) valueColor = "red";
    else if (percent >= 75) valueColor = "purple";
    else if (percent >= 50) valueColor = "blue";
    else if (percent >= 25) valueColor = "green";

    context.fillStyle = font_color;
    context.fillText(line_owned_rate_label, xPos, currentY);
    const labelWidthOwned = context.measureText(line_owned_rate_label).width;
    context.fillStyle = valueColor;
    context.fillText(line_owned_rate_value, xPos + labelWidthOwned, currentY);
    currentY += lineSpacing;

    context.fillStyle = font_color;
    const line_total_np = `${i18n.totalNPLevel[currentLang]}: ${totalNP}`;
    context.fillText(line_total_np, xPos, currentY);


    context.textAlign = 'start';
}



function getCoordinates(e){ const rect = e.target.getBoundingClientRect(); const scaleX = canvas.width / rect.width; const scaleY = canvas.height / rect.height; return {'x': (e.clientX - rect.left) * scaleX, 'y': (e.clientY - rect.top) * scaleY}; }
function getCategory(y){ return Math.floor((y - marginTop) / (CELL_SIZE + row_padding)); }
function getAttribute(x){ return Math.floor((x - marginLeft) / (CELL_SIZE + col_padding)); }

function handleUnitInteraction(event, isRightClick = false) {
    const point = getCoordinates(event);
    let categoryIndex = getCategory(point.y);
    let attributeIndex = getAttribute(point.x);

    let visibleCategoryIndex = 0;
    let actualCategoryIndex = -1;
    for (let i = 0; i < CategoryLen; i++) {
        if (CategoryNum[i] > 0) {
            if (visibleCategoryIndex === categoryIndex) {
                actualCategoryIndex = i;
                break;
            }
            visibleCategoryIndex++;
        }
    }
    if (actualCategoryIndex === -1) return;

    if (attributeIndex === 0) {
        if (isRightClick) return;

        if (selectedClasses.has(actualCategoryIndex)) {
            selectedClasses.delete(actualCategoryIndex);
        } else {
            selectedClasses.add(actualCategoryIndex);
        }
        drawCanvas();
        return;
    }

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

function exportData() {
    const accountName = getCurrentAccount();
    const data = getData(FGO_STORAGE);
    if (data.length === 0) {
        alert("目前帳號沒有資料可匯出。");
        return;
    }

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `fgo_5star_data_${accountName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (!Array.isArray(importedData)) {
                throw new Error("Data is not an array.");
            }
            if (confirm(i18n.confirmImport[currentLang])) {
                setData(FGO_STORAGE, importedData);
                alert(i18n.successImport[currentLang]);
                location.reload();
            }
        } catch (error) {
            console.error("Import failed:", error);
            alert(i18n.errorImport[currentLang]);
        } finally {
            event.target.value = null;
        }
    };
    reader.readAsText(file);
}

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

    if (canvas && context) {
        drawCanvas();
    }
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
