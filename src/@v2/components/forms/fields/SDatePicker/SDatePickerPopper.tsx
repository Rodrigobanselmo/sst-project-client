import { StaticDatePicker } from '@mui/x-date-pickers';
import { useDisclosure } from '@v2/hooks/useDisclosure';
import { SPopperArrow } from 'components/molecules/SPopperArrow';
import dayjs from 'dayjs';
import * as React from 'react';

export function SDatePickerPopper({
  children,
  onChange,
  onClose,
  onClear,
  value,
}: {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  children: React.ReactNode;
  onClose?: () => void;
  onClear?: () => void;
}) {
  const selectSate = useDisclosure();
  const anchorEl = React.useRef<null | HTMLDivElement>(null);

  const handleClose = () => {
    onClose?.();
    selectSate.close();
  };

  const handleChange = (date: Date | null) => {
    const OnlyChangeYear =
      value?.getFullYear() !== date?.getFullYear() &&
      date?.getMonth() === value?.getMonth() &&
      date?.getDate() === value?.getDate() &&
      date?.getHours() === value?.getHours() &&
      date?.getMinutes() === value?.getMinutes() &&
      date?.getSeconds() === value?.getSeconds();

    if (!OnlyChangeYear) {
      onChange?.(date);
      handleClose();
    }
  };

  const handleAccpet = (date: Date | null) => {
    console.log(9999);
    onChange?.(date);
    handleClose();
  };

  const handleClean = () => {
    onClear?.();
    handleClose();
  };

  return (
    <>
      <div ref={anchorEl} onClick={(e) => selectSate.open()}>
        {children}
      </div>
      <SPopperArrow
        disabledArrow
        placement="bottom-start"
        anchorEl={anchorEl}
        isOpen={selectSate.isOpen}
        close={handleClose}
        color="paper"
      >
        <StaticDatePicker
          value={value ? dayjs(value) : value}
          onChange={(date) => handleChange?.(date?.toDate() || null)}
          onAccept={(date) => handleAccpet?.(date?.toDate() || null)}
          localeText={{
            toolbarTitle: 'Selecione a data',
            cancelButtonLabel: 'Limpar',
          }}
          slotProps={{
            actionBar: {
              actions: onClear ? ['cancel'] : [],
              onCancel: handleClean,
            },
            yearButton: {
              color: '#000 !important',
              style: {
                color: '#000',
              },
            },
            toolbar: {
              classes: {
                root: 'staticDatePickerToolbarRoot',
                title: 'staticDatePickerToolbar',
              },
              sx: {
                display: 'flex',
                justifyContent: 'center',
                px: '20px',
                pt: 10,
              },
            },
          }}
        />
      </SPopperArrow>
    </>
  );
}
