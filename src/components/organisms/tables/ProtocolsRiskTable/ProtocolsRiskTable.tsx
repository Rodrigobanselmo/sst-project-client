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
import { initialProtocolRiskState } from 'components/organisms/modals/ModalEditProtocolRisk/hooks/useEditProtocols';
import { initialCompanySelectState } from 'components/organisms/modals/ModalSelectCompany';
import { company } from 'faker/locale/zh_TW';

import EditIcon from 'assets/icons/SEditIcon';
import SReloadIcon from 'assets/icons/SReloadIcon';
import { SRiskFactorIcon } from 'assets/icons/SRiskFactorIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { useThrottle } from 'core/hooks/useThrottle';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IProtocolToRisk } from 'core/interfaces/api/IProtocol';
import { useMutCopyProtocolRisk } from 'core/services/hooks/mutations/checklist/protocols/useMutCopyProtocolRisk/useMutCopyProtocolRisk';
import { IQueryProtocol } from 'core/services/hooks/queries/useQueryProtocols/useQueryProtocols';
import { useQueryProtocolsRisk } from 'core/services/hooks/queries/useQueryProtocolsRisk/useQueryProtocolsRisk';
import { queryClient } from 'core/services/queryClient';
import { getCompanyName } from 'core/utils/helpers/companyName';
import SProtocolIcon from 'assets/icons/SProtocolIcon';

export const ProtocolsRiskTable: FC<
  { children?: any } & BoxProps & {
      rowsPerPage?: number;
      onSelectData?: (company: IProtocolToRisk) => void;
      selectedData?: IProtocolToRisk[];
      query?: IQueryProtocol;
    }
> = ({ rowsPerPage = 8, onSelectData, selectedData }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const isSelect = !!onSelectData;

  const {
    data: protocols,
    isLoading: loadProtocols,
    count,
    companyId,
    isFetching,
    isRefetching,
    refetch,
  } = useQueryProtocolsRisk(page, { search }, rowsPerPage);

  const { onStackOpenModal } = useModal();
  const copyProtocolMutation = useMutCopyProtocolRisk();
  const { preventWarn } = usePreventAction();

  const onImportProtocols = () => {
    onStackOpenModal(ModalEnum.COMPANY_SELECT, {
      title: 'Selecione a Empresa que deseja copiar os protocolos',
      onSelect: (companySelected: ICompany) => {
        preventWarn(
          <SText textAlign={'justify'}>
            Você tem certeza que deseja importar toda a relação de Protocolos e
            riscos da empresa <b>{getCompanyName(companySelected)}</b>
            <SText fontSize={13} mt={6} textAlign={'justify'}>
              Protocolos que já estão presentes na tabela atual serão ignorados
              na importação (EX: Caso já possua um protocolo de &quot;Trabalho
              em altura&quot; vinculado ao risco de Trabalho em altura, ele não
              será considerado na importação caso a outra empresa possua)
            </SText>
          </SText>,
          () =>
            copyProtocolMutation.mutateAsync({
              companyId,
              fromCompanyId: companySelected.id,
            }),
          { confirmText: 'Importar', tag: 'add' },
        );
      },
    } as Partial<typeof initialCompanySelectState>);
  };

  const onAddProtocol = () => {
    onStackOpenModal(
      ModalEnum.PROTOCOL_RISK,
      {} as typeof initialProtocolRiskState,
    );
  };

  const onEditProtocol = (protocol: IProtocolToRisk) => {
    onStackOpenModal(ModalEnum.PROTOCOL_RISK, {
      ...(protocol as any),
    } as typeof initialProtocolRiskState);
  };

  const onSelectRow = (protocol: IProtocolToRisk) => {
    if (isSelect) {
      onSelectData(protocol);
    } else onEditProtocol(protocol);
  };

  const onRefetchThrottle = useThrottle(() => {
    refetch();
    // invalidate next or previous pages
    queryClient.invalidateQueries([QueryEnum.PROTOCOLS_RISK]);
  }, 1000);

  return (
    <>
      {!isSelect && (
        <>
          <STableTitle
            subtitle={
              <>
                Aqui você pode relacionar protocolos a riscos especificos
                <SText fontSize={11}>
                  (Exemplo: Todos os cargos que possuirem o risco de Trabalho em
                  altura e tiver um protocolo vinculado, todos os empregados
                  terão essa indicação no ASO)
                </SText>
              </>
            }
            icon={SProtocolIcon}
          >
            Relação de Protocolos
          </STableTitle>
        </>
      )}
      <STableSearch
        onAddClick={onAddProtocol}
        onExportClick={onImportProtocols}
        onReloadClick={onRefetchThrottle}
        loadingReload={loadProtocols || isFetching || isRefetching}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <STable
        loading={loadProtocols || copyProtocolMutation.isLoading}
        rowsNumber={rowsPerPage}
        columns={`${selectedData ? '15px ' : ''}250px minmax(150px, 5fr) 80px`}
      >
        <STableHeader>
          {selectedData && <STableHRow></STableHRow>}
          <STableHRow>Protocolo</STableHRow>
          <STableHRow>Risco</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody<(typeof protocols)[0]>
          rowsData={protocols}
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
                    checked={
                      !!selectedData.find((protocol) => protocol.id === row.id)
                    }
                  />
                )}
                <TextIconRow clickable text={row.protocol?.name || '-'} />
                <TextIconRow clickable text={row.risk?.name || '-'} />
                <IconButtonRow
                  icon={<EditIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditProtocol(row);
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
        totalCountOfRegisters={loadProtocols ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
    </>
  );
};
