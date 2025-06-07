// takeda-mei-logo-effects.js
// Interactive logo effects for Takeda Mei's geometric logo

class TakedaMeiLogo {
  constructor(containerId, width = 300, height = 300) {
    this.container = document.getElementById(containerId);
    this.width = width;
    this.height = height;
    this.canvas = null;
    this.ctx = null;
    
    // ロゴの構成要素
    this.elements = {
      mainFrame: {
        x: 50, y: 20, width: 200, height: 260,
        color: '#000000', strokeWidth: 4,
        offsetX: 0, offsetY: 0, rotation: 0, scale: 1
      },
      circle: {
        x: 150, y: 120, radius: 30,
        color: '#6FC7FF', strokeWidth: 4,
        offsetX: 0, offsetY: 0, rotation: 0, scale: 1
      },
      redRect: {
        x: 270, y: 50, width: 80, height: 120,
        color: '#FF0000', strokeWidth: 4,
        offsetX: 0, offsetY: 0, rotation: 0, scale: 1
      },
      blueRect: {
        x: 280, y: 180, width: 60, height: 60,
        color: '#6FC7FF', strokeWidth: 4,
        offsetX: 0, offsetY: 0, rotation: 0, scale: 1
      }
    };
    
    // エフェクトの状態
    this.effects = {
      rgbShift: { active: false, intensity: 0 },
      decompose: { active: false, progress: 0 },
      glitch: { active: false, time: 0 },
      distortion: { active: false, wave: 0 },
      particles: { active: false, particles: [] }
    };
    
    this.animationId = null;
    this.time = 0;
    
    this.init();
  }
  
  init() {
    // 既存の画像を非表示にする
    const existingImg = this.container.querySelector('img');
    if (existingImg) {
      existingImg.style.display = 'none';
    }
    
    // キャンバスを作成
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx = this.canvas.getContext('2d');
    
    this.container.appendChild(this.canvas);
    
    // イベントリスナーを設定
    this.setupInteractions();
    
    // アニメーションを開始
    this.startAnimation();
  }
  
  setupInteractions() {
    let hoverTimeout = null;
    
    // マウスホバーでエフェクト開始
    this.canvas.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
      this.triggerRandomEffect();
    });
    
    // マウスリーブでエフェクト終了（遅延付き）
    this.canvas.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(() => {
        this.resetEffects();
      }, 2000);
    });
    
    // クリックで強いエフェクト
    this.canvas.addEventListener('click', () => {
      this.triggerIntenseEffect();
    });
    
    // タッチイベント
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.triggerRandomEffect();
    });
    
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      setTimeout(() => this.resetEffects(), 1000);
    });
  }
  
  triggerRandomEffect() {
    const effects = ['rgbShift', 'decompose', 'glitch', 'distortion'];
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    
    switch (randomEffect) {
      case 'rgbShift':
        this.effects.rgbShift.active = true;
        this.effects.rgbShift.intensity = Math.random() * 15 + 5;
        break;
      case 'decompose':
        this.effects.decompose.active = true;
        this.effects.decompose.progress = 0;
        break;
      case 'glitch':
        this.effects.glitch.active = true;
        this.effects.glitch.time = 0;
        break;
      case 'distortion':
        this.effects.distortion.active = true;
        this.effects.distortion.wave = 0;
        break;
    }
  }
  
  triggerIntenseEffect() {
    // 複数のエフェクトを同時に発動
    this.effects.rgbShift.active = true;
    this.effects.rgbShift.intensity = Math.random() * 25 + 10;
    
    this.effects.glitch.active = true;
    this.effects.glitch.time = 0;
    
    this.effects.particles.active = true;
    this.createParticles();
    
    // 要素を分散
    Object.keys(this.elements).forEach(key => {
      const element = this.elements[key];
      element.offsetX = (Math.random() - 0.5) * 100;
      element.offsetY = (Math.random() - 0.5) * 100;
      element.rotation = (Math.random() - 0.5) * Math.PI * 0.5;
      element.scale = Math.random() * 0.5 + 0.75;
    });
  }
  
  resetEffects() {
    // すべてのエフェクトをリセット
    Object.keys(this.effects).forEach(key => {
      this.effects[key].active = false;
    });
    
    // 要素の位置をリセット
    Object.keys(this.elements).forEach(key => {
      const element = this.elements[key];
      element.offsetX = 0;
      element.offsetY = 0;
      element.rotation = 0;
      element.scale = 1;
    });
  }
  
  createParticles() {
    this.effects.particles.particles = [];
    
    // 各要素から粒子を生成
    Object.keys(this.elements).forEach(key => {
      const element = this.elements[key];
      for (let i = 0; i < 20; i++) {
        this.effects.particles.particles.push({
          x: element.x || element.x,
          y: element.y || element.y,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 1.0,
          decay: Math.random() * 0.02 + 0.01,
          color: element.color,
          size: Math.random() * 3 + 1
        });
      }
    });
  }
  
  startAnimation() {
    const animate = () => {
      this.time += 0.016; // 60fps相当
      this.update();
      this.render();
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }
  
  update() {
    // エフェクトの更新
    if (this.effects.decompose.active) {
      this.effects.decompose.progress += 0.02;
      if (this.effects.decompose.progress > 1) {
        this.effects.decompose.progress = 1;
      }
    }
    
    if (this.effects.glitch.active) {
      this.effects.glitch.time += 0.1;
      if (this.effects.glitch.time > 10) {
        this.effects.glitch.active = false;
      }
    }
    
    if (this.effects.distortion.active) {
      this.effects.distortion.wave += 0.1;
      if (this.effects.distortion.wave > Math.PI * 4) {
        this.effects.distortion.active = false;
      }
    }
    
    // 粒子の更新
    if (this.effects.particles.active) {
      this.effects.particles.particles = this.effects.particles.particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= particle.decay;
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        return particle.life > 0;
      });
      
      if (this.effects.particles.particles.length === 0) {
        this.effects.particles.active = false;
      }
    }
    
    // 要素の自然な復帰
    Object.keys(this.elements).forEach(key => {
      const element = this.elements[key];
      element.offsetX *= 0.95;
      element.offsetY *= 0.95;
      element.rotation *= 0.95;
      element.scale = element.scale * 0.95 + 0.05;
    });
  }
  
  render() {
    // キャンバスをクリア
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // RGBシフトエフェクト
    if (this.effects.rgbShift.active) {
      this.renderWithRGBShift();
    } else {
      this.renderNormal();
    }
    
    // グリッチエフェクト
    if (this.effects.glitch.active) {
      this.renderGlitch();
    }
    
    // 粒子エフェクト
    if (this.effects.particles.active) {
      this.renderParticles();
    }
  }
  
  renderNormal() {
    // 通常のレンダリング
    this.renderElement('mainFrame');
    this.renderElement('circle');
    this.renderElement('redRect');
    this.renderElement('blueRect');
  }
  
  renderWithRGBShift() {
    const intensity = this.effects.rgbShift.intensity;
    
    // 赤チャンネル
    this.ctx.globalCompositeOperation = 'screen';
    this.ctx.save();
    this.ctx.translate(-intensity, 0);
    this.ctx.globalAlpha = 0.8;
    this.renderElementsWithColor('#FF0000');
    this.ctx.restore();
    
    // 緑チャンネル
    this.ctx.save();
    this.ctx.translate(0, 0);
    this.ctx.globalAlpha = 0.8;
    this.renderElementsWithColor('#00FF00');
    this.ctx.restore();
    
    // 青チャンネル
    this.ctx.save();
    this.ctx.translate(intensity, 0);
    this.ctx.globalAlpha = 0.8;
    this.renderElementsWithColor('#0000FF');
    this.ctx.restore();
    
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.globalAlpha = 1;
  }
  
  renderElementsWithColor(color) {
    Object.keys(this.elements).forEach(key => {
      const originalColor = this.elements[key].color;
      this.elements[key].color = color;
      this.renderElement(key);
      this.elements[key].color = originalColor;
    });
  }
  
  renderElement(key) {
    const element = this.elements[key];
    const ctx = this.ctx;
    
    ctx.save();
    
    // 分解エフェクト
    if (this.effects.decompose.active) {
      const decompose = this.effects.decompose.progress;
      element.offsetX += Math.sin(this.time + key.length) * decompose * 50;
      element.offsetY += Math.cos(this.time + key.length) * decompose * 50;
      element.rotation += decompose * Math.PI * 0.5;
    }
    
    // 歪みエフェクト
    if (this.effects.distortion.active) {
      const distortion = Math.sin(this.effects.distortion.wave + key.length) * 10;
      element.offsetX += distortion;
      element.offsetY += Math.cos(this.effects.distortion.wave + key.length) * 5;
    }
    
    // 変形を適用
    if (key === 'circle') {
      ctx.translate(element.x + element.offsetX, element.y + element.offsetY);
    } else {
      ctx.translate(
        (element.x + element.width / 2) + element.offsetX,
        (element.y + element.height / 2) + element.offsetY
      );
    }
    
    ctx.rotate(element.rotation);
    ctx.scale(element.scale, element.scale);
    
    // 要素を描画
    ctx.strokeStyle = element.color;
    ctx.lineWidth = element.strokeWidth;
    ctx.fillStyle = 'transparent';
    
    switch (key) {
      case 'mainFrame':
        ctx.strokeRect(
          -element.width / 2,
          -element.height / 2,
          element.width,
          element.height
        );
        break;
        
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, element.radius, 0, Math.PI * 2);
        ctx.stroke();
        break;
        
      case 'redRect':
      case 'blueRect':
        ctx.strokeRect(
          -element.width / 2,
          -element.height / 2,
          element.width,
          element.height
        );
        break;
    }
    
    ctx.restore();
  }
  
  renderGlitch() {
    // グリッチブロック
    const blockCount = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < blockCount; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      const w = Math.random() * 50 + 10;
      const h = Math.random() * 20 + 5;
      
      this.ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.7)`;
      this.ctx.fillRect(x, y, w, h);
    }
    
    // スキャンライン
    if (Math.random() > 0.7) {
      for (let y = 0; y < this.height; y += 4) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
        this.ctx.fillRect(0, y, this.width, 1);
      }
    }
  }
  
  renderParticles() {
    this.effects.particles.particles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    
    // 元の画像を再表示
    const existingImg = this.container.querySelector('img');
    if (existingImg) {
      existingImg.style.display = 'block';
    }
  }
}

// 使用例とオートスタート
document.addEventListener('DOMContentLoaded', function() {
  const logoContainer = document.getElementById('takeda-mei-logo');
  
  if (logoContainer) {
    // インタラクティブロゴを初期化
    const interactiveLogo = new TakedaMeiLogo('takeda-mei-logo', 300, 300);
    
    // ページの可視性が変わったときの処理
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        // ページが非表示になったときはアニメーションを停止
        if (interactiveLogo.animationId) {
          cancelAnimationFrame(interactiveLogo.animationId);
        }
      } else {
        // ページが再表示されたときはアニメーションを再開
        interactiveLogo.startAnimation();
      }
    });
    
    // 5秒ごとにランダムエフェクトを自動発動
    setInterval(() => {
      if (!document.hidden && Math.random() > 0.7) {
        interactiveLogo.triggerRandomEffect();
        
        // 2秒後にリセット
        setTimeout(() => {
          interactiveLogo.resetEffects();
        }, 2000);
      }
    }, 5000);
  }
});