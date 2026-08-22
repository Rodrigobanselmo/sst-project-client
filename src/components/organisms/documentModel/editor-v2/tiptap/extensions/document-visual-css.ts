export function cssAlign(align?: string | null) {
  if (align === 'both' || align === 'justified') return 'justify';
  if (align === 'start') return 'left';
  if (align === 'end') return 'right';
  return align || undefined;
}

export function blockVisualStyle(attrs: {
  align?: string | null;
  size?: number | string | null;
  color?: string | null;
  lineHeight?: number | string | null;
}) {
  const align = cssAlign(attrs.align);
  return [
    align ? `text-align:${align}` : '',
    attrs.size != null && attrs.size !== ''
      ? `font-size:${attrs.size}pt`
      : '',
    attrs.color ? `color:${attrs.color}` : '',
    attrs.lineHeight != null && attrs.lineHeight !== ''
      ? `line-height:${attrs.lineHeight}`
      : '',
  ]
    .filter(Boolean)
    .join(';');
}

export function inlineStyleCss(
  style?: string | null,
  value?: string | null,
): string {
  if (style === 'COLOR' && value) return `color:${value}`;
  if (style === 'BG_COLOR' && value) return `background-color:${value}`;
  if (style === 'FONTSIZE' && value) return `font-size:${value}pt`;
  if (style === 'SUPERSCRIPT') return 'vertical-align:super;font-size:smaller';
  if (style === 'SUBSCRIPT') return 'vertical-align:sub;font-size:smaller';
  return '';
}
