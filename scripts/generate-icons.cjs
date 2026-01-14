#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 使用 Canvas 需要安裝 canvas 套件
// 但為了避免安裝額外依賴，我們使用更簡單的方法：複製原始圖標

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const sourceIcon = path.join(__dirname, '../public/icons/icon.png');
const iconsDir = path.join(__dirname, '../public/icons');

console.log('📦 檢查原始圖標...');

if (!fs.existsSync(sourceIcon)) {
  console.error('❌ 找不到 public/icons/icon.png');
  console.log('請確保你的圖標文件存在於 public/icons/icon.png');
  process.exit(1);
}

console.log('✅ 找到原始圖標');
console.log('\n⚠️  注意：這個腳本會複製原始圖標到所有需要的尺寸');
console.log('如果你的原始圖標不是正方形或解析度不夠高，可能會有問題');
console.log('\n建議：使用至少 512x512 的高質量圖標作為來源\n');

// 讀取原始圖標
const iconBuffer = fs.readFileSync(sourceIcon);

console.log('🎨 開始生成圖標...\n');

sizes.forEach(size => {
  const targetPath = path.join(iconsDir, `icon-${size}x${size}.png`);

  // 簡單複製（臨時方案）
  fs.writeFileSync(targetPath, iconBuffer);
  console.log(`✅ 已生成 icon-${size}x${size}.png`);
});

console.log('\n🎉 完成！所有圖標已生成');
console.log('\n⚠️  重要提示：');
console.log('這些圖標是直接複製的，瀏覽器會自動縮放');
console.log('如果圖標顯示效果不佳，建議使用以下方式獲得更好的質量：');
console.log('1. 在瀏覽器打開 scripts/resize-icon.html');
console.log('2. 上傳你的圖標並下載優化後的版本');
console.log('3. 或使用 Photoshop/GIMP 等工具手動調整尺寸\n');
