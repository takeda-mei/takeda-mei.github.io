// background-animation.js
// Beautiful Gradient Butterfly & Flowing Flower Pattern Generator

// 蝶のグラデーションカラー
const butterflyColors = [
  { r: 30, g: 144, b: 255 },   // ディープブルー
  { r: 75, g: 0, b: 130 },     // インディゴ
  { r: 138, g: 43, b: 226 },   // バイオレット
  { r: 255, g: 20, b: 147 },   // ディープピンク
  { r: 0, g: 191, b: 255 },    // ディープスカイブルー
  { r: 147, g: 0, b: 211 }     // ダークバイオレット
];

// 花の流線型カラー
const flowerColors = [
  '#ffffff', // ピュアホワイト
  '#f8f8ff', // ゴーストホワイト
  '#fff8dc', // コーンシルク
  '#fffacd', // レモンシフォン
  '#ffd700', // ゴールド
  '#ffb347', // ピーチ
  '#e6e6fa', // ラベンダー
  '#f0f8ff'  // アリスブルー
];

// パターンタイプ
const PATTERN_TYPES = {
  FLOWER: 'flower',
  BUTTERFLY: 'butterfly'
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
let swipeThreshold = 50;

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
    p.background(26, 59, 74);
    
    createInitialPatterns();
    setupTouchEvents();
  };
  
  p.draw = function() {
    p.fill(26, 59, 74, 20);
    p.rect(0, 0, p.width, p.height);
    
    manageGlitchEffect();
    
    if (p.millis() - lastPatternTime > p.random(4000, 8000)) {
      addRandomPattern();
      lastPatternTime = p.millis();
    }
    
    updatePatternInteractions();
    
    for (let i = patterns.length - 1; i >= 0; i--) {
      patterns[i].update();
      patterns[i].display();
      
      if (patterns[i].isDead()) {
        patterns.splice(i, 1);
      }
    }
  };
  
  p.windowResized = function() {
    const mvContainer = document.querySelector('.mv');
    p.resizeCanvas(mvContainer.offsetWidth, mvContainer.offsetHeight);
    p.background(26, 59, 74);
  };
  
  p.mousePressed = function() {
    if (!p.touches && p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      let type = p.random([PATTERN_TYPES.FLOWER, PATTERN_TYPES.BUTTERFLY]);
      patterns.push(new Pattern(p.mouseX, p.mouseY, p.random(80, 160), type));
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
          const swipeSpeed = Math.abs(swipeDistance) / 50;
          const size = p.map(swipeSpeed, 0, 5, 60, 140);
          
          let type = swipeDistance > 0 ? PATTERN_TYPES.FLOWER : PATTERN_TYPES.BUTTERFLY;
          
          if (Math.random() > 0.7) {
            const x = p.random(p.width * 0.2, p.width * 0.8);
            const y = p.random(p.height * 0.2, p.height * 0.8);
            patterns.push(new Pattern(x, y, size, type));
          }
          
          touchStartY = touchEndY;
        }
      }
    }, { passive: true });
    
    canvasElement.addEventListener('touchend', function(e) {
      if (isTouching) {
        isTouching = false;
        touchEndY = e.changedTouches[0].clientY;
        const swipeDistance = touchEndY - touchStartY;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
          let type = p.random([PATTERN_TYPES.FLOWER, PATTERN_TYPES.BUTTERFLY]);
          
          const x = p.width / 2 + p.random(-p.width * 0.2, p.width * 0.2);
          const y = p.height / 2 + p.random(-p.height * 0.2, p.height * 0.2);
          patterns.push(new Pattern(x, y, p.random(100, 180), type));
          
          glitchActive = true;
          glitchTime = p.millis();
        }
      }
    }, { passive: true });
    
    canvasElement.addEventListener('touchcancel', function() {
      isTouching = false;
    }, { passive: true });
  }
  
  function updatePatternInteractions() {
    let flowers = patterns.filter(p => p.type === PATTERN_TYPES.FLOWER);
    let butterflies = patterns.filter(p => p.type === PATTERN_TYPES.BUTTERFLY);
    
    butterflies.forEach(butterfly => {
      if (!butterfly.targetFlower && p.random() > 0.97) {
        let nearFlowers = flowers.filter(f => p.dist(butterfly.x, butterfly.y, f.x, f.y) < 250);
        if (nearFlowers.length > 0) {
          butterfly.targetFlower = p.random(nearFlowers);
          butterfly.attractionTime = 0;
        }
      }
    });
  }
  
  function manageGlitchEffect() {
    if (p.random() > 0.996) {
      glitchActive = true;
      glitchTime = p.millis();
    }
    
    if (glitchActive && p.millis() - glitchTime > 250) {
      glitchActive = false;
    }
    
    if (glitchActive && p.random() > 0.5) {
      let x = p.random(p.width);
      let y = p.random(p.height);
      let w = p.random(40, 120);
      let h = p.random(20, 80);
      
      p.push();
      p.fill(p.random(flowerColors));
      p.noStroke();
      p.rect(x, y, w, h);
      p.pop();
    }
  }
  
  function createInitialPatterns() {
    for (let i = 0; i < 3; i++) {
      let x = p.random(p.width * 0.2, p.width * 0.8);
      let y = p.random(p.height * 0.2, p.height * 0.8);
      patterns.push(new Pattern(x, y, p.random(120, 180), PATTERN_TYPES.FLOWER));
    }
    
    for (let i = 0; i < 2; i++) {
      let x = p.random(p.width * 0.3, p.width * 0.7);
      let y = p.random(p.height * 0.3, p.height * 0.7);
      patterns.push(new Pattern(x, y, p.random(100, 140), PATTERN_TYPES.BUTTERFLY));
    }
    
    lastPatternTime = p.millis();
  }
  
  function addRandomPattern() {
    let x = p.random(p.width * 0.1, p.width * 0.9);
    let y = p.random(p.height * 0.1, p.height * 0.9);
    let size = p.random(80, 160);
    let type = p.random([PATTERN_TYPES.FLOWER, PATTERN_TYPES.BUTTERFLY]);
    
    patterns.push(new Pattern(x, y, size, type));
  }
  
  class Pattern {
    constructor(x, y, size, type) {
      this.initialX = x;
      this.initialY = y;
      this.x = x;
      this.y = y;
      this.size = size;
      this.type = type;
      this.lifespan = p.random(600, 1000);
      this.age = 0;
      this.rotation = p.random(p.TWO_PI);
      this.rotationSpeed = p.random(-0.005, 0.005);
      this.scaleFactor = 1.0;
      this.scaleDirection = p.random([-0.001, 0.001]);
      this.noiseOffsetX = p.random(1000);
      this.noiseOffsetY = p.random(1000);
      
      if (this.type === PATTERN_TYPES.FLOWER) {
        this.petalCount = p.floor(p.random(5, 9));
        this.bloomPhase = 0;
        this.bloomSpeed = p.random(0.008, 0.02);
        this.flowDirection = p.random(p.TWO_PI);
        this.flowIntensity = p.random(0.5, 1.5);
        this.streamCount = p.floor(p.random(8, 16));
        this.centerSize = this.size * 0.15;
        
      } else if (this.type === PATTERN_TYPES.BUTTERFLY) {
        this.wingBeat = 0;
        this.wingSpeed = p.random(0.02, 0.04);
        this.flightAngle = p.random(p.TWO_PI);
        this.flightRadius = p.random(80, 140);
        this.flightSpeed = p.random(0.008, 0.015);
        this.targetFlower = null;
        this.attractionTime = 0;
        this.bodyLength = this.size * 0.7;
        this.wingSpan = this.size * 1.2;
        this.gradientPhase = p.random(p.TWO_PI);
        this.shimmerPhase = 0;
      }
    }
    
    update() {
      this.age++;
      this.lifespan--;
      this.rotation += this.rotationSpeed;
      
      this.scaleFactor += this.scaleDirection;
      if (this.scaleFactor < 0.8 || this.scaleFactor > 1.2) {
        this.scaleDirection *= -1;
      }
      
      this.noiseOffsetX += 0.006;
      this.noiseOffsetY += 0.006;
      
      if (this.type === PATTERN_TYPES.FLOWER) {
        this.updateFlower();
      } else if (this.type === PATTERN_TYPES.BUTTERFLY) {
        this.updateButterfly();
      }
      
      if (glitchActive && p.random() > 0.9) {
        this.x += p.random(-8, 8);
        this.y += p.random(-8, 8);
      }
    }
    
    updateFlower() {
      this.bloomPhase += this.bloomSpeed;
      this.flowDirection += 0.002;
      
      let swayX = (p.noise(this.noiseOffsetX) - 0.5) * 8;
      let swayY = (p.noise(this.noiseOffsetY) - 0.5) * 8;
      this.x = this.initialX + swayX;
      this.y = this.initialY + swayY;
    }
    
    updateButterfly() {
      this.wingBeat += this.wingSpeed;
      this.shimmerPhase += 0.03;
      this.gradientPhase += 0.01;
      
      if (this.targetFlower) {
        this.attractionTime++;
        
        let targetAngle = p.atan2(this.targetFlower.y - this.y, this.targetFlower.x - this.x);
        this.flightAngle = p.lerp(this.flightAngle, targetAngle, 0.03);
        
        let distance = p.dist(this.x, this.y, this.targetFlower.x, this.targetFlower.y);
        if (distance > 50) {
          this.x += p.cos(this.flightAngle) * 1.2;
          this.y += p.sin(this.flightAngle) * 1.2;
        } else {
          let orbitAngle = this.attractionTime * 0.015;
          this.x = this.targetFlower.x + p.cos(orbitAngle) * 50;
          this.y = this.targetFlower.y + p.sin(orbitAngle) * 35;
        }
        
        if (this.attractionTime > 300) {
          this.targetFlower = null;
          this.attractionTime = 0;
        }
        
      } else {
        this.flightAngle += p.random(-0.08, 0.08);
        this.x += p.cos(this.flightAngle) * 0.8;
        this.y += p.sin(this.flightAngle) * 0.8;
        
        if (this.x < 60 || this.x > p.width - 60) {
          this.flightAngle = p.PI - this.flightAngle;
        }
        if (this.y < 60 || this.y > p.height - 60) {
          this.flightAngle = -this.flightAngle;
        }
        
        this.x = p.constrain(this.x, 60, p.width - 60);
        this.y = p.constrain(this.y, 60, p.height - 60);
      }
      
      this.x += (p.noise(this.noiseOffsetX) - 0.5) * 3;
      this.y += (p.noise(this.noiseOffsetY) - 0.5) * 3;
    }
    
    display() {
      p.push();
      p.translate(this.x, this.y);
      p.rotate(this.rotation);
      p.scale(this.scaleFactor);
      
      let alpha = 255;
      if (this.lifespan < 100) {
        alpha = p.map(this.lifespan, 0, 100, 0, 255);
      } else if (this.age < 80) {
        alpha = p.map(this.age, 0, 80, 0, 255);
      }
      
      if (this.type === PATTERN_TYPES.FLOWER) {
        this.drawFlowingFlower(alpha);
      } else if (this.type === PATTERN_TYPES.BUTTERFLY) {
        this.drawGradientButterfly(alpha);
      }
      
      p.pop();
    }
    
    drawFlowingFlower(alpha) {
      let bloomScale = 0.6 + 0.4 * (p.sin(this.bloomPhase) * 0.5 + 0.5);
      let currentSize = this.size * bloomScale;
      
      // 流線型の花びら
      p.strokeWeight(1.5);
      p.noFill();
      
      for (let petal = 0; petal < this.petalCount; petal++) {
        let baseAngle = (petal / this.petalCount) * p.TWO_PI;
        let petalColor = p.color(p.random(flowerColors));
        petalColor.setAlpha(alpha * 0.9);
        p.stroke(petalColor);
        
        p.push();
        p.rotate(baseAngle);
        
        // 複雑な流線型の花びら
        p.beginShape();
        for (let i = 0; i < 20; i++) {
          let t = i / 19;
          let angle = t * p.PI - p.PI/2;
          
          // 複雑な流線型の計算
          let baseRadius = currentSize * 0.8;
          let flowWave1 = p.sin(t * p.PI * 3 + this.bloomPhase + petal) * currentSize * 0.2;
          let flowWave2 = p.sin(t * p.PI * 2 + this.bloomPhase * 0.7) * currentSize * 0.15;
          let edgeRipple = p.sin(t * p.PI * 6 + this.bloomPhase * 2) * currentSize * 0.08;
          
          let radius = baseRadius * p.sin(t * p.PI) + flowWave1 + flowWave2 + edgeRipple;
          
          let x = p.cos(angle) * radius;
          let y = p.sin(angle) * radius * 0.4;
          
          // さらなる流線の追加
          x += p.sin(t * p.PI * 4 + this.bloomPhase) * currentSize * 0.1;
          y += p.cos(t * p.PI * 3 + this.bloomPhase * 0.5) * currentSize * 0.05;
          
          p.vertex(x, y);
        }
        p.endShape();
        
        p.pop();
      }
      
      // 流れる装飾ストリーム
      for (let stream = 0; stream < this.streamCount; stream++) {
        let streamAngle = (stream / this.streamCount) * p.TWO_PI + this.flowDirection;
        let streamColor = p.color('#ffd700');
        streamColor.setAlpha(alpha * 0.4);
        p.stroke(streamColor);
        p.strokeWeight(0.8);
        
        p.beginShape();
        p.noFill();
        for (let i = 0; i < 15; i++) {
          let t = i / 14;
          let distance = currentSize * (0.3 + t * 0.9);
          let angle = streamAngle + p.sin(t * p.PI * 2 + this.bloomPhase + stream) * 0.8;
          
          let streamFlow = p.sin(t * p.PI * 3 + this.bloomPhase * 1.5) * currentSize * 0.2;
          let x = p.cos(angle) * distance + streamFlow;
          let y = p.sin(angle) * distance + streamFlow * 0.5;
          
          p.vertex(x, y);
        }
        p.endShape();
      }
      
      // 花の中心部 - より複雑に
      this.drawComplexFlowerCenter(this.centerSize, alpha);
      
      // 光の粒子効果
      if (p.random() > 0.7) {
        this.drawFlowerGlow(currentSize, alpha);
      }
    }
    
    drawComplexFlowerCenter(centerSize, alpha) {
      // 多層の中心部
      for (let layer = 1; layer <= 5; layer++) {
        let layerSize = centerSize * (layer / 5);
        let layerColor = p.color('#fff8dc');
        layerColor.setAlpha(alpha * (1.2 - layer * 0.15));
        p.fill(layerColor);
        p.noStroke();
        
        let points = layer * 6;
        p.beginShape();
        for (let i = 0; i < points; i++) {
          let angle = (i / points) * p.TWO_PI;
          let waveRadius = layerSize + p.sin(angle * (layer + 2) + this.bloomPhase) * centerSize * 0.15;
          let x = p.cos(angle) * waveRadius;
          let y = p.sin(angle) * waveRadius;
          p.vertex(x, y);
        }
        p.endShape(p.CLOSE);
      }
      
      // 中心の光る点
      let coreColor = p.color('#ffd700');
      coreColor.setAlpha(alpha);
      p.fill(coreColor);
      p.noStroke();
      p.circle(0, 0, centerSize * 0.3);
    }
    
    drawFlowerGlow(currentSize, alpha) {
      p.strokeWeight(0.3);
      let glowColor = p.color('#ffffff');
      glowColor.setAlpha(alpha * 0.2);
      p.stroke(glowColor);
      p.noFill();
      
      for (let glow = 0; glow < 3; glow++) {
        let glowRadius = currentSize * (1.2 + glow * 0.2);
        p.circle(0, 0, glowRadius);
      }
    }
    
    drawGradientButterfly(alpha) {
      let wingBeatFactor = p.sin(this.wingBeat) * 0.25 + 0.75;
      
      // 蝶の体 - より詳細に
      this.drawDetailedButterflyBody(alpha);
      
      // 左翅（グラデーション付き）
      p.push();
      p.rotate(-p.PI/10 * wingBeatFactor);
      this.drawGradientWing(alpha, 1);
      p.pop();
      
      // 右翅（グラデーション付き）
      p.push();
      p.scale(-1, 1);
      p.rotate(-p.PI/10 * wingBeatFactor);
      this.drawGradientWing(alpha, -1);
      p.pop();
      
      // 触角 - より美しく
      this.drawBeautifulAntennae(alpha);
      
      // シマー効果
      if (p.random() > 0.6) {
        this.drawShimmerEffect(alpha);
      }
    }
    
    drawDetailedButterflyBody(alpha) {
      let bodyColor = p.color(40, 20, 60);
      bodyColor.setAlpha(alpha);
      p.fill(bodyColor);
      p.strokeWeight(0.5);
      let outlineColor = p.color(80, 60, 120);
      outlineColor.setAlpha(alpha * 0.8);
      p.stroke(outlineColor);
      
      // 体の分節
      for (let segment = 0; segment < 6; segment++) {
        let segmentY = p.lerp(-this.bodyLength * 0.4, this.bodyLength * 0.4, segment / 5);
        let segmentWidth = this.bodyLength * (0.08 - segment * 0.008);
        let segmentHeight = this.bodyLength * 0.15;
        
        p.push();
        p.translate(0, segmentY);
        p.ellipse(0, 0, segmentWidth, segmentHeight);
        p.pop();
      }
    }
    
    drawGradientWing(alpha, side) {
      // 上翅 - 美しいグラデーション
      this.drawUpperWing(alpha, side);
      
      // 下翅 - 尾状突起付き
      p.push();
      p.translate(0, this.wingSpan * 0.2);
      p.scale(0.7);
      this.drawLowerWingWithTail(alpha, side);
      p.pop();
      
      // 翅脈 - より詳細
      this.drawDetailedVeins(alpha, side);
      
      // イリデセント効果
      this.drawIridescentEffect(alpha, side);
    }
    
    drawUpperWing(alpha, side) {
      // 翅の基本形状 - 波打つ縁
      let wingPoints = [];
      for (let i = 0; i < 16; i++) {
        let t = i / 15;
        let angle = t * p.PI/2 - p.PI/4;
        let baseRadius = this.wingSpan * (0.4 + t * 0.2);
        
        // 波打つ縁の計算
        let edgeWave = p.sin(t * p.PI * 4) * this.wingSpan * 0.08;
        let radius = baseRadius + edgeWave;
        
        let x = p.cos(angle) * radius;
        let y = p.sin(angle) * radius - this.wingSpan * 0.1;
        
        wingPoints.push({x: x, y: y});
      }
      
      // グラデーション効果
      for (let layer = 0; layer < 12; layer++) {
        let t = layer / 11;
        let colorIndex = p.floor(t * (butterflyColors.length - 1));
        let colorT = (t * (butterflyColors.length - 1)) - colorIndex;
        
        let color1 = butterflyColors[colorIndex];
        let color2 = butterflyColors[p.min(colorIndex + 1, butterflyColors.length - 1)];
        
        // グラデーション補間
        let r = p.lerp(color1.r, color2.r, colorT);
        let g = p.lerp(color1.g, color2.g, colorT);
        let b = p.lerp(color1.b, color2.b, colorT);
        
        // シマー効果の追加
        let shimmerOffset = p.sin(this.shimmerPhase + layer * 0.5) * 30;
        r = p.constrain(r + shimmerOffset, 0, 255);
        g = p.constrain(g + shimmerOffset, 0, 255);
        b = p.constrain(b + shimmerOffset, 0, 255);
        
        let wingColor = p.color(r, g, b);
        wingColor.setAlpha(alpha * (0.7 - layer * 0.04));
        p.fill(wingColor);
        p.strokeWeight(0.3);
        let edgeColor = p.color(255, 255, 255);
        edgeColor.setAlpha(alpha * 0.3);
        p.stroke(edgeColor);
        
        // 翅の描画
        p.beginShape();
        for (let point of wingPoints) {
          let scaledX = point.x * (1.0 - layer * 0.06);
          let scaledY = point.y * (1.0 - layer * 0.06);
          p.vertex(scaledX, scaledY);
        }
        p.endShape(p.CLOSE);
      }
    }
    
    drawLowerWingWithTail(alpha, side) {
      // 下翅の基本形状（尾状突起付き）
      let lowerWingColor = p.color(75, 0, 130);
      lowerWingColor.setAlpha(alpha * 0.8);
      p.fill(lowerWingColor);
      p.strokeWeight(0.5);
      let edgeColor = p.color(147, 0, 211);
      edgeColor.setAlpha(alpha * 0.6);
      p.stroke(edgeColor);
      
      p.beginShape();
      p.vertex(0, 0);
      p.vertex(this.wingSpan * 0.2, this.wingSpan * 0.1);
      p.vertex(this.wingSpan * 0.35, this.wingSpan * 0.25);
      p.vertex(this.wingSpan * 0.4, this.wingSpan * 0.4); // 尾状突起
      p.vertex(this.wingSpan * 0.25, this.wingSpan * 0.35);
      p.vertex(this.wingSpan * 0.15, this.wingSpan * 0.2);
      p.vertex(0, this.wingSpan * 0.08);
      p.endShape(p.CLOSE);
      
      // 下翅のグラデーション
      for (let layer = 1; layer <= 4; layer++) {
        let layerColor = p.color(138 - layer * 20, 43 + layer * 10, 226 - layer * 30);
        layerColor.setAlpha(alpha * (0.6 - layer * 0.1));
        p.fill(layerColor);
        p.noStroke();
        
        p.beginShape();
        p.vertex(0, 0);
        p.vertex(this.wingSpan * 0.15 * (1 - layer * 0.15), this.wingSpan * 0.08 * (1 - layer * 0.15));
        p.vertex(this.wingSpan * 0.25 * (1 - layer * 0.15), this.wingSpan * 0.2 * (1 - layer * 0.15));
        p.vertex(this.wingSpan * 0.2 * (1 - layer * 0.15), this.wingSpan * 0.25 * (1 - layer * 0.15));
        p.endShape(p.CLOSE);
      }
    }
    
    drawDetailedVeins(alpha, side) {
      p.strokeWeight(0.2);
      let veinColor = p.color(0, 0, 0);
      veinColor.setAlpha(alpha * 0.4);
      p.stroke(veinColor);
      
      // 主脈
      for (let vein = 0; vein < 8; vein++) {
        let veinAngle = -p.PI/4 + (vein / 7) * p.PI/2;
        let veinLength = this.wingSpan * (0.3 + vein * 0.05);
        
        p.beginShape();
        p.noFill();
        for (let i = 0; i < 10; i++) {
          let t = i / 9;
          let r = veinLength * t;
          let angle = veinAngle + p.sin(t * p.PI + this.shimmerPhase) * 0.1;
          
          let x = p.cos(angle) * r;
          let y = p.sin(angle) * r;
          p.vertex(x, y);
        }
        p.endShape();
      }
    }
    
    drawIridescentEffect(alpha, side) {
      // イリデセント（玉虫色）効果
      p.strokeWeight(0.8);
      let iridColor = p.color(255, 255, 255);
      iridColor.setAlpha(alpha * (0.3 + 0.2 * p.sin(this.shimmerPhase)));
      p.stroke(iridColor);
      p.noFill();
      
      for (let highlight = 0; highlight < 3; highlight++) {
        let highlightAngle = -p.PI/6 + highlight * p.PI/6;
        let highlightLength = this.wingSpan * 0.4;
        
        p.beginShape();
        for (let i = 0; i < 8; i++) {
          let t = i / 7;
          let r = highlightLength * t;
          let angle = highlightAngle;
          
          let x = p.cos(angle) * r;
          let y = p.sin(angle) * r;
          p.vertex(x, y);
        }
        p.endShape();
      }
    }
    
    drawBeautifulAntennae(alpha) {
      let antennaColor = p.color(60, 40, 80);
      antennaColor.setAlpha(alpha);
      p.stroke(antennaColor);
      p.strokeWeight(0.8);
      
      for (let antenna = 0; antenna < 2; antenna++) {
        let side = antenna === 0 ? -1 : 1;
        
        p.beginShape();
        p.noFill();
        for (let i = 0; i < 10; i++) {
          let t = i / 9;
          let baseX = side * this.wingSpan * 0.03;
          let baseY = -this.bodyLength * 0.45;
          
          let x = baseX + side * this.wingSpan * 0.12 * t;
          let y = baseY - this.wingSpan * 0.15 * t;
          
          x += p.sin(t * p.PI + this.shimmerPhase + antenna) * this.wingSpan * 0.02;
          y += p.sin(t * p.PI * 0.5 + this.shimmerPhase) * this.wingSpan * 0.02;
          
          p.vertex(x, y);
        }
        p.endShape();
        
        // 触角の先端
        let tipX = side * (this.wingSpan * 0.03 + this.wingSpan * 0.12);
        let tipY = -this.bodyLength * 0.45 - this.wingSpan * 0.15;
        tipX += p.sin(this.shimmerPhase + antenna) * this.wingSpan * 0.02;
        tipY += p.sin(this.shimmerPhase * 0.5) * this.wingSpan * 0.02;
        
        p.strokeWeight(2);
        p.point(tipX, tipY);
      }
    }
    
    drawShimmerEffect(alpha) {
      // 蝶の周りのシマー効果
      p.strokeWeight(0.2);
      
      for (let shimmer = 0; shimmer < 5; shimmer++) {
        let shimmerAngle = p.random(p.TWO_PI);
        let shimmerDistance = this.wingSpan * (1.1 + p.random(0.3));
        let shimmerX = p.cos(shimmerAngle) * shimmerDistance;
        let shimmerY = p.sin(shimmerAngle) * shimmerDistance;
        
        let shimmerColor = p.color(255, 255, 255);
        shimmerColor.setAlpha(alpha * p.random(0.1, 0.4));
        p.stroke(shimmerColor);
        
        p.beginShape();
        p.noFill();
        for (let i = 0; i < 6; i++) {
          let t = i / 5;
          let angle = t * p.TWO_PI;
          let radius = this.wingSpan * 0.02;
          let x = shimmerX + p.cos(angle) * radius;
          let y = shimmerY + p.sin(angle) * radius;
          p.vertex(x, y);
        }
        p.endShape(p.CLOSE);
      }
    }
    
    isDead() {
      return this.lifespan <= 0;
    }
  }
};

new p5(backgroundSketch);