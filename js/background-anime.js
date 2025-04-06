// background-animation.js
// パターンジェネレーター for Mei Takeda website

// 色の設定
const colors = [
  '#05d9e8', // ライトターコイズ
  '#005678', // ディープブルー
  '#01b8cd', // ミディアムターコイズ
  '#d100d1', // ピンク
  '#ffffff', // 白
  '#005f73', // ディープターコイズ
  '#0a9396', // ミディアムグリーンブルー
  '#94d2bd', // ライトグリーン
  '#ff9ec4'  // ライトピンク
];

// パターンタイプ
const PATTERN_TYPES = {
  SPIRAL: 'spiral',
  FLOWER: 'flower',
  BUTTERFLY: 'butterfly',
  GEOMETRIC: 'geometric',
  RANDOM_LINES: 'random_lines'
};

// グローバル変数
let patterns = [];
let lastPatternTime = 0;
let glitchActive = false;
let glitchTime = 0;
let canvas;

// タッチ操作のための変数
let touchStartY = 0;
let touchEndY = 0;
let isTouching = false;
let swipeThreshold = 50; // スワイプとして認識する最小距離

// p5.jsインスタンスモードで実行 (グローバルスコープを汚染しない)
const backgroundSketch = (p) => {
  p.setup = function() {
    // キャンバスサイズを.mvコンテナに合わせる
    const mvContainer = document.querySelector('.mv');
    canvas = p.createCanvas(mvContainer.offsetWidth, mvContainer.offsetHeight);
    canvas.id('backgroundCanvas');
    canvas.parent(mvContainer);
    canvas.style('position', 'absolute');
    canvas.style('top', '0');
    canvas.style('left', '0');
    canvas.style('z-index', '-1');
    canvas.style('touch-action', 'none'); // タッチ操作を防ぐデフォルト動作を無効化
    p.frameRate(30);
    p.background(26, 59, 74);
    
    // 初期パターンを生成
    createInitialPatterns();
    
    // タッチイベントのセットアップ
    setupTouchEvents();
  };
  
  p.draw = function() {
    // 背景を少し透明にすることで残像効果
    p.fill(26, 59, 74, 20);
    p.rect(0, 0, p.width, p.height);
    
    // グリッチエフェクト管理
    manageGlitchEffect();
    
    // 定期的に新しいパターンを追加
    if (p.millis() - lastPatternTime > 5000) { // 5秒ごと
      addRandomPattern();
      lastPatternTime = p.millis();
    }
    
    // 全パターンの更新と描画
    for (let i = patterns.length - 1; i >= 0; i--) {
      patterns[i].update();
      patterns[i].display();
      
      // 寿命が尽きたパターンを削除
      if (patterns[i].isDead()) {
        patterns.splice(i, 1);
      }
    }
  };
  
  // ウィンドウリサイズ時の対応
  p.windowResized = function() {
    const mvContainer = document.querySelector('.mv');
    p.resizeCanvas(mvContainer.offsetWidth, mvContainer.offsetHeight);
    p.background(26, 59, 74);
  };
  
  // マウスクリックでパターン追加
  p.mousePressed = function() {
    // モバイルデバイスではタッチイベントを使用するため、
    // 実際のマウスイベントのみに反応するようにする
    if (!p.touches && p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      let type = p.random([
        PATTERN_TYPES.SPIRAL, 
        PATTERN_TYPES.FLOWER, 
        PATTERN_TYPES.BUTTERFLY, 
        PATTERN_TYPES.GEOMETRIC, 
        PATTERN_TYPES.RANDOM_LINES
      ]);
      patterns.push(new Pattern(p.mouseX, p.mouseY, p.random(30, 150), type));
      return false; // デフォルトのブラウザ動作を防止
    }
    return true;
  };
  
  // タッチイベントのセットアップ
  function setupTouchEvents() {
    // キャンバス要素を取得
    const canvasElement = document.getElementById('backgroundCanvas');
    
    // タッチ開始イベント
    canvasElement.addEventListener('touchstart', function(e) {
      isTouching = true;
      touchStartY = e.touches[0].clientY;
      // デフォルトのスクロール動作を防止しない (ページスクロールを許可)
    }, { passive: true });
    
    // タッチ移動イベント
    canvasElement.addEventListener('touchmove', function(e) {
      if (isTouching) {
        touchEndY = e.touches[0].clientY;
        
        // 現在のスワイプ距離を計算
        const swipeDistance = touchEndY - touchStartY;
        
        // スワイプ方向に基づいてエフェクトを適用
        // 小さい動きでも反応するように、閾値なしでパターンを追加
        if (Math.abs(swipeDistance) > 5) { // 非常に小さな動きは無視
          const swipeSpeed = Math.abs(swipeDistance) / 50; // スワイプの速さを計算
          const size = p.map(swipeSpeed, 0, 5, 20, 150); // スワイプ速度に基づいてサイズを調整
          
          // スワイプ方向によってパターンタイプを変更
          let type;
          if (swipeDistance > 0) { // 下方向へのスワイプ
            type = p.random([PATTERN_TYPES.FLOWER, PATTERN_TYPES.BUTTERFLY]);
          } else { // 上方向へのスワイプ
            type = p.random([PATTERN_TYPES.SPIRAL, PATTERN_TYPES.GEOMETRIC]);
          }
          
          // スワイプパスに沿ってパターンを追加
          if (Math.random() > 0.7) { // パターンの密度を制御
            const x = p.random(p.width);
            patterns.push(new Pattern(x, touchEndY - canvasElement.getBoundingClientRect().top, p.random(size * 0.5, size), type));
          }
          
          // スワイプ開始位置を更新して連続的なパターン生成を可能に
          touchStartY = touchEndY;
        }
      }
    }, { passive: true });
    
    // タッチ終了イベント
    canvasElement.addEventListener('touchend', function(e) {
      if (isTouching) {
        isTouching = false;
        touchEndY = e.changedTouches[0].clientY;
        
        // スワイプの距離と方向を計算
        const swipeDistance = touchEndY - touchStartY;
        
        // スワイプが閾値を超えた場合、スワイプ方向に基づいて大きなパターンを追加
        if (Math.abs(swipeDistance) > swipeThreshold) {
          let type;
          if (swipeDistance > 0) { // 下方向へのスワイプ
            type = p.random([PATTERN_TYPES.FLOWER, PATTERN_TYPES.BUTTERFLY]);
          } else { // 上方向へのスワイプ
            type = p.random([PATTERN_TYPES.SPIRAL, PATTERN_TYPES.GEOMETRIC]);
          }
          
          // 大きなエンディングパターンを追加
          const x = p.width / 2;
          const y = p.height / 2;
          patterns.push(new Pattern(x, y, p.random(100, 200), type));
          
          // スワイプ後のグリッチエフェクトをトリガー
          glitchActive = true;
          glitchTime = p.millis();
        }
      }
    }, { passive: true });
    
    // タッチキャンセルイベント
    canvasElement.addEventListener('touchcancel', function() {
      isTouching = false;
    }, { passive: true });
  }
  
  // グリッチエフェクトの管理
  function manageGlitchEffect() {
    if (p.random() > 0.997) { // 低確率でグリッチ発動
      glitchActive = true;
      glitchTime = p.millis();
    }
    
    if (glitchActive && p.millis() - glitchTime > 200) { // グリッチは短時間
      glitchActive = false;
    }
    
    if (glitchActive && p.random() > 0.5) {
      // グリッチエフェクト: 画面の一部を切り替える
      let x = p.random(p.width);
      let y = p.random(p.height);
      let w = p.random(50, 150);
      let h = p.random(20, 100);
      
      // 画面の一部を別の場所にコピー
      let sourceX = p.random(p.width);
      let sourceY = p.random(p.height);
      
      // 効果として、画面の一部をシフトまたは色を変える
      p.push();
      if (p.random() > 0.5) {
        // 画像シフト
        p.copy(sourceX, sourceY, w, h, x, y, w, h);
      } else {
        // 色の歪み
        p.fill(p.random(colors));
        p.noStroke();
        p.rect(x, y, w, h);
      }
      p.pop();
    }
  }
  
  // 初期パターンの生成
  function createInitialPatterns() {
    // センターにスパイラルパターン
    patterns.push(new Pattern(
      p.width/2, 
      p.height/2, 
      p.random(100, 200), 
      PATTERN_TYPES.SPIRAL
    ));
    
    // その他のランダムなパターン
    for (let i = 0; i < 5; i++) {
      addRandomPattern();
    }
    
    lastPatternTime = p.millis();
  }
  
  // ランダムなパターンを追加
  function addRandomPattern() {
    let x = p.random(p.width);
    let y = p.random(p.height);
    let size = p.random(30, 150);
    let type = p.random([
      PATTERN_TYPES.SPIRAL, 
      PATTERN_TYPES.FLOWER, 
      PATTERN_TYPES.BUTTERFLY, 
      PATTERN_TYPES.GEOMETRIC, 
      PATTERN_TYPES.RANDOM_LINES
    ]);
    
    patterns.push(new Pattern(x, y, size, type));
  }
  
  // パターンクラス
  class Pattern {
    constructor(x, y, size, type) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.type = type;
      this.lifespan = p.random(300, 600); // フレーム単位の寿命
      this.rotation = p.random(p.TWO_PI);
      this.rotationSpeed = p.random(-0.02, 0.02);
      this.color = p.random(colors);
      this.secondaryColor = p.random(colors);
      this.scaleFactor = 1.0;
      this.scaleDirection = p.random([-0.002, 0.002]);
      
      // タイプ固有の初期化
      switch (this.type) {
        case PATTERN_TYPES.SPIRAL:
          this.spiralDensity = p.random(2, 8);
          this.spiralArms = p.floor(p.random(5, 30));
          break;
        case PATTERN_TYPES.FLOWER:
          this.petalCount = p.floor(p.random(5, 12));
          this.petalLength = this.size * p.random(0.4, 0.8);
          this.innerRadius = this.size * 0.2;
          break;
        case PATTERN_TYPES.BUTTERFLY:
          this.wingAngle = 0;
          this.wingSpeed = p.random(0.05, 0.1);
          break;
        case PATTERN_TYPES.GEOMETRIC:
          this.sides = p.floor(p.random(3, 8));
          this.layers = p.floor(p.random(3, 8));
          break;
        case PATTERN_TYPES.RANDOM_LINES:
          this.lineCount = p.floor(p.random(20, 100));
          this.linePoints = [];
          for (let i = 0; i < this.lineCount; i++) {
            this.linePoints.push({
              x1: p.random(-this.size, this.size),
              y1: p.random(-this.size, this.size),
              x2: p.random(-this.size, this.size),
              y2: p.random(-this.size, this.size)
            });
          }
          break;
      }
    }
    
    update() {
      this.lifespan--;
      this.rotation += this.rotationSpeed;
      
      // スケーリングアニメーション
      this.scaleFactor += this.scaleDirection;
      if (this.scaleFactor < 0.8 || this.scaleFactor > 1.2) {
        this.scaleDirection *= -1;
      }
      
      // タイプ固有の更新
      switch (this.type) {
        case PATTERN_TYPES.BUTTERFLY:
          this.wingAngle += this.wingSpeed;
          break;
      }
      
      // グリッチ時は時々移動または変形
      if (glitchActive && p.random() > 0.8) {
        this.x += p.random(-10, 10);
        this.y += p.random(-10, 10);
        this.rotation += p.random(-0.5, 0.5);
      }
    }
    
    display() {
      p.push();
      p.translate(this.x, this.y);
      p.rotate(this.rotation);
      p.scale(this.scaleFactor);
      
      // 透明度は寿命に基づく（出現/消滅のアニメーション）
      let alpha = 255;
      if (this.lifespan < 60) {
        alpha = p.map(this.lifespan, 0, 60, 0, 255);
      } else if (this.lifespan > 540) {
        alpha = p.map(this.lifespan, 540, 600, 0, 255);
      }
      
      // パターンのタイプに応じた描画
      switch (this.type) {
        case PATTERN_TYPES.SPIRAL:
          this.drawSpiral(alpha);
          break;
        case PATTERN_TYPES.FLOWER:
          this.drawFlower(alpha);
          break;
        case PATTERN_TYPES.BUTTERFLY:
          this.drawButterfly(alpha);
          break;
        case PATTERN_TYPES.GEOMETRIC:
          this.drawGeometric(alpha);
          break;
        case PATTERN_TYPES.RANDOM_LINES:
          this.drawRandomLines(alpha);
          break;
      }
      
      p.pop();
    }
    
    // スパイラルパターンの描画
    drawSpiral(alpha) {
      p.strokeWeight(1);
      p.noFill();
      
      let colorObj = p.color(this.color);
      colorObj.setAlpha(alpha);
      p.stroke(colorObj);
      
      for (let i = 0; i < this.spiralArms; i++) {
        p.beginShape();
        for (let angle = 0; angle < p.TWO_PI * 2; angle += 0.1) {
          let armAngle = angle + (p.TWO_PI / this.spiralArms) * i;
          let r = this.size * (angle / (p.TWO_PI * this.spiralDensity));
          let x = p.cos(armAngle) * r;
          let y = p.sin(armAngle) * r;
          p.vertex(x, y);
        }
        p.endShape();
      }
    }
    
    // 花のパターンの描画
    drawFlower(alpha) {
      let colorObj = p.color(this.color);
      colorObj.setAlpha(alpha);
      p.fill(colorObj);
      
      let centerColorObj = p.color(this.secondaryColor);
      centerColorObj.setAlpha(alpha);
      
      // 花の中心
      p.fill(centerColorObj);
      p.noStroke();
      p.ellipse(0, 0, this.innerRadius * 2);
      
      // 花びら
      p.fill(colorObj);
      for (let i = 0; i < this.petalCount; i++) {
        let angle = (i / this.petalCount) * p.TWO_PI;
        p.push();
        p.rotate(angle);
        p.beginShape();
        p.vertex(0, 0);
        p.bezierVertex(
          this.petalLength * 0.3, this.petalLength * 0.3,
          this.petalLength * 0.7, this.petalLength * 0.3,
          this.petalLength, 0
        );
        p.bezierVertex(
          this.petalLength * 0.7, -this.petalLength * 0.3,
          this.petalLength * 0.3, -this.petalLength * 0.3,
          0, 0
        );
        p.endShape(p.CLOSE);
        p.pop();
      }
    }
    
    // 蝶のパターンの描画
    drawButterfly(alpha) {
      let colorObj = p.color(this.color);
      colorObj.setAlpha(alpha);
      p.fill(colorObj);
      
      let bodyColorObj = p.color(this.secondaryColor);
      bodyColorObj.setAlpha(alpha);
      
      // 羽のサイズ
      let wingSize = this.size * 0.8;
      let wingOpenness = p.sin(this.wingAngle) * 0.5 + 0.5; // 0から1の間で羽の開き具合
      
      // 蝶の体
      p.stroke(bodyColorObj);
      p.strokeWeight(wingSize * 0.05);
      p.line(0, -wingSize * 0.5, 0, wingSize * 0.5);
      
      // 頭
      p.noStroke();
      p.fill(bodyColorObj);
      p.ellipse(0, -wingSize * 0.5, wingSize * 0.15);
      
      // 左の翅
      p.push();
      p.rotate(-p.PI/4 * wingOpenness); // 羽ばたき角度
      p.fill(colorObj);
      p.beginShape();
      p.vertex(0, 0);
      p.bezierVertex(
        -wingSize * 0.5, -wingSize * 0.3,
        -wingSize * 0.9, -wingSize * 0.5,
        -wingSize * 0.6, -wingSize * 0.1
      );
      p.bezierVertex(
        -wingSize * 0.8, wingSize * 0.1,
        -wingSize * 0.3, wingSize * 0.1,
        0, 0
      );
      p.endShape(p.CLOSE);
      
      // 左翅の模様
      p.fill(bodyColorObj);
      p.ellipse(-wingSize * 0.4, -wingSize * 0.3, wingSize * 0.2);
      p.pop();
      
      // 右の翅
      p.push();
      p.scale(-1, 1); // X軸を反転
      p.rotate(-p.PI/4 * wingOpenness); // 羽ばたき角度
      p.fill(colorObj);
      p.beginShape();
      p.vertex(0, 0);
      p.bezierVertex(
        -wingSize * 0.5, -wingSize * 0.3,
        -wingSize * 0.9, -wingSize * 0.5,
        -wingSize * 0.6, -wingSize * 0.1
      );
      p.bezierVertex(
        -wingSize * 0.8, wingSize * 0.1,
        -wingSize * 0.3, wingSize * 0.1,
        0, 0
      );
      p.endShape(p.CLOSE);
      
      // 右翅の模様
      p.fill(bodyColorObj);
      p.ellipse(-wingSize * 0.4, -wingSize * 0.3, wingSize * 0.2);
      p.pop();
    }
    
    // 幾何学パターンの描画
    drawGeometric(alpha) {
      p.strokeWeight(1);
      p.noFill();
      
      let colorObj = p.color(this.color);
      colorObj.setAlpha(alpha);
      p.stroke(colorObj);
      
      for (let layer = 1; layer <= this.layers; layer++) {
        let layerSize = (this.size / this.layers) * layer;
        
        p.beginShape();
        for (let i = 0; i < this.sides; i++) {
          let angle = (i / this.sides) * p.TWO_PI;
          let x = p.cos(angle) * layerSize;
          let y = p.sin(angle) * layerSize;
          p.vertex(x, y);
        }
        p.endShape(p.CLOSE);
      }
      
      // 追加の装飾線（内側から外側への放射線）
      for (let i = 0; i < this.sides * 2; i++) {
        let angle = (i / (this.sides * 2)) * p.TWO_PI;
        let innerRadius = this.size * 0.2;
        let outerRadius = this.size;
        
        p.line(
          p.cos(angle) * innerRadius,
          p.sin(angle) * innerRadius,
          p.cos(angle) * outerRadius,
          p.sin(angle) * outerRadius
        );
      }
    }
    
    // ランダムな線のパターンの描画
    drawRandomLines(alpha) {
      p.strokeWeight(1);
      
      let colorObj = p.color(this.color);
      colorObj.setAlpha(alpha);
      p.stroke(colorObj);
      
      for (let i = 0; i < this.linePoints.length; i++) {
        let linePoint = this.linePoints[i];
        p.line(linePoint.x1, linePoint.y1, linePoint.x2, linePoint.y2);
      }
    }
    
    // パターンの寿命が尽きたかどうか
    isDead() {
      return this.lifespan <= 0;
    }
  }
};

// p5.jsのインスタンスを作成
new p5(backgroundSketch);