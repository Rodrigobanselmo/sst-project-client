import { FC, useState, useMemo } from 'react';

import { Box, BoxProps, ClickAwayListener, Icon } from '@mui/material';
import clone from 'clone';
import { SDatePicker } from 'components/atoms/SDatePicker/SDatePicker';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import {
  ITableRowStatus,
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import { TextCompanyRow } from 'components/atoms/STable/components/Rows/TextCompanyRow';
import { TextEmployeeRow } from 'components/atoms/STable/components/Rows/TextEmployeeRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import TextUserRow from 'components/atoms/STable/components/Rows/TextUserRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { getCompanyName } from 'components/organisms/main/Header/Location';
import { initialExamScheduleState } from 'components/organisms/modals/ModalAddExamSchedule/hooks/useEditExamEmployee';
import { ModalEditEmployeeHisExamClinic } from 'components/organisms/modals/ModalEditEmployeeHisExamClinic/ModalEditEmployeeHisExamClinic';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dayjs from 'dayjs';
import {
  employeeExamTypeMap,
  ExamHistoryTypeEnum,
} from 'project/enum/employee-exam-history-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import SArrowNextIcon from 'assets/icons/SArrowNextIcon';
import SCalendarIcon from 'assets/icons/SCalendarIcon';

import { statusOptionsConstantExam } from 'core/constants/maps/status-options.constant';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IAddress } from 'core/interfaces/api/ICompany';
import {
  IEmployee,
  IEmployeeExamsHistory,
} from 'core/interfaces/api/IEmployee';
import { useMutUpdateManyScheduleHisExam } from 'core/services/hooks/mutations/manager/employee-history-exam/useMutUpdateManyScheduleHisExam/useMutUpdateManyScheduleHisExam';
import {
  IQueryEmployeeHistHier,
  useQueryHisExamEmployee,
} from 'core/services/hooks/queries/useQueryHisExamEmployee/useQueryHisExamEmployee';
import { useQueryHisScheduleExamClinic } from 'core/services/hooks/queries/useQueryHisScheduleExamClinic/useQueryHisScheduleExamClinic';
import { dateToString } from 'core/utils/date/date-format';
import { getAddressCity, getAddressMain } from 'core/utils/helpers/getAddress';
import { cepMask } from 'core/utils/masks/cep.mask';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';
import { cpfMask } from 'core/utils/masks/cpf.mask';
import { sortData } from 'core/utils/sorts/data.sort';
import { sortNumber } from 'core/utils/sorts/number.sort';

export const PersonalDatePicker: FC<
  BoxProps & { actualDate: Date; onChangeDate: (date: Date) => void }
> = ({ actualDate, onChangeDate, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SFlex ml={'auto'} align="center" {...props}>
      <SIconButton
        onClick={() => onChangeDate(dayjs(actualDate).add(-1, 'day').toDate())}
        size="small"
      >
        <Icon
          component={SArrowNextIcon}
          sx={{ fontSize: '1rem', transform: 'rotate(180deg)' }}
        />
      </SIconButton>
      <ClickAwayListener onClickAway={() => setIsOpen(false)}>
        <Box sx={{ position: 'relative', flex: 1, width: '100%' }}>
          <STagButton
            onClick={() => setIsOpen(!isOpen)}
            active
            bg={'secondary.main'}
            textProps={{ sx: { fontSize: '14px' } }}
            text={
              dayjs(actualDate).isSame(dayjs(), 'day')
                ? 'Hoje'
                : dayjs(actualDate).format('DD/MM/YYYY')
            }
            tooltipTitle="Voltar para o dia atual"
          />
          {isOpen && (
            <Box
              sx={{
                position: 'absolute',
                right: -25,
                top: 40,
                zIndex: 10,
              }}
            >
              <SDatePicker
                selected={actualDate}
                onChange={(date) => {
                  date && onChangeDate(date);
                  setIsOpen(false);
                }}
                inline
              />
            </Box>
          )}
        </Box>
      </ClickAwayListener>
      <SIconButton
        onClick={() => onChangeDate(dayjs(actualDate).add(1, 'day').toDate())}
        size="small"
      >
        <Icon component={SArrowNextIcon} sx={{ fontSize: '1rem' }} />
      </SIconButton>
    </SFlex>
  );
};
