// david-lynch-vhs-noise-clean.js
// David Lynch inspired VHS deterioration with SVG ghost patterns

// SVGパターンデータ
const svgPatterns = [
  // 線要素
  {type: 'line', x1: 32.624, y1: 216.746, x2: 172.622, y2: 216.746, color: 'white', width: 4},
  {type: 'line', x1: 159.497, y1: 505.491, x2: 264.495, y2: 505.491, color: 'white', width: 4},
  {type: 'line', x1: 1.00498, y1: 864.5, x2: 298.5, y2: 693.878, color: 'white', width: 4},
  {type: 'line', x1: 170.622, y1: 730.613, x2: 170.622, y2: 402.493, color: 'white', width: 4},
  {type: 'line', x1: 87.499, y1: 730.613, x2: 87.499, y2: 520.616, color: 'white', width: 4},
  {type: 'line', x1: 6.37451, y1: 317.37, x2: 448.242, y2: 317.37, color: 'white', width: 4},
  {type: 'line', x1: 209.433, y1: 104.152, x2: 546.303, y2: 826.015, color: 'white', width: 4},
  {type: 'line', x1: 857.11, y1: 104.998, x2: 857.11, y2: 848.736, color: 'white', width: 4},
  {type: 'line', x1: 631.989, y1: 400.493, x2: 1091.36, y2: 400.493, color: 'white', width: 4},
  {type: 'line', x1: 1565.18, y1: 1.49188, x2: 1442.68, y2: 110.865, color: 'white', width: 4},
  {type: 'line', x1: 1443.35, y1: 371.869, x2: 1443.35, y2: 616.864, color: 'white', width: 4},
  {type: 'line', x1: 1445.72, y1: 483.617, x2: 1725.72, y2: 483.617, color: 'white', width: 4},
  {type: 'line', x1: 1445.72, y1: 614.865, x2: 1738.84, y2: 614.865, color: 'white', width: 4},
  {type: 'line', x1: 1631.01, y1: 825.581, x2: 1740.38, y2: 956.828, color: 'white', width: 4},
  {type: 'line', x1: 1438.98, y1: 664.989, x2: 1438.98, y2: 826.861, color: 'white', width: 4},
  {type: 'line', x1: 1368.98, y1: 664.989, x2: 1368.98, y2: 826.861, color: 'white', width: 4},
  {type: 'line', x1: 1740.85, y1: 616.865, x2: 1740.85, y2: 949.359, color: 'white', width: 4},
  {type: 'line', x1: 1294.43, y1: 665.796, x2: 1228.81, y2: 814.543, color: 'white', width: 4},
  {type: 'line', x1: 1513.18, y1: 677.306, x2: 1578.8, y2: 826.054, color: 'white', width: 4},
  
  // 円要素
  {type: 'circle', cx: 376.056, cy: 216.559, r: 57.0615, color: 'white', width: 4, fill: false},
  {type: 'circle', cx: 966.671, cy: 299.682, r: 48.3116, color: '#6FC7FF', width: 4, fill: false},
  {type: 'circle', cx: 739.175, cy: 645.302, r: 48.3116, color: 'white', width: 4, fill: false},
  {type: 'circle', cx: 349.807, cy: 203.434, r: 50.3116, color: 'white', width: 0, fill: true},
  
  // 矩形要素
  {type: 'rect', x: 655.863, y: 128.873, w: 433.493, h: 695.988, color: '#141932', width: 4, fill: false},
  {type: 'rect', x: 1228.98, y: 176.997, w: 179.747, h: 359.119, color: '#FF0000', width: 4, fill: false},
  {type: 'rect', x: 1207.1, y: 155.122, w: 170.997, h: 367.869, color: 'white', width: 4, fill: false},
  {type: 'rect', x: 970.859, y: 216.371, w: 87.8734, h: 87.8734, color: 'white', width: 4, fill: false},
  {type: 'rect', x: 1443.35, y: 106.998, w: 175.372, h: 262.87, color: 'white', width: 4, fill: false},
  {type: 'rect', x: 1478.35, y: 194.497, w: 140.373, h: 26.6245, color: 'white', width: 4, fill: false},
  {type: 'rect', x: 1535.22, y: 303.87, w: 109.748, h: 96.6233, color: '#6FC7FF', width: 4, fill: false}
];

// 不穏な蝶の色（時々現れる）
const darkButterflyColors = [
  'rgba(200, 200, 200, 0.08)',
  'rgba(180, 180, 180, 0.06)', 
  'rgba(160, 160, 160, 0.04)',
  'rgba(220, 220, 220, 0.10)'
];

// グローバル変数
let noiseLines = [];
let staticPixels = [];
let ghostButterflies = [];
let filmGrain = [];
let svgGhosts = [];
let noiseIntensity = 0.6;
let interferencePhase = 0;
let canvas;
let vhsSpeed = 0.4;
let glitchAccumulation = 0;
let timeDistortion = 0;
let analogDrift = 0;
let filmDecay = 0;

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
    p.frameRate(24);
    p.background(10, 10, 10);
    
    initializeLynchNoise();
    setupTouchEvents();
  };
  
  p.draw = function() {
    // デビッドリンチ風の深い黒背景
    p.background(10, 10, 10, 200 + p.sin(analogDrift) * 30);
    
    // 時間の歪み効果
    updateTimeDistortion();
    
    // フィルムグレインの描画
    drawFilmGrain();
    
    // VHS劣化ノイズの描画
    drawDeterioratingVHS();
    
    // 不安定な静的ノイズ
    drawUnsettlingStatic();
    
    // 不穏な干渉パターン
    drawDisturbingInterference();
    
    // 記憶の断片のような蝶
    drawMemoryFragments();
    
    // SVGパターンの幻影
    drawSVGGhosts();
    
    // アナログ劣化効果
    drawAnalogDecay();
    
    // フィルムの傷や汚れ
    drawFilmDamage();
    
    // ノイズパターンの更新
    updateLynchPatterns();
    
    // グリッチの蓄積
    updateGlitchAccumulation();
  };
  
  p.windowResized = function() {
    const mvContainer = document.querySelector('.mv');
    p.resizeCanvas(mvContainer.offsetWidth, mvContainer.offsetHeight);
    p.background(10, 10, 10);
    initializeLynchNoise();
  };
  
  p.mousePressed = function() {
    if (!p.touches && p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      triggerLynchGlitch();
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
          glitchAccumulation += Math.abs(swipeDistance) * 0.01;
          noiseIntensity = p.map(Math.abs(swipeDistance), 15, 100, 0.3, 0.9);
          
          if (Math.random() > 0.9) {
            spawnMemoryFragment();
          }
          
          touchStartY = touchEndY;
        }
      }
    }, { passive: true });
    
    canvasElement.addEventListener('touchend', function(e) {
      if (isTouching) {
        isTouching = false;
        triggerLynchGlitch();
      }
    }, { passive: true });
    
    canvasElement.addEventListener('touchcancel', function() {
      isTouching = false;
    }, { passive: true });
  }
  
  function initializeLynchNoise() {
    noiseLines = [];
    staticPixels = [];
    ghostButterflies = [];
    filmGrain = [];
    svgGhosts = [];
    
    // VHS劣化ラインの初期化
    for (let i = 0; i < 12; i++) {
      generateDeterioratingLine();
    }
    
    // 不安定な静的ノイズの初期化
    let pixelCount = p.floor((p.width * p.height) / 200);
    for (let i = 0; i < pixelCount; i++) {
      staticPixels.push({
        x: p.random(p.width),
        y: p.random(p.height),
        brightness: p.random(0, 80),
        life: p.random(5, 40),
        flickerPhase: p.random(p.TWO_PI)
      });
    }
    
    // フィルムグレインの初期化
    let grainCount = p.floor((p.width * p.height) / 50);
    for (let i = 0; i < grainCount; i++) {
      filmGrain.push({
        x: p.random(p.width),
        y: p.random(p.height),
        size: p.random(0.5, 2),
        brightness: p.random(20, 100),
        life: p.random(1, 8)
      });
    }
  }
  
  function updateTimeDistortion() {
    timeDistortion += 0.01;
    analogDrift += 0.008;
    filmDecay += 0.003;
    
    if (p.random() > 0.995) {
      timeDistortion += p.random(0.5, 2.0);
    }
  }
  
  function drawFilmGrain() {
    p.loadPixels();
    
    for (let grain of filmGrain) {
      if (p.random() > 0.3) {
        let x = p.floor(grain.x);
        let y = p.floor(grain.y);
        
        if (x >= 0 && x < p.width && y >= 0 && y < p.height) {
          let index = (x + y * p.width) * 4;
          let brightness = grain.brightness + p.sin(timeDistortion + grain.x * 0.01) * 20;
          brightness = p.constrain(brightness, 0, 100);
          
          if (index >= 0 && index < p.pixels.length - 3) {
            p.pixels[index] = brightness;
            p.pixels[index + 1] = brightness;
            p.pixels[index + 2] = brightness;
            p.pixels[index + 3] = 120;
          }
        }
      }
    }
    
    p.updatePixels();
  }
  
  function drawDeterioratingVHS() {
    for (let line of noiseLines) {
      if (line.active) {
        let speedModulation = 1 + p.sin(timeDistortion + line.phase) * 0.5;
        line.y -= vhsSpeed * speedModulation;
        
        if (line.y < -line.height - 50) {
          line.y = p.height + p.random(20, 200);
          line.brightness = p.random(20, 60);
          line.opacity = p.random(40, 120);
          line.deterioration += 0.1;
        }
        
        let deterioratedBrightness = line.brightness * (1 - line.deterioration * 0.3);
        p.fill(deterioratedBrightness, deterioratedBrightness, deterioratedBrightness, line.opacity);
        p.noStroke();
        
        let blockCount = p.floor(p.random(3, 12));
        for (let b = 0; b < blockCount; b++) {
          let blockX = b * (p.width / blockCount) + p.random(-50, 50);
          let blockWidth = p.random(30, 150);
          let blockHeight = line.height + p.random(-2, 4);
          
          let distortion = p.sin(timeDistortion * 2 + blockX * 0.01) * 10;
          blockX += distortion;
          blockX = p.constrain(blockX, -20, p.width);
          
          p.rect(blockX, line.y, blockWidth, blockHeight);
          
          if (p.random() > 0.7) {
            for (let i = 0; i < blockWidth; i += 3) {
              if (p.random() > 0.5) {
                let textureBrightness = p.random(0, 80);
                p.fill(textureBrightness, textureBrightness, textureBrightness, line.opacity * 0.4);
                p.rect(blockX + i, line.y + p.random(-3, blockHeight + 3), 3, p.random(1, 5));
              }
            }
          }
        }
        
        p.fill(deterioratedBrightness * 0.5, deterioratedBrightness * 0.5, deterioratedBrightness * 0.5, line.opacity * 0.2);
        p.rect(0, line.y, p.width, line.height);
        
        if (p.random() > 0.95) {
          p.fill(0, 0, 0, 200);
          p.rect(0, line.y, p.width, line.height * p.random(1, 3));
        }
      }
    }
  }
  
  function drawUnsettlingStatic() {
    for (let i = 0; i < staticPixels.length * noiseIntensity; i++) {
      let pixel = p.random(staticPixels);
      if (pixel && p.random() > 0.4) {
        let flicker = p.sin(timeDistortion * 3 + pixel.flickerPhase) * 0.5 + 0.5;
        let brightness = pixel.brightness * flicker;
        
        if (p.random() > 0.998) {
          brightness = p.random(150, 255);
        }
        
        p.fill(brightness, brightness, brightness, 180);
        p.noStroke();
        
        let size = p.random(1, 4) + p.sin(pixel.flickerPhase) * 2;
        p.rect(pixel.x, pixel.y, size, size);
      }
    }
  }
  
  function drawDisturbingInterference() {
    interferencePhase += 0.03;
    
    if (p.random() > 0.94) {
      p.stroke(p.random(30, 100), p.random(30, 100), p.random(30, 100), 100);
      p.strokeWeight(p.random(1, 3));
      
      for (let i = 0; i < 4; i++) {
        let y = p.sin(interferencePhase + i * 0.8) * p.height * 0.3 + p.height * 0.5;
        let amplitude = p.sin(interferencePhase * 1.5 + i) * 80;
        
        p.beginShape();
        p.noFill();
        for (let x = 0; x < p.width; x += 6) {
          let waveY = y + p.sin(x * 0.008 + interferencePhase + i) * amplitude;
          waveY += p.sin(x * 0.03 + timeDistortion) * 20;
          p.vertex(x, waveY);
        }
        p.endShape();
      }
    }
    
    if (p.random() > 0.997) {
      p.fill(p.random(50, 150), p.random(50, 150), p.random(50, 150), p.random(10, 40));
      p.noStroke();
      p.rect(0, 0, p.width, p.height);
    }
  }
  
  function drawMemoryFragments() {
    for (let butterfly of ghostButterflies) {
      if (butterfly.active) {
        p.push();
        p.translate(butterfly.x, butterfly.y);
        p.rotate(butterfly.rotation);
        p.scale(butterfly.scale);
        
        let alpha = butterfly.opacity * (p.sin(butterfly.phase + timeDistortion) * 0.4 + 0.6);
        
        if (p.sin(timeDistortion * 2 + butterfly.phase) > 0.8) {
          alpha *= 3;
        }
        
        drawDisturbingButterfly(alpha, butterfly.color);
        
        p.pop();
      }
    }
  }
  
  function drawDisturbingButterfly(alpha, colorStr) {
    let color = p.color(colorStr);
    color.setAlpha(alpha * 255);
    
    p.fill(color);
    p.noStroke();
    
    let distortion = p.sin(timeDistortion * 3) * 5;
    
    // 上翅（歪み付き）
    p.beginShape();
    p.vertex(0, -15 + distortion);
    p.vertex(20 + distortion, -25);
    p.vertex(25, -10 + distortion);
    p.vertex(15, 0);
    p.vertex(0, 0);
    p.endShape(p.CLOSE);
    
    p.beginShape();
    p.vertex(0, -15 - distortion);
    p.vertex(-20 - distortion, -25);
    p.vertex(-25, -10 - distortion);
    p.vertex(-15, 0);
    p.vertex(0, 0);
    p.endShape(p.CLOSE);
    
    p.beginShape();
    p.vertex(0, 0);
    p.vertex(12 + distortion, 5);
    p.vertex(15, 15 + distortion);
    p.vertex(8, 18);
    p.vertex(0, 8);
    p.endShape(p.CLOSE);
    
    p.beginShape();
    p.vertex(0, 0);
    p.vertex(-12 - distortion, 5);
    p.vertex(-15, 15 - distortion);
    p.vertex(-8, 18);
    p.vertex(0, 8);
    p.endShape(p.CLOSE);
    
    color.setAlpha(alpha * 255 * 1.2);
    p.fill(color);
    p.ellipse(0 + distortion, -5, 2, 20);
  }
  
  function drawSVGGhosts() {
    for (let svgGhost of svgGhosts) {
      if (svgGhost.active) {
        p.push();
        p.translate(svgGhost.offsetX, svgGhost.offsetY);
        p.scale(svgGhost.scale);
        p.rotate(svgGhost.rotation);
        
        let alpha = svgGhost.opacity * (p.sin(svgGhost.phase + timeDistortion) * 0.3 + 0.7);
        
        if (p.sin(timeDistortion * 1.5 + svgGhost.phase) > 0.9) {
          alpha *= 2.5;
        }
        
        drawSVGPattern(svgGhost.patternIndex, alpha, svgGhost.distortion);
        
        p.pop();
      }
    }
  }
  
  function drawSVGPattern(startIndex, alpha, distortion) {
    let elementCount = p.floor(p.random(3, 8));
    
    for (let i = 0; i < elementCount; i++) {
      let elementIndex = (startIndex + i) % svgPatterns.length;
      let element = svgPatterns[elementIndex];
      
      if (!element) continue;
      
      let baseColor;
      if (element.color === 'white') {
        baseColor = p.color(p.random(80, 150), p.random(80, 150), p.random(80, 150));
      } else if (element.color === '#6FC7FF') {
        baseColor = p.color(p.random(60, 120), p.random(80, 140), p.random(100, 160));
      } else if (element.color === '#FF0000') {
        baseColor = p.color(p.random(100, 150), p.random(40, 80), p.random(40, 80));
      } else {
        baseColor = p.color(p.random(60, 120), p.random(60, 120), p.random(60, 120));
      }
      
      baseColor.setAlpha(alpha * 255);
      
      let dX = p.sin(timeDistortion * 2 + i) * distortion;
      let dY = p.cos(timeDistortion * 1.5 + i) * distortion;
      
      let scaleX = p.width / 1743;
      let scaleY = p.height / 959;
      
      switch (element.type) {
        case 'line':
          p.stroke(baseColor);
          p.strokeWeight(element.width * 0.5);
          p.line(
            element.x1 * scaleX + dX,
            element.y1 * scaleY + dY,
            element.x2 * scaleX + dX,
            element.y2 * scaleY + dY
          );
          break;
          
        case 'circle':
          if (element.fill) {
            p.fill(baseColor);
            p.noStroke();
          } else {
            p.noFill();
            p.stroke(baseColor);
            p.strokeWeight(element.width * 0.5);
          }
          p.ellipse(
            element.cx * scaleX + dX,
            element.cy * scaleY + dY,
            element.r * 2 * scaleX,
            element.r * 2 * scaleY
          );
          break;
          
        case 'rect':
          if (element.fill) {
            p.fill(baseColor);
            p.noStroke();
          } else {
            p.noFill();
            p.stroke(baseColor);
            p.strokeWeight(element.width * 0.5);
          }
          p.rect(
            element.x * scaleX + dX,
            element.y * scaleY + dY,
            element.w * scaleX,
            element.h * scaleY
          );
          break;
      }
    }
  }
  
  function drawAnalogDecay() {
    if (p.random() > 0.98) {
      p.push();
      p.blendMode(p.SCREEN);
      p.tint(255, 0, 0, 30);
      p.copy(canvas, 0, 0, p.width, p.height, 2, 0, p.width, p.height);
      p.tint(0, 255, 0, 30);
      p.copy(canvas, 0, 0, p.width, p.height, -1, 1, p.width, p.height);
      p.tint(0, 0, 255, 30);
      p.copy(canvas, 0, 0, p.width, p.height, -1, -1, p.width, p.height);
      p.pop();
    }
    
    if (p.random() > 0.996) {
      let distortY = p.random(p.height);
      let distortHeight = p.random(20, 100);
      let distortOffset = p.random(-20, 20);
      
      p.copy(0, distortY, p.width, distortHeight, 
             distortOffset, distortY, p.width, distortHeight);
    }
  }
  
  function drawFilmDamage() {
    if (p.random() > 0.97) {
      p.stroke(p.random(100, 200), p.random(100, 200), p.random(100, 200), p.random(20, 80));
      p.strokeWeight(p.random(1, 4));
      
      if (p.random() > 0.5) {
        let scratchX = p.random(p.width);
        p.line(scratchX, 0, scratchX + p.random(-50, 50), p.height);
      }
      
      if (p.random() > 0.7) {
        p.noStroke();
        p.fill(p.random(20, 80), p.random(20, 80), p.random(20, 80), p.random(30, 100));
        p.ellipse(p.random(p.width), p.random(p.height), 
                  p.random(10, 40), p.random(10, 40));
      }
    }
  }
  
  function generateDeterioratingLine() {
    noiseLines.push({
      y: p.height + p.random(20, 150),
      height: p.random(4, 20),
      brightness: p.random(20, 60),
      opacity: p.random(50, 140),
      active: true,
      life: p.random(300, 800),
      maxLife: 800,
      deterioration: p.random(0, 0.3),
      phase: p.random(p.TWO_PI)
    });
    
    if (noiseLines.length > 18) {
      noiseLines.shift();
    }
  }
  
  function spawnMemoryFragment() {
    if (ghostButterflies.length < 2) {
      ghostButterflies.push({
        x: p.random(p.width * 0.2, p.width * 0.8),
        y: p.random(p.height * 0.2, p.height * 0.8),
        rotation: p.random(p.TWO_PI),
        rotationSpeed: p.random(-0.02, 0.02),
        scale: p.random(0.4, 1.0),
        opacity: p.random(0.03, 0.12),
        color: p.random(darkButterflyColors),
        active: true,
        life: p.random(120, 300),
        maxLife: 300,
        phase: p.random(p.TWO_PI),
        phaseSpeed: p.random(0.03, 0.08),
        driftX: p.random(-0.5, 0.5),
        driftY: p.random(-0.3, 0.3)
      });
    }
  }
  
  function spawnSVGGhost() {
    if (svgGhosts.length < 3) {
      svgGhosts.push({
        offsetX: p.random(-p.width * 0.2, p.width * 0.2),
        offsetY: p.random(-p.height * 0.2, p.height * 0.2),
        scale: p.random(0.3, 0.8),
        rotation: p.random(p.TWO_PI),
        rotationSpeed: p.random(-0.01, 0.01),
        opacity: p.random(0.05, 0.15),
        active: true,
        life: p.random(180, 400),
        maxLife: 400,
        phase: p.random(p.TWO_PI),
        phaseSpeed: p.random(0.02, 0.06),
        patternIndex: p.floor(p.random(svgPatterns.length)),
        distortion: p.random(3, 15),
        driftX: p.random(-0.3, 0.3),
        driftY: p.random(-0.2, 0.2)
      });
    }
  }
  
  function updateLynchPatterns() {
    // VHSノイズラインの更新
    for (let i = noiseLines.length - 1; i >= 0; i--) {
      let line = noiseLines[i];
      line.life--;
      line.deterioration += 0.001;
      
      if (line.life <= 0 || line.y < -line.height - 100) {
        noiseLines.splice(i, 1);
      } else {
        if (p.random() > 0.98) {
          vhsSpeed = p.random(0.2, 1.0);
        }
        
        if (p.random() > 0.99) {
          line.deterioration += p.random(0.05, 0.2);
          line.brightness *= 0.9;
        }
      }
    }
    
    // 静的ノイズピクセルの更新
    for (let pixel of staticPixels) {
      pixel.life--;
      pixel.flickerPhase += 0.1;
      
      if (pixel.life <= 0) {
        pixel.x = p.random(p.width);
        pixel.y = p.random(p.height);
        pixel.brightness = p.random(0, 80);
        pixel.life = p.random(5, 40);
        pixel.flickerPhase = p.random(p.TWO_PI);
      }
    }
    
    // フィルムグレインの更新
    for (let grain of filmGrain) {
      grain.life--;
      
      if (grain.life <= 0) {
        grain.x = p.random(p.width);
        grain.y = p.random(p.height);
        grain.brightness = p.random(20, 100);
        grain.life = p.random(1, 8);
      }
    }
    
    // 蝶の更新
    for (let i = ghostButterflies.length - 1; i >= 0; i--) {
      let butterfly = ghostButterflies[i];
      butterfly.life--;
      butterfly.rotation += butterfly.rotationSpeed;
      butterfly.phase += butterfly.phaseSpeed;
      
      butterfly.x += butterfly.driftX + p.sin(timeDistortion + butterfly.phase) * 0.5;
      butterfly.y += butterfly.driftY + p.cos(timeDistortion + butterfly.phase) * 0.3;
      
      if (butterfly.life < 80) {
        butterfly.opacity *= 0.97;
      }
      
      if (butterfly.life <= 0 || butterfly.opacity < 0.02) {
        ghostButterflies.splice(i, 1);
      }
    }
    
    // SVGゴーストの更新
    for (let i = svgGhosts.length - 1; i >= 0; i--) {
      let svgGhost = svgGhosts[i];
      svgGhost.life--;
      svgGhost.rotation += svgGhost.rotationSpeed;
      svgGhost.phase += svgGhost.phaseSpeed;
      
      svgGhost.offsetX += svgGhost.driftX + p.sin(timeDistortion + svgGhost.phase) * 0.8;
      svgGhost.offsetY += svgGhost.driftY + p.cos(timeDistortion + svgGhost.phase) * 0.6;
      
      svgGhost.distortion += p.sin(timeDistortion * 2 + svgGhost.phase) * 0.2;
      svgGhost.distortion = p.constrain(svgGhost.distortion, 2, 25);
      
      if (svgGhost.life < 100) {
        svgGhost.opacity *= 0.96;
      }
      
      if (svgGhost.life <= 0 || svgGhost.opacity < 0.03) {
        svgGhosts.splice(i, 1);
      }
    }
    
    // 新しいノイズの生成
    if (p.random() > 0.94) {
      generateDeterioratingLine();
    }
    
    // 記憶の断片の稀な出現
    if (p.random() > 0.998) {
      spawnMemoryFragment();
    }
    
    // SVGパターンの幻影の稀な出現
    if (p.random() > 0.997) {
      spawnSVGGhost();
    }
  }
  
  function updateGlitchAccumulation() {
    glitchAccumulation *= 0.995;
    
    if (glitchAccumulation > 1.0) {
      if (p.random() > 0.7) {
        triggerLynchGlitch();
      }
      glitchAccumulation *= 0.8;
    }
    
    if (p.random() > 0.999) {
      glitchAccumulation += p.random(0.2, 0.5);
    }
  }
  
  function triggerLynchGlitch() {
    noiseIntensity = p.random(0.6, 0.95);
    
    for (let i = 0; i < p.random(6, 15); i++) {
      generateDeterioratingLine();
    }
    
    timeDistortion += p.random(1, 3);
    vhsSpeed = p.random(0.1, 2.0);
    
    if (p.random() > 0.6) {
      for (let i = 0; i < p.random(1, 3); i++) {
        spawnMemoryFragment();
      }
    }
    
    if (p.random() > 0.7) {
      for (let i = 0; i < p.random(1, 2); i++) {
        spawnSVGGhost();
      }
    }
    
    if (p.random() > 0.8) {
      p.fill(255, 255, 255, p.random(100, 200));
      p.noStroke();
      p.rect(0, 0, p.width, p.height);
    }
  }
};

new p5(backgroundSketch);