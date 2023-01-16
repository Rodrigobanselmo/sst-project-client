import { FC } from 'react';
import JSONPretty from 'react-json-pretty';
import XMLViewer from 'react-xml-viewer';

import PreviewIcon from '@mui/icons-material/Preview';
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
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import { TextCompanyRow } from 'components/atoms/STable/components/Rows/TextCompanyRow';
import { TextEmployeeRow } from 'components/atoms/STable/components/Rows/TextEmployeeRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import { STableButton } from 'components/atoms/STable/components/STableButton';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import SText from 'components/atoms/SText';
import { initialBlankState } from 'components/organisms/modals/ModalBlank/ModalBlank';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { EmployeeESocialEventActionEnum } from 'project/enum/esocial-event-action.enum';
import { StatusEnum } from 'project/enum/status.enum';

import SReloadIcon from 'assets/icons/SReloadIcon';

import { eSocialEventMap } from 'core/constants/maps/esocial-events.map';
import { eSocialEventActionMap } from 'core/constants/maps/esocial-events.map copy';
import { statusOptionsConstantESocial } from 'core/constants/maps/status-options.constant';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IESocialEvent } from 'core/interfaces/api/IEvent';
import {
  IQueryEvents,
  useQueryEvents,
} from 'core/services/hooks/queries/useQueryEvents/useQueryEvents';
import { dateToString } from 'core/utils/date/date-format';

export const ESocialEventTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (event: IESocialEvent) => void;
    selectedData?: IESocialEvent[];
    query?: IQueryEvents;
  }
> = ({ rowsPerPage = 8, onSelectData, selectedData }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const isSelect = !!onSelectData;

  const {
    data: risks,
    isLoading,
    count,
    isFetching,
    isRefetching,
    refetch,
  } = useQueryEvents(page, { search }, rowsPerPage);

  const { onStackOpenModal } = useModal();

  const onSelectRow = (risk: IESocialEvent) => {
    if (isSelect) {
      onSelectData(risk);
    }
  };

  const onViewXMl = (event: IESocialEvent) => {
    const xml = (event.eventXml || '').replaceAll('undefined', '*****');

    const response = event?.response || {};

    onStackOpenModal(ModalEnum.MODAL_BLANK, {
      title: 'Visualizar XML',
      content: () => (
        <Box>
          <SText color="text.light" fontSize={13} mt={1}>
            Envio eSocial
          </SText>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'grey.400',
              backgroundColor: 'white',
              p: 5,
              borderRadius: 1,
              fontSize: 12,
              width: 800,
              maxHeight: 300,
              overflow: 'auto',
              mb: 10,
            }}
          >
            <XMLViewer xml={xml} />
          </Box>
          <SText color="text.light" fontSize={13} mt={1}>
            Retorno eSocial
          </SText>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'grey.400',
              backgroundColor: 'white',
              p: 5,
              borderRadius: 1,
              fontSize: 12,
              width: 800,
              maxHeight: 300,
              overflow: 'auto',
            }}
          >
            <JSONPretty id="json-pretty" data={response} />
          </Box>
        </Box>
      ),
    } as Partial<typeof initialBlankState>);
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Empresa', column: 'minmax(180px, 240px)' },
    { text: 'Funcionário', column: 'minmax(160px, 1fr)' },
    { text: 'Tipo', column: '120px' },
    { text: 'Data', column: '160px' },
    { text: 'Evento', column: '90px' },
    { text: 'Status', column: '125px', justifyContent: 'center' },
    { text: 'Lote', column: '90px', justifyContent: 'center' },
    { text: 'Recibo', column: '170px' },
    { text: 'XML', column: '80px', justifyContent: 'center' },
  ];

  if (selectedData) header.unshift({ text: '', column: '15px' });

  return (
    <>
      <STableSearch
        // onAddClick={onAddRisk}
        onChange={(e) => handleSearchChange(e.target.value)}
      >
        <STableButton
          text="autualizar"
          onClick={() => {
            refetch();
          }}
          loading={isLoading || isFetching || isRefetching}
          sx={{ mr: 'auto', height: 30, minWidth: 30 }}
          icon={SReloadIcon}
          color="grey.500"
        />
      </STableSearch>
      <STable
        loading={isLoading}
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
            const action = eSocialEventActionMap[row?.action];
            const isExclude =
              action?.value === EmployeeESocialEventActionEnum.EXCLUDE;
            const isModify =
              action?.value === EmployeeESocialEventActionEnum.MODIFY;

            return (
              <STableRow
                onClick={() => onSelectRow(row)}
                clickable
                key={row.id}
                status={isExclude ? 'inactive' : isModify ? 'info' : 'none'}
              >
                {selectedData && (
                  <SCheckBox
                    label=""
                    checked={!!selectedData.find((exam) => exam.id === row.id)}
                  />
                )}
                <TextCompanyRow showCNPJ clickable company={row.company} />
                <TextEmployeeRow clickable employee={row.employee} />
                <TextIconRow clickable text={action?.name} />
                <TextIconRow
                  clickable
                  text={dateToString(row.created_at, 'DD/MM/YYYY HH:mm:ss')}
                />
                <TextIconRow clickable text={eSocialEventMap[row.type]?.name} />
                <StatusSelect
                  large={false}
                  options={statusOptionsConstantESocial}
                  sx={{ maxWidth: '100%' }}
                  selected={'status' in row ? row.status : StatusEnum.PENDING}
                  statusOptions={[]}
                  disabled
                />
                <TextIconRow justify="center" clickable text={row.batchId} />
                <TextIconRow clickable text={row.receipt || '-'} />
                <SFlex justify="center">
                  <IconButtonRow
                    tooltipTitle="Visualizar XML"
                    icon={<PreviewIcon />}
                    sx={{
                      color: 'grey.600',
                    }}
                    onClick={() => onViewXMl(row)}
                  />
                </SFlex>
              </STableRow>
            );
          }}
        />
      </STable>{' '}
      <STablePagination
        mt={2}
        registersPerPage={rowsPerPage}
        totalCountOfRegisters={isLoading ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
    </>
  );
};
