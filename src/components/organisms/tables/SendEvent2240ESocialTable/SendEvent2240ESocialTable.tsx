import { FC } from 'react';
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
import { TextHierarchyRow } from 'components/atoms/STable/components/Rows/TextHierarchyRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import SText from 'components/atoms/SText';
import { initialBlankState } from 'components/organisms/modals/ModalBlank/ModalBlank';
import { employeeExamEvaluationTypeMap } from 'project/enum/employee-exam-history-evaluation.enum';
import { employeeExamTypeMap } from 'project/enum/employee-exam-history-type.enum';
import { esocialSendMap } from 'project/enum/esocial';

import SCheckIcon from 'assets/icons/SCheckIcon';
import { SCloseIcon } from 'assets/icons/SCloseIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IEvent2240 } from 'core/interfaces/api/IEvent';
import { dateToString } from 'core/utils/date/date-format';

export const SendEvent2240ESocialTable: FC<
  { children?: any } & BoxProps & {
      isLoading?: boolean;
      rowsPerPage?: number;
      onSelectData?: (company: IEvent2240) => void;
      selectedData?: IEvent2240[];
      events: IEvent2240[];
      company?: ICompany;
    }
> = ({
  rowsPerPage = 10,
  company,
  isLoading,
  onSelectData,
  selectedData,
  events,
}) => {
  const { page, setPage, results } = useTableSearch({
    data: events,
    keys: [],
    rowsPerPage,
  });

  const isSelect = !!onSelectData;
  const count = events.length;
  const { onStackOpenModal } = useModal();

  const onSelectRow = (company: IEvent2240) => {
    if (isSelect) {
      onSelectData(company);
    }
  };

  const onViewXMl = (event: IEvent2240) => {
    const xml = event.xml.replaceAll('undefined', '*****');
    onStackOpenModal(ModalEnum.MODAL_BLANK, {
      title: 'Visualizar XML',
      content: () => (
        <Box>
          {!!event?.errors?.length && (
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'grey.400',
                backgroundColor: 'white',
                p: 5,
                borderRadius: 1,
                fontSize: 12,
                width: 800,
                maxHeight: 500,
                overflow: 'auto',
                mb: 10,
              }}
            >
              <div onClick={(e) => e.stopPropagation()}>
                {event.errors.map((error) => {
                  return (
                    <SText
                      component="li"
                      key={error.message}
                      color="error.dark"
                      fontSize={13}
                      mt={1}
                    >
                      {error.message}
                    </SText>
                  );
                })}
              </div>
            </Box>
          )}
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'grey.400',
              backgroundColor: 'white',
              p: 5,
              borderRadius: 1,
              fontSize: 12,
              width: 800,
              maxHeight: 500,
              overflow: 'auto',
            }}
          >
            <XMLViewer xml={xml} />
          </Box>
        </Box>
      ),
    } as Partial<typeof initialBlankState>);
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Funcionário', column: 'minmax(160px, 220px)' },
    { text: 'Função', column: 'minmax(180px, 220px)' },
    { text: 'Empresa', column: 'minmax(180px, 1fr)' },
    { text: 'riscos', column: '100px' },
    { text: 'Data', column: '110px' },
    { text: 'Tipo', column: '60px' },
    { text: 'Disponível', column: '100px', justifyContent: 'center' },
    { text: 'XML', column: '45px', justifyContent: 'center' },
  ];

  if (selectedData) header.unshift({ text: '', column: '15px' });

  return (
    <>
      {/* <STableSearch
        // onAddClick={onAddRisk}
        onChange={(e) => handleSearchChange(e.target.value)}
      /> */}
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
        <STableBody<(typeof events)[0]>
          rowsData={results}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            const employee = row?.employee;
            const errors = row?.errors;

            const isError = errors?.length > 0;

            return (
              <STableRow
                onClick={() => onSelectRow(row)}
                key={row.id}
                status={esocialSendMap[row.type].rowStatus}
              >
                {selectedData && (
                  <SCheckBox
                    label=""
                    checked={!!selectedData.find((exam) => exam.id === row.id)}
                  />
                )}
                <TextEmployeeRow employee={employee} />
                <TextHierarchyRow
                  office={employee.hierarchy}
                  sector={employee.sectorHierarchy}
                />
                <TextCompanyRow showCNPJ clickable company={company} />
                <TextIconRow
                  clickable
                  tooltipProps={{ minLength: 2 }}
                  tooltipTitle={
                    <>
                      {row.risks?.map((name, index) => (
                        <>
                          {index} - {name}
                          <br />
                        </>
                      ))}
                    </>
                  }
                  text={`${row.risks.length} riscos`}
                />
                <TextIconRow text={dateToString(row.doneDate)} />
                <TextIconRow text={esocialSendMap[row.type]?.content} />

                <SFlex center>
                  <IconButtonRow
                    tooltipTitle={
                      isError ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          {errors.map((error) => {
                            return (
                              <SText
                                component="li"
                                key={error.message}
                                color="common.white"
                                fontSize={13}
                                mt={1}
                              >
                                {error.message}
                              </SText>
                            );
                          })}
                        </div>
                      ) : (
                        'Valido'
                      )
                    }
                    icon={isError ? <SCloseIcon /> : <SCheckIcon />}
                    sx={{
                      color: isError ? 'error.main' : 'success.main',
                    }}
                    onClick={() => onViewXMl(row)}
                  />
                </SFlex>
                <IconButtonRow
                  tooltipTitle="Visualizar XML"
                  icon={<PreviewIcon />}
                  sx={{
                    color: 'grey.600',
                  }}
                  onClick={() => onViewXMl(row)}
                />
              </STableRow>
            );
          }}
        />
      </STable>
      <STablePagination
        mt={2}
        registersPerPage={rowsPerPage}
        totalCountOfRegisters={count}
        currentPage={page}
        onPageChange={setPage}
      />
    </>
  );
};
