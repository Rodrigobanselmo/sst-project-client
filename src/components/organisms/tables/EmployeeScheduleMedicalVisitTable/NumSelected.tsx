/* eslint-disable react/display-name */
import { forwardRef, useImperativeHandle } from 'react';
import { Box, BoxProps } from '@mui/material';
import SText from 'components/atoms/SText';
import { useUpdate } from 'core/hooks/useRerender';
import { IEmployeeSelectedProps } from './EmployeeScheduleMedicalVisitTable';

export const NumSelected = forwardRef<
  any,
  BoxProps & {
    selectedRef: { current: IEmployeeSelectedProps };
  }
>(({ selectedRef, ...props }, ref) => {
  const triggerUpdate = useUpdate();

  useImperativeHandle(ref, () => ({
    update: () => triggerUpdate(),
  }));

  return (
    <Box {...props}>
      <SText fontSize={12} fontWeight={600}>
        Funcionários selecionados:{' '}
        <SText fontSize={12} component={'span'}>
          {
            Object.values(selectedRef.current).filter((ref) =>
              Object.values(ref).some((s) => s?.checked),
            ).length
          }
        </SText>
      </SText>
    </Box>
  );
});
