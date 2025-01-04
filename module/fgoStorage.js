var FGO_STORAGE = "FGO_Storage";
var ACCOUNT_KEY = "FGO_Account";

function onAccountChange(select) {
  switchAccount(select.value);
  location.reload(); // Refresh the page to load data for the selected account
}

function getCurrentAccount() {
  const account = localStorage.getItem(ACCOUNT_KEY);
  return account ? account : "account1"; // Default to account1
}

function switchAccount(accountName) {
  if (accountName) {
    localStorage.setItem(ACCOUNT_KEY, accountName);
  }
}

function migrateOldData() {
  const oldData = localStorage.getItem(FGO_STORAGE);
  if (oldData && !localStorage.getItem(`${FGO_STORAGE}_account1`)) {
    localStorage.setItem(`${FGO_STORAGE}_account1`, oldData);
    console.log("舊資料已遷移到帳號1");
  }
}

function getData(configName) {
  const account = getCurrentAccount();
  const item = localStorage.getItem(`${configName}_${account}`);
  return item == null ? [] : JSON.parse(item);
}

function setData(configName, configContent) {
  const account = getCurrentAccount();
  if (configContent)
    localStorage.setItem(`${configName}_${account}`, JSON.stringify(configContent));
}

function deleteData(configName) {
  const account = getCurrentAccount();
  localStorage.removeItem(`${configName}_${account}`);
}

function updateData(units) {
  if (!units) return;

  // Store units where np >= 0
  let newData = units.flat(2).filter((x) => x.npLv >= 0);

  if (!newData || newData.length == 0) return;

  const currentData = getData(FGO_STORAGE);

  if (currentData.length == 0) {
    setData(FGO_STORAGE, newData.filter((x) => x.npLv > 0));
    return;
  }

  let storage = [];

  // Step 1. Update storage if exist
  cLoop: for (let i = 0; i < currentData.length; i++) {
    for (let j = 0; j < newData.length; j++) {
      if (newData[j].no && newData[j].no == currentData[i].no) {
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

  // Step 2. Add new
  nLoop: for (let i = 0; i < newData.length; i++) {
    for (let j = 0; j < storage.length; j++) {
      if (storage[j].no && newData[i].no == storage[j].no) {
        // Already added in Step 1.
        continue nLoop;
      }
    }

    if (newData[i].npLv > 0) {
      storage.push(newData[i]);
    }
  }

  setData(FGO_STORAGE, storage);
}

function updateUnitsNPLevel(units) {
  const fgoStorage = getData(FGO_STORAGE);
  if (fgoStorage.length == 0) {
    console.log("data is empty");
  } else {
    for (let i = 0; i < units.length; i++) {
      for (let j = 0; j < units[i].length; j++) {
        for (let k = 0; k < fgoStorage.length; k++) {
          if (units[i][j].no && units[i][j].no == fgoStorage[k].no) {
            units[i][j].npLv = fgoStorage[k].npLv;
          }
        }
      }
    }
  }
}

function addUnitsNo(units) {
  for (let i = 0; i < units.length; i++) {
    for (let j = 0; j < units[i].length; j++) {
      units[i][j].no = units[i][j].imageUrl.split("/").pop().split(".")[0];
    }
  }
}

// Migrate old data on script load
migrateOldData();
