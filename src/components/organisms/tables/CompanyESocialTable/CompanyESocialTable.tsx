import { FC, useState } from 'react';

import CircleTwoToneIcon from '@mui/icons-material/CircleTwoTone';
import { Box, BoxProps } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SCheckBox from 'components/atoms/SCheckBox';
import SFlex from 'components/atoms/SFlex';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { SRadio } from 'components/molecules/form/radio';
import { initialSendESocialState } from 'components/organisms/modals/ModalSendESocial/ModalSendESocial';
import { EmployeeESocialEventTypeEnum } from 'project/enum/esocial-event-type.enum';

import { esocialEventOptionsList } from 'core/constants/maps/esocial-events.map';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { ICompany } from 'core/interfaces/api/ICompany';
import {
  IQueryCompanies,
  useQueryCompanies,
} from 'core/services/hooks/queries/useQueryCompanies';
import { getCompanyName } from 'core/utils/helpers/companyName';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';

export const CompanyESocialTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (company: ICompany) => void;
    selectedData?: ICompany[];
    query?: IQueryCompanies;
  }
> = ({ rowsPerPage = 8, query, onSelectData, selectedData }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();
  const [event, setEvent] = useState(EmployeeESocialEventTypeEnum.EXAM_2220);
  const isSelect = !!onSelectData;

  const { companies, count, isLoading } = useQueryCompanies(
    page,
    { search, selectReport: true, ...query },
    rowsPerPage,
  );

  const { onStackOpenModal } = useModal();

  const onEdit = (company: ICompany) => {
    onStackOpenModal(ModalEnum.MODAL_SEND_ESOCIAL, {
      companyId: company.id,
      company: company,
      type: EmployeeESocialEventTypeEnum.EXAM_2220,
    } as typeof initialSendESocialState);
  };

  const onChangeEvent = (event: EmployeeESocialEventTypeEnum) => {
    setEvent(event);
  };

  const onSelectRow = (company: ICompany) => {
    if (isSelect) {
      onSelectData(company);
    } else onEdit(company);
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Nome', column: 'minmax(160px, 300px)' },
    { text: 'CNPJ', column: 'minmax(160px, 1fr)' },
    { text: 'Pendente', column: '90px', justifyContent: 'center' },
    { text: 'Transmitido', column: '90px', justifyContent: 'center' },
    { text: 'Rejeitado', column: '90px', justifyContent: 'center' },
    { text: 'Gerado', column: '90px', justifyContent: 'center' },
    { text: '', column: '120px', justifyContent: 'center' },
  ];

  if (selectedData) header.unshift({ text: '', column: '15px' });

  return (
    <>
      <SRadio
        value={event}
        valueField="value"
        row
        formControlProps={{
          sx: {
            mt: -5,
            mb: 10,
            ml: '-4px',
            '& .MuiSvgIcon-root': {
              fontSize: 15,
            },
            '& .MuiTypography-root': {
              color: 'text.light',
            },
          },
        }}
        labelField="label"
        renderLabel={(v) => (
          <SText>
            {v.label.split('//')[0]}
            <SText component="span" ml={2} fontSize={12}>
              {v.label.split('//')[1]}
            </SText>
          </SText>
        )}
        onChange={(e) => onChangeEvent((e.target as any).value)}
        options={esocialEventOptionsList}
      />
      <STableSearch
        // onAddClick={onAddRisk}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
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
        <STableBody<typeof companies[0]>
          rowsData={companies}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            const esocial = row.report?.dailyReport?.esocial;
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
                <TextIconRow clickable text={getCompanyName(row)} py={7} />
                <TextIconRow clickable text={cnpjMask.mask(row.cnpj)} />
                <SFlex width="100%" center>
                  <STagButton
                    icon={CircleTwoToneIcon}
                    width={70}
                    loading={!!esocial?.processing}
                    textProps={{ sx: { color: 'grey.600' } }}
                    sx={{ minHeight: 25, maxHeight: 25 }}
                    iconProps={{
                      sx: { color: 'warning.main', fontSize: '15px' },
                    }}
                    text={String(esocial?.pending || '')}
                  />
                </SFlex>
                <SFlex width="100%" center>
                  <STagButton
                    minWidth={70}
                    sx={{ minHeight: 25, maxHeight: 25 }}
                    icon={CircleTwoToneIcon}
                    iconProps={{
                      sx: { color: 'success.main', fontSize: '15px' },
                    }}
                    text={String(esocial?.done || '')}
                  />
                </SFlex>
                <SFlex width="100%" center>
                  <STagButton
                    width={70}
                    sx={{ minHeight: 25, maxHeight: 25 }}
                    icon={CircleTwoToneIcon}
                    iconProps={{
                      sx: { color: 'error.main', fontSize: '15px' },
                    }}
                    text={String(esocial?.rejected || '')}
                  />
                </SFlex>
                <SFlex width="100%" center>
                  <STagButton
                    width={70}
                    icon={CircleTwoToneIcon}
                    sx={{ minHeight: 25, maxHeight: 25 }}
                    iconProps={{ sx: { color: 'grey.500', fontSize: '15px' } }}
                    text={String(esocial?.transmitted || '')}
                  />
                </SFlex>
                <Box ml={10}>
                  <SButton
                    variant="outlined"
                    xsmall
                    sx={{
                      width: '100%',
                      backgroundColor: 'white',
                      color: 'info.main',
                      borderColor: 'info.main',
                      '&:hover': {
                        borderColor: 'info.main',
                      },
                    }}
                  >
                    Enviar
                  </SButton>
                </Box>
                {/* <IconButtonRow
                  icon={<EditIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(row);
                  }}
                /> */}
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
