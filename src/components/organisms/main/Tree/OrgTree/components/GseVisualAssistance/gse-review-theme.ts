import { alpha } from '@mui/material/styles';
import { REVIEW_COLORS } from './gse-integrated-review.model';

export function gseReviewTone(
  tone: { color: string; background: string },
  mode: string,
) {
  if (mode !== 'dark') return tone;
  const accents: Record<string, string> = {
    [REVIEW_COLORS.neutral.color]: '#BDCBD7',
    [REVIEW_COLORS.newGroup.color]: '#D7B3F5',
    [REVIEW_COLORS.changedGroup.color]: '#F3D17C',
    [REVIEW_COLORS.existing.color]: '#95D6B6',
    [REVIEW_COLORS.add.color]: '#9CC8F5',
    [REVIEW_COLORS.remove.color]: '#F2A6A6',
  };
  const color = accents[tone.color] || '#BDCBD7';
  return { color, background: alpha(color, 0.12) };
}
/** Local panel contrast: legacy typography defaults otherwise remain dark in dark mode. */
export const gsePanelContrastSx = {
  color: 'text.primary',
  '& .MuiTypography-root': { color: 'inherit' },
  '& .MuiFormHelperText-root': { color: 'text.secondary' },
} as const;
