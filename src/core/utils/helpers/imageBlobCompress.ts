export interface ImageBlobCompressProps {
  blob: Blob;
  maxWidth?: number;
  resize?: boolean;
  maxHeight?: number;
  imageExtension?: 'jpeg' | 'png' | 'jpg' | 'gif';
  name?: string;
  compressionRules?: { minSize: number; quality: number }[];
}

export async function imageBlobCompress({
  blob,
  imageExtension = 'jpeg',
  name = 'imagem',
  maxWidth = 1200,
  maxHeight = 1200,
  resize = true,
  compressionRules = [
    { quality: 1, minSize: 200_000 },
    { quality: 0.9, minSize: 300_000 },
    { quality: 0.8, minSize: 500_000 },
    { quality: 0.7, minSize: 2_000_000 },
    { quality: 0.5, minSize: 5_000_000 },
  ],
}: ImageBlobCompressProps): Promise<{ file: File; dataUrl: string }> {
  return new Promise<{ file: File; dataUrl: string }>((resolve, reject) => {
    const file = new File([blob], `${name}.${imageExtension}`, {
      type: `image/${imageExtension}`,
    });
    const reader = new FileReader();
    reader.addEventListener('load', async (event) => {
      const imgElement = document.createElement('img');
      if (event.target?.result) imgElement.src = event.target.result.toString();

      imgElement.onload = async function (e: any) {
        const canvas = document.createElement('canvas');

        const width = e.target.width;
        const height = e.target.heigh;

        if (e && e.target && e.target?.width) {
          canvas.width = e.target.width;
          canvas.height = e.target.height;

          if (resize) {
            const MAX_WIDTH = maxWidth
              ? width > maxWidth
                ? maxWidth
                : width
              : width;

            const MAX_HEIGHT = maxHeight
              ? height > maxHeight
                ? maxHeight
                : height
              : height;

            const isVertical = e.target.width < e.target.height;

            if (!isVertical && e.target.width > MAX_WIDTH) {
              const scaleSize = MAX_WIDTH / e.target.width;
              canvas.width = MAX_WIDTH;
              canvas.height = e.target.height * scaleSize;
            }

            if (isVertical && e.target.height > MAX_HEIGHT) {
              const scaleSizeHeight = MAX_HEIGHT / e.target.height;
              canvas.height = MAX_HEIGHT;
              canvas.width = e.target.width * scaleSizeHeight;
            }
          }

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(e.target, 0, 0, canvas.width, canvas.height);

            const rule = compressionRules.find(
              (rule) => rule.minSize > file.size,
            );

            const dataUrl = canvas.toDataURL(
              `image/${imageExtension}`,
              rule?.quality || 1,
            );

            const fileFromUrl = new File(
              [await createBlob(dataUrl)],
              `${name}.${imageExtension}`,
              {
                type: `image/${imageExtension}`,
              },
            );

            resolve({ file: fileFromUrl, dataUrl });
          }
        }
      };
    });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function createBlob(base64: any) {
  const res = await fetch(base64);
  const myBlob = await res.blob();
  return myBlob;
}
