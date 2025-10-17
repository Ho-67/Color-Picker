const ranges = document.querySelectorAll(".range");
const rangeValues = document.querySelectorAll(".range-value");
const randomButtons = document.querySelectorAll(".random");
const randomAllButton = document.getElementById("random-all");
const title = document.getElementById("title");
const hexCodeInput = document.getElementById("hex-code-input");
const copyButton = document.getElementById("copy-btn");

// --- 核心工具函數 ---

/**
 * 檢查輸入的字串是否只包含 Hex Code 有效字元 (#, 0-9, a-f)
 * @param {string} str - 待檢查的字串
 * @returns {boolean}
 */
const isValidHexChar = (str) => {
  // 允許 # 符號，以及 A-F 和 0-9
  return /^[#a-fA-F0-9]*$/.test(str);
};

/**
 * 將 Hex Code 字符串轉換為 R, G, B 對象
 * @param {string} hex - Hex Code (e.g., "#FF00AA" 或 "FF00AA")
 * @returns {object|null} 包含 {r, g, b} 屬性的對象，如果無效則返回 null
 */
const hexToRgb = (hex) => {
  // 移除開頭的 # 符號
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b); // 處理 #RGB 簡寫格式

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!result) {
    return null; // 如果格式無效 (e.g., #GGGGGG)，則返回 null
  }

  // 將十六進位字串解析為十進位數字 (radix 16)
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
};

/**
 * 將 R, G, B 十進位值轉換為 Hex Code 字符串
 * @param {number} r - Red 值 (0-255)
 * @param {number} g - Green 值 (0-255)
 * @param {number} b - Blue 值 (0-255)
 * @returns {string} Hex Code (e.g., "#FF00AA")
 */
const rgbToHex = (r, g, b) => {
  // toHex 是一個內部小幫手，把十進位數轉成兩位十六進位字串 (e.g. 10 -> "0a", 255 -> "ff")
  const toHex = (c) => {
    const hex = Number(c).toString(16); // 轉為十六進位
    return hex.length === 1 ? "0" + hex : hex; // 如果只有一位，前面補 0
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
};

/**
 * 根據當前滑桿的值更新所有顯示和顏色
 */
const updateColors = () => {
  // 讀取滑桿值 (轉為整數)
  const r = parseInt(ranges[0].value);
  const g = parseInt(ranges[1].value);
  const b = parseInt(ranges[2].value);
  // 準備顏色字符串
  const rgb = `rgb(${r}, ${g}, ${b})`;
  const hex = rgbToHex(r, g, b);

  // 1. 更新背景顏色
  document.body.style.backgroundColor = rgb;

  // 2. 更新 Hex Code 顯示
  // 讓 Hex 輸入框的值與當前的顏色同步
  hexCodeInput.value = hex.toUpperCase();

  // 3. 根據背景亮度設定標題文字顏色 (確保可讀性)
  // 亮度計算 (ITU-R BT.709): (R * 0.2126 + G * 0.7152 + B * 0.0722)
  const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722;
  // 使用閾值 140 (0-255) 來決定文字顏色
  title.style.color = luminance > 140 ? "#333" : "#FFF";
};

// --- 事件監聽器與初始化 ---

// 初始化
updateColors();

// 1. 滑桿移動事件
ranges.forEach((range, i) => {
  range.addEventListener("input", () => {
    rangeValues[i].innerText = range.value; // 更新數值顯示
    hexCodeInput.classList.remove("error"); // 滑桿移動會同步顏色，清除 Hex 錯誤
    updateColors();
  });
});

// 2. 單一隨機按鈕事件
randomButtons.forEach((button, i) => {
  button.addEventListener("click", () => {
    const randomValue = Math.floor(Math.random() * 256); // 隨機數 (0-255)
    ranges[i].value = randomValue; // 設定滑桿值
    rangeValues[i].innerText = randomValue; // 更新數值顯示
    hexCodeInput.classList.remove("error"); // 滑桿移動會同步顏色，清除 Hex 錯誤
    updateColors();
  });
});

// 3. 隨機全部按鈕事件
randomAllButton.addEventListener("click", () => {
  ranges.forEach((range, i) => {
    const randomValue = Math.floor(Math.random() * 256);
    range.value = randomValue;
    rangeValues[i].innerText = randomValue;
  });
  hexCodeInput.classList.remove("error"); // 滑桿移動會同步顏色，清除 Hex 錯誤
  updateColors();
});

// 4. 複製 Hex Code 按鈕事件
copyButton.addEventListener("click", () => {
  // 取得要複製的文字
  const hexValue = hexCodeInput.value;

  // 使用 Async Clipboard API 的 writeText() 方法來複製文字到剪貼簿
  // navigator.clipboard：這是瀏覽器提供的一個全域物件，代表對系統剪貼簿的介面
  // writeText(text)：這是剪貼簿 API 中專門用來將純文字內容寫入剪貼簿的方法
  // writeText(text) 回傳的 Promise 會進入 resolve 狀態，並執行 .then()
  navigator.clipboard
    .writeText(hexValue)
    .then(() => {
      // 視覺回饋：複製成功後短暫改變按鈕文字
      const originalText = copyButton.innerText;
      copyButton.innerText = "已複製!";
      copyButton.style.backgroundColor = "#28a745";
      setTimeout(() => {
        copyButton.innerText = originalText;
        copyButton.style.backgroundColor = "#007bff";
      }, 800);
    })
    .catch((err) => {
      console.error("無法複製文字:", err);
      alert("複製失敗，請檢查瀏覽器權限。");
    });
});

// 5. 監聽 Hex 輸入框變化事件
hexCodeInput.addEventListener("input", () => {
  let hex = hexCodeInput.value.trim();

  // 1. 執行即時字元檢查
  if (!isValidHexChar(hex)) {
    // 如果輸入了如 'w', 'q' 等無效字元
    hexCodeInput.classList.add("error");
    // 不進行顏色轉換，直接返回
    return;
  }

  // 2. 嘗試轉換 Hex 為 RGB
  const rgbObject = hexToRgb(hex);

  // --- 驗證與同步邏輯 ---
  if (rgbObject) {
    // **A. 驗證成功 (格式和字元都有效)**

    // 移除錯誤提示樣式
    hexCodeInput.classList.remove("error");

    const { r, g, b } = rgbObject;

    // 1. 更新滑桿 (ranges)
    ranges[0].value = r;
    ranges[1].value = g;
    ranges[2].value = b;

    // 2. 更新滑桿旁的數字顯示 (rangeValues)
    rangeValues[0].innerText = r;
    rangeValues[1].innerText = g;
    rangeValues[2].innerText = b;

    // 3. 更新網頁顏色和標題
    updateColors();
  } else if (hex.length > 7) {
    // **B. 長度超標 (e.g. #FF00AACC)**
    hexCodeInput.classList.add("error");
  } else if (hex.length >= 2 && hex.length < 7) {
    // **C. 正在輸入中 (例如 #FF0)**
    // 允許輸入，但由於格式尚未完整，不會更新顏色
    hexCodeInput.classList.remove("error");
  } else if (hex.length === 7) {
    // **D. 格式無效的完整字串 (e.g. #FFFFFG)**
    hexCodeInput.classList.add("error");
  } else {
    // **E. 邊界情況 (e.g. 空字串或只輸入 #)**
    hexCodeInput.classList.remove("error");
  }
});
