import { FC, MouseEvent, useState } from 'react';

import { Box, Icon } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import STooltip from 'components/atoms/STooltip';
import { SMenu } from 'components/molecules/SMenu';
import { IMenuSearchOption } from 'components/molecules/SMenuSearch/types';
import { IAnchorEvent } from 'components/molecules/STagSelect/types';
import { onGetExamPdfRoute } from 'components/organisms/modals/ModalEditEmployeeHisExamClinic/hooks/useEditExamData';

import { SDownloadIcon } from 'assets/icons/SDownloadIcon';
import { SUploadIcon } from 'assets/icons/SUploadIcon';

import { RoutesEnum } from 'core/enums/routes.enums';
import { useMutDownloadFile } from 'core/services/hooks/mutations/general/useMutDownloadFile';

import { STableExportProps } from './types';

export const STableExport: FC<STableExportProps> = ({
  onExportClick,
  onInportClick,
  ...props
}) => {
  const [anchorEl, setAnchorEl] = useState<IAnchorEvent>(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = async (
    option: IMenuSearchOption,
    e: MouseEvent<HTMLLIElement>,
  ) => {
    e.stopPropagation();
    if (option.value == 1) {
      onInportClick?.();
    }
    if (option.value == 2) {
      onExportClick?.();
    }
  };

  const handleSelectButton = (e: any) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  return (
    <Box>
      <STooltip title="Importar e Exportar">
        <div>
          <SButton
            {...props}
            onClick={handleSelectButton}
            sx={{
              height: 38,
              minWidth: 38,
              maxWidth: 38,
              borderRadius: 1,
              m: 0,
              backgroundColor: 'grey.700',
              '&:hover': {
                backgroundColor: 'grey.800',
              },
              ml: 1,
            }}
          >
            <Icon
              component={SUploadIcon}
              sx={{
                fontSize: ['1.2rem'],
                color: 'common.white',
              }}
            />
          </SButton>
        </div>
      </STooltip>
      <SMenu
        close={handleClose}
        isOpen={Boolean(anchorEl)}
        anchorEl={anchorEl}
        handleSelect={handleSelect}
        options={[
          {
            name: 'Enviar Planilha',
            value: 2,
            disabled: !onExportClick,
            icon: SUploadIcon,
          },
          {
            name: 'Baixar Planilha',
            value: 1,
            disabled: !onInportClick,
            icon: SDownloadIcon,
          },
        ]}
      />
    </Box>
  );
};
