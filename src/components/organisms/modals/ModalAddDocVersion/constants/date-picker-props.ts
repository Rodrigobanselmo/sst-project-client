import { ReactDatePickerProps } from 'react-datepicker';

import {
  MODAL_DATE_PICKER_POPPER_CLASS,
  ModalDatePickerPopperContainer,
} from './modal-date-picker-popper';

/** Props do calendário para abrir visível dentro de modais com scroll/overflow. */
export const modalDatePickerCalendarProps: Partial<ReactDatePickerProps> = {
  popperPlacement: 'bottom-start',
  popperClassName: MODAL_DATE_PICKER_POPPER_CLASS,
  popperProps: { strategy: 'fixed' },
  popperContainer: ModalDatePickerPopperContainer,
  popperModifiers: [
    {
      name: 'offset',
      options: { offset: [0, 8] },
    },
    {
      name: 'preventOverflow',
      options: {
        rootBoundary: 'viewport',
        altAxis: true,
        padding: 8,
      },
    },
    {
      name: 'flip',
      options: {
        fallbackPlacements: [
          'bottom-start',
          'top-start',
          'bottom-end',
          'top-end',
        ],
      },
    },
  ],
};
