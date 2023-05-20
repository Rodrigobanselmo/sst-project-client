import { FC, MouseEvent, useState } from 'react';

import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import { onDownloadPdf } from 'components/molecules/SIconDownloadExam/SIconDownloadExam';
import { onDownloadOS } from 'components/organisms/forms/OsForm/hooks/useOSForm';
import { useScheduleExam } from 'components/organisms/tables/HistoryScheduleExamCompanyTable/hooks/useScheduleExam';

import { SCalendarIcon } from 'assets/icons/SCalendarIcon';
import SDocumentIcon from 'assets/icons/SDocumentIcon';
import SEditIcon from 'assets/icons/SEditIcon';
import SMoreOptionsIcon from 'assets/icons/SMoreOptionsIcon/SMoreOptionsIcon';
import { SOsIcon } from 'assets/icons/SOsIcon';

import { RoutesEnum } from 'core/enums/routes.enums';

import { SMenu } from '../../../../../molecules/SMenu';
import { IMenuSearchOption } from '../../../../../molecules/SMenuSearch/types';
import { IAnchorEvent } from '../../../../../molecules/STagSelect/types';
import { ISIconUpload } from './types';

export const SDropIconEmployee: FC<{ children?: any } & ISIconUpload> = ({
  handleSelectMenu,
  disabled,
  isTag,
  text,
  isMenu = true,
  loading,
  employee,
  company,
  onEditEmployee,
  isScheduled,
  isExpired,
  canSchedule,
  exam,
  skipOS,
  skipGuia,
}) => {
  const [anchorEl, setAnchorEl] = useState<IAnchorEvent>(null);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { onReSchedule } = useScheduleExam();

  const companyId = company.id;
  const employeeId = employee.id;

  const handleSelect = async (
    option: IMenuSearchOption,
    e: MouseEvent<HTMLLIElement>,
  ) => {
    e.stopPropagation();
    if (option.value == 'OS') {
      onDownloadOS(employeeId, companyId);
    }
    if (option.value == 'SCHEDULE') {
      onReSchedule({
        employee,
        ...(isScheduled && { ...exam }),
      });
    }
    if (option.value == 'GUIA') {
      onDownloadPdf(RoutesEnum.PDF_GUIDE, { employeeId, companyId });
    }
    if (option.value == 'EDIT') {
      onEditEmployee?.(employee);
    }

    handleSelectMenu && handleSelectMenu(option, e);
  };

  const handleSelectButton = (e: any) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const scheduleTypeString = () => {
    if (isScheduled) return 'Reagendar Exame';
    if (isExpired || canSchedule) return 'Agendar Exame';
    return 'Exame na valídade';
  };

  const options: {
    name: string;
    value: number | string;
    disabled?: boolean;
    borderTop?: boolean;
    color?: string;
    iconColor?: string;
    icon?: any;
  }[] = [
    ...(!skipOS
      ? [
          {
            name: 'Baixar Ordem de Serviço (OS)',
            value: 'OS',
            disabled: !companyId || !employeeId || disabled,
            icon: SOsIcon,
          },
        ]
      : []),
    ...(!skipGuia && isScheduled
      ? [
          {
            name: 'Baixar Guia',
            value: 'GUIA',
            icon: SDocumentIcon,
            disabled: !companyId || !employeeId || disabled,
            color: 'primary.main',
            iconColor: 'primary.main',
          },
        ]
      : []),
    {
      name: scheduleTypeString(),
      value: 'SCHEDULE',
      icon: SCalendarIcon,
      disabled:
        !companyId || !employeeId || disabled || (!canSchedule && !isExpired),
      ...((isExpired || isScheduled) && {
        color: 'info.main',
        iconColor: 'info.main',
      }),
    },
    {
      name: 'Editar Funcionário',
      value: 'EDIT',
      icon: SEditIcon,
      disabled: !companyId || !employeeId || disabled,
      borderTop: true,
    },
  ];

  return (
    <Box>
      <>
        {!isMenu && (
          <SFlex>
            {options.map((data) => {
              return (
                <STagButton
                  borderActive={'info'}
                  outline
                  key={data.value}
                  text={data.name}
                  disabled={data.disabled}
                  onClick={(e) => handleSelect(data, e as any)}
                  loading={loading}
                  iconProps={{
                    sx: { ...(data.color && { color: data.color }) },
                  }}
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
                text={text || 'Mais Ações'}
                onClick={handleSelectButton}
                loading={loading}
              />
            ) : (
              <SIconButton
                tooltip={text || 'Mais Ações'}
                sx={{ width: 36, height: 36 }}
                onClick={handleSelectButton}
                loading={loading}
              >
                <Icon component={SMoreOptionsIcon} />
              </SIconButton>
            )}
          </>
        )}
      </>
      <SMenu
        close={handleClose}
        isOpen={Boolean(anchorEl)}
        anchorEl={anchorEl}
        handleSelect={handleSelect}
        options={options}
      />
    </Box>
  );
};
