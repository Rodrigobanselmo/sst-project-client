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
import { STableButton } from 'components/atoms/STable/components/STableButton';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import SText from 'components/atoms/SText';
import { initialExamRiskState } from 'components/organisms/modals/ModalEditExamRisk/hooks/useEditExams';
import { initialCompanySelectState } from 'components/organisms/modals/ModalSelectCompany';
import { company } from 'faker/locale/zh_TW';
import { StatusEnum } from 'project/enum/status.enum';

import EditIcon from 'assets/icons/SEditIcon';
import { SExamIcon } from 'assets/icons/SExamIcon';
import SReloadIcon from 'assets/icons/SReloadIcon';
import { SRiskFactorIcon } from 'assets/icons/SRiskFactorIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { useThrottle } from 'core/hooks/useThrottle';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IExamToRisk } from 'core/interfaces/api/IExam';
import { useMutCopyExamRisk } from 'core/services/hooks/mutations/checklist/exams/useMutCopyExamRisk/useMutCopyExamRisk';
import { IQueryExam } from 'core/services/hooks/queries/useQueryExams/useQueryExams';
import { useQueryExamsRisk } from 'core/services/hooks/queries/useQueryExamsRisk/useQueryExamsRisk';
import { queryClient } from 'core/services/queryClient';
import { getCompanyName } from 'core/utils/helpers/companyName';

export const getExamPeriodic = (row: Partial<IExamToRisk>) => {
  const periodic = [] as string[];

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
  { children?: any } & BoxProps & {
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
    companyId,
    isFetching,
    isRefetching,
    refetch,
  } = useQueryExamsRisk(page, { search }, rowsPerPage);

  const { onStackOpenModal } = useModal();
  const copyExamMutation = useMutCopyExamRisk();
  const { preventWarn } = usePreventAction();

  const onImportExams = () => {
    onStackOpenModal(ModalEnum.COMPANY_SELECT, {
      title: 'Selecione a Empresa que deseja copiar os exames',
      onSelect: (companySelected: ICompany) => {
        preventWarn(
          <SText textAlign={'justify'}>
            Você tem certeza que deseja importar toda a relação de Exame e
            riscos da empresa <b>{getCompanyName(companySelected)}</b>
            <SText fontSize={13} mt={6} textAlign={'justify'}>
              Exames que já estão presentes na tabela atual serão ignorados na
              importação (Caso já possua um exame de &quot;Audiometria&quot;
              vinculado ao Ruído, ele não será considerado na importação caso a
              outra empresa possua)
            </SText>
          </SText>,
          () =>
            copyExamMutation.mutateAsync({
              companyId,
              fromCompanyId: companySelected.id,
            }),
          { confirmText: 'Importar', tag: 'add' },
        );
      },
    } as Partial<typeof initialCompanySelectState>);
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

  const onRefetchThrottle = useThrottle(() => {
    refetch();
    // invalidate next or previous pages
    queryClient.invalidateQueries([QueryEnum.EXAMS_RISK_DATA]);
    queryClient.invalidateQueries([QueryEnum.EXAMS_RISK]);
  }, 1000);

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
            icon={SExamIcon}
          >
            Exames
          </STableTitle>
        </>
      )}
      <STableSearch
        onAddClick={onAddExam}
        onExportClick={onImportExams}
        onChange={(e) => handleSearchChange(e.target.value)}
        loadingReload={loadExams || isFetching || isRefetching}
        onReloadClick={onRefetchThrottle}
      />
      <STable
        loading={loadExams || copyExamMutation.isLoading}
        rowsNumber={rowsPerPage}
        columns={`${
          selectedData ? '15px ' : ''
        }minmax(250px, 5fr) minmax(150px, 5fr) 120px 55px 135px ${
          // eslint-disable-next-line no-constant-condition
          false ? '180px' : ''
        }90px 80px`}
      >
        <STableHeader>
          {selectedData && <STableHRow></STableHRow>}
          <STableHRow>Risco</STableHRow>
          <STableHRow>Exame</STableHRow>
          <STableHRow>Periodicidade</STableHRow>
          <STableHRow>Sexo</STableHRow>
          <STableHRow>Faixa etária</STableHRow>
          {/* <STableHRow justifyContent="center">
            Peridiocidade
            <span style={{ fontSize: 9, margin: '1px 0 0px 5px' }}>
              (Comorbidades)
            </span>
          </STableHRow> */}
          <STableHRow justifyContent="center">Peridiocidade</STableHRow>
          {/* <STableHRow justifyContent="center">Status</STableHRow> */}
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody<(typeof exams)[0]>
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
                    row?.validityInMonths
                      ? row?.validityInMonths + ' meses'
                      : '-'
                  }
                />{' '}
                {/* <TextIconRow
                  clickable
                  justifyContent="center"
                  align="center"
                  text={
                    row?.lowValidityInMonths
                      ? row?.lowValidityInMonths + ' meses'
                      : '-'
                  }
                /> */}
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
