var FGO_STORAGE = "FGO_Storage";
var ACCOUNT_KEY = "FGO_Account";

// 在頁面加載時初始化
window.onload = function () {
  const currentAccount = getCurrentAccount();

  // 更新顯示的帳號
  updateSwitchButton(currentAccount);

  console.log(`當前帳號：${currentAccount}`);
};

// 按鈕切換帳號的邏輯
function switchAccount() {
  const currentAccount = getCurrentAccount();
  const newAccount = currentAccount === "account1" ? "account2" : "account1";

  // 更新帳號並保存
  localStorage.setItem("selectedAccount", newAccount);
  localStorage.setItem(ACCOUNT_KEY, newAccount);

  console.log(`切換到帳號：${newAccount}`);

  // 刷新頁面
  location.reload();
}

// 取得當前帳號
function getCurrentAccount() {
  return localStorage.getItem(ACCOUNT_KEY) || "account1"; // 預設為 account1
}

// 更新切換按鈕的文字
function updateSwitchButton(currentAccount) {
  const switchButton = document.getElementById("switch-account-btn");

  if (switchButton) {
    switchButton.innerText = `當前帳號：${currentAccount}（點擊切換）`;
  }
}

// 資料遷移：保證舊資料正確轉移到 `account1`
function migrateOldData() {
  const oldData = localStorage.getItem(FGO_STORAGE);
  if (oldData && !localStorage.getItem(`${FGO_STORAGE}_account1`)) {
    localStorage.setItem(`${FGO_STORAGE}_account1`, oldData);
    console.log("舊資料已遷移到帳號1");
  }
}

// 讀取當前帳號的資料
function getData(configName) {
  const account = getCurrentAccount();
  const item = localStorage.getItem(`${configName}_${account}`);
  return item == null ? [] : JSON.parse(item);
}

// 儲存當前帳號的資料
function setData(configName, configContent) {
  const account = getCurrentAccount();
  if (configContent) {
    localStorage.setItem(`${configName}_${account}`, JSON.stringify(configContent));
  }
}

// 刪除當前帳號的資料
function deleteData(configName) {
  const account = getCurrentAccount();
  localStorage.removeItem(`${configName}_${account}`);
}

// 更新資料
function updateData(units) {
  if (!units) return;

  let newData = units.flat(2).filter((x) => x.npLv >= 0);

  if (!newData || newData.length === 0) return;

  const currentData = getData(FGO_STORAGE);

  if (currentData.length === 0) {
    setData(FGO_STORAGE, newData.filter((x) => x.npLv > 0));
    return;
  }

  let storage = [];

  // 更新現有資料
  cLoop: for (let i = 0; i < currentData.length; i++) {
    for (let j = 0; j < newData.length; j++) {
      if (newData[j].no && newData[j].no === currentData[i].no) {
        if (newData[j].npLv > 0) {
          storage.push(newData[j]);
        }
        continue cLoop;
      }
    }

    if (currentData[i].no && currentData[i].npLv > 0) {
      storage.push(currentData[i]);
    }
  }

  // 新增不存在的資料
  nLoop: for (let i = 0; i < newData.length; i++) {
    for (let j = 0; j < storage.length; j++) {
      if (storage[j].no && newData[i].no === storage[j].no) {
        continue nLoop;
      }
    }

    if (newData[i].npLv > 0) {
      storage.push(newData[i]);
    }
  }

  setData(FGO_STORAGE, storage);
}

// 更新從者 NP 等級
function updateUnitsNPLevel(units) {
  const fgoStorage = getData(FGO_STORAGE);
  if (fgoStorage.length === 0) {
    console.log("data is empty");
  } else {
    for (let i = 0; i < units.length; i++) {
      for (let j = 0; j < units[i].length; j++) {
        for (let k = 0; k < fgoStorage.length; k++) {
          if (units[i][j].no && units[i][j].no === fgoStorage[k].no) {
            units[i][j].npLv = fgoStorage[k].npLv;
          }
        }
      }
    }
  }
}

// 新增從者編號
function addUnitsNo(units) {
  for (let i = 0; i < units.length; i++) {
    for (let j = 0; j < units[i].length; j++) {
      units[i][j].no = units[i][j].imageUrl.split("/").pop().split(".")[0];
    }
  }
}

// 初始化：資料遷移
migrateOldData();
