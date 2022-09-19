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
import SText from 'components/atoms/SText';
import { initialExamRiskState } from 'components/organisms/modals/ModalEditExamRisk/hooks/useEditExams';
import { StatusEnum } from 'project/enum/status.enum';

import EditIcon from 'assets/icons/SEditIcon';
import { SRiskFactorIcon } from 'assets/icons/SRiskFactorIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IExamToRisk } from 'core/interfaces/api/IExam';
import { IQueryExam } from 'core/services/hooks/queries/useQueryExams/useQueryExams';
import { useQueryExamsRisk } from 'core/services/hooks/queries/useQueryExamsRisk/useQueryExamsRisk';

export const getExamPeriodic = (row: Partial<IExamToRisk>) => {
  const periodic = [];

  if (row.isAdmission) periodic.push('Admissional');
  if (row.isPeriodic) periodic.push('Periódico');
  if (row.isChange) periodic.push('Mudança');
  if (row.isReturn) periodic.push('Retorno');
  if (row.isDismissal) periodic.push('Demissional');

  return {
    text: periodic.map((p) => p.substring(0, 1)).join(', '),
    tooltip: periodic.join(', '),
  };
};

export const getExamAge = (exam: Partial<IExamToRisk>) => {
  if (!exam.toAge && !exam.fromAge) return 'todas';
  if (!exam.toAge && exam.fromAge)
    return 'a partir de ' + exam.fromAge + ' anos';
  if (exam.toAge && !exam.fromAge) return 'até ' + exam.toAge + ' anos';
  return exam.fromAge + ' a ' + exam.toAge + ' anos';
};

export const ExamsRiskTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (company: IExamToRisk) => void;
    selectedData?: IExamToRisk[];
    query?: IQueryExam;
  }
> = ({ rowsPerPage = 8, onSelectData, selectedData }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const isSelect = !!onSelectData;

  const {
    data: exams,
    isLoading: loadExams,
    count,
  } = useQueryExamsRisk(page, { search }, rowsPerPage);

  const { onStackOpenModal } = useModal();

  const handleEditStatus = (status: StatusEnum) => {
    console.log(status); // TODO edit checklist status
  };

  const onAddExam = () => {
    onStackOpenModal(ModalEnum.EXAM_RISK, {} as typeof initialExamRiskState);
  };

  const onEditExam = (exam: IExamToRisk) => {
    onStackOpenModal(ModalEnum.EXAM_RISK, {
      ...(exam as any),
    } as typeof initialExamRiskState);
  };

  const onSelectRow = (exam: IExamToRisk) => {
    if (isSelect) {
      onSelectData(exam);
    } else onEditExam(exam);
  };

  return (
    <>
      {!isSelect && (
        <>
          <STableTitle
            subtitle={
              <>
                Aqui você pode relacionar exames a riscos especificos
                <SText fontSize={11}>
                  (Exemplo: Todos os cargos que possuirem o risco de Ruído e o
                  exame de Audiometria estiver vinculado, todos os empregados
                  terão que realizar tal exame)
                </SText>
              </>
            }
            icon={SRiskFactorIcon}
          >
            Riscos e seus Exames
          </STableTitle>
        </>
      )}
      <STableSearch
        onAddClick={onAddExam}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <STable
        loading={loadExams}
        rowsNumber={rowsPerPage}
        columns={`${
          selectedData ? '15px ' : ''
        }minmax(250px, 5fr) minmax(150px, 5fr) 120px 55px 135px 150px 90px 80px`}
      >
        <STableHeader>
          {selectedData && <STableHRow></STableHRow>}
          <STableHRow>Risco</STableHRow>
          <STableHRow>Exame</STableHRow>
          <STableHRow>Periodicidade</STableHRow>
          <STableHRow>Sexo</STableHRow>
          <STableHRow>Faixa etária</STableHRow>
          <STableHRow justifyContent="center">
            Validade
            <span style={{ fontSize: 9, margin: '1px 0 0px 5px' }}>
              (Comorbidades)
            </span>
          </STableHRow>
          <STableHRow justifyContent="center">Validade</STableHRow>
          {/* <STableHRow justifyContent="center">Status</STableHRow> */}
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody<typeof exams[0]>
          rowsData={exams}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
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
                <TextIconRow clickable text={row.risk?.name || '-'} />
                <TextIconRow clickable text={row.exam?.name || '-'} />
                <TextIconRow
                  clickable
                  tooltipTitle={getExamPeriodic(row).tooltip}
                  text={getExamPeriodic(row).text || '-'}
                />
                <TextIconRow
                  clickable
                  text={
                    (row.isMale ? 'M' : '') + (row.isFemale ? ' F' : '') || '-'
                  }
                />
                <TextIconRow clickable text={getExamAge(row) || '-'} />
                <TextIconRow
                  clickable
                  justifyContent="center"
                  text={
                    row?.lowValidityInMonths
                      ? row?.lowValidityInMonths + ' meses'
                      : '-'
                  }
                />{' '}
                <TextIconRow
                  clickable
                  justifyContent="center"
                  align="center"
                  text={
                    row?.validityInMonths
                      ? row?.validityInMonths + ' meses'
                      : '-'
                  }
                />
                {/* <TextIconRow clickable text={row.material || '-'} /> */}
                {/* <StatusSelect
                  large={false}
                  sx={{ maxWidth: '90px' }}
                  selected={'status' in row ? row.status : StatusEnum.ACTIVE}
                  statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
                  handleSelectMenu={(option) => handleEditStatus(option.value)}
                  disabled
                /> */}
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
      </STable>
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
