/**
 * 角色類別，用於管理 NPC 的狀態、動畫與互動
 */
class Character {
  constructor(name, sheet, frameCount, frameW, frameH, scale, interactionDistance) {
    this.name = name;
    this.sheet = sheet;
    this.frameCount = frameCount;
    this.frameW = sheet ? sheet.width / frameCount : frameW;
    this.frameH = sheet ? sheet.height : frameH;
    this.spriteScale = scale;
    this.interactionDistance = interactionDistance;

    this.x = 0;
    this.y = 0;

    // 動畫相關
    this.currentFrame = 0;
    this.frameCounter = 0;
    this.frameDelay = 6;

    // 互動狀態
    this.dialogActive = false;
    this.quiz = null; // 當前的題目物件 { question, answer, ... }
    this.feedback = ''; // 當前回饋文字
    this.feedbackTimer = 0;
    this.feedbackDuration = 180; // 3 秒
  }

  // 設定角色位置
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  // 更新動畫幀
  updateAnimation() {
    this.frameCounter++;
    if (this.frameCounter > this.frameDelay) {
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
      this.frameCounter = 0;
    }
  }

  // 繪製角色
  draw(flipped = false) {
    this.updateAnimation();

    const displayW = this.frameW * this.spriteScale;
    const displayH = this.frameH * this.spriteScale;
    const sourceX = this.currentFrame * this.frameW;

    if (this.sheet) {
      if (flipped) {
        push();
        // 移動原點到圖片右側邊界，然後水平翻轉
        translate(this.x + displayW, this.y);
        scale(-1, 1);
        image(this.sheet, 0, 0, displayW, displayH, sourceX, 0, this.frameW, this.frameH);
        pop();
      } else {
        image(this.sheet, this.x, this.y, displayW, displayH, sourceX, 0, this.frameW, this.frameH);
      }
    } else {
      // 如果圖片不存在，畫一個 placeholder
      push();
      fill('#CCCCCC');
      stroke(0);
      rect(this.x, this.y, displayW, displayH);
      fill(0);
      noStroke();
      textSize(12);
      textAlign(CENTER, CENTER);
      text(`${this.name}\nmissing`, this.x + displayW / 2, this.y + displayH / 2);
      pop();
    }
  }

  // 檢查與玩家的距離
  checkInteraction(playerX, playerY, playerW, playerH) {
    const playerCX = playerX + playerW / 2;
    const playerCY = playerY + playerH / 2;
    const charCX = this.x + (this.frameW * this.spriteScale) / 2;
    const charCY = this.y + (this.frameH * this.spriteScale) / 2;

    const d = dist(playerCX, playerCY, charCX, charCY);

    if (d <= this.interactionDistance) {
      if (!this.dialogActive) {
        // 首次進入範圍
        this.dialogActive = true;
        this.feedback = ''; // 清除舊回饋
        this.feedbackTimer = 0;
      }
    } else {
      if (this.dialogActive) {
        // 離開範圍
        this.dialogActive = false;
        this.quiz = null; // 清除題目
      }
    }
  }

  // 顯示對話框
  drawDialog() {
    if (!this.dialogActive) return;

    const displayW = this.frameW * this.spriteScale;
    const boxW = 320;
    const boxH = 120;
    let bx = constrain(this.x - boxW / 2 + displayW / 2, 10, width - boxW - 10);
    let by = this.y - boxH - 10;
    if (by < 10) by = this.y + (this.frameH * this.spriteScale) + 10;

    push();
    fill(255);
    stroke(0);
    rect(bx, by, boxW, boxH, 8);
    noStroke();
    fill(0);
    textSize(14);
    textAlign(LEFT, TOP);

    if (this.feedbackTimer > 0) {
      // 顯示回饋
      fill(this.feedback.includes('不對') ? '#D00' : '#0A7');
      textAlign(CENTER, CENTER);
      text(this.feedback, bx + boxW / 2, by + boxH / 2);
      this.feedbackTimer--;
      if (this.feedbackTimer === 0) {
        this.quiz = null; // 回饋結束後清除題目，準備問新問題
      }
    } else if (this.quiz) {
      // 顯示問題
      text(this.quiz.question, bx + 12, by + 10);
      textSize(12);
      fill(80);
      text(this.quiz.hint, bx + 12, by + boxH - 22);
    } else {
      // 提示靠近可以互動
      textAlign(CENTER, CENTER);
      text('靠近我，然後按下 Enter 回答問題！', bx + boxW / 2, by + boxH / 2);
    }

    pop();
  }
}