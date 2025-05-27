// vhs-noise-butterfly.js
// VHS Tape Noise with Subtle Butterfly Apparitions

// 暗い青系カラーパレット（画像に合わせて）
const darkColors = [
  '#1a2332', // ダークブルーグレー
  '#2c3e50', // ミッドナイトブルー
  '#34495e', // ウェットアスファルト
  '#445566', // スレートグレー
  '#556677', // ライトスレート
  '#667788', // グレイッシュブルー
  '#778899', // ライトスレートグレー
];

// 蝶の薄い色（ほぼ見えない）
const ghostButterflyColors = [
  'rgba(100, 150, 200, 0.03)', // 極薄ブルー
  'rgba(120, 180, 220, 0.04)', // 極薄ライトブルー
  'rgba(80, 130, 180, 0.02)',  // 極薄ダークブルー
  'rgba(140, 190, 240, 0.05)', // 極薄スカイブルー
];

// ノイズの種類
const NOISE_TYPES = {
  VHS_HORIZONTAL: 'vhs_horizontal',
  STATIC: 'static',
  INTERFERENCE: 'interference',
  GHOST_BUTTERFLY: 'ghost_butterfly'
};

// グローバル変数
let noiseLines = [];
let staticPixels = [];
let ghostButterflies = [];
let noiseIntensity = 0.4;
let interferencePhase = 0;
let canvas;
let vhsSpeed = 0.5; // VHS風のゆっくりとした速度

// タッチ操作のための変数
let touchStartY = 0;
let touchEndY = 0;
let isTouching = false;
let swipeThreshold = 30;

// p5.jsインスタンスモードで実行
const backgroundSketch = (p) => {
  p.setup = function() {
    const mvContainer = document.querySelector('.mv');
    canvas = p.createCanvas(mvContainer.offsetWidth, mvContainer.offsetHeight);
    canvas.id('backgroundCanvas');
    canvas.parent(mvContainer);
    canvas.style('position', 'absolute');
    canvas.style('top', '0');
    canvas.style('left', '0');
    canvas.style('z-index', '-1');
    canvas.style('touch-action', 'none');
    p.frameRate(30);
    p.background(26, 35, 50); // 画像に合わせた暗い青系
    
    initializeNoise();
    setupTouchEvents();
  };
  
  p.draw = function() {
    // 画像に合わせた暗い青系背景
    p.background(26, 35, 50, 240);
    
    // VHS風ノイズの描画
    drawVHSNoise();
    drawStaticNoise();
    drawInterference();
    
    // 極薄の蝶（見えるか見えないか）
    drawGhostButterflies();
    
    // ノイズパターンの更新
    updateNoisePatterns();
    
    // 時々ノイズ強度を微調整
    if (p.random() > 0.99) {
      noiseIntensity = p.random(0.2, 0.6);
    }
  };
  
  p.windowResized = function() {
    const mvContainer = document.querySelector('.mv');
    p.resizeCanvas(mvContainer.offsetWidth, mvContainer.offsetHeight);
    p.background(26, 35, 50);
    initializeNoise();
  };
  
  p.mousePressed = function() {
    if (!p.touches && p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      triggerVHSGlitch();
      return false;
    }
    return true;
  };
  
  function setupTouchEvents() {
    const canvasElement = document.getElementById('backgroundCanvas');
    
    canvasElement.addEventListener('touchstart', function(e) {
      isTouching = true;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    canvasElement.addEventListener('touchmove', function(e) {
      if (isTouching) {
        touchEndY = e.touches[0].clientY;
        const swipeDistance = touchEndY - touchStartY;
        
        if (Math.abs(swipeDistance) > 15) {
          noiseIntensity = p.map(Math.abs(swipeDistance), 15, 80, 0.2, 0.7);
          noiseIntensity = p.constrain(noiseIntensity, 0.1, 0.8);
          
          // 稀に蝶を出現させる
          if (Math.random() > 0.85) {
            spawnGhostButterfly();
          }
          
          touchStartY = touchEndY;
        }
      }
    }, { passive: true });
    
    canvasElement.addEventListener('touchend', function(e) {
      if (isTouching) {
        isTouching = false;
        triggerVHSGlitch();
      }
    }, { passive: true });
    
    canvasElement.addEventListener('touchcancel', function() {
      isTouching = false;
    }, { passive: true });
  }
  
  function initializeNoise() {
    noiseLines = [];
    staticPixels = [];
    ghostButterflies = [];
    
    // VHS風水平ノイズラインの初期化
    for (let i = 0; i < 8; i++) {
      generateVHSNoiseLine();
    }
    
    // 静的ノイズピクセルの初期化（控えめに）
    let pixelCount = p.floor((p.width * p.height) / 300);
    for (let i = 0; i < pixelCount; i++) {
      staticPixels.push({
        x: p.random(p.width),
        y: p.random(p.height),
        brightness: p.random(40, 120), // 暗めの範囲
        life: p.random(10, 30)
      });
    }
  }
  
  function drawVHSNoise() {
    // VHS風水平ノイズ（下から上に登る）
    for (let line of noiseLines) {
      if (line.active) {
        // 下から上への移動
        line.y -= vhsSpeed;
        
        // 上端を超えたら下からリスタート
        if (line.y < -line.height - 20) {
          line.y = p.height + p.random(20, 100);
          line.brightness = p.random(40, 100);
          line.opacity = p.random(60, 150);
        }
        
        // 水平ノイズバンドの描画
        p.fill(line.brightness, line.brightness + 20, line.brightness + 40, line.opacity);
        p.noStroke();
        
        // VHS特有の断続的なブロック（水平方向）
        let blockCount = p.floor(p.random(4, 10));
        for (let b = 0; b < blockCount; b++) {
          let blockX = b * (p.width / blockCount) + p.random(-30, 30);
          let blockWidth = p.random(40, 120);
          
          // 画面幅に収める
          blockX = p.constrain(blockX, 0, p.width - blockWidth);
          
          p.rect(blockX, line.y, blockWidth, line.height);
          
          // 時々追加のノイズテクスチャ
          if (p.random() > 0.8) {
            for (let i = 0; i < blockWidth; i += 4) {
              if (p.random() > 0.7) {
                p.fill(p.random(30, 100), p.random(40, 120), p.random(50, 140), line.opacity * 0.5);
                p.rect(blockX + i, line.y + p.random(-2, line.height + 2), 4, p.random(1, 4));
              }
            }
          }
        }
        
        // ライン全体を薄く塗る
        p.fill(line.brightness * 0.7, line.brightness * 0.8 + 15, line.brightness * 0.9 + 30, line.opacity * 0.3);
        p.rect(0, line.y, p.width, line.height);
      }
    }
  }
  
  function drawStaticNoise() {
    // 控えめな静的ノイズ
    for (let i = 0; i < staticPixels.length * noiseIntensity * 0.5; i++) {
      let pixel = p.random(staticPixels);
      if (pixel && p.random() > 0.5) {
        let brightness = p.random(40, 120);
        p.fill(brightness * 0.8, brightness * 0.9, brightness, 150);
        p.noStroke();
        p.rect(pixel.x, pixel.y, p.random(1, 3), p.random(1, 2));
      }
    }
  }
  
  function drawInterference() {
    // 薄い干渉パターン
    interferencePhase += 0.02;
    
    if (p.random() > 0.97) {
      p.stroke(60, 80, 120, 80);
      p.strokeWeight(1);
      
      for (let i = 0; i < 3; i++) {
        let y = p.sin(interferencePhase + i * 0.7) * p.height * 0.2 + p.height * 0.5;
        
        p.beginShape();
        p.noFill();
        for (let x = 0; x < p.width; x += 8) {
          let waveY = y + p.sin(x * 0.01 + interferencePhase + i) * 15;
          p.vertex(x, waveY);
        }
        p.endShape();
      }
    }
  }
  
  function drawGhostButterflies() {
    // 極薄の蝶（見えるか見えないか）
    for (let butterfly of ghostButterflies) {
      if (butterfly.active) {
        p.push();
        p.translate(butterfly.x, butterfly.y);
        p.rotate(butterfly.rotation);
        p.scale(butterfly.scale);
        
        // 極薄の透明度
        let alpha = butterfly.opacity * (p.sin(butterfly.phase) * 0.3 + 0.7);
        
        // 蝶の形を非常に薄く描画
        drawSubtleButterfly(alpha, butterfly.color);
        
        p.pop();
      }
    }
  }
  
  function drawSubtleButterfly(alpha, colorStr) {
    // 極薄の蝶の形
    let color = p.color(colorStr);
    color.setAlpha(alpha * 255);
    
    p.fill(color);
    p.noStroke();
    
    // 非常にシンプルな蝶の形
    // 上翅
    p.beginShape();
    p.vertex(0, -15);
    p.vertex(20, -25);
    p.vertex(25, -10);
    p.vertex(15, 0);
    p.vertex(0, 0);
    p.endShape(p.CLOSE);
    
    // 上翅（反対側）
    p.beginShape();
    p.vertex(0, -15);
    p.vertex(-20, -25);
    p.vertex(-25, -10);
    p.vertex(-15, 0);
    p.vertex(0, 0);
    p.endShape(p.CLOSE);
    
    // 下翅
    p.beginShape();
    p.vertex(0, 0);
    p.vertex(12, 5);
    p.vertex(15, 15);
    p.vertex(8, 18);
    p.vertex(0, 8);
    p.endShape(p.CLOSE);
    
    // 下翅（反対側）
    p.beginShape();
    p.vertex(0, 0);
    p.vertex(-12, 5);
    p.vertex(-15, 15);
    p.vertex(-8, 18);
    p.vertex(0, 8);
    p.endShape(p.CLOSE);
    
    // 体
    color.setAlpha(alpha * 255 * 1.5);
    p.fill(color);
    p.ellipse(0, -5, 2, 20);
  }
  
  function generateVHSNoiseLine() {
    noiseLines.push({
      y: p.height + p.random(20, 100), // 画面の下から開始
      height: p.random(3, 15),
      brightness: p.random(40, 100),
      opacity: p.random(60, 150),
      active: true,
      life: p.random(200, 500), // 長めの寿命
      maxLife: 500
    });
    
    if (noiseLines.length > 15) {
      noiseLines.shift();
    }
  }
  
  function spawnGhostButterfly() {
    // 極薄の蝶を稀に出現させる
    if (ghostButterflies.length < 3) { // 最大3匹まで
      ghostButterflies.push({
        x: p.random(p.width * 0.2, p.width * 0.8),
        y: p.random(p.height * 0.2, p.height * 0.8),
        rotation: p.random(p.TWO_PI),
        rotationSpeed: p.random(-0.01, 0.01),
        scale: p.random(0.3, 0.8),
        opacity: p.random(0.02, 0.08), // 極薄
        color: p.random(ghostButterflyColors),
        active: true,
        life: p.random(180, 400),
        maxLife: 400,
        phase: p.random(p.TWO_PI),
        phaseSpeed: p.random(0.02, 0.05),
        driftX: p.random(-0.3, 0.3),
        driftY: p.random(-0.2, 0.2)
      });
    }
  }
  
  function updateNoisePatterns() {
    // VHSノイズラインの更新
    for (let i = noiseLines.length - 1; i >= 0; i--) {
      let line = noiseLines[i];
      line.life--;
      
      // 上端を超えたか寿命が尽きたら削除
      if (line.life <= 0 || line.y < -line.height - 50) {
        noiseLines.splice(i, 1);
      } else {
        // 時々速度を微調整（VHSテープの不安定さ）
        if (p.random() > 0.98) {
          vhsSpeed = p.random(0.3, 0.8);
        }
        
        // 時々ライン形状を微調整
        if (p.random() > 0.95) {
          line.height += p.random(-1, 1);
          line.height = p.constrain(line.height, 2, 20);
          line.brightness = p.random(30, 110);
        }
      }
    }
    
    // 静的ノイズピクセルの更新
    for (let pixel of staticPixels) {
      pixel.life--;
      if (pixel.life <= 0) {
        pixel.x = p.random(p.width);
        pixel.y = p.random(p.height);
        pixel.brightness = p.random(40, 120);
        pixel.life = p.random(10, 30);
      }
    }
    
    // 蝶の更新
    for (let i = ghostButterflies.length - 1; i >= 0; i--) {
      let butterfly = ghostButterflies[i];
      butterfly.life--;
      butterfly.rotation += butterfly.rotationSpeed;
      butterfly.phase += butterfly.phaseSpeed;
      
      // 微妙なドリフト
      butterfly.x += butterfly.driftX;
      butterfly.y += butterfly.driftY;
      
      // 透明度のフェード
      if (butterfly.life < 60) {
        butterfly.opacity *= 0.98;
      }
      
      if (butterfly.life <= 0 || butterfly.opacity < 0.01) {
        ghostButterflies.splice(i, 1);
      }
    }
    
    // 新しいノイズの生成
    if (p.random() > 0.96) { // 頻度を少し上げる
      generateVHSNoiseLine();
    }
    
    // 蝶の稀な出現
    if (p.random() > 0.995) { // 0.5%の確率
      spawnGhostButterfly();
    }
  }
  
  function triggerVHSGlitch() {
    // VHS風グリッチ効果
    noiseIntensity = p.random(0.5, 0.8);
    
    // 複数のノイズラインを生成
    for (let i = 0; i < p.random(4, 10); i++) {
      generateVHSNoiseLine();
    }
    
    // VHS速度を一時的に変更
    vhsSpeed = p.random(0.8, 1.5);
    
    // 稀に蝶を出現させる
    if (p.random() > 0.7) {
      spawnGhostButterfly();
    }
  }
};

new p5(backgroundSketch);