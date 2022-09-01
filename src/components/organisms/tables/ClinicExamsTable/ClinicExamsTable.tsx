import { FC } from 'react';

import { BoxProps } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { initialClinicExamState } from 'components/organisms/modals/ModalAddClinicExam/hooks/useEditClinicExams';
import { initialExamState } from 'components/organisms/modals/ModalAddExam/hooks/useEditExams';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';

import EditIcon from 'assets/icons/SEditIcon';
import { SExamIcon } from 'assets/icons/SExamIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IExamToClinic } from 'core/interfaces/api/IExam';
import { useQueryClinicExams } from 'core/services/hooks/queries/useQueryClinicExams/useQueryClinicExams';
import { getMoney } from 'core/utils/helpers/getMoney.utils';
import { getText } from 'core/utils/helpers/getText';

export const ClinicExamsTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (clinicExam: IExamToClinic) => void;
    selectedData?: IExamToClinic[];
  }
> = ({ rowsPerPage = 8, onSelectData, selectedData }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const isSelect = !!onSelectData;
  const {
    data: exams,
    isLoading: loadExams,
    count,
  } = useQueryClinicExams(page, { search, endDate: null }, rowsPerPage);

  const { onStackOpenModal } = useModal();

  const handleEditStatus = (status: StatusEnum) => {
    console.log(status); // TODO edit checklist status
  };

  const onAddExam = () => {
    onStackOpenModal(
      ModalEnum.EXAMS_CLINIC_ADD,
      {} as typeof initialClinicExamState,
    );
  };

  const onEditExam = ({ startDate, ...exam }: IExamToClinic) => {
    onStackOpenModal(ModalEnum.EXAMS_CLINIC_ADD, {
      ...(exam as any),
      ...(new Date(startDate) > new Date() && { startDate }),
    } as typeof initialClinicExamState);
  };

  const onSelectRow = (exam: IExamToClinic) => {
    if (isSelect) {
      onSelectData(exam);
    } else onEditExam(exam);
  };

  return (
    <>
      <STableTitle icon={SExamIcon}>Exames Realizados</STableTitle>
      <STableSearch
        onAddClick={onAddExam}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <STable
        loading={loadExams}
        rowsNumber={rowsPerPage}
        columns={`${
          selectedData ? '15px ' : ''
        }minmax(250px, 5fr) minmax(150px, 3fr) minmax(150px, 3fr) 90px 80px`}
      >
        <STableHeader>
          {selectedData && <STableHRow></STableHRow>}
          <STableHRow>Nome</STableHRow>
          <STableHRow>Prazo</STableHRow>
          <STableHRow>Valor</STableHRow>
          <STableHRow justifyContent="center">Status</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody<typeof exams[0]>
          rowsData={exams}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            const exam = row?.exam;

            return (
              <STableRow
                onClick={() => onSelectRow(row)}
                clickable
                key={row.id}
              >
                {selectedData && (
                  <SCheckBox
                    label=""
                    checked={!!selectedData.find((e) => e.id === exam?.id)}
                  />
                )}
                <TextIconRow clickable text={getText(exam?.name)} />
                <TextIconRow clickable text={getText(row?.dueInDays)} />
                <TextIconRow clickable text={getMoney(row?.price)} />
                <StatusSelect
                  large={false}
                  sx={{ maxWidth: '90px' }}
                  selected={'status' in row ? row.status : StatusEnum.ACTIVE}
                  statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
                  handleSelectMenu={(option) => handleEditStatus(option.value)}
                  disabled
                />
                <IconButtonRow
                  icon={<EditIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditExam(row);
                  }}
                />
              </STableRow>
            );
          }}
        />
      </STable>{' '}
      <STablePagination
        mt={2}
        registersPerPage={rowsPerPage}
        totalCountOfRegisters={loadExams ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
    </>
  );
};