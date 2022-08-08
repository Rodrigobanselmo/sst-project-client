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
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { initialExamState } from 'components/organisms/modals/ModalAddExam/hooks/useEditExams';
import { ExamSelect } from 'components/organisms/tagSelects/ExamSelect';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';

import EditIcon from 'assets/icons/SEditIcon';
import { SExamIcon } from 'assets/icons/SExamIcon';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IExam } from 'core/interfaces/api/IExam';
import { useQueryExams } from 'core/services/hooks/queries/useQueryExams/useQueryExams';
import { getMoney } from 'core/utils/helpers/getMoney.utils';
import { getText } from 'core/utils/helpers/getText';

export const ClinicExamsTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (company: IExam) => void;
    selectedData?: IExam[];
  }
> = ({ rowsPerPage = 8, onSelectData, selectedData }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const isSelect = !!onSelectData;
  const { companyId } = useGetCompanyId();

  const {
    data: exams,
    isLoading: loadExams,
    count,
  } = useQueryExams(page, { search, clinicId: companyId }, rowsPerPage);

  const { onStackOpenModal } = useModal();

  const handleEditStatus = (status: StatusEnum) => {
    console.log(status); // TODO edit checklist status
  };

  const onAddExam = () => {
    onStackOpenModal(ModalEnum.EXAMS_CLINIC_ADD, {} as typeof initialExamState);
  };

  const onEditExam = (exam: IExam) => {
    onStackOpenModal(ModalEnum.EXAMS_CLINIC_ADD, {
      ...(exam as any),
    } as typeof initialExamState);
  };

  const onSelectRow = (exam: IExam) => {
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
      >
        {/* <ExamSelect
          color="success"
          sx={{ maxWidth: 0, opacity: 0, transform: 'translate(-40px, 10px)' }}
          id={IdsEnum.EXAMS_SELECT}
          onlyExam
          asyncLoad
          text={'adicionar'}
          tooltipTitle=""
          multiple={false}
          handleSelect={(options: IExam) => {
            if (options?.id) console.log(options);
          }}
        /> */}
      </STableSearch>
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
            const clinic = row?.examToClinic?.[0];

            return (
              <STableRow
                onClick={() => onSelectRow(row)}
                clickable
                key={row.id}
              >
                {selectedData && (
                  <SCheckBox
                    label=""
                    checked={!!selectedData.find((exam) => exam.id === row.id)}
                  />
                )}
                <TextIconRow clickable text={getText(row.name)} />
                <TextIconRow clickable text={getText(clinic?.dueInDays)} />
                <TextIconRow
                  clickable
                  text={getMoney(clinic?.pricings?.[0]?.price)}
                />
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
