export const getFontSize = (font: number) => {
  return font * 1.5;
};

export const getSpacing = (font: number, props?: { px?: boolean }) => {
  return font / (props?.px ? 17 : 34);
};

export const getLineHeight = (font: number, props?: { px?: boolean }) => {
  if (!font) return '150%';
  return (font / 350) * 150 + '%';
};
