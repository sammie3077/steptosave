import React, { useState, useRef, useEffect } from 'react';
import { TrashIcon } from './Icons';

export const ProgressBar: React.FC<{ current: number; total: number; theme: any }> = React.memo(
  ({ current, total, theme }) => {
    const percentage = Math.min(100, Math.floor((current / total) * 100)) || 0;
    return (
      <div className="w-full rounded-full h-4 relative overflow-hidden" style={{ backgroundColor: theme.light }}>
        <div
          className="h-full transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: theme.primary }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color: theme.text }}>
          {percentage}%
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

export const ConfirmDialog: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  theme: any;
}> = React.memo(({ isOpen, title, message, onConfirm, onCancel, theme }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-red-50">
            <TrashIcon size={24} className="text-red-500" />
          </div>
          <h3 className="text-lg font-black" style={{ color: theme.dark }}>
            {title}
          </h3>
        </div>
        <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="py-3 px-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="py-3 px-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition shadow-lg"
          >
            確認刪除
          </button>
        </div>
      </div>
    </div>
  );
});

ConfirmDialog.displayName = 'ConfirmDialog';

export const ImageCropper: React.FC<{
  src: string;
  onCrop: (base64: string) => void;
  onCancel: () => void;
  theme: any;
}> = React.memo(({ src, onCrop, onCancel, theme }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (x: number, y: number) => {
    setIsDragging(true);
    setLastPos({ x, y });
  };

  const handleDragMove = (x: number, y: number) => {
    if (!isDragging) return;
    const dx = x - lastPos.x;
    const dy = y - lastPos.y;
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastPos({ x, y });
  };

  const handleDragEnd = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setZoom(prev => Math.min(Math.max(0.5, prev + delta), 4));
  };

  const handleCrop = () => {
    if (!canvasRef.current || !imgRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgRef.current;
    const container = containerRef.current;

    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    const sxRatio = (containerRect.left - imgRect.left) / imgRect.width;
    const syRatio = (containerRect.top - imgRect.top) / imgRect.height;
    const swRatio = containerRect.width / imgRect.width;
    const shRatio = containerRect.height / imgRect.height;

    const sx = sxRatio * img.naturalWidth;
    const sy = syRatio * img.naturalHeight;
    const sw = swRatio * img.naturalWidth;
    const sh = shRatio * img.naturalHeight;

    const maxSize = 800; // Reduced from 1080 for better compression
    const aspectRatio = sw / sh;

    if (aspectRatio > 1) {
      canvas.width = maxSize;
      canvas.height = maxSize / aspectRatio;
    } else {
      canvas.width = maxSize * aspectRatio;
      canvas.height = maxSize;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    // Reduced quality from 0.95 to 0.8 for better compression
    onCrop(canvas.toDataURL('image/jpeg', 0.8));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 select-none">
      <div className="bg-white p-6 rounded-3xl w-full max-w-md flex flex-col gap-6 shadow-2xl">
        <h3 className="text-center font-black text-lg" style={{ color: theme.dark }}>
          裁切與調整
        </h3>

        <div
          ref={containerRef}
          className="relative aspect-square w-full rounded-2xl bg-gray-100 overflow-hidden cursor-move touch-none flex items-center justify-center border-2 border-dashed border-gray-200"
          onMouseDown={e => handleDragStart(e.clientX, e.clientY)}
          onMouseMove={e => handleDragMove(e.clientX, e.clientY)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onWheel={handleWheel}
          onTouchStart={e => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={e => handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={handleDragEnd}
        >
          <img
            ref={imgRef}
            src={src}
            draggable={false}
            className="max-w-none transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              width: 'auto',
              height: 'auto',
              minWidth: '100%',
              minHeight: '100%',
              objectFit: 'contain'
            }}
            alt="To crop"
          />
          <div className="absolute inset-0 pointer-events-none border-2 border-white/50 flex">
            <div className="w-1/3 h-full border-r border-white/20"></div>
            <div className="w-1/3 h-full border-r border-white/20"></div>
          </div>
          <div className="absolute inset-0 pointer-events-none flex flex-col">
            <div className="h-1/3 w-full border-b border-white/20"></div>
            <div className="h-1/3 w-full border-b border-white/20"></div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-gray-400">
            <span>縮小</span>
            <span>放大縮放 ({zoom.toFixed(1)}x)</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="4"
            step="0.1"
            value={zoom}
            onChange={e => setZoom(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-current"
            style={{ color: theme.primary }}
          />
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="py-3 bg-gray-50 text-gray-400 rounded-2xl font-bold hover:bg-gray-100 transition"
          >
            取消
          </button>
          <button
            onClick={handleCrop}
            className="py-3 text-white rounded-2xl font-black shadow-lg hover:opacity-90 transition"
            style={{ backgroundColor: theme.primary }}
          >
            確認裁切
          </button>
        </div>
      </div>
      <p className="mt-4 text-white/50 text-xs font-bold text-center">
        可使用手指拖動調整位置，
        <br />
        使用滑鼠滾輪或拉桿縮放
      </p>
    </div>
  );
});

ImageCropper.displayName = 'ImageCropper';
