import { FC } from 'react';

import { Box } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import SText from 'components/atoms/SText';
import { SAuthShow } from 'components/molecules/SAuthShow';
import dayjs from 'dayjs';
import { PermissionEnum } from 'project/enum/permission.enum';
import { useDebouncedCallback } from 'use-debounce';

import { dateToString } from 'core/utils/date/date-format';

import { ExamsScheduleClinicColumn } from './columns/ExamsScheduleClinic';
import { IExamsScheduleTable, IExamsScheduleTableProps } from './types';

export const ExamsScheduleTable: FC<IExamsScheduleTableProps> = (props) => {
  const { data, hideHeader, setData, hideInstruct, disabled, isPendingExams } =
    props;

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
            const isValid =
              row.expiredDate &&
              !row.closeToExpired &&
              dayjs().isBefore(row.expiredDate);
            return (
              <STableRow
                key={row.id}
                status={isValid ? 'info' : undefined}
                display={['flex', 'flex', 'grid']}
                flexDirection={['column', 'column', 'row']}
                alignItems={['start', 'start', 'center']}
                justifyContent={['start', 'start', 'start']}
              >
                <Box width={['100%', '100%', 'fit-content']}>
                  <SAuthShow
                    permissions={[PermissionEnum.CLINIC_SCHEDULE]}
                    cruds={'u'}
                  >
                    <SCheckBox
                      disabled={disabled}
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
                  </SAuthShow>
                </Box>

                <Box width={['100%', '100%', 'fit-content']}>
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
                      </>
                    }
                  />
                  {isValid && (
                    <SText
                      fontSize={12}
                      {...(isValid && { color: 'secondary' })}
                    >
                      válido até <b>{dateToString(row?.expiredDate)}</b>
                    </SText>
                  )}
                  {isPendingExams && (
                    <SText
                      fontSize={12}
                      {...(isValid && { color: 'secondary' })}
                    >
                      agendado para: <b>{dateToString(row?.doneDate)}</b>
                    </SText>
                  )}
                </Box>

                {isSelected && (
                  <>
                    <ExamsScheduleClinicColumn
                      {...props}
                      row={row}
                      handleDebounceChange={handleDebounceChange}
                    />
                    {!showDueInDays && <Box mt={[5, 5, 0]} />}
                    {showDueInDays && (
                      <TextIconRow
                        justifyContent="center"
                        textAlign={'center'}
                        text={
                          <>
                            {row.doneDate ? 'Resultado' : 'Previsão'}
                            <br />
                            {!row.doneDate && (
                              <>
                                {row.dueInDays}{' '}
                                {typeof row.dueInDays == 'number' && 'dias'}
                              </>
                            )}
                            {row.doneDate && (
                              <>
                                {dateToString(
                                  dayjs(row.doneDate)
                                    .add(row.dueInDays || 0, 'day')
                                    .toDate(),
                                )}
                              </>
                            )}
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
