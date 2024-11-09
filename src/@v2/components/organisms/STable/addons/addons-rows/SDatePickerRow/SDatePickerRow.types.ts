import { ReactNode } from 'react';

export type SDatePickerRowProps = {
  onChange: (date: Date | null) => void;
  onClear?: () => void;
  date: Date | null;
  emptyDate?: string;
};
