// ===================================================================================
// imageCache.js - 用 Cache Storage API 手動管理圖片快取（不需要 Service Worker）
//
// 行為：
//   - 第一次要某張圖時，快取沒有 -> fetch 下載一次 -> 存進 Cache Storage。
//   - 之後任何一次（包含重新整理、關掉瀏覽器隔天再開）只要網址沒變，
//     一律直接從 Cache Storage 拿，完全不會再發 HTTP 請求。
//   - 之後新增的從者（新的檔名/URL）第一次一定會是快取沒有 -> 照樣正常下載一次。
//
// 如果某張「既有檔名」的圖片內容本身被置換掉了（例如畫錯重畫），
// 光看網址一樣的快取機制不會自動發現，需要手動把 CACHE_VERSION 往上加一版，
// 讓所有人下次造訪時整批圖片快取失效、重新下載一次。
// ===================================================================================

const CACHE_VERSION = 1;
const CACHE_NAME_PREFIX = 'fgo5s-images-';
const CACHE_NAME = `${CACHE_NAME_PREFIX}v${CACHE_VERSION}`;

// 讀取（必要時下載）一張圖片，回傳一個可以直接拿去 canvas.drawImage() 用的 <img>。
export async function loadCachedImage(url) {
    if (!('caches' in window)) {
        // 極少數不支援 Cache Storage 的環境（例如非常舊的瀏覽器），退回原生載入方式
        return loadImageDirect(url);
    }
    try {
        const cache = await caches.open(CACHE_NAME);
        let response = await cache.match(url);

        if (!response) {
            response = await fetch(url);
            if (response && response.ok) {
                // response 是 stream，只能被讀取一次，所以要先 clone 一份存進快取，
                // 剩下那份才拿去轉成 blob 使用
                cache.put(url, response.clone());
            }
        }

        const blob = await response.blob();
        return await blobToImage(blob);
    } catch (err) {
        // 快取讀寫失敗或圖片真的下載不到（例如檔名打錯），
        // 退回原生載入方式，讓既有的 drawPlaceholder 邏輯接手顯示「?」
        return loadImageDirect(url);
    }
}

function blobToImage(blob) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(blob);
        img.onload = () => resolve(img);
        img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error(`Image decode failed: ${blob.type}`)); };
        img.src = objectUrl;
    });
}

function loadImageDirect(url) {
    return new Promise((resolve) => {
        const img = new Image();
        // 不管成功或失敗都 resolve，讓呼叫端自己用 image.complete / naturalHeight 判斷，
        // 跟原本 render.js 的 drawImage() 邏輯保持一致
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
        img.src = url;
    });
}

// 清掉舊版本的圖片快取（例如 CACHE_VERSION 有被手動升版時）。
// 失敗也沒關係，純粹是釋放空間用，不影響主要功能。
export async function cleanupOldImageCaches() {
    if (!('caches' in window)) return;
    try {
        const keys = await caches.keys();
        await Promise.all(
            keys
                .filter(key => key.startsWith(CACHE_NAME_PREFIX) && key !== CACHE_NAME)
                .map(key => caches.delete(key))
        );
    } catch (err) {
        console.warn('清理舊版圖片快取失敗（不影響主要功能）:', err);
    }
}