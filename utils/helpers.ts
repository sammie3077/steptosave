// Debounce function for delaying expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Compress image to reduce storage size
export async function compressImage(
  base64: string,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG with quality setting
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64;
  });
}

// Calculate file size from base64 string (in KB)
export function getBase64Size(base64: string): number {
  const base64Length = base64.length - (base64.indexOf(',') + 1);
  const padding = (base64.charAt(base64.length - 2) === '=') ? 2 : ((base64.charAt(base64.length - 1) === '=') ? 1 : 0);
  const sizeInBytes = (base64Length * 3) / 4 - padding;
  return sizeInBytes / 1024; // Convert to KB
}

// Format relative date
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return '今天';
  if (diffInDays === 1) return '昨天';
  if (diffInDays < 7) return `${diffInDays} 天前`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} 週前`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} 個月前`;
  return `${Math.floor(diffInDays / 365)} 年前`;
}
