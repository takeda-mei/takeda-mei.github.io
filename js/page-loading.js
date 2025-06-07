// loading-improvements.js
// スムーズなページ読み込み体験の実装

class LoadingManager {
  constructor() {
    this.isLoaded = false;
    this.loadedElements = new Set();
    this.totalElements = 0;
    
    this.init();
  }
  
  init() {
    // DOMContentLoaded前に実行
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.handleDOMReady());
    } else {
      this.handleDOMReady();
    }
    
    // ページ完全読み込み後
    window.addEventListener('load', () => this.handlePageLoad());
    
    // ロゴ専用のローディングエフェクト
    this.createLogoLoader();
  }
  
  createLogoLoader() {
    const logoContainer = document.getElementById('takeda-mei-logo');
    if (!logoContainer) return;
    
    // ローディングオーバーレイを作成
    const loaderOverlay = document.createElement('div');
    loaderOverlay.id = 'logo-loader-overlay';
    loaderOverlay.innerHTML = `
      <div class="logo-skeleton">
        <div class="skeleton-frame"></div>
        <div class="skeleton-circle"></div>
        <div class="skeleton-rect-red"></div>
        <div class="skeleton-rect-blue"></div>
      </div>
      <div class="loading-text">
        <span class="loading-char">L</span>
        <span class="loading-char">O</span>
        <span class="loading-char">A</span>
        <span class="loading-char">D</span>
        <span class="loading-char">I</span>
        <span class="loading-char">N</span>
        <span class="loading-char">G</span>
        <span class="loading-dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
    `;
    
    // CSSスタイルを追加
    this.addLoaderStyles();
    
    // ローディングオーバーレイを挿入
    logoContainer.style.position = 'relative';
    logoContainer.appendChild(loaderOverlay);
    
    // アニメーションを開始
    this.startLoaderAnimation();
  }
  
  addLoaderStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #logo-loader-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(10, 10, 10, 0.95);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        transition: opacity 0.5s ease-out;
      }
      
      .logo-skeleton {
        width: 300px;
        height: 300px;
        position: relative;
        margin-bottom: 20px;
      }
      
      .skeleton-frame,
      .skeleton-circle,
      .skeleton-rect-red,
      .skeleton-rect-blue {
        position: absolute;
        border: 2px solid #333;
        background: linear-gradient(90deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%);
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
      }
      
      .skeleton-frame {
        top: 20px;
        left: 50px;
        width: 200px;
        height: 260px;
      }
      
      .skeleton-circle {
        top: 120px;
        left: 150px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        transform: translate(-50%, -50%);
      }
      
      .skeleton-rect-red {
        top: 50px;
        left: 270px;
        width: 80px;
        height: 120px;
        border-color: #660000;
      }
      
      .skeleton-rect-blue {
        top: 180px;
        left: 280px;
        width: 60px;
        height: 60px;
        border-color: #003366;
      }
      
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      
      .loading-text {
        color: #666;
        font-family: 'Courier New', monospace;
        font-size: 16px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
      }
      
      .loading-char {
        display: inline-block;
        animation: typewriter 0.1s ease-in-out forwards;
        opacity: 0;
      }
      
      .loading-char:nth-child(1) { animation-delay: 0.1s; }
      .loading-char:nth-child(2) { animation-delay: 0.2s; }
      .loading-char:nth-child(3) { animation-delay: 0.3s; }
      .loading-char:nth-child(4) { animation-delay: 0.4s; }
      .loading-char:nth-child(5) { animation-delay: 0.5s; }
      .loading-char:nth-child(6) { animation-delay: 0.6s; }
      .loading-char:nth-child(7) { animation-delay: 0.7s; }
      
      @keyframes typewriter {
        to { opacity: 1; }
      }
      
      .loading-dots {
        margin-left: 5px;
      }
      
      .loading-dots span {
        display: inline-block;
        animation: dots 1.5s infinite;
        opacity: 0;
      }
      
      .loading-dots span:nth-child(1) { animation-delay: 0s; }
      .loading-dots span:nth-child(2) { animation-delay: 0.3s; }
      .loading-dots span:nth-child(3) { animation-delay: 0.6s; }
      
      @keyframes dots {
        0%, 60%, 100% { opacity: 0; }
        30% { opacity: 1; }
      }
      
      .progress-bar {
        width: 200px;
        height: 4px;
        background: #333;
        border-radius: 2px;
        overflow: hidden;
        position: relative;
      }
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4dd0e1, #6FC7FF, #4dd0e1);
        background-size: 200% 100%;
        width: 0%;
        transition: width 0.3s ease;
        animation: progress-shimmer 2s infinite;
      }
      
      @keyframes progress-shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      
      /* フェードアウト状態 */
      #logo-loader-overlay.fade-out {
        opacity: 0;
        pointer-events: none;
      }
      
      /* ロゴの段階的表示 */
      .logo-element-fade-in {
        animation: fadeInUp 0.8s ease-out forwards;
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      /* VHSローディング効果 */
      .vhs-loading {
        position: relative;
        overflow: hidden;
      }
      
      .vhs-loading::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, 
          transparent, 
          rgba(255, 255, 255, 0.1), 
          transparent);
        animation: vhs-scan 2s infinite;
      }
      
      @keyframes vhs-scan {
        0% { left: -100%; }
        100% { left: 100%; }
      }
      
      /* スケルトンのパルス効果 */
      .skeleton-pulse {
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% { opacity: 0.6; }
        50% { opacity: 1; }
        100% { opacity: 0.6; }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  startLoaderAnimation() {
    const progressBar = document.querySelector('.progress-fill');
    const skeletonElements = document.querySelectorAll('.skeleton-frame, .skeleton-circle, .skeleton-rect-red, .skeleton-rect-blue');
    
    // スケルトンにパルス効果を追加
    skeletonElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('skeleton-pulse');
      }, index * 200);
    });
    
    // プログレスバーアニメーション
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress > 100) progress = 100;
      
      if (progressBar) {
        progressBar.style.width = progress + '%';
      }
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => this.hideLoader(), 300);
      }
    }, 100);
  }
  
  hideLoader() {
    const loaderOverlay = document.getElementById('logo-loader-overlay');
    if (loaderOverlay) {
      loaderOverlay.classList.add('fade-out');
      
      setTimeout(() => {
        if (loaderOverlay.parentNode) {
          loaderOverlay.parentNode.removeChild(loaderOverlay);
        }
        
        // ロゴの段階的表示を開始
        this.startLogoReveal();
      }, 500);
    }
  }
  
  startLogoReveal() {
    const logoContainer = document.getElementById('takeda-mei-logo');
    if (!logoContainer) return;
    
    // 既存の画像またはキャンバス要素を段階的にフェードイン
    const logoElement = logoContainer.querySelector('img, canvas');
    if (logoElement) {
      logoElement.style.opacity = '0';
      logoElement.style.transform = 'translateY(30px) scale(0.9)';
      logoElement.style.transition = 'all 0.8s ease-out';
      
      // VHSローディング効果を追加
      logoElement.classList.add('vhs-loading');
      
      setTimeout(() => {
        logoElement.style.opacity = '1';
        logoElement.style.transform = 'translateY(0) scale(1)';
        
        // VHSスキャン効果を削除
        setTimeout(() => {
          logoElement.classList.remove('vhs-loading');
        }, 2000);
      }, 100);
    }
  }
  
  handleDOMReady() {
    // DOMが読み込まれた時の処理
    this.progressivelyShowElements();
  }
  
  handlePageLoad() {
    // ページが完全に読み込まれた時の処理
    this.isLoaded = true;
    
    setTimeout(() => {
      this.hideLoader();
    }, 200);
  }
  
  progressivelyShowElements() {
    // 重要でない要素を段階的に表示
    const elements = document.querySelectorAll('.mv-title:not(#takeda-mei-logo), .mv p, .mv h1, .mv h2');
    
    elements.forEach((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'all 0.6s ease-out';
      
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 300 + index * 100);
    });
  }
  
  // 外部から呼び出し可能なメソッド
  forceComplete() {
    this.hideLoader();
  }
}

// ページ読み込み改善の自動初期化
document.addEventListener('DOMContentLoaded', function() {
  // loadingManagerをグローバルに登録（デバッグ用）
  window.loadingManager = new LoadingManager();
});

// CSS重要度を上げるための追加スタイル
const criticalCSS = document.createElement('style');
criticalCSS.textContent = `
  /* クリティカルCSS - 最優先で読み込み */
  .mv-title {
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  #takeda-mei-logo {
    position: relative !important;
  }
  
  /* 初期状態を隠す */
  .mv-title:not(#takeda-mei-logo),
  .mv p,
  .mv h1,
  .mv h2 {
    opacity: 0;
  }
`;

// ヘッドの最初に挿入（最優先）
document.head.insertBefore(criticalCSS, document.head.firstChild);