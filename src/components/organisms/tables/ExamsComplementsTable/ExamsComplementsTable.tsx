import { FC } from 'react';
import { Control, FieldValues, UseFormSetValue } from 'react-hook-form';

import { BoxProps } from '@mui/material';
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

export interface IExamComplementsTable {
  doneDate?: Date;
  name: string;
  id: number;
  status?: StatusEnum;
  clinic?: ICompany;
  validityInMonths?: number;
  expiredDate?: Date | null;
  closeToExpired?: boolean;
  isSelected?: boolean;
}

export const ExamsComplementsTable: FC<
  { children?: any } & BoxProps & {
      data?: IExamComplementsTable[];
      setData?: (data: Partial<IExamComplementsTable>) => void;
      control: Control<any, object>;
      setValue: UseFormSetValue<FieldValues>;
    }
> = ({ data, setData, control, setValue }) => {
  const handleDebounceChange = useDebouncedCallback((value: any) => {
    setData?.(value);
  }, 1000);

  return (
    <>
      <STable
        columns={'15px 140px minmax(150px, 3fr) minmax(250px, 3fr) 70px 100px'}
      >
        <STableHeader>
          <STableHRow></STableHRow>
          <STableHRow>Data</STableHRow>
          <STableHRow>Exame</STableHRow>
          <STableHRow>Clínica</STableHRow>
          <STableHRow>Peridiocidade</STableHRow>
          <STableHRow justifyContent="center">Status</STableHRow>
        </STableHeader>
        <STableBody<IExamComplementsTable>
          rowsData={data || []}
          hideLoadMore
          renderRow={(row) => {
            const isValid =
              row?.expiredDate &&
              new Date(row.expiredDate) > new Date() &&
              !row.closeToExpired;

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
                <DatePickerForm
                  label=""
                  control={control}
                  unmountOnChangeDefault
                  name={'doneDate_' + String(row.id)}
                  defaultValue={dateToDate(row?.doneDate)}
                  sx={{
                    input: {
                      fontSize: 13,
                      margin: 0,
                      py: 1,
                      px: 3,
                    },
                    svg: {
                      fontSize: 20,
                    },
                  }}
                  superSmall={true}
                  labelPosition="center"
                  onChange={(date) => {
                    setData?.({
                      id: row.id,
                      doneDate: date instanceof Date ? date : undefined,
                    });
                  }}
                />
                <TextIconRow
                  text={
                    <>
                      <SText
                        {...(isValid && { color: 'secondary', lineNumber: 1 })}
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
                <ClinicInputSelect
                  onChange={(clinic) => {
                    setData?.({ clinic, id: row.id });
                  }}
                  inputProps={{
                    placeholder: 'clínica',
                    superSmall: true,
                    sx: {
                      input: {
                        fontSize: 13,
                      },
                    },
                  }}
                  defaultValue={row?.clinic}
                  unmountOnChangeDefault
                  name={'clinic_' + String(row.id)}
                  label=""
                  control={control}
                />
                <AutocompleteForm
                  name={'val_' + String(row.id)}
                  filterOptions={(x) => x}
                  control={control}
                  freeSolo
                  getOptionLabel={(option) => `${option}`}
                  inputProps={{
                    labelPosition: 'center',
                    placeholder: 'meses...',
                    name: 'val_' + String(row.id),
                    superSmall: true,
                    sx: {
                      input: {
                        fontSize: 13,
                      },
                    },
                  }}
                  onChange={(validityInMonths) => {
                    setData?.({ validityInMonths, id: row.id });
                    setValue('val_' + String(row.id), validityInMonths || '');
                  }}
                  onInputChange={(e, validityInMonths) => {
                    handleDebounceChange({
                      validityInMonths: Number(validityInMonths),
                      id: row.id,
                    });
                  }}
                  defaultValue={String(row.validityInMonths || '')}
                  unmountOnChangeDefault
                  setValue={(v) => setValue('val_' + String(row.id), v || '')}
                  mask={intMask.apply}
                  label=""
                  options={[3, 6, 9, 12, 18, 24]}
                />
                <StatusSelect
                  options={statusOptionsConstantExam}
                  large={false}
                  selected={row?.status}
                  statusOptions={[
                    StatusEnum.DONE,
                    // StatusEnum.CANCELED,
                    // StatusEnum.EXPIRED,
                  ]}
                  handleSelectMenu={(option) =>
                    setData?.({ status: option.value, id: row.id })
                  }
                />
              </STableRow>
            );
          }}
        />
      </STable>
    </>
  );
};
