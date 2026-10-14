import {
  CATALOG_ONLY_ALLOWED_IMAGE_MIME,
  CATALOG_ONLY_MAX_TEMP_IMAGE_BYTES,
  type CatalogOnlyAllowedImageMime,
} from './catalog-only-photo-limits.constants';

export type CatalogOnlyTemporaryImage = {
  localId: string;
  fileName: string;
  mimeType: CatalogOnlyAllowedImageMime;
  dataUrl: string;
  byteLength: number;
};

function isAllowedMime(value: string): value is CatalogOnlyAllowedImageMime {
  return (CATALOG_ONLY_ALLOWED_IMAGE_MIME as readonly string[]).includes(value);
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Falha ao ler a imagem.'));
    };
    image.src = url;
  });
}

function canvasToJpegDataUrl(
  canvas: HTMLCanvasElement,
  quality: number,
): string {
  return canvas.toDataURL('image/jpeg', quality);
}

function dataUrlByteLength(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] || '';
  return Math.floor((base64.length * 3) / 4);
}

/**
 * Comprime a imagem no client para caber no limite da API.
 * Sempre gera JPEG (menor custo/tamanho) quando precisa redimensionar.
 */
export async function compressCatalogOnlyTempImage(
  file: File,
): Promise<CatalogOnlyTemporaryImage> {
  const declared = (file.type || '').toLowerCase();
  if (!isAllowedMime(declared)) {
    throw new Error('Use JPEG, PNG ou WebP.');
  }

  if (file.size <= CATALOG_ONLY_MAX_TEMP_IMAGE_BYTES && declared === 'image/jpeg') {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
      reader.readAsDataURL(file);
    });
    return {
      localId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      fileName: file.name || 'foto.jpg',
      mimeType: 'image/jpeg',
      dataUrl,
      byteLength: file.size,
    };
  }

  const image = await loadImage(file);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponível.');
  ctx.drawImage(image, 0, 0, width, height);

  let quality = 0.82;
  let dataUrl = canvasToJpegDataUrl(canvas, quality);
  let byteLength = dataUrlByteLength(dataUrl);
  while (byteLength > CATALOG_ONLY_MAX_TEMP_IMAGE_BYTES && quality > 0.4) {
    quality -= 0.1;
    dataUrl = canvasToJpegDataUrl(canvas, quality);
    byteLength = dataUrlByteLength(dataUrl);
  }

  if (byteLength > CATALOG_ONLY_MAX_TEMP_IMAGE_BYTES) {
    throw new Error(
      `A imagem excede ${CATALOG_ONLY_MAX_TEMP_IMAGE_BYTES / (1024 * 1024)} MB mesmo após compressão.`,
    );
  }

  return {
    localId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fileName: (file.name || 'foto').replace(/\.\w+$/, '') + '.jpg',
    mimeType: 'image/jpeg',
    dataUrl,
    byteLength,
  };
}
