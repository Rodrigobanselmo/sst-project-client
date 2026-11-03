# Frontend conventions

Read the existing project conventions in `CLAUDE.md` before changing this client.

## MUI spacing

This project customizes `theme.spacing(n)` in `src/configs/theme/index.ts` to `0.125 * n rem`. With the current 16px root, **one spacing unit is 2px**, not MUI's default 8px. For example, `Stack spacing={8}`, `sx={{ gap: 8 }}` and `sx={{ p: 8 }}` mean 16px. Explicit lengths such as `'16px'` are also supported. This rule applies to spacing-aware properties, not every numeric CSS property.

Check the real theme before choosing margin, padding or gap. Keep room for floating labels, helper text, validation messages and dialog actions. Verify affected forms at desktop and narrow widths. Do not change the global spacing scale to fix a local layout.

## Civil dates

Use the existing MUI calendar with an explicit `DD/MM/YYYY` display for Brazilian civil dates. A native `type="date"` can render month/day/year according to Chromium or the operating system even with a Portuguese app locale. The SST/eSocial fields use `SstDateField` with an ISO `YYYY-MM-DD` contract and a form validity guard. Partial or impossible drafts must block submission without retaining an older valid ISO. Do not convert civil days through UTC or `toISOString()`, and do not fix a date mismatch only in a screenshot or test label.
