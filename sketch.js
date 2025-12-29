let spriteSheet1, spriteSheet2;
let endBgImg; // 通關背景圖
let bgImg1, bgImg2, bgImg3; // 背景圖
let currentStage = 1; // 目前關卡
let defaultFrameCount = 5; // all-1.png 的幀數
let altFrameCount = 12; // all-2.png 的幀數
let spriteScale = 3; // 顯示放大倍數（改名避免與 p5.scale 衝突）
let song;
let amp;

// 玩家角色設定
let currentFrame = 0;
let frameCounter = 0;
let frameDelay = 5; // 動畫速度
let posX, posY;
let speed = 6;
let facingLeft = false; // 是否面向左邊
let altPlaying = false;

// NPC 角色
let phineas, ferb, bad, remilia;



// Stage 3 Cutscene variables
let stage3Initialized = false;
let badCutsceneState = 0; // 0: none, 1: wait, 2: dialog1, 3: dialog2, 4: done
let cutsceneTimer = 0;
let cutsceneActive = false;

// 測驗資料
let quizTable;
let quizData = [];
let quizPool = []; // 用於抽題的暫存池（避免重複）
const totalQuestions = 6; // 總題數
// 遊戲狀態旗標
let stage1Cleared = false;
let stage2Cleared = false;
let stage3Cleared = false;
let gameOver = false;
let gameWon = false;
let showWarning = false;
let warningTimer = 0;

let score = 0;
let answeredCount = 0;
let finished = false; // 是否已完成所有題目

// Confetti（彩帶）效果
let confetti = [];
let confettiLaunched = false;

// DOM 元素
let answerInput;
let submitButton;
let optionButtons = {}; // 新增：選項按鈕集合 (A/B/C/D)
let intro = true;         // 新增：是否顯示啟始頁面
let introImage;           // 新增：啟始背景圖（82.png）

// 新增：姓名輸入相關
let nameInput;
let nameConfirm;
let nameDialogActive = false;
let playerName = '';

function preload() {
  spriteSheet1 = loadImage('png/all-1.png');
  spriteSheet2 = loadImage('png/all-2.png'); // 共 12 張，尺寸 619x64

  // 新增：載入通關背景圖
  endBgImg = loadImage('png/89.png', () => {}, () => {
    console.warn('通關圖 png/89.png 找不到');
  });

  // 重新載入 CSV 測驗資料
  quizTable = loadTable('quiz.csv', 'csv', 'header');

  // 載入音樂檔案，若找不到可能會在瀏覽器 console 顯示錯誤
  try {
    song = loadSound('music/music.mp3');
  } catch (e) {
    console.warn('音樂檔案 music/music.mp3 找不到');
    song = null;
  }

  // 新增：載入背景圖
  bgImg1 = loadImage('background/background1.png', () => {}, () => {
    console.warn('背景圖 background/background1.png 找不到');
  });
  bgImg2 = loadImage('background/background2.png', () => {}, () => {
    console.warn('背景圖 background/background2.png 找不到');
  });
  bgImg3 = loadImage('background/background3.png', () => {}, () => {
    console.warn('背景圖 background/background3.png 找不到');
  });

  // 新增：載入啟始頁面圖
  introImage = loadImage('background/background0.png', () => {}, () => {
    console.warn('啟始圖 background/background0.png 找不到，將使用純色背景');
    introImage = null;
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  amp = new p5.Amplitude();

  // 阻止瀏覽器右鍵選單（讓右鍵可用作其他用途）
  document.addEventListener('contextmenu', e => e.preventDefault());

  // 處理從 CSV 載入的資料
  for (let row of quizTable.getRows()) {
    quizData.push(row.obj);
  }
  // 初始化抽題池（複製一份）
  quizPool = quizData.slice();

  // 初始化玩家角色位置
  let tempFW = (spriteSheet1.width || 170) / defaultFrameCount;
  let tempFH = spriteSheet1.height || 64;
  let displayW = tempFW * spriteScale;
  let displayH = tempFH * spriteScale;
  posX = (width - displayW) / 2;
  posY = (height - displayH) / 2;

  // 載入 NPC 圖片並建立角色實例
  loadImage('Phineas/Phineas.png', img => {
    let pScale = 0.8; // 調整 Phineas 的縮放比例
    phineas = new Character('Phineas', img, 8, 0, 0, pScale, 140);
    phineas.setPosition(width * 0.75, height / 2 - (phineas.frameH * pScale) / 2 + 100); // 調整位置
  }, () => { // 載入失敗的 fallback
    let pScale = 0.8;
    phineas = new Character('Phineas', null, 8, 1035 / 8, 215, pScale, 140);
    phineas.setPosition(width * 0.75, height / 2 - (phineas.frameH * pScale) / 2);
    console.warn('Phineas 圖片找不到，使用 placeholder');
  });

  loadImage('Ferb/Ferb.png', img => {
    let fScale = 0.6; // 調整 Ferb 的縮放比例
    ferb = new Character('Ferb', img, 7, 0, 0, fScale, 140);
    ferb.setPosition(width * 0.25 + (ferb.frameW * fScale) / 2 + 1000, height / 2 - (ferb.frameH * fScale) / 2 + 235); // 調整位置
  }, () => { // 載入失敗的 fallback
    let fScale = 0.6;
    ferb = new Character('Ferb', null, 7, 832 / 7, 300, fScale, 140);
    ferb.setPosition(width * 0.25 - (ferb.frameW * fScale) / 2, height / 2 - (ferb.frameH * fScale) / 2);
    console.warn('Ferb 圖片找不到，使用 placeholder');
  });

  // 新增：載入 Bad 角色
  loadImage('bad/bad.png', img => {
    let bScale = 1.7; // 調整 bad 的縮放比例
    bad = new Character('Bad', img, 4, 0, 0, bScale, 140); 
    bad.setPosition(width * 0.75, height / 2 - (bad.frameH * bScale) / 2 + 200); // 調整位置
  }, () => {
    // Fallback: 寬為447，高為291
    bad = new Character('Bad', null, 4, 447 / 4, 291, spriteScale, 140);
    bad.setPosition(width * 0.75, height / 2 - (bad.frameH * spriteScale) / 2);
    console.warn('Bad 圖片找不到，使用 placeholder');
  });

  // 新增：載入 Remilia (提示角色)
  loadImage('remilia/remilia.png', img => {
    remilia = new Character('Remilia', img, 5, 0, 0, spriteScale, 140);
  }, () => {
    // Fallback: 寬為195，高為43
    remilia = new Character('Remilia', null, 5, 195 / 5, 43, spriteScale, 140);
    console.warn('Remilia 圖片找不到，使用 placeholder');
  });

  // 建立 DOM 輸入框與按鈕（保留原來但不使用）
  answerInput = createInput();
  submitButton = createButton('ENTER');
  submitButton.mousePressed(() => {
    // 保留備援，但主要使用選項按鈕
  });
  answerInput.hide();
  submitButton.hide();

  // 建立姓名輸入框與確定按鈕（初始隱藏）
  nameInput = createInput();
  nameInput.attribute('placeholder', '請輸入姓名');
  nameInput.hide();
  nameConfirm = createButton('確定');
  nameConfirm.mousePressed(confirmName);
  nameConfirm.hide();

  // 建立選項按鈕（A/B/C/D），預設隱藏
  const letters = ['A','B','C','D'];
  for (let i=0; i<letters.length; i++) {
    const l = letters[i];
    optionButtons[l] = createButton(l);
    optionButtons[l].mousePressed(() => optionSelected(l));
    optionButtons[l].hide();
    optionButtons[l].addClass('quiz-option'); // 可以用 CSS 調整樣式
  }

  // 初始化 confetti 陣列
  confetti = [];
  confettiLaunched = false;
}

function draw() {
  // 若仍在啟始頁面，顯示 82.png 與文字說明，點擊左鍵進入姓名輸入對話框
  if (intro) {
    if (introImage) {
      image(introImage, 0, 0, width, height);
    } else {
      background('#222'); // fallback
    }

    push();
    textAlign(CENTER, CENTER);

    // 立體字效果：先畫陰影層，然後畫主字
    const mainText = '當你闖入卡通\n你將回答問題擊敗最終魔王';
    textSize(min(width, height) * 0.04);

    // 陰影層（多層位移製成立體感）
    fill(0, 120);
    for (let i=4; i>=1; i--) {
      text(mainText, width/2 + i, height/2 - 20 + i);
    }
    // 主要文字（較亮）
    fill(255);
    text(mainText, width/2, height/2 - 20);

    // 小字提示（在主文字下方）
    textSize(14);
    fill(230);
    // 也給小字輕微陰影
    fill(0,100);
    text('點擊滑鼠左鍵繼續', width / 2 + 1, height / 2 + 40 + 1);
    fill(240);
    text('點擊滑鼠左鍵繼續', width / 2, height / 2 + 40);
    pop();

    // 若已觸發姓名對話框，顯示輸入 UI 在畫面中心
    if (nameDialogActive) {
      const boxW = min(480, width * 0.6);
      const boxH = 120;
      const boxX = width/2 - boxW/2;
      const boxY = height/2 - boxH/2;

      // 半透明方格
      push();
      fill(255, 240);
      stroke(0, 120);
      strokeWeight(1);
      rect(boxX, boxY, boxW, boxH, 8);

      // 標題文字
      noStroke();
      fill(0);
      textAlign(CENTER, CENTER);
      textSize(18);
      text('請輸入姓名', width/2, boxY + 24);
      pop();

      // 顯示並定位 DOM 輸入框與確定按鈕
      nameInput.size(boxW - 40, 28);
      nameInput.position(boxX + 20, boxY + 44);
      nameConfirm.position(boxX + boxW/2 - 30, boxY + 80);
      nameInput.show();
      nameConfirm.show();
      // 停止其他互動（不要讓遊戲開始）
      return;
    }

    return; // 尚未輸入姓名，不執行其他遊戲邏輯
  }

  // 根據音量大小調整動畫速度
  let level = amp.getLevel();
  frameDelay = map(level, 0, 0.5, 15, 0);

  // --- Game Over 檢查 ---
  if (gameOver) {
    background(0);
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("你將永遠無法離開\n按下空白鍵重新開始", width / 2, height / 2);
    return;
  }

  // --- 通關畫面檢查 ---
  if (gameWon) {
    if (endBgImg) {
      image(endBgImg, 0, 0, width, height);
    } else {
      background(255);
    }
    
    // 紅色字恭喜通關
    fill(255, 0, 0);
    textSize(64);
    textAlign(CENTER, CENTER);
    text("恭喜通關", width / 2, height / 2);

    // 繪製玩家並顯示對話框
    let sheet = altPlaying ? spriteSheet2 : spriteSheet1;
    let activeFrameCount = altPlaying ? altFrameCount : defaultFrameCount;
    let frameW = sheet.width / activeFrameCount;
    let frameH = sheet.height;
    let dW = frameW * spriteScale;
    let dH = frameH * spriteScale;
    let sX = currentFrame * frameW;
    
    // 讓玩家顯示在畫面下方中間
    let pX = width / 2 - dW / 2;
    let pY = height - dH - 50;
    image(sheet, pX, pY, dW, dH, sX, 0, frameW, frameH);

    // 玩家頭頂對話框
    drawSpeechBubble(pX + dW/2, pY, "終於過關了");
    return;
  }

  // 使用背景圖片填滿畫布；若載入失敗則回退為原本背景色
  let currentBg;
  if (currentStage === 1) currentBg = bgImg1;
  else if (currentStage === 2) currentBg = bgImg2;
  else if (currentStage === 3) currentBg = bgImg3;

  if (currentBg) {
    image(currentBg, 0, 0, width, height);
  } else {
    background('#CDF3F4');
  }

  // 顯示左上角分數與題數 (已移除)

  // 若完成，啟動並顯示 confetti 與最終分數
  if (answeredCount >= totalQuestions) {
    finished = true;
    answerInput.hide();
    submitButton.hide();

    if (!confettiLaunched) {
      launchConfetti(180); // 發射 180 片彩帶
      confettiLaunched = true;
    }

    // 繼續更新與繪製 confetti
    for (let i = confetti.length - 1; i >= 0; i--) {
      confetti[i].update();
      confetti[i].draw();
      if (confetti[i].offscreen()) {
        confetti.splice(i, 1);
      }
    }

    // 半透明遮罩並顯示最終分數
    push();
    fill(0, 120);
    rect(0, 0, width, height);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(36);
    text(`測驗結束！ 最終分數：${score} / ${totalQuestions * 25}`, width / 2, height / 2); // 每題 25 分
    pop();

    // 顯示持續飄落的 confetti，不繼續其他互動
    return;
  }

  // --- Stage 3 Cutscene Logic ---
  if (currentStage === 3) {
    if (!stage3Initialized) {
      stage3Initialized = true;
      badCutsceneState = 1; // Start waiting
      cutsceneTimer = millis() + 300; // 0.3 seconds delay
      cutsceneActive = true;
    }

    if (cutsceneActive) {
      if (badCutsceneState === 1) {
        if (millis() > cutsceneTimer) {
          badCutsceneState = 2;
          if (bad) {
            bad.dialogActive = true;
            bad.feedback = "你終於來了\n我等你很久了";
            bad.feedbackTimer = 180; // 3 seconds (60fps)
          }
        }
      } else if (badCutsceneState === 2) {
        // Wait for feedbackTimer to finish
        if (bad && bad.feedbackTimer <= 0) {
          badCutsceneState = 3;
          bad.feedback = "我是不會讓你過關的";
          bad.feedbackTimer = 90; // 1.5 seconds
        }
      } else if (badCutsceneState === 3) {
        if (bad && bad.feedbackTimer <= 0) {
          badCutsceneState = 4;
          cutsceneActive = false;
          bad.dialogActive = false; // Hide dialog
        }
      }
    }
  }

  // 玩家移動控制
  if (!cutsceneActive) {
    if (keyIsDown(LEFT_ARROW)) {
      posX -= speed;
      facingLeft = true;
    } else if (keyIsDown(RIGHT_ARROW)) {
      posX += speed;
      facingLeft = false;
    }
    if (keyIsDown(UP_ARROW)) {
      posY -= speed;
    } else if (keyIsDown(DOWN_ARROW)) {
      posY += speed;
    }
  }

  // 玩家動畫設定
  let sheet = altPlaying ? spriteSheet2 : spriteSheet1;
  let activeFrameCount = altPlaying ? altFrameCount : defaultFrameCount;
  if (currentFrame >= activeFrameCount) currentFrame = 0;

  let frameW = sheet.width / activeFrameCount;
  let frameH = sheet.height;
  let displayW = frameW * spriteScale;
  let displayH = frameH * spriteScale;

  // 限制角色不要移出畫布
  if (posX > width - displayW) {
    if (currentStage === 1) {
      if (stage1Cleared) {
        currentStage = 2;
        posX = 0;
      } else {
        posX = width - displayW;
        showWarning = true;
        warningTimer = millis();
      }
    } else if (currentStage === 2) {
      if (stage2Cleared) {
        currentStage = 3;
        posX = 0;
        stage3Initialized = false; // 重置 Stage 3 劇情
      } else {
        posX = width - displayW;
        showWarning = true;
        warningTimer = millis();
      }
    } else if (currentStage === 3) {
      if (stage3Cleared) {
        gameWon = true;
      } else {
        posX = width - displayW;
        showWarning = true;
        warningTimer = millis();
      }
    } else {
      posX = width - displayW;
    }
  }
  // 顯示警告文字
  if (showWarning) {
    if (millis() - warningTimer < 2000) {
      drawSpeechBubble(posX + displayW / 2, posY, "你尚未回答問題");
    } else {
      showWarning = false;
    }
  }

  if (posX < 0) posX = 0;

  posY = constrain(posY, 0, height - displayH);

  // 更新玩家動畫幀
  frameCounter++;
  if (frameCounter > frameDelay) {
    if (altPlaying) {
      if (currentFrame < activeFrameCount - 1) {
        currentFrame++;
      } else {
        // 播放完 all-2.png 的最後一幀，結束 alt 播放並回到預設
        altPlaying = false;
        currentFrame = 0;
      }
    } else {
      currentFrame = (currentFrame + 1) % activeFrameCount;
    }
    frameCounter = 0;
  }

  let sourceX = currentFrame * frameW;

  // --- 繪製與更新 NPC ---
  if (phineas && currentStage === 1) {
    // 判斷玩家是否在 NPC 左側，若是則鏡像
    let pCenterX = posX + displayW / 2;
    let npcCenterX = phineas.x + (phineas.frameW * phineas.spriteScale) / 2;
    phineas.draw(pCenterX < npcCenterX);

    phineas.checkInteraction(posX, posY, displayW, displayH);
    phineas.drawDialog();
  }

  if (ferb && currentStage === 2) {
    let pCenterX = posX + displayW / 2;
    let npcCenterX = ferb.x + (ferb.frameW * ferb.spriteScale) / 2;
    ferb.draw(pCenterX < npcCenterX);

    ferb.checkInteraction(posX, posY, displayW, displayH);
    ferb.drawDialog();
  }

  if (bad && currentStage === 3) {
    bad.draw();
    // Cutscene 期間不檢查互動距離，強制顯示對話
    if (!cutsceneActive) {
      bad.checkInteraction(posX, posY, displayW, displayH);
    }
    bad.drawDialog();
  }

  // --- 決定是否顯示回答區 ---
  // 判斷當前關卡的出題者
  let activeQuizChar = null;
  if (currentStage === 1) activeQuizChar = phineas;
  else if (currentStage === 2) activeQuizChar = ferb;
  else if (currentStage === 3) activeQuizChar = bad;

  if (activeQuizChar && activeQuizChar.dialogActive && activeQuizChar.quiz && activeQuizChar.feedbackTimer <= 0) {
    const panelW = 340; // 加寬面板以容納所有元件
    const panelH = 60;
    const panelX = posX + displayW / 2 - panelW / 2;
    const panelY = posY - panelH - 10;

    // 繪製淺色底板
    push();
    fill(255, 255, 255, 230);
    noStroke();
    rect(panelX, panelY, panelW, panelH, 8);

    // 繪製 "請回答" 文字
    fill(0);
    textSize(16);
    textAlign(LEFT, CENTER);
    let label = '請回答:';
    text(label, panelX + 15, panelY + panelH / 2);
    let labelW = textWidth(label);
    pop();

    // 定位並顯示輸入框和按鈕（隨玩家位置顯示）
    const inputX = panelX + 15 + labelW + 10;
    const elHeight = answerInput.elt.offsetHeight || 25;
    const inputY = panelY + (panelH - elHeight) / 2;

    answerInput.size(120); // 設定輸入框寬度
    answerInput.position(inputX, inputY);
    submitButton.position(inputX + 120 + 10, inputY);
    answerInput.show();
    submitButton.show();
  } else {
    // 若無活動中的出題者，隱藏輸入框
    answerInput.hide();
    submitButton.hide();
  }

  // --- Remilia Hint Logic ---
  if (activeQuizChar && activeQuizChar.quiz && activeQuizChar.quizStartTime && (millis() - activeQuizChar.quizStartTime > 4000)) {
    if (remilia) {
      remilia.setPosition(posX - 400, posY);
      remilia.dialogActive = true;
      remilia.feedback = "提示：\n" + activeQuizChar.quiz.hint;
      remilia.feedbackTimer = 5; // 保持顯示
      remilia.draw(true); // 翻轉使其面向右側
      remilia.drawDialog();
    }
  }

  // --- 最後繪製玩家，確保在最上層 ---
  if (facingLeft) {
    push();
    translate(posX + displayW, posY);
    scale(-1, 1);
    image(sheet, 0, 0, displayW, displayH, sourceX, 0, frameW, frameH);
    pop();
  } else {
    image(sheet, posX, posY, displayW, displayH, sourceX, 0, frameW, frameH);
  }
}

function keyPressed() {
  // Game Over 或 通關時，按下空白鍵重新整理頁面
  if (key === ' ' && (gameOver || gameWon)) {
    window.location.reload();
  }

  // 點擊一次 A（keyCode 65）開始播放 all-2.png 的整個序列（若正在播放則忽略）
  if ((key === 'a' || key === 'A' || keyCode === 65) && !altPlaying) {
    altPlaying = true;
    currentFrame = 0;
    frameCounter = 0;
  }

  // 按下 Enter 鍵時，觸發問題或提交答案
  if (keyCode === ENTER) {
    submitAnswer();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 輸入框位置已改為動態，此處無需再處理
}

function mousePressed() {
  // 如果正在啟始頁面，左鍵觸發姓名對話框
  if (intro && mouseButton === LEFT) {
    nameDialogActive = true;
    return;
  }

  // 一旦離開啟始頁面，正常處理音樂啟動
  if (song && !song.isPlaying()) {
    song.loop();
  }
}

function submitAnswer() {
  if (finished) return;
  let answered = false;
  
  // 根據關卡決定處理哪個角色的問答
  if (currentStage === 1 && phineas && phineas.dialogActive) {
    handleQuiz(phineas);
    answered = true;
  } else if (currentStage === 2 && ferb && ferb.dialogActive) {
    handleQuiz(ferb);
    answered = true;
  } else if (currentStage === 3 && bad && bad.dialogActive) {
    handleQuiz(bad);
    answered = true;
  }

  if (answered) {
    answerInput.value(''); // 清空輸入框
  }
}

function handleQuiz(character) {
  if (finished) return;
  if (character.feedbackTimer > 0) return; // 正在顯示回饋，不處理

  if (!character.quiz) {
    // 從 quizPool 抽一題（若空則重填）
    if (quizPool.length === 0) {
      quizPool = quizData.slice();
    }
    if (quizPool.length === 0) return;

    let idx = floor(random(0, quizPool.length));
    // 將題目從 pool 中移出以避免立即重複
    character.quiz = quizPool.splice(idx, 1)[0];
    character.quizStartTime = millis(); // 紀錄開始時間
    return;
  } else {
    // 檢查答案
    const userAnswer = answerInput.value().trim();
    // 保存題目資料（包含 hint），因為之後會把 character.quiz 清掉
    const currentQ = character.quiz;

    if (userAnswer === currentQ.answer) {
      character.feedback = currentQ.correct_feedback;
      score += 25; // 每題 25 分
      // 設定關卡通過旗標
      if (currentStage === 1) stage1Cleared = true;
      if (currentStage === 2) stage2Cleared = true;
      if (currentStage === 3) stage3Cleared = true;
    } else {
      // 錯誤時顯示提示 (直接顯示在當前角色對話框)
      character.feedback = (currentQ.incorrect_feedback || '答錯了！') + '\n' + (currentQ.hint || '');
      
      // Bad 角色答錯觸發 Game Over
      if (currentStage === 3 && character === bad) {
        gameOver = true;
      }
    }

    answeredCount++;
    character.feedbackTimer = character.feedbackDuration;
    // 清掉題目，避免重複回答
    character.quiz = null;

    // 若達到總題數則在下一個 draw() 觸發結束流程
    if (answeredCount >= totalQuestions) {
      finished = true;
      answerInput.hide();
      submitButton.hide();
    }
  }
}

// Confetti 類別與發射函式
function launchConfetti(n) {
  for (let i = 0; i < n; i++) {
    let x = random(0, width);
    let y = random(-height * 0.5, -10);
    let dx = random(-1.5, 1.5);
    let dy = random(1, 3) + random(0, 2);
    let size = random(6, 14);
    let colors = [
      color(255, 102, 102),
      color(255, 204, 102),
      color(102, 204, 255),
      color(153, 255, 153),
      color(255, 153, 255),
      color(255, 255, 153)
    ];
    let c = random(colors);
    let rot = random(TWO_PI);
    let rotSpeed = random(-0.2, 0.2);
    confetti.push(new Confetti(x, y, dx, dy, c, size, rot, rotSpeed));
  }
}

class Confetti {
  constructor(x, y, dx, dy, col, size, rot, rotSpeed) {
    this.pos = createVector(x, y);
    this.vel = createVector(dx, dy);
    this.acc = createVector(0, 0.02);
    this.col = col;
    this.size = size;
    this.rot = rot;
    this.rotSpeed = rotSpeed;
    this.angular = random(-0.1, 0.1);
    this.life = 0;
    this.maxLife = random(180, 400);
  }

  update() {
    // 施加微小風與重力，增加旋轉
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.rot += this.rotSpeed;
    this.vel.x += sin(this.life * 0.05) * 0.02; // 模擬擺動
    this.life++;
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rot);
    noStroke();
    fill(this.col);
    // 以矩形模擬彩帶，大小和旋轉會看起來像條帶
    rectMode(CENTER);
    rect(0, 0, this.size * 1.6, this.size * 0.6, 2);
    pop();
  }

  offscreen() {
    return this.pos.y - this.size > height + 50 || this.life > this.maxLife;
  }
}

// 新增：處理姓名確定
function confirmName() {
  const val = nameInput.value().trim();
  if (!val) {
    // 若為空，簡單閃爍或維持輸入（這裡直接 return）
    return;
  }
  playerName = val;
  // 隱藏姓名輸入 UI，進入主畫面
  nameInput.hide();
  nameConfirm.hide();
  nameDialogActive = false;
  intro = false;

  // 播放音樂（如有）
  if (song && !song.isPlaying()) {
    song.loop();
  }
}

// 輔助函式：繪製簡易對話框
function drawSpeechBubble(x, y, txt) {
  push();
  textSize(16);
  let w = textWidth(txt) + 20;
  let h = 40;
  let bx = x - w / 2;
  let by = y - h - 10;
  
  fill(255);
  stroke(0);
  strokeWeight(1);
  rect(bx, by, w, h, 10);
  
  // 三角形指標
  triangle(x - 5, by + h, x + 5, by + h, x, by + h + 5);
  
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  text(txt, x, by + h / 2);
  pop();
}

// 重置遊戲
function resetGame() {
  currentStage = 1;
  score = 0;
  answeredCount = 0;
  stage1Cleared = false;
  stage2Cleared = false;
  stage3Cleared = false;
  gameOver = false;
  gameWon = false;
  posX = 0;
  stage3Initialized = false;
  cutsceneActive = false;
  badCutsceneState = 0;
  if (phineas) phineas.quiz = null;
  if (ferb) ferb.quiz = null;
  if (bad) bad.quiz = null;

  // 回到啟始頁面 (background0)
  intro = true;
  nameDialogActive = false;
  playerName = '';
  if (song) song.stop();
}
