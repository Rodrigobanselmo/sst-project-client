import { createPortal } from 'react-dom';

import type { ReactDatePickerProps } from 'react-datepicker';

export const MODAL_DATE_PICKER_POPPER_CLASS = 'modal-document-date-picker-popper';

/** Renderiza o calendário no body para não ser cortado pelo overflow do modal. */
export const ModalDatePickerPopperContainer: NonNullable<
  ReactDatePickerProps['popperContainer']
> = ({ children }) => {
  if (typeof document === 'undefined') {
    return <>{children}</>;
  }

  return createPortal(<>{children}</>, document.body);
};
