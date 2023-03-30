import { FC, MouseEvent, useState } from 'react';

import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import { onDownloadOS } from 'components/organisms/forms/OsForm/hooks/useOSForm';
import { useScheduleExam } from 'components/organisms/tables/HistoryScheduleExamCompanyTable/hooks/useScheduleExam';

import { SCalendarIcon } from 'assets/icons/SCalendarIcon';
import SDocumentIcon from 'assets/icons/SDocumentIcon';
import SEditIcon from 'assets/icons/SEditIcon';
import SMoreOptionsIcon from 'assets/icons/SMoreOptionsIcon/SMoreOptionsIcon';
import { SOsIcon } from 'assets/icons/SOsIcon';

import { SMenu } from '../../../../../molecules/SMenu';
import { IMenuSearchOption } from '../../../../../molecules/SMenuSearch/types';
import { IAnchorEvent } from '../../../../../molecules/STagSelect/types';
import { ISIconUpload } from './types';

export const SDropIconEmployee: FC<ISIconUpload> = ({
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
    if (option.value == 1) {
      onDownloadOS(employeeId, companyId);
    }
    if (option.value == 2) {
      onReSchedule({
        employee,
        ...(isScheduled && { ...exam }),
      });
    }
    if (option.value == 3) {
      onEditEmployee?.(employee);
    }

    handleSelectMenu && handleSelectMenu(option, e);
  };

  const handleSelectButton = (e: any) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const scheduleTypeString = () => {
    if (isExpired || canSchedule) return 'Agendar Exame';
    if (isScheduled) return 'Reagendar Exame';
    return 'Exame na valídade';
  };

  const options: {
    name: string;
    value: number;
    disabled?: boolean;
    borderTop?: boolean;
    color?: string;
    iconColor?: string;
    icon?: any;
  }[] = [
    {
      name: 'Baixar Ordem de Serviço (OS)',
      value: 1,
      disabled: !companyId || !employeeId || disabled,
      icon: SOsIcon,
    },
    // {
    //   name: 'Baixar Guia',
    //   value: 2,
    //   disabled: !companyId || !employeeId || disabled,
    // },
    {
      name: scheduleTypeString(),
      value: 2,
      icon: SCalendarIcon,
      disabled:
        !companyId || !employeeId || disabled || (!canSchedule && !isExpired),
      ...(isExpired && {
        color: 'info.dark',
        iconColor: 'info.dark',
      }),
    },
    {
      name: 'Editar Funcionário',
      value: 3,
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
