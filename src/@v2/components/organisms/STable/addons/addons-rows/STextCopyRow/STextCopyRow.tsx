import { FC } from 'react';

import { STextRow } from '../STextRow/STextRow';
import { STextCopyRowProps } from './STextCopyRow.types';
import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';

export const STextCopyRow: FC<STextCopyRowProps> = ({ ...props }) => {
  const { showSnackBar } = useSystemSnackbar();

  return (
    <STextRow
      tooltipTitle="Clicar para copiar"
      tooltipMinLength={1}
      tooltipProps={{
        placement: 'bottom',
      }}
      textProps={{
        sx: {
          '&:hover': {
            cursor: 'pointer',
            color: 'info.light',
          },
        },
      }}
      containerProps={{
        onClick: (e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(props.text);

          showSnackBar('Texto copiado com sucesso', { type: 'success' });
        },
        sx: { m: -6, p: 6 },
      }}
      {...props}
    />
  );
};
