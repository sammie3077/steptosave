# 🚀 Step2Save 部署檢查清單

## 📋 部署前檢查

### 1. PWA 圖標 ✅

```bash
# 檢查圖標是否存在
ls -la public/icons/

# 應該看到：
# icon-72x72.png
# icon-96x96.png
# icon-128x128.png
# icon-144x144.png
# icon-152x152.png
# icon-192x192.png
# icon-384x384.png
# icon-512x512.png
```

**如果沒有圖標：**
1. 開啟 `scripts/generate-icons.html`
2. 生成並下載圖標
3. 放到 `public/icons/` 目錄

### 2. 構建測試 ✅

```bash
# 清理舊構建
rm -rf dist/

# 重新構建
npm run build

# 檢查構建產物
ls -la dist/

# 應該包含：
# ✓ index.html
# ✓ manifest.json
# ✓ service-worker.js
# ✓ icons/ 目錄
# ✓ assets/ 目錄
```

### 3. 本地測試 ✅

```bash
# 啟動開發服務器
npm run dev

# 或使用生產構建測試
npm run build
npx serve dist
```

**測試項目：**
- [ ] 應用正常載入
- [ ] 所有功能正常
- [ ] Service Worker 註冊成功
- [ ] 安裝提示顯示（Chrome）
- [ ] 主題顏色正確
- [ ] 圖標顯示正確

### 4. PWA 審計 ✅

```bash
# 使用 Chrome DevTools
1. 開啟 DevTools (F12)
2. 切換到 Lighthouse 標籤
3. 選擇 "Progressive Web App"
4. 點擊 "Generate report"
```

**目標分數：**
- PWA: 100/100
- Performance: 90+/100
- Accessibility: 90+/100
- Best Practices: 90+/100

### 5. 緩存策略檢查 ✅

```bash
# 在 DevTools > Application > Cache Storage
# 應該看到：
# - step2save-v1 (precache)
# - step2save-runtime (runtime cache)
```

---

## 🌐 部署到生產環境

### 選項 1: Vercel (推薦)

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入
vercel login

# 部署
vercel

# 或直接部署到生產
vercel --prod
```

**Vercel 配置** (vercel.json)：
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "framework": "vite"
}
```

### 選項 2: Netlify

```bash
# 安裝 Netlify CLI
npm i -g netlify-cli

# 登入
netlify login

# 部署
netlify deploy

# 部署到生產
netlify deploy --prod
```

**Netlify 配置** (netlify.toml)：
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 選項 3: GitHub Pages

```bash
# 1. 安裝 gh-pages
npm install --save-dev gh-pages

# 2. 在 package.json 添加部署腳本
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}

# 3. 部署
npm run deploy
```

### 選項 4: 自建伺服器 (Nginx)

**Nginx 配置**：
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # HTTPS 重定向
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/step2save/dist;
    index index.html;

    # PWA 必需：正確的 MIME types
    types {
        application/manifest+json  json;
        application/javascript     js;
    }

    # Service Worker 緩存控制
    location /service-worker.js {
        add_header Cache-Control "no-cache";
        expires off;
    }

    # Manifest 緩存控制
    location /manifest.json {
        add_header Cache-Control "no-cache";
        expires off;
    }

    # 其他資源可以緩存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 安全 headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

---

## 🔒 HTTPS 要求

**⚠️ 重要：PWA 必須在 HTTPS 下運行！**

**例外：**
- `localhost` (開發環境)
- `127.0.0.1` (本地測試)

**取得免費 SSL 證書：**
```bash
# 使用 Let's Encrypt (Certbot)
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 📊 部署後驗證

### 1. 基本檢查

```bash
# 檢查網站可訪問
curl -I https://yourdomain.com

# 應該返回：
# HTTP/2 200
# content-type: text/html
```

### 2. Manifest 檢查

```bash
# 檢查 manifest 可訪問
curl https://yourdomain.com/manifest.json

# 應該返回完整的 JSON 配置
```

### 3. Service Worker 檢查

```bash
# 檢查 service worker 可訪問
curl https://yourdomain.com/service-worker.js

# 應該返回 JavaScript 代碼
```

### 4. PWA 安裝測試

**在手機上測試：**
1. 用 Chrome 開啟網站
2. 等待安裝提示
3. 點擊「立即安裝」
4. 驗證圖標和啟動畫面

### 5. 離線測試

1. 安裝 App
2. 開啟飛航模式
3. 啟動 App
4. 驗證所有功能可用

---

## 🐛 常見部署問題

### 問題 1: Service Worker 404

**原因：** 路徑配置錯誤

**解決：**
```javascript
// 確保 service-worker.js 在根目錄
navigator.serviceWorker.register('/service-worker.js')
```

### 問題 2: Manifest 無法載入

**原因：** MIME type 錯誤

**解決：**
```nginx
# Nginx 配置
types {
    application/manifest+json json;
}
```

### 問題 3: 圖標不顯示

**檢查：**
1. 圖標文件是否存在
2. manifest.json 路徑是否正確
3. 圖標尺寸是否正確

### 問題 4: HTTPS 證書錯誤

**解決：**
```bash
# 檢查證書有效期
openssl x509 -in cert.pem -text -noout

# 更新證書
sudo certbot renew
```

---

## 📈 監控和分析

### Google Analytics (可選)

```javascript
// 添加到 index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### PWA 安裝追蹤

```javascript
// 在 App.tsx 中添加
window.addEventListener('appinstalled', () => {
  console.log('PWA installed');
  // 發送分析事件
  gtag('event', 'pwa_install');
});
```

---

## 🎯 效能優化清單

### 生產環境優化

- [x] Vite 生產構建
- [x] Service Worker 緩存
- [x] 圖片壓縮（自動）
- [x] LocalStorage debounce
- [x] React.memo 優化
- [ ] CDN 分發 (可選)
- [ ] 圖片 lazy loading (未來)
- [ ] Code splitting (未來)

### SEO 優化 (可選)

```html
<!-- 添加到 index.html -->
<meta name="description" content="可愛的存錢規劃追蹤器">
<meta name="keywords" content="存錢,理財,規劃,記帳">
<meta property="og:title" content="Step2Save">
<meta property="og:description" content="幫助你一步步達成存錢目標">
<meta property="og:image" content="/icons/icon-512x512.png">
```

---

## ✅ 最終檢查清單

部署前確認：

```
□ 構建成功無錯誤
□ 所有圖標已生成
□ Lighthouse PWA 得分 100
□ Service Worker 正常工作
□ HTTPS 證書有效
□ 本地測試通過
□ 手機測試通過
□ 離線模式可用
□ 安裝流程順暢
□ 更新機制正常
□ 所有功能正常
□ 無控制台錯誤
□ 效能符合預期
```

---

## 🎉 部署完成！

恭喜！Step2Save 已成功部署為 PWA！

**下一步：**
1. 分享給用戶
2. 收集反饋
3. 持續優化
4. 添加新功能

**支援：**
- 文檔：PWA_GUIDE.md
- 過濾功能：FILTER_FEATURES.md
- 效能優化：PERFORMANCE_OPTIMIZATIONS.md

祝你的 App 大獲成功！🚀✨
