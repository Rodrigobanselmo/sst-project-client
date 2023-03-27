import React, { FC, MouseEvent, useState } from 'react';

import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import { onGetExamPdfRoute } from 'components/organisms/modals/ModalEditEmployeeHisExamClinic/hooks/useEditExamData';
import { initialFileUploadState } from 'components/organisms/modals/ModalUploadNewFile/ModalUploadNewFile';

import SDocumentIcon from 'assets/icons/SDocumentIcon';
import { SDownloadIcon } from 'assets/icons/SDownloadIcon';
import { SUploadFileIcon } from 'assets/icons/SUploadFileIcon';
import { SUploadIcon } from 'assets/icons/SUploadIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { useMutDownloadFile } from 'core/services/hooks/mutations/general/useMutDownloadFile';

import { SMenu } from '../SMenu';
import { IMenuSearchOption } from '../SMenuSearch/types';
import { IAnchorEvent } from '../STagSelect/types';
import { ISIconUpload } from './types';

export const onDownloadPdf = (
  base: RoutesEnum,
  options: {
    asoId?: number;
    employeeId?: number;
    companyId?: string;
  },
) => {
  if (!options.employeeId || !options.companyId) return;

  const path = base
    .replace(':employeeId', String(options.employeeId))
    .replace(':asoId', String(options.asoId))
    .replace(':companyId', options.companyId);

  window.open(path, '_blank');
};

export const SIconDownloadExam: FC<ISIconUpload> = ({
  handleSelectMenu,
  disabled,
  isTag,
  text,
  loading,
  isActive,
  companyId,
  employeeId,
  asoId,
  missingDoctor,
  showIfKitMedico,
  isMenu = true,
  isAvaliation,
}) => {
  const [anchorEl, setAnchorEl] = useState<IAnchorEvent>(null);
  const downloadMutation = useMutDownloadFile();

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = async (
    option: IMenuSearchOption,
    e: MouseEvent<HTMLLIElement>,
  ) => {
    e.stopPropagation();
    if (option.value == 1) {
      onDownloadPdf(RoutesEnum.PDF_GUIDE, { employeeId, companyId });
    }
    if (option.value == 2) {
      if (showIfKitMedico && !(await showIfKitMedico())) return;

      onDownloadPdf(onGetExamPdfRoute({ isAvaliation }), {
        employeeId,
        companyId,
        asoId,
      });
    }
    if (option.value == 3) {
      onDownloadPdf(RoutesEnum.PDF_DOC_PCD, { employeeId, companyId });
    }

    handleSelectMenu && handleSelectMenu(option, e);
  };

  const handleSelectButton = (e: any) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  return (
    <Box>
      <>
        {!isMenu && (
          <SFlex>
            {[
              {
                name: 'Baixar Guia',
                value: 1,
                disabled: !companyId || !employeeId || disabled,
              },
              {
                name: 'Baixar Kit Médico',
                value: 2,
                disabled: !companyId || !employeeId || disabled,
              },
              // {
              //   name: 'Baixar Laudo PCD',
              //   value: 3,
              //   disabled:
              //     !companyId || missingDoctor || !employeeId || disabled,
              // },
            ].map((data) => {
              return (
                <STagButton
                  borderActive={'info'}
                  outline
                  key={data.value}
                  text={data.name}
                  disabled={data.disabled}
                  onClick={(e) => handleSelect(data, e as any)}
                  loading={loading || downloadMutation.isLoading}
                  iconProps={{ sx: isActive ? { color: 'info.main' } : {} }}
                />
              );
            })}
          </SFlex>
        )}
        {isMenu && (
          <>
            {isTag ? (
              <STagButton
                icon={SDocumentIcon}
                text={text || 'Baixar documentos'}
                onClick={handleSelectButton}
                loading={loading || downloadMutation.isLoading}
                iconProps={{ sx: isActive ? { color: 'info.main' } : {} }}
              />
            ) : (
              <SIconButton
                tooltip={text || 'Baixar documentos'}
                sx={{ width: 36, height: 36 }}
                onClick={handleSelectButton}
                loading={loading || downloadMutation.isLoading}
              >
                <Icon
                  component={SDocumentIcon}
                  sx={isActive ? { color: 'info.main' } : {}}
                />
              </SIconButton>
            )}
          </>
        )}
      </>
      <SMenu
        close={handleClose}
        isOpen={Boolean(anchorEl)}
        anchorEl={anchorEl}
        startAdornment={() => {
          return (
            <Icon sx={{ fontSize: 15, mr: 4 }} component={SDownloadIcon} />
          );
        }}
        handleSelect={handleSelect}
        options={[
          {
            name: 'Baixar Guia de Encaminhamento',
            value: 1,
            disabled: !companyId || !employeeId || disabled,
          },
          {
            name: 'Baixar Kit Médico',
            value: 2,
            disabled: !companyId || !employeeId || disabled,
          },
          // {
          //   name: 'Baixar Laudo PCD',
          //   value: 3,
          //   disabled: !companyId || !employeeId || disabled,
          // },
        ]}
      />
    </Box>
  );
};
