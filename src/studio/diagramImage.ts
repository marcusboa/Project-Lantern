import type { BitmapDiagram } from '../types/patent';

/** Diagrams occupy roughly a third of the 800 x 480 canvas; anything larger is wasted bytes. */
const MAX_EDGE = 900;
const MAX_BYTES = 900_000;

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('That file could not be read as an image.'));
    image.src = dataUrl;
  });
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('That file could not be read.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Reads a bitmap from disk and downscales it so the whole card — image included —
 * still fits in localStorage. Transparency is preserved by keeping PNG sources as PNG.
 */
export async function readDiagramImage(file: File): Promise<BitmapDiagram> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Choose a bitmap image (PNG, JPEG, WEBP or GIF).');
  }

  const original = await readAsDataUrl(file);
  const image = await loadImage(original);
  const scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

  const context = canvas.getContext('2d');
  if (context === null) throw new Error('This browser cannot process images.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const transparent = file.type === 'image/png' || file.type === 'image/gif';
  let dataUrl = transparent ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.86);
  if (dataUrl.length > MAX_BYTES) dataUrl = canvas.toDataURL('image/jpeg', 0.7);
  if (dataUrl.length > MAX_BYTES) {
    throw new Error('That image is too large to store — try one under roughly 1 megapixel.');
  }

  return { dataUrl, alt: '' };
}
