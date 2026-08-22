export type SaveActionColor = 'primary' | 'error';
export type SaveActionV2Color = 'primary' | 'danger';

export function getSaveActionColor(isDirty: boolean): SaveActionColor {
  return isDirty ? 'error' : 'primary';
}

export function getSaveActionV2Color(isDirty: boolean): SaveActionV2Color {
  return isDirty ? 'danger' : 'primary';
}
