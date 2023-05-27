export function calculateDimensionsWithMaxSize({
  width,
  height,
  maxWidth,
  maxHeight,
  minWidth,
  minHeight,
}: {
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
}): { width: number; height: number } {
  if (!width || !height || !maxWidth || !maxHeight)
    return { width: 0, height: 0 };

  if ((minWidth && minWidth > width) || (minHeight && minHeight > height)) {
    const widthRatio = (minWidth || 0) / width;
    const heightRatio = (minHeight || 0) / height;
    const scale = Math.max(widthRatio, heightRatio);

    width *= scale;
    height *= scale;
  }

  if (width > maxWidth || height > maxHeight) {
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const scale = Math.min(widthRatio, heightRatio);

    width *= scale;
    height *= scale;
  }

  return { width, height };
}
