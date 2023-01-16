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
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import { STableButton } from 'components/atoms/STable/components/STableButton';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import SText from 'components/atoms/SText';
import { initialBlankState } from 'components/organisms/modals/ModalBlank/ModalBlank';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';

import SReloadIcon from 'assets/icons/SReloadIcon';

import { eSocialEventMap } from 'core/constants/maps/esocial-events.map';
import { statusOptionsConstantESocial } from 'core/constants/maps/status-options.constant';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IESocialBatch } from 'core/interfaces/api/IEvent';
import { useQueryEventBatch } from 'core/services/hooks/queries/useQueryEventBatch/useQueryEventBatch';
import { IQueryEvents } from 'core/services/hooks/queries/useQueryEvents/useQueryEvents';
import { dateToString } from 'core/utils/date/date-format';

export const ESocialBatchTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (event: IESocialBatch) => void;
    selectedData?: IESocialBatch[];
    query?: IQueryEvents;
  }
> = ({ rowsPerPage = 8, onSelectData, selectedData }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();
  const { onStackOpenModal } = useModal();

  const isSelect = !!onSelectData;

  const {
    data: eventBatch,
    isLoading,
    isFetching,
    isRefetching,
    count,
    refetch,
  } = useQueryEventBatch(page, { search }, rowsPerPage);

  const onSelectRow = (risk: IESocialBatch) => {
    if (isSelect) {
      onSelectData(risk);
    }
  };
  const onViewXMl = (event: IESocialBatch) => {
    const response = event.response || {};

    onStackOpenModal(ModalEnum.MODAL_BLANK, {
      title: 'Visualizar XML',
      content: () => (
        <Box>
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
    { text: 'Lote', column: '50px', justifyContent: 'center' },
    { text: 'Empresa', column: 'minmax(180px, 240px)' },
    { text: 'Data', column: '160px' },
    { text: 'Evento', column: '1fr' },
    { text: 'Status', column: '125px', justifyContent: 'center' },
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
        <STableBody<typeof eventBatch[0]>
          rowsData={eventBatch}
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
                <TextIconRow justify="center" clickable text={row.id} />
                <TextCompanyRow showCNPJ clickable company={row.company} />
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
