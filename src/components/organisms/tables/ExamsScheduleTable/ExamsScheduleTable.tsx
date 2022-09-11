import { FC } from 'react';
import { Control, FieldValues, UseFormSetValue } from 'react-hook-form';

import { Box, BoxProps } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import SFlex from 'components/atoms/SFlex';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { ClinicInputSelect } from 'components/organisms/inputSelect/ClinicSelect/ClinicInputSelect';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';
import { useDebouncedCallback } from 'use-debounce';

import { statusOptionsConstantExam } from 'core/constants/maps/status-options.constant';
import { ICompany } from 'core/interfaces/api/ICompany';
import { dateToDate, dateToString } from 'core/utils/date/date-format';
import { intMask } from 'core/utils/masks/int.mask';

import { ExamsScheduleClinicColumn } from './columns/ExamsScheduleClinic';
import { IExamsScheduleTable, IExamsScheduleTableProps } from './types';

export const ExamsScheduleTable: FC<IExamsScheduleTableProps> = (props) => {
  const { data, hideHeader, setData, hideInstruct } = props;

  const handleDebounceChange = useDebouncedCallback((value: any) => {
    setData?.(value);
  }, 1000);

  const showDueInDays =
    !hideInstruct && data && !data.some((d) => d.isAttendance);

  return (
    <>
      <STable
        columns={`15px minmax(150px, 2fr) minmax(250px, 4fr) ${
          showDueInDays ? '100px' : ''
        }`}
      >
        {!hideHeader && (
          <STableHeader>
            <STableHRow></STableHRow>
            {/* <STableHRow>Data</STableHRow> */}
            <STableHRow>Exame</STableHRow>
            <STableHRow>Clínica</STableHRow>
            <STableHRow justifyContent="center">Previsão</STableHRow>
          </STableHeader>
        )}
        <STableBody<IExamsScheduleTable>
          rowsData={data || []}
          contentEmpty={
            <>
              Nenhum exame <br /> selecionado
            </>
          }
          hideLoadMore
          renderRow={(row) => {
            const isSelected = row?.isSelected;
            const isValid = row.expiredDate && !row.closeToExpired;
            return (
              <STableRow key={row.id} status={isValid ? 'info' : undefined}>
                <SCheckBox
                  onClick={(e) => {
                    e.stopPropagation();
                    setData?.({
                      id: row.id,
                      isSelected: !row.isSelected,
                    });
                  }}
                  label=""
                  checked={row.isSelected}
                />
                <TextIconRow
                  tooltipTitle={<>{row.name}</>}
                  text={
                    <>
                      <SText
                        {...(isValid && {
                          color: 'secondary',
                          lineNumber: 1,
                        })}
                        fontSize={12}
                      >
                        {row.name || '-'}
                      </SText>
                      {isValid && (
                        <SText
                          fontSize={12}
                          {...(isValid && { color: 'secondary' })}
                        >
                          válido até <b>{dateToString(row?.expiredDate)}</b>
                        </SText>
                      )}
                    </>
                  }
                />
                {isSelected && (
                  <>
                    <ExamsScheduleClinicColumn
                      {...props}
                      row={row}
                      handleDebounceChange={handleDebounceChange}
                    />
                    {showDueInDays && (
                      <TextIconRow
                        justifyContent="center"
                        textAlign={'center'}
                        text={
                          <>
                            Previsão
                            <br />
                            {row.dueInDays}{' '}
                            {typeof row.dueInDays == 'number' && 'dias'}
                          </>
                        }
                      />
                    )}
                  </>
                )}
              </STableRow>
            );
          }}
        />
      </STable>
    </>
  );
};
