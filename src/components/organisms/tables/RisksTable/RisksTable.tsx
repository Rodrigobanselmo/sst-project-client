import { FC } from 'react';

import { Box, BoxProps } from '@mui/material';
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
import { STagRisk } from 'components/atoms/STagRisk';
import { SCheckRiskDocInfo } from 'components/molecules/SCheckRiskDocInfo';
import { initialAddRiskState } from 'components/organisms/modals/ModalAddRisk/hooks/useAddRisk';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';

import EditIcon from 'assets/icons/SEditIcon';
import { SExamIcon } from 'assets/icons/SExamIcon';
import { SRiskFactorIcon } from 'assets/icons/SRiskFactorIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IExam } from 'core/interfaces/api/IExam';
import { IRiskDocInfo, IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useMutUpsertRiskDocInfo } from 'core/services/hooks/mutations/checklist/risk/useMutUpsertRiskDocInfo';
import {
  IQueryExam,
  useQueryExams,
} from 'core/services/hooks/queries/useQueryExams/useQueryExams';
import { useQueryRisks } from 'core/services/hooks/queries/useQueryRisks/useQueryRisks';

import { getRiskDoc } from '../RiskCompanyTable/RiskCompanyTable';

export const RisksTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (company: IRiskFactors) => void;
    selectedData?: IRiskFactors[];
    query?: IQueryExam;
  }
> = ({ rowsPerPage = 8, onSelectData, selectedData }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const isSelect = !!onSelectData;

  const {
    data: risks,
    isLoading: loadRisks,
    count,
    companyId,
  } = useQueryRisks(page, { search }, rowsPerPage);

  const { onStackOpenModal } = useModal();
  const upsertRiskDocInfo = useMutUpsertRiskDocInfo();

  const handleEditStatus = (status: StatusEnum) => {
    console.log(status); // TODO edit checklist status
  };

  const onAddRisk = () => {
    onStackOpenModal(ModalEnum.RISK_ADD, {} as typeof initialAddRiskState);
  };

  const onEditRisk = (risk: IRiskFactors) => {
    onStackOpenModal(ModalEnum.RISK_ADD, {
      ...(risk as any),
    } as typeof initialAddRiskState);
  };

  const onChangeRiskDocInfo = (docInfo: Partial<IRiskDocInfo>) => {
    if (!docInfo.riskId) return;

    upsertRiskDocInfo.mutateAsync({
      ...docInfo,
      riskId: docInfo.riskId,
    });
  };

  const onSelectRow = (risk: IRiskFactors) => {
    if (isSelect) {
      onSelectData(risk);
    } else onEditRisk(risk);
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Tipo', column: '40px' },
    { text: 'Nome', column: 'minmax(160px, 400px)' },
    { text: 'Sev.', column: '50px', justifyContent: 'center' },
    { text: 'Presente em', column: 'minmax(250px, 1fr)' },
    { text: 'Status', column: '90px', justifyContent: 'center' },
    { text: 'Editar', column: '80px', justifyContent: 'center' },
  ];

  if (selectedData) header.unshift({ text: '', column: '15px' });

  return (
    <>
      {!isSelect && (
        <STableTitle icon={SRiskFactorIcon}>
          Fatores de Risco e Perigos
        </STableTitle>
      )}
      <STableSearch
        onAddClick={onAddRisk}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <STable
        loading={loadRisks}
        rowsNumber={rowsPerPage}
        columns={header.map(({ column }) => column).join(' ')}
      >
        <STableHeader>
          {header.map(({ text, ...props }) => (
            <STableHRow key={text} {...props}>
              {text}
            </STableHRow>
          ))}
        </STableHeader>
        <STableBody<typeof risks[0]>
          rowsData={risks}
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
                <STagRisk hideRiskName riskFactor={row} />
                <TextIconRow clickable text={row.name || '-'} />
                <TextIconRow
                  justify="center"
                  clickable
                  text={row.severity || '-'}
                />
                <Box onClick={(e) => e.stopPropagation()}>
                  <SCheckRiskDocInfo
                    onUnmount={upsertRiskDocInfo.isError}
                    onSelectCheck={(docInfo) =>
                      onChangeRiskDocInfo({
                        ...docInfo,
                        riskId: row.id,
                      })
                    }
                    riskDocInfo={getRiskDoc(row, {
                      companyId,
                    })}
                  />
                </Box>
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
                    onEditRisk(row);
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
        totalCountOfRegisters={loadRisks ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
    </>
  );
};
