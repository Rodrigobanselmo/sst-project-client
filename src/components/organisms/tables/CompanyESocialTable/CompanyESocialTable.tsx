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
import { STableButton } from 'components/atoms/STable/components/STableButton';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import SWizardBox from 'components/atoms/SWizardBox';
import { SRadio } from 'components/molecules/form/radio';
import { initialSendESocial2210State } from 'components/organisms/modals/ModalSend2210ESocial/ModalSend2210ESocial';
import { initialSendESocialState } from 'components/organisms/modals/ModalSend2220ESocial/ModalSend2220ESocial';
import { initialSendESocial2240State } from 'components/organisms/modals/ModalSend2240ESocial/ModalSend2240ESocial';
import { EmployeeESocialEventTypeEnum } from 'project/enum/esocial-event-type.enum';

import SReloadIcon from 'assets/icons/SReloadIcon';

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

import { STTableEsocialBox } from './styles';

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

  const { companies, count, isLoading, refetch, isRefetching, isFetching } =
    useQueryCompanies(
      page,
      { search, selectReport: true, ...query },
      rowsPerPage,
    );

  const { onStackOpenModal } = useModal();

  // const onEdit = (company: ICompany) => {
  //   onStackOpenModal(ModalEnum.MODAL_SEND_ESOCIAL, {
  //     companyId: company.id,
  //     company: company,
  //     type: EmployeeESocialEventTypeEnum.EXAM_2220,
  //   } as typeof initialSendESocialState);
  // };

  const onSend2210 = (company: ICompany) => {
    onStackOpenModal(ModalEnum.MODAL_SEND_ESOCIAL_2210, {
      companyId: company.id,
      company: company,
    } as typeof initialSendESocial2210State);
  };

  const onSend2220 = (company: ICompany) => {
    onStackOpenModal(ModalEnum.MODAL_SEND_ESOCIAL_2220, {
      companyId: company.id,
      company: company,
      type: EmployeeESocialEventTypeEnum.EXAM_2220,
    } as typeof initialSendESocialState);
  };

  const onSend2240 = (company: ICompany) => {
    onStackOpenModal(ModalEnum.MODAL_SEND_ESOCIAL_2240, {
      companyId: company.id,
      company: company,
    } as typeof initialSendESocial2240State);
  };

  const onChangeEvent = (event: EmployeeESocialEventTypeEnum) => {
    setEvent(event);
  };

  const onSelectRow = (company: ICompany) => {
    if (isSelect) {
      onSelectData(company);
    }
    //  else onEdit(company);
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Nome', column: 'minmax(160px, 300px)' },
    { text: 'CNPJ', column: 'minmax(160px, 1fr)' },
    { text: 'evento', column: '65px', justifyContent: 'center' },
    { text: '', column: '100px', justifyContent: 'center' },
    { text: 'Pendente', column: '90px', justifyContent: 'center' },
    { text: 'Transmitido', column: '90px', justifyContent: 'center' },
    { text: 'Rejeitado', column: '90px', justifyContent: 'center' },
    { text: 'Gerado', column: '90px', justifyContent: 'center' },
  ];

  if (selectedData) header.unshift({ text: '', column: '15px' });

  return (
    <>
      {/* <SWizardBox sx={{ px: 5, py: 10, pb: 0, mb: 4 }}>
        <SRadio
          value={event}
          valueField="value"
          row
          formControlProps={{
            sx: {
              mt: -8,
              mb: 3,
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
      </SWizardBox> */}
      <SWizardBox sx={{ px: 5, py: 10 }}>
        <STableSearch
          // onAddClick={onAddRisk}
          // boxProps={{ mr: 'auto' }}
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
          <STableBody<typeof companies[0]>
            rowsData={companies}
            hideLoadMore
            rowsInitialNumber={rowsPerPage}
            renderRow={(row) => {
              const esocial = row.report?.dailyReport?.esocial;
              const S2210 = esocial?.S2210;
              const S2220 = esocial?.S2220;
              const S2240 = esocial?.S2240;

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
                        !!selectedData.find((exam) => exam.id === row.id)
                      }
                    />
                  )}
                  <TextIconRow
                    align="start"
                    clickable
                    text={getCompanyName(row)}
                    py={4}
                  />
                  <TextIconRow
                    align="start"
                    py={4}
                    clickable
                    text={cnpjMask.mask(row.cnpj)}
                  />
                  <STTableEsocialBox>
                    <TextIconRow center text={'S-2210'} />
                    <TextIconRow center text={'S-2220'} />
                    <TextIconRow center text={'S-2240'} />
                    <TextIconRow center text={'Total'} />
                  </STTableEsocialBox>

                  <STTableEsocialBox ml={0}>
                    <SButton
                      variant="outlined"
                      xsmall
                      onClick={(e) => {
                        e.stopPropagation();
                        onSend2210(row);
                      }}
                      sx={{
                        width: '100%',
                        backgroundColor: 'white',
                        color: 'grey.700',
                        borderColor: 'grey.700',
                        '&:hover': {
                          borderColor: 'grey.700',
                        },
                      }}
                    >
                      Transmitir
                    </SButton>
                    <SButton
                      variant="outlined"
                      xsmall
                      onClick={(e) => {
                        e.stopPropagation();
                        onSend2220(row);
                      }}
                      sx={{
                        width: '100%',
                        backgroundColor: 'white',
                        color: 'grey.700',
                        borderColor: 'grey.700',
                        '&:hover': {
                          borderColor: 'grey.700',
                        },
                      }}
                    >
                      Transmitir
                    </SButton>
                    <SButton
                      variant="outlined"
                      xsmall
                      onClick={(e) => {
                        e.stopPropagation();
                        onSend2240(row);
                      }}
                      sx={{
                        width: '100%',
                        backgroundColor: 'white',
                        color: 'grey.700',
                        borderColor: 'grey.700',
                        '&:hover': {
                          borderColor: 'grey.700',
                        },
                      }}
                    >
                      Transmitir
                    </SButton>
                  </STTableEsocialBox>

                  <STTableEsocialBox>
                    <TextIconRow
                      textAlign={'center'}
                      center
                      text={String(S2210?.pending || 0)}
                      {...(S2210?.pending && { color: 'warning.dark' })}
                    />
                    <TextIconRow
                      textAlign={'center'}
                      center
                      text={String(S2220?.pending || 0)}
                      {...(S2220?.pending && { color: 'warning.dark' })}
                    />
                    <TextIconRow
                      textAlign={'center'}
                      center
                      text={String(S2240?.pending || 0)}
                      {...(S2240?.pending && { color: 'warning.dark' })}
                    />
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
                  </STTableEsocialBox>
                  <STTableEsocialBox>
                    <TextIconRow
                      textAlign={'center'}
                      center
                      text={String(S2210?.done || 0)}
                      {...(S2210?.done && { color: 'success.dark' })}
                    />
                    <TextIconRow
                      textAlign={'center'}
                      center
                      text={String(S2220?.done || 0)}
                      {...(S2220?.done && { color: 'success.dark' })}
                    />
                    <TextIconRow
                      textAlign={'center'}
                      center
                      text={String(S2240?.done || 0)}
                      {...(S2240?.done && { color: 'success.dark' })}
                    />
                    <STagButton
                      minWidth={70}
                      sx={{ minHeight: 25, maxHeight: 25 }}
                      icon={CircleTwoToneIcon}
                      iconProps={{
                        sx: { color: 'success.main', fontSize: '15px' },
                      }}
                      text={String(esocial?.done || '')}
                    />
                  </STTableEsocialBox>
                  <STTableEsocialBox>
                    <TextIconRow
                      textAlign={'center'}
                      center
                      text={String(S2210?.rejected || 0)}
                      {...(S2210?.rejected && { color: 'error.dark' })}
                    />
                    <TextIconRow
                      textAlign={'center'}
                      center
                      text={String(S2220?.rejected || 0)}
                      {...(S2220?.rejected && { color: 'error.dark' })}
                    />
                    <TextIconRow
                      textAlign={'center'}
                      center
                      text={String(S2240?.rejected || 0)}
                      {...(S2240?.rejected && { color: 'error.dark' })}
                    />
                    <STagButton
                      width={70}
                      sx={{ minHeight: 25, maxHeight: 25 }}
                      icon={CircleTwoToneIcon}
                      iconProps={{
                        sx: { color: 'error.main', fontSize: '15px' },
                      }}
                      text={String(esocial?.rejected || '')}
                    />
                  </STTableEsocialBox>
                  <STTableEsocialBox>
                    <TextIconRow
                      textAlign={'center'}
                      center
                      text={String(S2210?.transmitted || 0)}
                      {...(S2210?.transmitted && { color: 'grey.600' })}
                    />
                    <TextIconRow
                      textAlign={'center'}
                      center
                      text={String(S2220?.transmitted || 0)}
                      {...(S2220?.transmitted && { color: 'grey.600' })}
                    />
                    <TextIconRow
                      textAlign={'center'}
                      center
                      text={String(S2240?.transmitted || 0)}
                      {...(S2240?.transmitted && { color: 'grey.600' })}
                    />
                    <STagButton
                      width={70}
                      icon={CircleTwoToneIcon}
                      sx={{ minHeight: 25, maxHeight: 25 }}
                      iconProps={{
                        sx: { color: 'grey.500', fontSize: '15px' },
                      }}
                      text={String(esocial?.transmitted || '')}
                    />
                  </STTableEsocialBox>

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
      </SWizardBox>
    </>
  );
};
