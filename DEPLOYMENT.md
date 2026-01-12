# Step2Save 部署指南

## ✅ 已完成的準備工作

- ✅ Git repository 初始化完成
- ✅ 程式碼已推送到 GitHub: https://github.com/sammie3077/steptosave
- ✅ 快取解決方案已設定（vercel.json、vite.config.ts）
- ✅ .gitignore 已設定（排除 node_modules、dist、.env.local）

## 🚀 部署到 Vercel

### 步驟 1: 登入 Vercel

1. 前往 https://vercel.com
2. 點擊 **"Sign Up"** 或 **"Login"**
3. 選擇 **"Continue with GitHub"** 並授權

### 步驟 2: 匯入 GitHub Repository

1. 在 Vercel Dashboard，點擊 **"Add New..."** → **"Project"**
2. 找到 `sammie3077/steptosave` repository
3. 點擊 **"Import"**

### 步驟 3: 設定專案

#### Build & Development Settings

Vercel 應該會自動偵測到 Vite，使用以下設定：

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

如果沒有自動偵測，請手動設定以上選項。

#### Environment Variables（環境變數）

如果你的 `.env.local` 有 API Key（例如 GEMINI_API_KEY），需要在這裡設定：

1. 展開 **"Environment Variables"** 區塊
2. 新增變數：
   - Name: `GEMINI_API_KEY`
   - Value: 你的 API Key
   - Environment: Production, Preview, Development（全選）

⚠️ **重要**：不要把 `.env.local` 推送到 GitHub！

### 步驟 4: 部署

1. 檢查所有設定是否正確
2. 點擊 **"Deploy"**
3. 等待建置完成（約 1-2 分鐘）

### 步驟 5: 完成！

部署成功後，你會得到一個網址，例如：
```
https://steptosave.vercel.app
或
https://steptosave-sammie3077.vercel.app
```

## 🔄 自動部署設定

部署完成後，Vercel 會自動設定：

- ✅ **Push to main** → 自動部署到 Production
- ✅ **Pull Request** → 自動建立 Preview 部署
- ✅ **每次更新** → 使用者會自動看到最新版本（感謝我們的快取解決方案！）

## 🧪 測試部署是否成功

### 1. 功能測試

訪問你的網站，測試以下功能：

- [ ] 建立新的存錢專案
- [ ] 新增存錢規則
- [ ] 記錄成果並上傳圖片
- [ ] 圖片裁切功能正常
- [ ] 刪除功能會彈出確認對話框
- [ ] 切換主題顏色
- [ ] 重新整理頁面，資料有保存（LocalStorage）

### 2. 快取測試

1. 記下當前版本的某個文字或顏色
2. 修改程式碼（例如改變按鈕文字）
3. Push 到 GitHub
4. 等待 Vercel 部署完成
5. **不要強制刷新**，直接重新整理頁面
6. ✅ 應該會看到最新版本

### 3. 開發者工具檢查

開啟開發者工具 → Network 標籤：

1. 檢查 `index.html`：
   ```
   Cache-Control: public, max-age=0, must-revalidate
   ```

2. 檢查 JS 檔案（例如 `index.ABC123.js`）：
   ```
   Cache-Control: public, max-age=31536000, immutable
   ```

3. 每次部署後，JS 檔案名稱應該不同（雜湊值改變）

## 🔧 常見問題

### Q: 部署失敗怎麼辦？

1. 檢查 Vercel 的 Build Logs
2. 確認 `package.json` 中的 scripts 正確：
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview"
     }
   }
   ```
3. 確認本地 `npm run build` 可以成功執行

### Q: 圖片無法顯示？

圖片是用 Base64 存在 LocalStorage 中，不會上傳到伺服器，所以：
- ✅ 不同裝置/瀏覽器的資料是獨立的
- ✅ 不需要額外的圖片儲存服務
- ⚠️ 圖片只存在本地瀏覽器

如果需要跨裝置同步，需要實作後端 API 和資料庫。

### Q: 環境變數沒有生效？

1. 確認變數名稱正確（例如 `GEMINI_API_KEY`）
2. Vercel 環境變數需要以 `VITE_` 開頭才能在前端使用
3. 修改 `vite.config.ts` 中的設定：
   ```typescript
   define: {
     'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
   }
   ```

### Q: 想要自訂網域？

1. 在 Vercel Dashboard → Settings → Domains
2. 新增你的網域
3. 按照指示設定 DNS（A record 或 CNAME）

## 📱 PWA 設定（可選）

如果未來想要加入 PWA 功能：

1. 閱讀 `CACHE-SOLUTION.md` 中的 PWA 章節
2. 修改 `App.tsx` 中的 Service Worker 清理邏輯
3. 使用 `vite-plugin-pwa` 套件
4. 實作正確的更新策略（skipWaiting）

⚠️ **目前已設定自動清除 Service Worker**，以確保使用者永遠看到最新版本。

## 🎉 完成！

你的 Step2Save 應用程式已經成功部署到 Vercel！

- 🌐 網址：https://steptosave.vercel.app（或你的自訂網域）
- 🔄 自動部署：每次 push 到 main 分支都會自動更新
- ✨ 快取最佳化：使用者永遠能看到最新版本
- 📱 響應式設計：手機、平板、桌面都能完美使用

有任何問題，請參考：
- Vercel 文件：https://vercel.com/docs
- Vite 文件：https://vitejs.dev/guide/
- 快取解決方案：`CACHE-SOLUTION.md`
