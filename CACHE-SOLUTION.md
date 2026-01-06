# 快取問題解決方案

## 問題說明

當部署到 Vercel 後，使用者可能看到舊版本的網站，需要強制刷新（Ctrl+Shift+R 或 Cmd+Shift+R）才能看到最新內容。

### 主要原因

1. **瀏覽器快取**：瀏覽器預設會快取 HTML、JS、CSS 檔案
2. **CDN 快取**：Vercel CDN 會快取靜態資源
3. **Service Worker 快取**（PWA）：這是最常見且最難處理的問題

## 已實施的解決方案

### 1. HTML Meta 標籤防快取

**檔案：** `index.html`

```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

確保 HTML 檔案永遠不被快取。

### 2. Vite 檔案雜湊（Cache Busting）

**檔案：** `vite.config.ts`

```javascript
build: {
  rollupOptions: {
    output: {
      entryFileNames: `assets/[name].[hash].js`,
      chunkFileNames: `assets/[name].[hash].js`,
      assetFileNames: `assets/[name].[hash].[ext]`
    }
  }
}
```

**效果：**
- 每次建置產生唯一檔名：`index.ABC123.js` → `index.XYZ789.js`
- 檔名改變，瀏覽器自動下載新版本
- 這是最可靠的快取破壞方法

### 3. Vercel 快取標頭設定

**檔案：** `vercel.json`

```json
{
  "headers": [
    {
      "source": "/index.html",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

**策略：**
- HTML 檔案：max-age=0（永遠重新驗證）
- Assets 檔案：max-age=31536000（1 年），因為有雜湊值

### 4. Service Worker 自動清理

**檔案：** `App.tsx`

```javascript
useEffect(() => {
  // 卸載所有 Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.unregister());
    });
  }

  // 清除所有快取
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
}, []);
```

**重要：** 如果你未來想加入 PWA 功能，需要移除或修改這段程式碼。

## PWA 專案的特殊處理

如果你要安裝 PWA（Progressive Web App），需要修改更新策略：

### 選項 A：使用 workbox 的更新策略

```javascript
// 在 service worker 中
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

registerRoute(
  ({ request }) => request.destination === 'document',
  new NetworkFirst()
);
```

### 選項 B：提示使用者更新

```javascript
// App.tsx
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // 顯示「有新版本可用」的通知
            if (confirm('有新版本可用，是否重新載入？')) {
              window.location.reload();
            }
          }
        });
      });
    });
  }
}, []);
```

### 選項 C：skipWaiting 自動更新（推薦）

```javascript
// service-worker.js
self.addEventListener('install', event => {
  self.skipWaiting(); // 強制啟用新的 Service Worker
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});
```

## 測試更新是否生效

### 本地測試

1. 修改程式碼（例如改變文字或顏色）
2. 執行 `npm run build`
3. 檢查 `dist` 資料夾中的檔案名稱是否有新的雜湊值
4. 開啟瀏覽器開發者工具 → Network 標籤
5. 勾選「Disable cache」
6. 重新整理頁面，應該看到新的檔案名稱

### Vercel 測試

1. Push 程式碼到 GitHub
2. 等待 Vercel 自動部署完成
3. 開啟網站（不要強制刷新）
4. 開啟開發者工具 → Console
5. 應該會看到 "Service Worker unregistered for fresh content"
6. 重新整理頁面，應該看到最新版本

### 驗證快取標頭

1. 開啟開發者工具 → Network 標籤
2. 重新整理頁面
3. 點擊 `index.html` 檔案
4. 檢查 Response Headers：
   - `Cache-Control: public, max-age=0, must-revalidate` ✓
5. 點擊 JS 檔案（例如 `index.ABC123.js`）
6. 檢查 Response Headers：
   - `Cache-Control: public, max-age=31536000, immutable` ✓

## 常見問題

### Q: 為什麼使用者還是看到舊版本？

**可能原因：**
1. 瀏覽器擴充功能干擾（如廣告攔截器）
2. 公司網路有額外的代理伺服器快取
3. PWA Service Worker 仍在運作

**解決方法：**
1. 請使用者開啟無痕模式測試
2. 檢查 Service Worker：開發者工具 → Application → Service Workers
3. 手動卸載：點擊 "Unregister"

### Q: 檔案雜湊值沒有改變？

檢查 `vite.config.ts` 的 build 設定是否正確。

### Q: 我想要 PWA 但也要自動更新怎麼辦？

使用「選項 C：skipWaiting 自動更新」策略。

## 總結

目前的設定已經提供了 **4 層防禦**：

1. ✅ HTML Meta 標籤
2. ✅ Vite 檔案雜湊（最重要）
3. ✅ Vercel 快取標頭
4. ✅ Service Worker 清理

這應該能解決 99% 的快取問題。如果未來要加入 PWA，記得調整 Service Worker 清理邏輯。
