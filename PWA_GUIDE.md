# 📱 Step2Save PWA 完整指南

## 🎉 PWA 功能概覽

Step2Save 現在已經是一個完整的 **Progressive Web App (PWA)**！你可以像原生 App 一樣安裝和使用它。

---

## ✨ PWA 功能特色

### 1. **可安裝** 📲
- 直接從瀏覽器安裝到手機/電腦
- 無需透過 App Store 或 Google Play
- 像原生 App 一樣出現在主畫面

### 2. **離線使用** 🔌
- 沒有網路也能使用
- 自動緩存重要文件
- 資料保存在本地（LocalStorage）

### 3. **快速啟動** ⚡
- Service Worker 預緩存
- 秒開無需等待
- 流暢的使用體驗

### 4. **自動更新** 🔄
- 有新版本時自動提示
- 點擊確認即可更新
- 保留所有資料

### 5. **省空間** 💾
- 只有約 240KB 大小
- 比原生 App 小得多
- 不占用太多儲存空間

---

## 📋 文件結構

```
public/
├── manifest.json              # PWA 配置文件
├── service-worker.js          # Service Worker（離線支持）
└── icons/                     # App 圖標集
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png

components/
└── InstallPrompt.tsx          # 安裝提示組件

scripts/
└── generate-icons.html        # 圖標生成工具

index.html                     # PWA meta 標籤 + SW 註冊
```

---

## 🚀 如何安裝

### 在 Android (Chrome)

1. 用 Chrome 開啟 Step2Save
2. 等待 3 秒，會出現「安裝 Step2Save」提示
3. 點擊「立即安裝」
4. App 會出現在主畫面！

**替代方法：**
- 點擊瀏覽器右上角 ⋮
- 選擇「安裝應用程式」或「加到主畫面」

### 在 iOS (Safari)

1. 用 Safari 開啟 Step2Save
2. 點擊底部的「分享」按鈕 📤
3. 向下滾動，選擇「加入主畫面」
4. 點擊「新增」

**注意：** iOS 目前不支援自動安裝提示

### 在 桌面 (Chrome/Edge)

1. 開啟 Step2Save
2. 網址列右側會出現 ⊕ 安裝圖標
3. 點擊安裝
4. App 會出現在應用程式列表

---

## 🎨 安裝提示功能

### 智能顯示邏輯

```typescript
// 以下情況不會顯示提示：
❌ App 已經安裝
❌ 7 天內被用戶關閉過
❌ 瀏覽器不支援 PWA
❌ 正在以獨立模式（已安裝）運行

// 以下情況會顯示提示：
✅ 首次訪問（3秒後）
✅ 上次關閉已超過 7 天
✅ 瀏覽器支援 beforeinstallprompt
```

### 提示內容

```
┌─────────────────────────────────────────┐
│  📥  安裝 Step2Save                     │
│                                         │
│  安裝到主畫面，隨時隨地輕鬆記錄存錢成果！ │
│                                         │
│  [立即安裝]  [稍後]                     │
│                                         │
│  ✓ 離線使用    ✓ 快速啟動              │
│  ✓ 更省空間    ✓ 像原生 App            │
└─────────────────────────────────────────┘
```

---

## 🔧 技術實現

### 1. Manifest.json

```json
{
  "name": "Step2Save - 存錢規劃器",
  "short_name": "Step2Save",
  "display": "standalone",
  "background_color": "#fffcfc",
  "theme_color": "#e6c4c4",
  "icons": [ /* 8 種尺寸 */ ],
  "shortcuts": [ /* 快捷操作 */ ]
}
```

**關鍵配置：**
- `display: standalone` - 全屏模式，隱藏瀏覽器 UI
- `theme_color` - 使用粉色主題
- `lang: zh-TW` - 繁體中文
- `shortcuts` - 快速新增成果（未來可擴展）

### 2. Service Worker

#### 緩存策略

```javascript
// Network First (網路優先)
fetch(request)
  .then(response => {
    // 成功：緩存新版本
    cache.put(request, response.clone());
    return response;
  })
  .catch(() => {
    // 失敗：返回緩存
    return caches.match(request);
  });
```

**特點：**
- 總是嘗試獲取最新內容
- 網路失敗時回退到緩存
- 自動更新緩存
- 清理舊版本緩存

#### 生命週期

```
Install → Activate → Fetch
   ↓         ↓         ↓
預緩存    清理舊緩存   攔截請求
```

### 3. 更新機制

```javascript
// 檢測到新版本
registration.addEventListener('updatefound', () => {
  // 提示用戶更新
  if (confirm('發現新版本！點擊確定重新載入。')) {
    newWorker.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }
});
```

---

## 📊 效能數據

| 項目 | 數值 | 說明 |
|------|------|------|
| **Bundle 大小** | 240KB | +3KB (增加 PWA 功能) |
| **Gzip 壓縮後** | 73KB | 實際下載大小 |
| **首次載入** | < 1s | 在 4G 網路下 |
| **重複載入** | < 0.1s | 使用 Service Worker 緩存 |
| **離線可用** | ✅ | 完全離線可用 |

---

## 🎯 用戶體驗流程

### 首次訪問

```
1. 用戶開啟網站
   ↓
2. Service Worker 註冊（背景）
   ↓
3. 等待 3 秒
   ↓
4. 顯示安裝提示（底部卡片）
   ↓
5. 用戶選擇「立即安裝」或「稍後」
```

### 已安裝用戶

```
1. 點擊主畫面圖標
   ↓
2. 秒開（Service Worker 緩存）
   ↓
3. 檢查更新（背景）
   ↓
4. 如有更新 → 提示用戶
```

### 離線使用

```
1. 斷開網路
   ↓
2. 開啟 App（仍可使用）
   ↓
3. 所有功能正常（資料在本地）
   ↓
4. 恢復網路 → 自動同步緩存
```

---

## 🛠️ 圖標生成

### 使用內建生成器

1. 在瀏覽器中開啟：
   ```
   scripts/generate-icons.html
   ```

2. 點擊「生成圖標」

3. 點擊「下載全部」

4. 將下載的圖標放到：
   ```
   public/icons/
   ```

### 需要的尺寸

```
✓ 72x72    - 小尺寸圖標
✓ 96x96    - 快捷圖標
✓ 128x128  - Chrome 安裝
✓ 144x144  - Windows 磁貼
✓ 152x152  - iPad
✓ 192x192  - Android 主圖標 (重要)
✓ 384x384  - 中等尺寸
✓ 512x512  - 啟動畫面 (重要)
```

### 設計指南

**配色：**
- 背景：`#e6c4c4` (粉色主題)
- 圖標：`#ba8c8c` (深粉色)
- 細節：白色

**風格：**
- 可愛的存錢豬
- 圓潤的邊角
- 簡潔的設計

---

## 🔍 測試 PWA

### Chrome DevTools

1. 開啟 DevTools (F12)
2. 切換到「Application」標籤
3. 檢查項目：

```
Manifest
  ✓ manifest.json 正確載入
  ✓ 圖標正確顯示
  ✓ 配置符合 PWA 標準

Service Workers
  ✓ Service Worker 已註冊
  ✓ 狀態：Activated
  ✓ Fetch events 正常

Storage
  ✓ Cache Storage 包含文件
  ✓ LocalStorage 有資料
```

### Lighthouse 審計

```bash
# 在 Chrome DevTools 中
1. 切換到「Lighthouse」標籤
2. 選擇「Progressive Web App」
3. 點擊「Generate report」
```

**目標分數：**
- ✅ PWA 優化：100/100
- ✅ 效能：90+/100
- ✅ 無障礙：90+/100
- ✅ 最佳實踐：90+/100

### 手動測試清單

```
□ 安裝流程順暢
□ 圖標正確顯示
□ 啟動畫面美觀
□ 主題顏色正確
□ 離線可用
□ 更新提示正常
□ 快速啟動
□ 無控制台錯誤
```

---

## 🚨 常見問題

### Q1: 為什麼沒有看到安裝提示？

**可能原因：**
- iOS Safari 不支援自動提示（需手動安裝）
- 已經安裝過
- 7 天內關閉過提示
- 瀏覽器不支援 PWA

**解決方法：**
- 清除 LocalStorage 中的 `pwa-install-dismissed`
- 使用 Chrome/Edge 測試
- 檢查 console 是否有錯誤

### Q2: Service Worker 沒有註冊？

**檢查項目：**
```bash
# 1. 確認文件存在
ls public/service-worker.js

# 2. 檢查 console
# 應該看到：[PWA] Service Worker registered successfully

# 3. 確認在 HTTPS 或 localhost
# Service Worker 只在安全環境下運行
```

### Q3: 更新後仍顯示舊版本？

**解決方法：**
```javascript
// 1. 手動清除緩存
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});

// 2. 取消註冊 Service Worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister());
});

// 3. 重新載入
location.reload();
```

### Q4: 圖標不顯示？

**檢查：**
1. 圖標文件是否存在於 `public/icons/`
2. manifest.json 中的路徑是否正確
3. 圖標尺寸是否正確
4. 圖標格式是否為 PNG

---

## 🎨 自定義配置

### 更改主題顏色

```json
// manifest.json
{
  "theme_color": "#你的顏色",
  "background_color": "#你的背景色"
}
```

### 添加快捷操作

```json
// manifest.json
{
  "shortcuts": [
    {
      "name": "查看統計",
      "url": "/?view=stats",
      "icons": [{ "src": "/icons/shortcut-stats.png", "sizes": "96x96" }]
    }
  ]
}
```

### 修改緩存策略

```javascript
// service-worker.js
// 改為 Cache First（緩存優先）
event.respondWith(
  caches.match(request)
    .then(cached => cached || fetch(request))
);
```

---

## 📈 未來擴展

### 計劃中的功能

1. **推送通知** 🔔
   ```javascript
   // 提醒用戶記錄成果
   self.addEventListener('push', event => {
     self.registration.showNotification('別忘了記錄今天的存錢！');
   });
   ```

2. **背景同步** 🔄
   ```javascript
   // 離線時暫存，上線後自動同步
   self.addEventListener('sync', event => {
     if (event.tag === 'sync-records') {
       // 同步離線記錄到雲端
     }
   });
   ```

3. **快捷鍵** ⌨️
   - 長按圖標顯示快捷菜單
   - 快速新增成果
   - 查看今日統計

4. **啟動畫面** 🎨
   - 自定義 splash screen
   - 品牌展示
   - 載入動畫

---

## 📚 參考資源

### 官方文檔
- [PWA 完整指南](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://web.dev/add-manifest/)

### 工具
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox](https://developers.google.com/web/tools/workbox)

### 測試
- [PWA測試清單](https://web.dev/pwa-checklist/)
- [Can I Use - PWA](https://caniuse.com/?search=pwa)

---

## 📝 總結

Step2Save 現在是一個功能完整的 PWA！

**✅ 已實現：**
- 完整的 PWA 配置
- Service Worker 離線支持
- 智能安裝提示
- 自動更新機制
- 圖標生成工具
- 詳細文檔

**🎯 優勢：**
- 無需應用商店
- 安裝簡單快速
- 離線完全可用
- 自動更新
- 體積小巧

**📱 支援平台：**
- ✅ Android (Chrome/Edge)
- ✅ Windows (Chrome/Edge)
- ✅ macOS (Chrome/Edge)
- ⚠️ iOS (手動安裝)

準備好讓用戶享受原生 App 般的體驗了！🎉

---

**PWA 版本**: v3.0
**完成日期**: 2026-01-12
**下一步**: 部署到生產環境，開始收集用戶反饋
