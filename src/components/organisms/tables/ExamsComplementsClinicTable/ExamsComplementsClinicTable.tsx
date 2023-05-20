import { FC, useState } from 'react';
import { Control, FieldValues, UseFormSetValue } from 'react-hook-form';

import { Box, BoxProps } from '@mui/material';
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
import { SelectForm } from 'components/molecules/form/select';
import { SIconUploadFile } from 'components/molecules/SIconUploadFile/SIconUploadFile';
import { ClinicInputSelect } from 'components/organisms/inputSelect/ClinicSelect/ClinicInputSelect';
import { onUserSchedule } from 'components/organisms/modals/ModalEditEmployeeHisExamClinic/hooks/useEditExamData';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { employeeExamConclusionTypeList } from 'project/enum/employee-exam-history-conclusion.enum';
import { StatusEnum } from 'project/enum/status.enum';
import { useDebouncedCallback } from 'use-debounce';

import { statusOptionsConstantExam } from 'core/constants/maps/status-options.constant';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import {
  IUseTableSelect,
  TableCheckSelect,
  TableCheckSelectAll,
  useTableSelect,
} from 'core/hooks/useTableSelect';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IEmployeeExamsHistory } from 'core/interfaces/api/IEmployee';
import { dateToDate, dateToString } from 'core/utils/date/date-format';
import { intMask } from 'core/utils/masks/int.mask';

export interface IExamComplementsClinicTable extends IEmployeeExamsHistory {}

export const ExamsComplementsClinicTable: FC<
  { children?: any } & BoxProps &
    Partial<IUseTableSelect> & {
      data?: IExamComplementsClinicTable[];
      setData?: (data: Partial<IExamComplementsClinicTable>) => void;
      control: Control<any, object>;
      setValue: UseFormSetValue<FieldValues>;
      companyId?: string;
      isLoadingFile?: boolean;
      uploadExam?: ({
        ids,
        file,
      }: {
        ids: number[];
        file: File;
      }) => Promise<void>;
    }
> = ({
  data,
  setData,
  control,
  setValue,
  onToggleSelected,
  onIsSelected,
  onToggleAll,
  uploadExam,
  companyId,
  isLoadingFile,
}) => {
  const ids = (data || []).map(({ id }) => id);
  const [openId, setOpenId] = useState(0);

  const onSelectRow = (examData: IExamComplementsClinicTable) => {
    if (examData.id == openId) return setOpenId(0);
    return setOpenId(examData.id);
  };

  return (
    <>
      <STable columns={'15px 80px 60px minmax(150px, 3fr) 200px 120px 40px'}>
        <STableHeader>
          <TableCheckSelectAll
            isSelected={!!onIsSelected?.(ids)}
            onToggleAll={() => onToggleAll?.(ids)}
          />
          <STableHRow>Data</STableHRow>
          <STableHRow>Hora</STableHRow>
          <STableHRow>Exame</STableHRow>
          <STableHRow>Conclusão</STableHRow>
          <STableHRow justifyContent="center">Status</STableHRow>
          <STableHRow justifyContent="center"></STableHRow>
        </STableHeader>
        <STableBody<IExamComplementsClinicTable>
          rowsData={data || []}
          hideLoadMore
          renderRow={(row) => {
            const isOpen = openId === row.id;
            return (
              <STableRow
                key={row.id}
                status={row.status === 'DONE' ? 'info' : undefined}
                onClick={() => onSelectRow(row)}
                clickable
              >
                <Box onClick={(e) => e.stopPropagation()}>
                  <TableCheckSelect
                    isSelected={!!onIsSelected?.(row.id)}
                    onToggleSelected={() => onToggleSelected?.(row.id)}
                  />
                </Box>
                <TextIconRow text={`${dateToString(row?.doneDate)}`} />
                <TextIconRow text={`${row?.time}`} />
                <TextIconRow text={row?.exam?.name} />
                <SelectForm
                  unmountOnChangeDefault
                  defaultValue={String(row.conclusion || '') || ''}
                  label=""
                  emptyItem="Sem resultado"
                  control={control}
                  setValue={setValue}
                  placeholder="selecione..."
                  name={row.id + '_conclusion'}
                  labelPosition="center"
                  onChange={(e) => {
                    if (e.target.value)
                      setData?.({
                        ...data,
                        id: row.id,
                        conclusion: (e as any).target.value,
                      });
                  }}
                  size="small"
                  superSmall
                  options={employeeExamConclusionTypeList}
                />
                <StatusSelect
                  options={statusOptionsConstantExam}
                  large={false}
                  selected={row?.status}
                  statusOptions={[
                    StatusEnum.DONE,
                    StatusEnum.PROCESSING,
                    StatusEnum.CANCELED,
                  ]}
                  handleSelectMenu={(option) =>
                    setData?.({ status: option.value, id: row.id })
                  }
                />
                <SIconUploadFile
                  loading={isLoadingFile}
                  disabledDownload={!row.fileUrl}
                  isActive={!!row.fileUrl}
                  downloadPath={
                    ApiRoutesEnum.EMPLOYEE_HISTORY_EXAM +
                    `/${row.id}/download/${companyId}`
                  }
                  onUpload={(file) => uploadExam?.({ file, ids: [row.id] })}
                />
                {isOpen && (
                  <Box gridColumn={'1 / 10'} mb={2} mt={-1}>
                    <SText color="text.label" fontSize={'13px'}>
                      Clínica: {row.clinic?.fantasy}
                    </SText>
                    <SText color="text.label" fontSize={'13px'}>
                      Agendado por: {row.userSchedule?.name} (
                      {row.userSchedule?.email})
                    </SText>
                    {row.userDone && (
                      <SText color="text.label" fontSize={'13px'}>
                        {onUserSchedule(row)}: {row.userDone?.name} (
                        {row.userDone?.email})
                      </SText>
                    )}
                  </Box>
                )}
              </STableRow>
            );
          }}
        />
      </STable>
    </>
  );
};
