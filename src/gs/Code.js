function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cache = CacheService.getScriptCache();

  if (action === 'GET_COA_LIST') {
    const cachedData = cache.get("COA_META_CACHE");

    if (cachedData) {
      return ContentService.createTextOutput(cachedData)
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = ss.getSheetByName("COA");
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);

    // Column A (Name), B (Primary Category) နှင့် C (Sub-Category) ကို ယူခြင်း
    const values = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    const filteredValues = values.filter(v => v[0].toString().trim() !== "")
                                .map(v => ({ name: v[0], primary: v[1], sub: v[2] }));
    const output = JSON.stringify(filteredValues);

    cache.put("COA_META_CACHE", output, 1800);

    return ContentService.createTextOutput(output)
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'GET_COA_REGISTRATION_LIST') {
    const cached = cache.get("REG_LIST_CACHE");
    if (cached) return ContentService.createTextOutput(cached).setMimeType(ContentService.MimeType.JSON);

    const sheet = ss.getSheetByName("COA_Register");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    const output = JSON.stringify(data);
    cache.put("REG_LIST_CACHE", output, 1800);
    return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'GET_CUSTOMER_LIST') {
    const cached = cache.get("CUST_LIST_CACHE");
    if (cached) return ContentService.createTextOutput(cached).setMimeType(ContentService.MimeType.JSON);

    const sheet = ss.getSheetByName("Customers");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    const data = sheet.getRange(2, 1, lastRow - 1, 5).getValues(); // Name, Phone, Address, Remark, Shop Name
    const output = JSON.stringify(data);
    cache.put("CUST_LIST_CACHE", output, 1800);
    return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'GET_WAVE_LIST') {
    const cached = cache.get("WAVE_LIST_CACHE");
    if (cached) return ContentService.createTextOutput(cached).setMimeType(ContentService.MimeType.JSON);

    const sheet = ss.getSheetByName("Wave_Money");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    const output = JSON.stringify(data);
    cache.put("WAVE_LIST_CACHE", output, 1800);
    return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'GET_BANK_LIST') {
    const cached = cache.get("BANK_LIST_CACHE");
    if (cached) return ContentService.createTextOutput(cached).setMimeType(ContentService.MimeType.JSON);

    const sheet = ss.getSheetByName("Bank_Money");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    const output = JSON.stringify(data);
    cache.put("BANK_LIST_CACHE", output, 1800);
    return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'GET_BANK_COM') {
    const sheet = ss.getSheetByName("BankCom");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues().map(row => ({
      min: parseFloat(row[0].toString().replace(/,/g, '')),
      max: parseFloat(row[1].toString().replace(/,/g, '')),
      rate: parseFloat(row[2]) // Percentage rate (e.g., 0.5)
    }));
    
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'GET_TRUE_LIST') {
    const cached = cache.get("TRUE_LIST_CACHE");
    if (cached) return ContentService.createTextOutput(cached).setMimeType(ContentService.MimeType.JSON);

    const sheet = ss.getSheetByName("True_Money");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    const output = JSON.stringify(data);
    cache.put("TRUE_LIST_CACHE", output, 1800);
    return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'GET_JOURNAL_LIST') {
    const cached = cache.get("JOURNAL_LIST_CACHE");
    if (cached) return ContentService.createTextOutput(cached).setMimeType(ContentService.MimeType.JSON);

    const sheet = ss.getSheetByName("Journal");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    const lastRow = sheet.getLastRow();
    // Header သာရှိပြီး Data မရှိသေးပါက [] ပို့မည်
    if (lastRow < 2) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    // Column 8 ခုစလုံး (Date to Shop Name) ကို ယူမည်
    const data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
    const output = JSON.stringify(data);
    cache.put("JOURNAL_LIST_CACHE", output, 1800);
    return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'GET_TRUE_COM') {
    const sheet = ss.getSheetByName("TrueCom");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    const data = sheet.getRange(2, 1, lastRow - 1, 6).getValues().map(row => ({
      min: parseFloat(row[0].toString().replace(/,/g, '')),
      max: parseFloat(row[1].toString().replace(/,/g, '')),
      fee: row[2],
      transferCom: row[3],
      cashOutCom: row[4],
      interCashOutCom: row[5]
    }));
    
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'GET_WAVE_COM') {
    const sheet = ss.getSheetByName("WaveCom");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    const data = sheet.getRange(2, 1, lastRow - 1, 6).getValues().map(row => ({
      min: parseFloat(row[0].toString().replace(/,/g, '')),
      max: parseFloat(row[1].toString().replace(/,/g, '')),
      fee: row[2],
      transferCom: row[3],
      cashInCom: row[4],
      cashOutCom: row[5]
    }));
    
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'LOGIN_CHECK') {
    const email = e.parameter.email;
    const password = e.parameter.password;
    const sheet = ss.getSheetByName("User");
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, message: "User sheet မရှိသေးပါ။" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    // i=1 မှစသည်မှာ header ကိုကျော်ရန်ဖြစ်သည် (A: Email, B: Password, C: Name, D: Picture)
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString().trim() === email && data[i][1].toString().trim() === password) {
        return ContentService.createTextOutput(JSON.stringify({ 
          success: true, 
          user: { email: data[i][0], name: data[i][2], picture: data[i][4] || '' } 
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Email သို့မဟုတ် Password မှားယွင်းနေပါသည်။" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
/**
 * COA_Register sheet ရှိ အကောင့်များ၏ Balance ကို update လုပ်ရန်
 */
function updateCOABalance(ss, accountName, amountChange, transactionType, reference, shopName) {
  const sheet = ss.getSheetByName("COA_Register");
  if (!sheet || !accountName) return;
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1].toString().trim() === accountName.toString().trim()) {
      const currentBalance = parseFloat(data[i][2]) || 0;
      const newBalance = currentBalance + amountChange;
      sheet.getRange(i + 1, 3).setValue(newBalance);

      // Journal Sheet မှာ Double Entry Record သိမ်းဆည်းခြင်း
      recordJournalEntry(ss, accountName, amountChange, currentBalance, newBalance, transactionType, reference, shopName);
      break;
    }
  }
}

/**
 * Double Entry Journal Record သိမ်းဆည်းရန်
 */
function recordJournalEntry(ss, account, change, openingBalance, endingBalance, type, ref, shopName) {
  let journal = ss.getSheetByName("Journal");
  if (!journal) {
    journal = ss.insertSheet("Journal");
    journal.appendRow(["Date", "Account", "Description", "In/Out", "Opening Balance", "Ending Balance", "Reference", "Shop Name"]);
    journal.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#e2e8f0");
  }
  journal.appendRow([new Date(), account, type, change, openingBalance, endingBalance, ref, shopName]);
}

/**
 * ဒေတာအသစ်သွင်းသည့်အခါ Cache များအားလုံးကို ရှင်းပစ်ရန်
 */
function clearDataCaches() {
  const cache = CacheService.getScriptCache();
  const keys = ["REG_LIST_CACHE", "CUST_LIST_CACHE", "WAVE_LIST_CACHE", "BANK_LIST_CACHE", "TRUE_LIST_CACHE", "JOURNAL_LIST_CACHE"];
  cache.removeAll(keys);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // 30 စက္ကန့်အထိ တန်းစီစောင့်ဆိုင်းမည်
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheetName = "";
    let headers = [];
    let rowData = [];

    // Action အလိုက် Logic ခွဲခြားခြင်း
    if (data.action === 'COA_REGISTER') {
      clearDataCaches();
      sheetName = "COA_Register";
      headers = ["COA Type", "Account Name", "Open Balance", "Phone", "Note", "Shop Name", "Timestamp"];
      
      let sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#fbcfe8");
      }

      // Duplicate Check: Account Name ထပ်မထပ်စစ်ဆေးခြင်း (Column A)
      const existingNames = sheet.getRange("A:A").getValues().flat();
      const isDuplicate = existingNames.some(name => 
        name.toString().trim().toLowerCase() === data.accountName.toString().trim().toLowerCase()
      );

      if (isDuplicate) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Duplicate Account Name" }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      rowData = [
        data.coaType,
        data.accountName,
        data.openBalance,
        data.phone,
        data.note,
        data.shopName,
        new Date()
      ];
      sheet.appendRow(rowData);

    } else if (data.action === 'WAVE_MONEY') {
      clearDataCaches();
      sheetName = "Wave_Money";
      headers = ["Card", "Account", "Customer", "Phone", "Type", "Transfer", "Transfer Fee", "Transfer Com", "Cash Out", "Cash Out Com", "Cash In", "Cash In Com", "Balance", "Service Fee", "Note", "Shop Name", "Timestamp"];
      
      let sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e1bee7");
      }
      
      rowData = [
        data.cardSelect,
        data.accountName,
        data.customer,
        data.phone,
        data.transactionType,
        data.transfer,
        data.transferPercent,
        data.transferCom,
        data.cashOut,
        data.cashOutCom,
        data.cashIn,
        data.cashInCom,
        data.balance,
        data.fee,
        data.note,
        data.shopName,
        new Date()
      ];
      
      sheet.appendRow(rowData);
      
      // --- Balance Update Logic ---
      const amtTransfer = parseFloat(data.transfer) || 0;
      const amtCashOut = parseFloat(data.cashOut) || 0;
      const amtCashIn = parseFloat(data.cashIn) || 0;
      const waveFee = parseFloat(data.transferPercent) || 0; // Wave ကဖြတ်တဲ့လွှဲခ
      const serviceFee = parseFloat(data.fee) || 0;         // ဆိုင်ကယူတဲ့ဝန်ဆောင်ခ
      const tCom = parseFloat(data.transferCom) || 0;
      const oCom = parseFloat(data.cashOutCom) || 0;
      const iCom = parseFloat(data.cashInCom) || 0;
      const refInfo = `Customer: ${data.customer} (${data.phone})`;

      let cashBookChange = 0;
      let agentCardChange = 0;
      let desc = "";

      if (amtTransfer > 0) {
        // ငွေလွှဲ: CashBook + (လွှဲငွေ + လွှဲခ + ဝန်ဆောင်ခ)
        // Agent: - (လွှဲငွေ + လွှဲခ) + ကော်မရှင်
        cashBookChange = amtTransfer + waveFee + serviceFee;
        agentCardChange = -(amtTransfer + waveFee) + tCom;
        desc = "Wave Transfer";
      } else if (amtCashOut > 0) {
        // ငွေထုတ်: CashBook - (ထုတ်ငွေ - ဝန်ဆောင်ခ)
        // Agent: + ထုတ်ငွေ + ကော်မရှင်
        cashBookChange = -(amtCashOut - serviceFee);
        agentCardChange = amtCashOut + oCom;
        desc = "Wave Cash Out";
      } else if (amtCashIn > 0) {
        // ငွေသွင်း: CashBook + (သွင်းငွေ + ဝန်ဆောင်ခ) 
        // Agent: - သွင်းငွေ + ကော်မရှင်
        cashBookChange = amtCashIn + serviceFee;
        agentCardChange = -amtCashIn + iCom;
        desc = "Wave Cash In";
      } else if (parseFloat(data.balance) !== 0) {
        desc = "Wave Balance Adjustment";
        agentCardChange = parseFloat(data.balance);
      }

      if (cashBookChange !== 0) updateCOABalance(ss, data.accountName, cashBookChange, desc, refInfo, data.shopName);
      if (agentCardChange !== 0) updateCOABalance(ss, data.cardSelect, agentCardChange, desc, refInfo, data.shopName);

    } else if (data.action === 'TRUE_MONEY') {
      clearDataCaches();
      sheetName = "True_Money";
      headers = ["Card", "Account", "Customer", "Phone", "Type", "Transfer", "Transfer Fee", "Transfer Com", "Cash Out", "Cash Out Com", "Inter Cash Out", "Inter Cash Out Com", "Balance", "Service Fee", "Note", "Shop Name", "Timestamp"];
      
      let sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#bbdefb");
      }
      
      rowData = [
        data.cardSelect,
        data.accountName,
        data.customer,
        data.phone,
        data.transactionType,
        data.transfer,
        data.transferPercent,
        data.transferCom,
        data.cashOut,
        data.cashOutCom,
        data.interCashOut,
        data.interCashOutCom,
        data.balance,
        data.fee,
        data.note,
        data.shopName,
        new Date()
      ];
      
      sheet.appendRow(rowData);
      
      const amtTransfer = parseFloat(data.transfer) || 0;
      const amtCashOut = parseFloat(data.cashOut) || 0;
      const amtInterCashOut = parseFloat(data.interCashOut) || 0;
      const trueFee = parseFloat(data.transferPercent) || 0;
      const serviceFee = parseFloat(data.fee) || 0;
      const tCom = parseFloat(data.transferCom) || 0;
      const oCom = parseFloat(data.cashOutCom) || 0;
      const ioCom = parseFloat(data.interCashOutCom) || 0;
      const refInfo = `Customer: ${data.customer} (${data.phone})`;

      let cashBookChange = 0;
      let agentCardChange = 0;
      let desc = "";

      if (amtTransfer > 0) {
        cashBookChange = amtTransfer + trueFee + serviceFee;
        agentCardChange = -(amtTransfer + trueFee) + tCom;
        desc = "True Transfer";
      } else if (amtCashOut > 0) {
        cashBookChange = -(amtCashOut - serviceFee);
        agentCardChange = amtCashOut + oCom;
        desc = "True Cash Out";
      } else if (amtInterCashOut > 0) {
        cashBookChange = -(amtInterCashOut - serviceFee);
        agentCardChange = amtInterCashOut + ioCom;
        desc = "True Inter Cash Out";
      } else if (parseFloat(data.balance) !== 0) {
        desc = "True Balance Adjustment";
        agentCardChange = parseFloat(data.balance);
      }

      if (cashBookChange !== 0) updateCOABalance(ss, data.accountName, cashBookChange, desc, refInfo, data.shopName);
      if (agentCardChange !== 0) updateCOABalance(ss, data.cardSelect, agentCardChange, desc, refInfo, data.shopName);

    } else if (data.action === 'BANK_TRANSACTION') {
      clearDataCaches();
      sheetName = "Bank_Money";
      headers = ["Bank Account", "Cash Account", "Customer", "Phone", "Amount", "Commission", "Extra Transfer", "Zero Commission", "Note", "Shop Name", "Timestamp"];
      let sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#c8e6c9");
      }
      
      const amt = parseFloat(data.amount) || 0;
      const comm = parseFloat(data.commission) || 0;
      const isExtra = data.isExtraTransfer === true;
      const isZeroCom = data.isZeroCommission === true;
      
      rowData = [
        data.cardSelect, data.accountName, data.customer, data.phone,
        amt, comm, isExtra, isZeroCom, data.note, data.shopName, new Date()
      ];
      sheet.appendRow(rowData);

      const refInfo = `Bank Cash Out: ${data.customer} (${data.phone})`;
      
      if (isExtra) {
        // ပိုလွဲ ON: IN အကောင့်ကို Com ပါပေါင်းသွင်း၊ OUT အကောင့်က amt အပြည့်ထွက်
        updateCOABalance(ss, data.cardSelect, amt + comm, "Bank Cash Out (Extra)", refInfo, data.shopName);
        updateCOABalance(ss, data.accountName, -amt, "Bank Cash Out (Extra)", refInfo, data.shopName);
      } else {
        // ပုံမှန်: IN အကောင့်ကို amt ပဲဝင်၊ OUT အကောင့်က Com နှုတ်ပြီးထွက်
        updateCOABalance(ss, data.cardSelect, amt, "Bank Cash Out", refInfo, data.shopName);
        updateCOABalance(ss, data.accountName, -(amt - comm), "Bank Cash Out", refInfo, data.shopName);
      }

    } else if (data.action === 'DELETE_BANK_TRX') {
      clearDataCaches();
      let sheet = ss.getSheetByName("Bank_Money");
      if (sheet) {
        const rowIndex = data.rowIndex + 2;
        const row = sheet.getRange(rowIndex, 1, 1, 11).getValues()[0];
        const bankAcc = row[0];
        const cashAcc = row[1];
        const cust = row[2];
        const ph = row[3];
        const amt = parseFloat(row[4]) || 0;
        const comm = parseFloat(row[5]) || 0;
        const isExtra = row[6] === true;
        const shop = row[9];

        const refInfo = `Reversed: ${cust} (${ph})`;
        const desc = "Reverse Transaction";
        
        if (isExtra) {
          updateCOABalance(ss, bankAcc, -(amt + comm), desc, refInfo, shop);
          updateCOABalance(ss, cashAcc, amt, desc, refInfo, shop);
        } else {
          updateCOABalance(ss, bankAcc, -amt, desc, refInfo, shop);
          updateCOABalance(ss, cashAcc, (amt - comm), desc, refInfo, shop);
        }
        
        sheet.deleteRow(rowIndex);
      }
    } else if (data.action === 'DELETE_TRUE_TRX') {
      clearDataCaches();
      let sheet = ss.getSheetByName("True_Money");
      if (sheet) {
        const rowIndex = data.rowIndex + 2;
        const rowData = sheet.getRange(rowIndex, 1, 1, 16).getValues()[0];
        
        const cardSelect = rowData[0];
        const accountName = rowData[1];
        const customer = rowData[2];
        const phone = rowData[3];
        const amtTransfer = parseFloat(rowData[5]) || 0;
        const trueFee = parseFloat(rowData[6]) || 0;
        const tCom = parseFloat(rowData[7]) || 0;
        const amtCashOut = parseFloat(rowData[8]) || 0;
        const oCom = parseFloat(rowData[9]) || 0;
        const amtInterCashOut = parseFloat(rowData[10]) || 0;
        const ioCom = parseFloat(rowData[11]) || 0;
        const balanceAdj = parseFloat(rowData[12]) || 0;
        const serviceFee = parseFloat(rowData[13]) || 0;
        const shopName = rowData[15];

        let cashBookChange = 0;
        let agentCardChange = 0;

        if (amtTransfer > 0) {
          cashBookChange = amtTransfer + trueFee + serviceFee;
          agentCardChange = -(amtTransfer + trueFee) + tCom;
        } else if (amtCashOut > 0) {
          cashBookChange = -(amtCashOut - serviceFee);
          agentCardChange = amtCashOut + oCom;
        } else if (amtInterCashOut > 0) {
          cashBookChange = -(amtInterCashOut - serviceFee);
          agentCardChange = amtInterCashOut + ioCom;
        } else if (balanceAdj !== 0) {
          agentCardChange = balanceAdj;
        }

        const refInfo = `Reversed: ${customer} (${phone})`;
        const desc = "Reverse Transaction";

        if (cashBookChange !== 0) updateCOABalance(ss, accountName, -cashBookChange, desc, refInfo, shopName);
        if (agentCardChange !== 0) updateCOABalance(ss, cardSelect, -agentCardChange, desc, refInfo, shopName);

        sheet.deleteRow(rowIndex);
      }
    } else if (data.action === 'DELETE_WAVE_TRX') {
      clearDataCaches();
      let sheet = ss.getSheetByName("Wave_Money");
      if (sheet) {
        const rowIndex = data.rowIndex + 2;
        const rowData = sheet.getRange(rowIndex, 1, 1, 16).getValues()[0];
        
        const cardSelect = rowData[0];
        const accountName = rowData[1];
        const customer = rowData[2];
        const phone = rowData[3];
        const amtTransfer = parseFloat(rowData[5]) || 0;
        const waveFee = parseFloat(rowData[6]) || 0;
        const tCom = parseFloat(rowData[7]) || 0;
        const amtCashOut = parseFloat(rowData[8]) || 0;
        const oCom = parseFloat(rowData[9]) || 0;
        const amtCashIn = parseFloat(rowData[10]) || 0;
        const iCom = parseFloat(rowData[11]) || 0;
        const balanceAdj = parseFloat(rowData[12]) || 0;
        const serviceFee = parseFloat(rowData[13]) || 0;
        const shopName = rowData[15];

        let cashBookChange = 0;
        let agentCardChange = 0;

        if (amtTransfer > 0) {
          cashBookChange = amtTransfer + waveFee + serviceFee;
          agentCardChange = -(amtTransfer + waveFee) + tCom;
        } else if (amtCashOut > 0) {
          cashBookChange = -(amtCashOut - serviceFee);
          agentCardChange = amtCashOut + oCom;
        } else if (amtCashIn > 0) {
          cashBookChange = amtCashIn + serviceFee;
          agentCardChange = -amtCashIn + iCom;
        } else if (balanceAdj !== 0) {
          agentCardChange = balanceAdj;
        }

        const refInfo = `Reversed: ${customer} (${phone})`;
        const desc = "Reverse Transaction";

        // Balance များကို ပြန်လည်ခုနှိမ်ခြင်း (Negate values to reverse)
        if (cashBookChange !== 0) updateCOABalance(ss, accountName, -cashBookChange, desc, refInfo, shopName);
        if (agentCardChange !== 0) updateCOABalance(ss, cardSelect, -agentCardChange, desc, refInfo, shopName);

        sheet.deleteRow(rowIndex);
      }
    } else if (data.action === 'CUSTOMER_REGISTER') {
      clearDataCaches();
      sheetName = "Customers";
      headers = ["Name", "Phone", "Address", "Remark", "Shop Name", "Timestamp"];
      
      let sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e8f5e9");
      }
      
      rowData = [
        data.name,
        data.phone,
        data.address,
        data.remark,
        data.shopName,
        new Date()
      ];
      sheet.appendRow(rowData);

    } else if (data.action === 'SAVE_USER_WITH_PASSWORD') {
      let sheet = ss.getSheetByName("User");
      if (!sheet) {
        sheet = ss.insertSheet("User");
        sheet.appendRow(["Email", "Password", "Name", "Role", "Picture", "Timestamp"]);
        sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#f3f4f6");
      }
      
      const email = data.email.toString().trim();
      const rows = sheet.getDataRange().getValues();
      let foundIndex = -1;
      
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0].toString().trim() === email) {
          foundIndex = i + 1;
          break;
        }
      }

      if (foundIndex > 0) {
        // အဟောင်းရှိလျှင် Password နှင့် အချက်အလက်များကို Update လုပ်မည်
        sheet.getRange(foundIndex, 2).setValue(data.password);
        sheet.getRange(foundIndex, 3).setValue(data.name);
        sheet.getRange(foundIndex, 5).setValue(data.picture || '');
      } else {
        // အသစ်ထည့်မည်
        sheet.appendRow([
          data.email,
          data.password,
          data.name,
          "User",
          data.picture || '',
          new Date()
        ]);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'User data saved to Google Sheet.' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: `Failed to parse request body or save data: ${error.message}` }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock(); // အလုပ်ပြီးရင် lock ကို ပြန်ဖွင့်ပေးသည်
  }
}
