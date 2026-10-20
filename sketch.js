let canvasElement = null; // 儲存 p5.js 畫布元素
let selectedWeather = []; // 儲存本次抽出的六種天氣
let slotAnswers = []; // 儲存六個圖片格的答案
let nameBank = []; // 儲存下方尚未放置的名稱
let draggedItem = null; // 儲存目前拖曳中的天氣名稱
let draggedSource = null; // 儲存拖曳來源資料
let dragX = 0; // 儲存拖曳中的 X 座標
let dragY = 0; // 儲存拖曳中的 Y 座標
let answerRevealed = false; // 紀錄是否已顯示答案
let submitted = false; // 紀錄是否已交卷
let score = 0; // 儲存測驗分數
let noticeText = ""; // 儲存操作提示文字
let noticeUntil = 0; // 儲存提示顯示期限
let confetti = []; // 儲存彩帶物件
let layout = {}; // 儲存響應式版面資料

const CORRECT_COLOR = "#d8e2dc"; // 設定正確答案背景顏色
const WRONG_COLOR = "#f4acb7"; // 設定錯誤答案背景顏色

const WEATHER_BANK = [ // 建立十二種天氣資料
  { name: "晴天", type: "sun" }, // 設定晴天資料
  { name: "多雲", type: "cloud" }, // 設定多雲資料
  { name: "下雨", type: "rain" }, // 設定下雨資料
  { name: "下雪", type: "snow" }, // 設定下雪資料
  { name: "雷雨", type: "thunder" }, // 設定雷雨資料
  { name: "彩虹", type: "rainbow" }, // 設定彩虹資料
  { name: "大風", type: "wind" }, // 設定大風資料
  { name: "霧天", type: "fog" }, // 設定霧天資料
  { name: "颱風", type: "storm" }, // 設定颱風資料
  { name: "月夜", type: "moon" }, // 設定月夜資料
  { name: "炎熱", type: "heat" }, // 設定炎熱資料
  { name: "冰雹", type: "hail" }, // 設定冰雹資料
]; // 結束天氣資料

function setup() { // 定義 p5.js 初始化函式
  canvasElement = createCanvas(windowWidth, windowHeight); // 建立全螢幕畫布
  canvasElement.position(0, 0); // 將畫布放在頁面左上角
  canvasElement.style("z-index", "0"); // 將畫布設定在底層
  document.body.style.margin = "0"; // 移除網頁預設邊界
  document.body.style.overflow = "hidden"; // 防止頁面出現捲軸
  document.body.style.touchAction = "none"; // 防止觸控時捲動網頁
  textFont("Arial, Noto Sans TC, sans-serif"); // 設定中文字型
  textAlign(CENTER, CENTER); // 設定文字置中
  rectMode(CORNER); // 設定矩形繪製模式
  startNewQuiz(); // 開始新的測驗
} // 結束 setup 函式

function draw() { // 定義 p5.js 主繪圖函式
  background("#f7f4ef"); // 設定全螢幕背景顏色
  updateLayout(); // 更新響應式版面
  drawHeader(); // 繪製標題與玩法
  drawWeatherCards(); // 繪製六張天氣圖片卡片
  drawNameBank(); // 繪製下方天氣名稱
  drawButtons(); // 繪製功能按鈕
  drawNotice(); // 繪製提示訊息
  drawDraggedItem(); // 繪製拖曳中的天氣名稱
  if (submitted && score / selectedWeather.length > 0.6) { // 判斷是否需要顯示彩帶
    updateConfetti(); // 更新彩帶位置
    drawConfetti(); // 繪製彩帶效果
  } // 結束彩帶判斷
} // 結束 draw 函式

function startNewQuiz() { // 定義重新開始測驗函式
  selectedWeather = shuffle([...WEATHER_BANK]).slice(0, 6); // 從十二種天氣隨機抽出六種
  selectedWeather = shuffle(selectedWeather); // 再次打亂圖片排列順序
  slotAnswers = Array(6).fill(null); // 清空六個圖片格
  nameBank = selectedWeather.map((weather) => weather.name); // 建立下方名稱清單
  answerRevealed = false; // 隱藏答案結果
  submitted = false; // 設定尚未交卷
  score = 0; // 將分數歸零
  draggedItem = null; // 清除拖曳項目
  draggedSource = null; // 清除拖曳來源
  confetti = []; // 清除彩帶
  noticeText = "請將下方天氣名稱拖曳到相對應的圖片下方。"; // 設定操作提示
  noticeUntil = millis() + 3000; // 設定提示結束時間
} // 結束 startNewQuiz 函式

function updateLayout() { // 定義響應式版面函式
  const margin = constrain(width * 0.04, 16, 48); // 計算頁面邊界
  const contentWidth = min(width - margin * 2, 1200); // 計算內容寬度
  const contentX = (width - contentWidth) / 2; // 計算內容起始位置
  const titleY = constrain(height * 0.07, 38, 68); // 計算標題位置
  const instructionY = titleY + 42; // 計算玩法說明位置
  const cardsY = instructionY + 42; // 計算天氣卡片位置
  const columns = width < 700 ? 2 : 3; // 依畫面寬度決定欄數
  const gap = constrain(width * 0.018, 10, 22); // 設定卡片間距
  const cardWidth = (contentWidth - gap * (columns - 1)) / columns; // 計算卡片寬度
  const cardHeight = width < 700 ? 190 : 230; // 計算卡片高度
  const rows = ceil(6 / columns); // 計算卡片列數
  const bankY = cardsY + rows * cardHeight + (rows - 1) * gap + 24; // 計算名稱區位置
  const bankHeight = width < 700 ? 150 : 90; // 計算名稱區高度
  const buttonY = bankY + bankHeight + 22; // 計算按鈕位置
  const buttonWidth = min(contentWidth * 0.28, 220); // 計算按鈕寬度
  const buttonHeight = 48; // 計算按鈕高度
  layout = { // 建立版面資料
    margin, // 儲存頁面邊界
    contentWidth, // 儲存內容寬度
    contentX, // 儲存內容起始位置
    titleY, // 儲存標題位置
    instructionY, // 儲存玩法位置
    cardsY, // 儲存卡片位置
    columns, // 儲存欄數
    gap, // 儲存卡片間距
    cardWidth, // 儲存卡片寬度
    cardHeight, // 儲存卡片高度
    rows, // 儲存卡片列數
    bankY, // 儲存名稱區位置
    bankHeight, // 儲存名稱區高度
    buttonY, // 儲存按鈕位置
    buttonWidth, // 儲存按鈕寬度
    buttonHeight, // 儲存按鈕高度
  }; // 結束版面資料
} // 結束 updateLayout 函式

function drawHeader() { // 定義標題繪製函式
  noStroke(); // 關閉外框
  fill("#263238"); // 設定標題顏色
  textAlign(LEFT, CENTER); // 設定文字靠左
  textSize(constrain(width * 0.05, 26, 54)); // 設定標題大小
  text("天氣圖片連連看", layout.margin, layout.titleY); // 顯示標題
  fill("#546e7a"); // 設定玩法文字顏色
  textSize(constrain(width * 0.018, 13, 19)); // 設定玩法文字大小
  text("玩法：將下方天氣名稱拖曳到上方相對應的圖片下方；拖曳到已有名稱的格子會互換。", layout.margin, layout.instructionY, layout.contentWidth, 42); // 顯示玩法說明
  textAlign(CENTER, CENTER); // 還原文字置中
} // 結束 drawHeader 函式

function getCardPosition(index) { // 定義取得天氣卡片位置函式
  const column = index % layout.columns; // 計算卡片欄位
  const row = floor(index / layout.columns); // 計算卡片列數
  return { // 回傳卡片位置
    x: layout.contentX + column * (layout.cardWidth + layout.gap), // 計算卡片 X 座標
    y: layout.cardsY + row * (layout.cardHeight + layout.gap), // 計算卡片 Y 座標
  }; // 結束位置資料
} // 結束 getCardPosition 函式

function drawWeatherCards() { // 定義天氣卡片繪製函式
  selectedWeather.forEach((weather, index) => { // 逐一繪製六張天氣卡片
    const position = getCardPosition(index); // 取得目前卡片位置
    const imageHeight = layout.cardHeight - 60; // 計算圖示區高度
    const answerY = position.y + layout.cardHeight - 48; // 計算答案格位置
    const currentAnswer = slotAnswers[index]; // 取得目前格子的答案
    let cardColor = "#ffffff"; // 設定預設卡片顏色
    if (answerRevealed && currentAnswer !== null) { // 判斷是否已顯示答案
      cardColor = currentAnswer === weather.name ? CORRECT_COLOR : WRONG_COLOR; // 設定答案顏色
    } // 結束答案顏色判斷
    fill(cardColor); // 填入卡片背景顏色
    stroke("#cfd8dc"); // 設定卡片外框顏色
    strokeWeight(2); // 設定卡片外框粗細
    rect(position.x, position.y, layout.cardWidth, layout.cardHeight, 18); // 繪製卡片
    fill("#eef3f5"); // 設定圖示區背景顏色
    noStroke(); // 關閉圖示區外框
    rect(position.x + 10, position.y + 10, layout.cardWidth - 20, imageHeight, 12); // 繪製圖示區
    push(); // 儲存繪圖狀態
    translate(position.x + layout.cardWidth / 2, position.y + 10 + imageHeight / 2); // 移動到圖示區中心
    drawWeatherIcon(weather.type, min(layout.cardWidth, imageHeight) * 0.34); // 繪製天氣圖示
    pop(); // 還原繪圖狀態
    fill("#ffffff"); // 設定答案格背景
    stroke("#90a4ae"); // 設定答案格外框
    strokeWeight(2); // 設定答案格外框粗細
    rect(position.x + 14, answerY, layout.cardWidth - 28, 38, 10); // 繪製答案放置格
    noStroke(); // 關閉答案格外框
    fill("#37474f"); // 設定答案文字顏色
    textSize(constrain(width * 0.018, 12, 17)); // 設定答案文字大小
    text(currentAnswer === null ? "將名稱拖到這裡" : currentAnswer, position.x + layout.cardWidth / 2, answerY + 19); // 顯示答案內容
    if (answerRevealed && currentAnswer !== null) { // 判斷是否顯示對錯
      fill(currentAnswer === weather.name ? "#2e7d32" : "#c62828"); // 設定對錯顏色
      textSize(13); // 設定對錯文字大小
      text(currentAnswer === weather.name ? "✓ 正確" : "✗ 錯誤", position.x + layout.cardWidth / 2, answerY + 57); // 顯示對錯
    } // 結束對錯判斷
  }); // 結束卡片繪製
} // 結束 drawWeatherCards 函式

function drawWeatherIcon(type, size) { // 定義天氣圖示繪製函式
  if (type === "sun") drawSunIcon(size); // 繪製晴天圖示
  if (type === "cloud") drawCloudIcon(size); // 繪製多雲圖示
  if (type === "rain") drawRainIcon(size); // 繪製下雨圖示
  if (type === "snow") drawSnowIcon(size); // 繪製下雪圖示
  if (type === "thunder") drawThunderIcon(size); // 繪製雷雨圖示
  if (type === "rainbow") drawRainbowIcon(size); // 繪製彩虹圖示
  if (type === "wind") drawWindIcon(size); // 繪製大風圖示
  if (type === "fog") drawFogIcon(size); // 繪製霧天圖示
  if (type === "storm") drawStormIcon(size); // 繪製颱風圖示
  if (type === "moon") drawMoonIcon(size); // 繪製月夜圖示
  if (type === "heat") drawHeatIcon(size); // 繪製炎熱圖示
  if (type === "hail") drawHailIcon(size); // 繪製冰雹圖示
} // 結束 drawWeatherIcon 函式

function drawSunIcon(size) { // 定義晴天圖示
  stroke("#f59e0b"); // 設定陽光線條顏色
  strokeWeight(max(2, size * 0.035)); // 設定陽光線條粗細
  for (let index = 0; index < 8; index += 1) { // 繪製八條陽光
    const angle = index * TWO_PI / 8; // 計算陽光角度
    line(cos(angle) * size * 0.45, sin(angle) * size * 0.45, cos(angle) * size * 0.65, sin(angle) * size * 0.65); // 繪製陽光線
  } // 結束陽光迴圈
  noStroke(); // 關閉外框
  fill("#facc15"); // 設定太陽顏色
  circle(0, 0, size); // 繪製太陽
} // 結束 drawSunIcon 函式

function drawCloudIcon(size) { // 定義多雲圖示
  noStroke(); // 關閉外框
  fill("#90a4ae"); // 設定雲朵顏色
  ellipse(-size * 0.22, size * 0.08, size * 0.62, size * 0.42); // 繪製左側雲朵
  ellipse(size * 0.12, 0, size * 0.76, size * 0.55); // 繪製中間雲朵
  ellipse(size * 0.38, size * 0.1, size * 0.52, size * 0.38); // 繪製右側雲朵
  rect(-size * 0.45, size * 0.08, size * 0.9, size * 0.28, size * 0.12); // 連接雲朵底部
} // 結束 drawCloudIcon 函式

function drawRainIcon(size) { // 定義下雨圖示
  drawCloudIcon(size); // 先繪製雲朵
  stroke("#38bdf8"); // 設定雨滴顏色
  strokeWeight(max(2, size * 0.04)); // 設定雨滴粗細
  for (let index = -2; index <= 2; index += 1) { // 繪製五滴雨
    line(index * size * 0.18, size * 0.32, index * size * 0.18 - size * 0.08, size * 0.58); // 繪製雨滴
  } // 結束雨滴迴圈
} // 結束 drawRainIcon 函式

function drawSnowIcon(size) { // 定義下雪圖示
  drawCloudIcon(size); // 先繪製雲朵
  fill("#60a5fa"); // 設定雪花顏色
  noStroke(); // 關閉外框
  for (let index = -2; index <= 2; index += 1) { // 繪製五片雪花
    circle(index * size * 0.18, size * 0.48, size * 0.11); // 繪製雪花
  } // 結束雪花迴圈
} // 結束 drawSnowIcon 函式

function drawThunderIcon(size) { // 定義雷雨圖示
  drawCloudIcon(size); // 先繪製雲朵
  fill("#facc15"); // 設定閃電顏色
  noStroke(); // 關閉外框
  beginShape(); // 開始繪製閃電
  vertex(-size * 0.08, size * 0.18); // 設定閃電第一個頂點
  vertex(size * 0.18, size * 0.18); // 設定閃電第二個頂點
  vertex(0, size * 0.5); // 設定閃電第三個頂點
  vertex(size * 0.13, size * 0.5); // 設定閃電第四個頂點
  vertex(-size * 0.2, size * 0.88); // 設定閃電第五個頂點
  vertex(-size * 0.05, size * 0.57); // 設定閃電第六個頂點
  vertex(-size * 0.2, size * 0.57); // 設定閃電第七個頂點
  endShape(CLOSE); // 結束閃電圖形
} // 結束 drawThunderIcon 函式

function drawRainbowIcon(size) { // 定義彩虹圖示
  noFill(); // 不填滿彩虹
  strokeWeight(size * 0.1); // 設定彩虹線條粗細
  stroke("#ef4444"); // 設定紅色彩虹線
  arc(0, size * 0.25, size * 1.2, size * 1.2, PI, TWO_PI); // 繪製紅色彩虹
  stroke("#f59e0b"); // 設定橙色彩虹線
  arc(0, size * 0.25, size, size, PI, TWO_PI); // 繪製橙色彩虹
  stroke("#22c55e"); // 設定綠色彩虹線
  arc(0, size * 0.25, size * 0.8, size * 0.8, PI, TWO_PI); // 繪製綠色彩虹
  stroke("#3b82f6"); // 設定藍色彩虹線
  arc(0, size * 0.25, size * 0.6, size * 0.6, PI, TWO_PI); // 繪製藍色彩虹
} // 結束 drawRainbowIcon 函式

function drawWindIcon(size) { // 定義大風圖示
  noFill(); // 不填滿風線
  stroke("#60a5fa"); // 設定風線顏色
  strokeWeight(max(2, size * 0.04)); // 設定風線粗細
  arc(-size * 0.15, -size * 0.12, size * 0.9, size * 0.35, PI, TWO_PI); // 繪製第一條風線
  arc(size * 0.05, size * 0.12, size * 0.95, size * 0.35, PI, TWO_PI); // 繪製第二條風線
  arc(-size * 0.15, size * 0.36, size * 0.7, size * 0.28, PI, TWO_PI); // 繪製第三條風線
} // 結束 drawWindIcon 函式

function drawFogIcon(size) { // 定義霧天圖示
  stroke("#94a3b8"); // 設定霧線顏色
  strokeWeight(max(3, size * 0.05)); // 設定霧線粗細
  for (let index = -1; index <= 1; index += 1) { // 繪製三條霧線
    line(-size * 0.5, index * size * 0.22, size * 0.5, index * size * 0.22); // 繪製霧線
  } // 結束霧線迴圈
} // 結束 drawFogIcon 函式

function drawStormIcon(size) { // 定義颱風圖示
  noFill(); // 不填滿颱風
  stroke("#6366f1"); // 設定颱風顏色
  strokeWeight(max(3, size * 0.045)); // 設定颱風線條粗細
  arc(0, 0, size, size * 0.65, 0, PI + HALF_PI); // 繪製颱風外圈
  arc(0, 0, size * 0.68, size * 0.45, PI, TWO_PI + QUARTER_PI); // 繪製颱風內圈
  circle(0, 0, size * 0.12); // 繪製颱風中心
} // 結束 drawStormIcon 函式

function drawMoonIcon(size) { // 定義月夜圖示
  noStroke(); // 關閉外框
  fill("#facc15"); // 設定月亮顏色
  circle(0, 0, size * 0.78); // 繪製月亮
  fill("#eef3f5"); // 設定背景色
  circle(size * 0.24, -size * 0.15, size * 0.78); // 製造月牙效果
  fill("#facc15"); // 設定星星顏色
  circle(-size * 0.42, -size * 0.35, size * 0.08); // 繪製星星
  circle(size * 0.42, size * 0.36, size * 0.07); // 繪製星星
} // 結束 drawMoonIcon 函式

function drawHeatIcon(size) { // 定義炎熱圖示
  drawSunIcon(size * 0.72); // 繪製縮小太陽
  stroke("#ef4444"); // 設定熱氣線條顏色
  strokeWeight(max(2, size * 0.04)); // 設定熱氣線條粗細
  noFill(); // 不填滿熱氣曲線
  arc(-size * 0.4, size * 0.4, size * 0.3, size * 0.55, PI, TWO_PI); // 繪製左側熱氣
  arc(0, size * 0.4, size * 0.3, size * 0.55, PI, TWO_PI); // 繪製中間熱氣
  arc(size * 0.4, size * 0.4, size * 0.3, size * 0.55, PI, TWO_PI); // 繪製右側熱氣
} // 結束 drawHeatIcon 函式

function drawHailIcon(size) { // 定義冰雹圖示
  drawCloudIcon(size); // 先繪製雲朵
  fill("#2563eb"); // 設定冰雹顏色
  noStroke(); // 關閉外框
  for (let index = -2; index <= 2; index += 1) { // 繪製五顆冰雹
    circle(index * size * 0.18, size * 0.5, size * 0.14); // 繪製冰雹
  } // 結束冰雹迴圈
} // 結束 drawHailIcon 函式

function getNamePosition(index) { // 定義取得下方名稱位置函式
  const columns = width < 700 ? 2 : 3; // 計算名稱欄數
  const gap = 12; // 設定名稱間距
  const itemWidth = (layout.contentWidth - gap * (columns - 1)) / columns; // 計算名稱寬度
  const itemHeight = 48; // 計算名稱高度
  const column = index % columns; // 計算名稱欄位
  const row = floor(index / columns); // 計算名稱列數
  return { // 回傳名稱位置資料
    x: layout.contentX + column * (itemWidth + gap), // 設定名稱 X 座標
    y: layout.bankY + 18 + row * (itemHeight + gap), // 設定名稱 Y 座標
    width: itemWidth, // 回傳名稱寬度
    height: itemHeight, // 回傳名稱高度
  }; // 結束名稱位置
} // 結束 getNamePosition 函式

function drawNameBank() { // 定義下方名稱區繪製函式
  fill("#ffffff"); // 設定名稱區背景顏色
  stroke("#cfd8dc"); // 設定名稱區外框顏色
  strokeWeight(2); // 設定名稱區外框粗細
  rect(layout.contentX, layout.bankY, layout.contentWidth, layout.bankHeight, 16); // 繪製名稱區
  nameBank.forEach((name, index) => { // 逐一繪製名稱標籤
    const position = getNamePosition(index); // 取得名稱位置
    fill("#90caf9"); // 設定名稱標籤背景
    stroke("#42a5f5"); // 設定名稱標籤外框
    strokeWeight(2); // 設定名稱標籤外框粗細
    rect(position.x, position.y, position.width, position.height, 12); // 繪製名稱標籤
    fill("#0d47a1"); // 設定名稱文字顏色
    noStroke(); // 關閉文字外框
    textSize(constrain(width * 0.02, 14, 20)); // 設定名稱文字大小
    text(name, position.x + position.width / 2, position.y + position.height / 2); // 顯示名稱
  }); // 結束名稱迴圈
  fill("#607d8b"); // 設定名稱區說明顏色
  noStroke(); // 關閉說明外框
  textSize(14); // 設定說明文字大小
  text("下方天氣名稱", layout.contentX + layout.contentWidth / 2, layout.bankY + layout.bankHeight - 10); // 顯示名稱區說明
} // 結束 drawNameBank 函式

function getAnswerPosition(index) { // 定義取得答案格位置函式
  const position = getCardPosition(index); // 取得卡片位置
  return { // 回傳答案格資料
    x: position.x + 14, // 設定答案格 X 座標
    y: position.y + layout.cardHeight - 48, // 設定答案格 Y 座標
    width: layout.cardWidth - 28, // 設定答案格寬度
    height: 38, // 設定答案格高度
  }; // 結束答案格資料
} // 結束 getAnswerPosition 函式

function getNameBankArea() { // 定義取得下方名稱區域函式
  return { // 回傳名稱區域資料
    x: layout.contentX, // 設定名稱區域 X 座標
    y: layout.bankY, // 設定名稱區域 Y 座標
    width: layout.contentWidth, // 設定名稱區域寬度
    height: layout.bankHeight, // 設定名稱區域高度
  }; // 結束名稱區域資料
} // 結束 getNameBankArea 函式

function getBankNameAt(x, y) { // 定義取得下方名稱函式
  for (let index = 0; index < nameBank.length; index += 1) { // 逐一檢查名稱
    const position = getNamePosition(index); // 取得名稱位置
    if (isInside(x, y, position.x, position.y, position.width, position.height)) { // 判斷是否按到名稱
      return nameBank[index]; // 回傳名稱
    } // 結束位置判斷
  } // 結束名稱檢查
  return null; // 找不到名稱時回傳空值
} // 結束 getBankNameAt 函式

function getSlotAt(x, y) { // 定義取得圖片答案格函式
  for (let index = 0; index < 6; index += 1) { // 逐一檢查六個圖片格
    const position = getAnswerPosition(index); // 取得答案格位置
    if (isInside(x, y, position.x, position.y, position.width, position.height)) { // 判斷是否按到答案格
      return index; // 回傳圖片格索引
    } // 結束位置判斷
  } // 結束圖片格檢查
  return null; // 找不到圖片格時回傳空值
} // 結束 getSlotAt 函式

function findNameSlot(name) { // 定義尋找名稱所在格函式
  return slotAnswers.indexOf(name); // 回傳名稱所在格索引
} // 結束 findNameSlot 函式

function mousePressed() { // 定義滑鼠按下事件
  if (submitted) { // 判斷是否已經交卷
    const restartY = layout.buttonY + layout.buttonHeight + 30 + 34 + 70 + 6 * 26 + 26; // 計算重新測驗按鈕位置
    const restartWidth = min(layout.contentWidth * 0.6, 260); // 計算重新測驗按鈕寬度
    const restartX = (width - restartWidth) / 2; // 計算重新測驗按鈕 X 座標
    if (isInside(mouseX, mouseY, restartX, restartY, restartWidth, 44)) { // 判斷是否按下重新抽題
      startNewQuiz(); // 重新開始測驗
      return false; // 停止預設事件
    } // 結束重新抽題判斷
  } // 結束交卷判斷
  const buttonGap = 14; // 設定按鈕間距
  const totalWidth = layout.buttonWidth * 2 + buttonGap; // 計算按鈕總寬度
  const startX = (width - totalWidth) / 2; // 計算按鈕起始位置
  if (isInside(mouseX, mouseY, startX, layout.buttonY, layout.buttonWidth, layout.buttonHeight)) { // 判斷是否按下看答案
    answerRevealed = true; // 顯示答案
    return false; // 停止預設事件
  } // 結束看答案判斷
  if (isInside(mouseX, mouseY, startX + layout.buttonWidth + buttonGap, layout.buttonY, layout.buttonWidth, layout.buttonHeight)) { // 判斷是否按下交卷
    submitQuiz(); // 執行交卷
    return false; // 停止預設事件
  } // 結束交卷判斷
  if (submitted) { // 交卷後不再允許拖曳
    return false; // 停止預設事件
  } // 結束交卷限制
  const bankName = getBankNameAt(mouseX, mouseY); // 取得下方被按到的名稱
  if (bankName !== null) { // 判斷是否按到名稱
    draggedItem = bankName; // 儲存拖曳中的名稱
    draggedSource = { type: "bank" }; // 記錄名稱來自下方
    dragX = mouseX; // 儲存拖曳 X 座標
    dragY = mouseY; // 儲存拖曳 Y 座標
    return false; // 停止預設事件
  } // 結束下方名稱判斷
  const slotIndex = getSlotAt(mouseX, mouseY); // 取得被按到的圖片格
  if (slotIndex !== null && slotAnswers[slotIndex] !== null) { // 判斷是否按到已有名稱的格子
    draggedItem = slotAnswers[slotIndex]; // 儲存格子內的名稱
    draggedSource = { type: "slot", index: slotIndex }; // 記錄名稱來自圖片格
    dragX = mouseX; // 儲存拖曳 X 座標
    dragY = mouseY; // 儲存拖曳 Y 座標
    return false; // 停止預設事件
  } // 結束圖片格判斷
  return false; // 停止預設事件
} // 結束 mousePressed 函式

function mouseDragged() { // 定義滑鼠拖曳事件
  if (draggedItem !== null) { // 判斷是否正在拖曳
    dragX = mouseX; // 更新拖曳 X 座標
    dragY = mouseY; // 更新拖曳 Y 座標
  } // 結束拖曳判斷
  return false; // 停止預設事件
} // 結束 mouseDragged 函式

function mouseReleased() { // 定義滑鼠放開事件
  if (draggedItem !== null) { // 判斷是否有拖曳項目
    placeDraggedItem(mouseX, mouseY); // 放置拖曳名稱
    draggedItem = null; // 清除拖曳名稱
    draggedSource = null; // 清除拖曳來源
  } // 結束拖曳判斷
  return false; // 停止預設事件
} // 結束 mouseReleased 函式

function touchStarted() { // 定義觸控開始事件
  if (touches.length > 0) { // 判斷是否有觸控資料
    mouseX = touches[0].x; // 取得觸控 X 座標
    mouseY = touches[0].y; // 取得觸控 Y 座標
    mousePressed(); // 共用滑鼠按下邏輯
  } // 結束觸控判斷
  return false; // 停止觸控預設行為
} // 結束 touchStarted 函式

function touchMoved() { // 定義觸控移動事件
  if (touches.length > 0) { // 判斷是否有觸控資料
    mouseX = touches[0].x; // 取得觸控 X 座標
    mouseY = touches[0].y; // 取得觸控 Y 座標
    mouseDragged(); // 共用滑鼠拖曳邏輯
  } // 結束觸控判斷
  return false; // 停止觸控預設行為
} // 結束 touchMoved 函式

function touchEnded() { // 定義觸控結束事件
  mouseReleased(); // 共用滑鼠放開邏輯
  return false; // 停止觸控預設行為
} // 結束 touchEnded 函式

function placeDraggedItem(x, y) { // 定義放置拖曳名稱函式
  const targetSlot = getSlotAt(x, y); // 取得目標圖片格索引
  const nameBankArea = getNameBankArea(); // 取得下方名稱區
  const oldSlot = findNameSlot(draggedItem); // 取得拖曳名稱原本位置
  if (targetSlot !== null) { // 判斷是否放入圖片格
    const targetName = slotAnswers[targetSlot]; // 取得目標格原本名稱
    if (oldSlot !== -1) { // 判斷是否從圖片格拖曳
      slotAnswers[oldSlot] = targetName; // 先把目標名稱放到原本格子
    } // 結束來源格處理
    slotAnswers[targetSlot] = draggedItem; // 將拖曳名稱放入目標格
    nameBank = nameBank.filter((name) => name !== draggedItem); // 從下方名稱區移除拖曳名稱
    if (targetName !== null && oldSlot === -1) { // 判斷是否從下方拖到已有名稱格
      nameBank.push(targetName); // 將被替換名稱放回下方
    } // 結束下方交換處理
    noticeText = "名稱已放入圖片格。"; // 設定成功提示
    noticeUntil = millis() + 1600; // 設定提示時間
    return; // 結束放置處理
  } // 結束圖片格判斷
  if (isInside(x, y, nameBankArea.x, nameBankArea.y, nameBankArea.width, nameBankArea.height)) { // 判斷是否放回下方
    if (oldSlot !== -1) { // 判斷是否來自圖片格
      slotAnswers[oldSlot] = null; // 清空原本圖片格
      if (!nameBank.includes(draggedItem)) { // 判斷名稱是否不在下方
        nameBank.push(draggedItem); // 將名稱放回下方
      } // 結束名稱放回判斷
    } // 結束來源判斷
    noticeText = "名稱已放回下方名稱區。"; // 設定放回提示
    noticeUntil = millis() + 1600; // 設定提示時間
    return; // 結束放回處理
  } // 結束名稱區判斷
  noticeText = "請放到圖片下方格子或名稱區。"; // 設定錯誤位置提示
  noticeUntil = millis() + 1800; // 設定提示時間
} // 結束 placeDraggedItem 函式

function drawButtons() { // 定義按鈕繪製函式
  const buttonGap = 14; // 設定按鈕間距
  const totalWidth = layout.buttonWidth * 2 + buttonGap; // 計算按鈕總寬度
  const startX = (width - totalWidth) / 2; // 計算按鈕起始位置
  fill("#607d8b"); // 設定看答案按鈕顏色
  noStroke(); // 關閉按鈕外框
  rect(startX, layout.buttonY, layout.buttonWidth, layout.buttonHeight, 12); // 繪製看答案按鈕
  fill("#ffffff"); // 設定看答案文字顏色
  textSize(16); // 設定看答案文字大小
  text("點我看答案", startX + layout.buttonWidth / 2, layout.buttonY + layout.buttonHeight / 2); // 顯示看答案文字
  fill("#1976d2"); // 設定交卷按鈕顏色
  rect(startX + layout.buttonWidth + buttonGap, layout.buttonY, layout.buttonWidth, layout.buttonHeight, 12); // 繪製交卷按鈕
  fill("#ffffff"); // 設定交卷文字顏色
  text("交卷看成績", startX + layout.buttonWidth + buttonGap + layout.buttonWidth / 2, layout.buttonY + layout.buttonHeight / 2); // 顯示交卷文字
  if (submitted) { // 判斷是否已經交卷
    const percentage = round(score / selectedWeather.length * 100); // 計算百分比
    const resultY = layout.buttonY + layout.buttonHeight + 32; // 設定結果位置
    fill("#263238"); // 設定結果文字顏色
    textSize(22); // 設定結果文字大小
    text(`得分：${score} / ${selectedWeather.length}（${percentage}%）`, width / 2, resultY); // 顯示總分
    textSize(18); // 設定提示文字大小
    if (percentage > 60) { // 判斷是否超過百分之六十
      fill("#2e7d32"); // 設定通過文字顏色
      text("恭喜通過！彩帶正在為你慶祝！", width / 2, resultY + 34); // 顯示通過訊息
    } else { // 處理未通過狀態
      fill("#ad1457"); // 設定未通過文字顏色
      text("繼續努力，你一定會進步！", width / 2, resultY + 34); // 顯示鼓勵文字
    } // 結束成績判斷
    drawReview(resultY + 72); // 顯示每題結果
    drawRestartButton(resultY + 72 + 6 * 27 + 25); // 繪製重新測驗按鈕
  } // 結束交卷判斷
} // 結束 drawButtons 函式

function drawReview(startY) { // 定義答案檢視函式
  textAlign(LEFT, CENTER); // 設定文字靠左
  textSize(14); // 設定結果文字大小
  selectedWeather.forEach((weather, index) => { // 逐一顯示每題結果
    const correct = slotAnswers[index] === weather.name; // 判斷答案是否正確
    fill(correct ? "#2e7d32" : "#c62828"); // 設定對錯文字顏色
    const answerText = slotAnswers[index] === null ? "未作答" : slotAnswers[index]; // 取得使用者答案
    text(`${correct ? "✓" : "✗"} 第 ${index + 1} 題：${answerText}，正確答案：${weather.name}`, layout.contentX, startY + index * 27); // 顯示每題結果
  }); // 結束結果迴圈
  textAlign(CENTER, CENTER); // 還原文字置中
} // 結束 drawReview 函式

function drawRestartButton(y) { // 定義重新抽題按鈕函式
  const buttonWidth = min(layout.contentWidth * 0.6, 260); // 設定按鈕寬度
  const buttonHeight = 44; // 設定按鈕高度
  const buttonX = (width - buttonWidth) / 2; // 設定按鈕 X 座標
  fill("#455a64"); // 設定按鈕背景顏色
  noStroke(); // 關閉按鈕外框
  rect(buttonX, y, buttonWidth, buttonHeight, 12); // 繪製重新抽題按鈕
  fill("#ffffff"); // 設定按鈕文字顏色
  textSize(16); // 設定按鈕文字大小
  text("重新抽題", width / 2, y + buttonHeight / 2); // 顯示重新抽題文字
} // 結束 drawRestartButton 函式

function drawNotice() { // 定義提示訊息繪製函式
  if (noticeText === "" || millis() > noticeUntil) { // 判斷提示是否過期
    return; // 結束函式
  } // 結束提示判斷
  fill("#795548"); // 設定提示文字顏色
  noStroke(); // 關閉提示外框
  textSize(15); // 設定提示文字大小
  text(noticeText, width / 2, min(height - 24, layout.buttonY - 10)); // 顯示提示文字
} // 結束 drawNotice 函式

function drawDraggedItem() { // 定義拖曳標籤繪製函式
  if (draggedItem === null) { // 判斷是否有拖曳項目
    return; // 沒有拖曳時結束
  } // 結束拖曳判斷
  push(); // 儲存繪圖狀態
  rectMode(CENTER); // 設定矩形中心模式
  fill("#42a5f5"); // 設定拖曳標籤背景
  stroke("#1565c0"); // 設定拖曳標籤外框
  strokeWeight(2); // 設定拖曳標籤外框粗細
  rect(dragX, dragY, min(layout.cardWidth, 240), 46, 12); // 繪製拖曳標籤
  noStroke(); // 關閉文字外框
  fill("#ffffff"); // 設定拖曳文字顏色
  textSize(16); // 設定拖曳文字大小
  text(draggedItem, dragX, dragY); // 顯示拖曳名稱
  pop(); // 還原繪圖狀態
} // 結束 drawDraggedItem 函式

function submitQuiz() { // 定義交卷函式
  if (slotAnswers.some((answer) => answer === null)) { // 判斷是否還有空格
    noticeText = "請先完成六個圖片格，再按交卷看成績。"; // 設定未完成提示
    noticeUntil = millis() + 2200; // 設定提示時間
    return; // 尚未完成時結束
  } // 結束空格判斷
  score = selectedWeather.reduce((total, weather, index) => total + (slotAnswers[index] === weather.name ? 1 : 0), 0); // 計算答對題數
  submitted = true; // 設定已交卷
  answerRevealed = true; // 交卷後顯示答案
  if (score / selectedWeather.length > 0.6) { // 判斷是否超過百分之六十
    createConfetti(); // 建立彩帶
  } // 結束及格判斷
} // 結束 submitQuiz 函式

function createConfetti() { // 定義建立彩帶函式
  confetti = []; // 清空彩帶陣列
  for (let index = 0; index < 100; index += 1) { // 建立一百個彩帶
    confetti.push({ // 加入彩帶資料
      x: random(width), // 設定彩帶 X 座標
      y: random(-height, 0), // 設定彩帶 Y 座標
      width: random(6, 13), // 設定彩帶寬度
      height: random(10, 24), // 設定彩帶高度
      speed: random(1, 4), // 設定彩帶速度
      angle: random(TWO_PI), // 設定彩帶角度
      spin: random(-0.08, 0.08), // 設定彩帶旋轉速度
      sway: random(0.02, 0.06), // 設定彩帶擺動速度
      offset: random(TWO_PI), // 設定彩帶擺動偏移
      color: color(random(255), random(255), random(255)), // 設定彩帶顏色
    }); // 結束彩帶資料
  } // 結束彩帶迴圈
} // 結束 createConfetti 函式

function updateConfetti() { // 定義更新彩帶函式
  confetti.forEach((piece) => { // 逐一更新彩帶
    piece.y += piece.speed; // 讓彩帶向下移動
    piece.x += sin(frameCount * piece.sway + piece.offset); // 讓彩帶左右擺動
    piece.angle += piece.spin; // 更新彩帶角度
    if (piece.y > height + 30) { // 判斷彩帶是否離開畫面
      piece.y = random(-100, -20); // 將彩帶放回畫面上方
      piece.x = random(width); // 重新設定彩帶 X 座標
    } // 結束彩帶重設判斷
  }); // 結束彩帶更新
} // 結束 updateConfetti 函式

function drawConfetti() { // 定義彩帶繪製函式
  confetti.forEach((piece) => { // 逐一繪製彩帶
    push(); // 儲存繪圖狀態
    translate(piece.x, piece.y); // 移動到彩帶位置
    rotate(piece.angle); // 旋轉彩帶
    rectMode(CENTER); // 設定矩形中心模式
    fill(piece.color); // 設定彩帶顏色
    noStroke(); // 關閉彩帶外框
    rect(0, 0, piece.width, piece.height, 2); // 繪製彩帶
    pop(); // 還原繪圖狀態
  }); // 結束彩帶繪製
} // 結束 drawConfetti 函式

function isInside(x, y, areaX, areaY, areaWidth, areaHeight) { // 定義區域判斷函式
  return x >= areaX && x <= areaX + areaWidth && y >= areaY && y <= areaY + areaHeight; // 回傳座標是否位於區域內
} // 結束 isInside 函式

function windowResized() { // 定義視窗改變函式
  resizeCanvas(windowWidth, windowHeight); // 重新調整畫布大小
  updateLayout(); // 重新計算版面
} // 結束 windowResized 函式