// Computed widths describe one viewport, not the element's layout contract.
// In particular a grid cell's measured width must not become a percentage of
// that same cell in the exported document.
export function normalizeReportSnapshotProperty(
  key: string,
  value: string,
  context: { html: boolean; inlineWidth: string },
) {
  if (key === 'width' && context.html)
    return context.inlineWidth.endsWith('%') ? context.inlineWidth : 'auto';
  if (key === 'flex-basis' && context.html && value.endsWith('px'))
    return 'auto';
  if (key === 'grid-template-columns')
    return value.replace(/([\d.]+)px/g, 'minmax(0,$1fr)');
  // SVG shape widths are geometry in viewBox units, never HTML percentages.
  return value;
}
