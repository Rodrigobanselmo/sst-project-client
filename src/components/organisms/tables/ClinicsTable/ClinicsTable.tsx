import { FC } from 'react';

import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
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
import { ModalEditCompany } from 'components/organisms/modals/company/ModalEditCompany';
import { ModalUploadFile } from 'components/organisms/modals/ModalUploadFile';
import { ModalUploadPhoto } from 'components/organisms/modals/ModalUploadPhoto';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { useRouter } from 'next/router';
import { CompanyTypesEnum } from 'project/enum/company-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import SClinicIcon from 'assets/icons/SClinicIcon';
import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IAddress, ICompany } from 'core/interfaces/api/ICompany';
import { useMutUploadFile } from 'core/services/hooks/mutations/general/useMutUploadFile';
import {
  IQueryCompanies,
  IQueryCompaniesTypes,
  useQueryCompanies,
} from 'core/services/hooks/queries/useQueryCompanies';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';

export const ClinicsTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (company: ICompany) => void;
    selectedData?: ICompany[];
    query?: IQueryCompanies;
    type?: IQueryCompaniesTypes;
  }
> = ({ rowsPerPage = 8, onSelectData, selectedData, query, type }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();
  const isSelect = !!onSelectData;

  const { companies, count, isLoading } = useQueryCompanies(
    page,
    { search, ...query, isClinic: true },
    rowsPerPage,
    type,
  );
  const { onStackOpenModal } = useModal();

  const { push } = useRouter();

  const handleEditStatus = (status: StatusEnum) => {
    console.log(status); // TODO edit checklist status
  };

  const handleGoToClinic = (companyId: string) => {
    push(`${RoutesEnum.CLINICS}/${companyId}`);
  };

  const onSelectRow = (company: ICompany) => {
    if (isSelect) {
      onSelectData(company);
    } else handleGoToClinic(company.id);
  };

  const getAddress = (address?: IAddress) => {
    if (!address) return '';
    return `${address.street}, ${address.neighborhood}`;
  };

  return (
    <>
      {!isSelect && <STableTitle icon={SClinicIcon}>Clínicas</STableTitle>}
      <STableSearch
        onAddClick={() => onStackOpenModal(ModalEnum.CLINIC_EDIT)}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <STable
        loading={isLoading}
        rowsNumber={rowsPerPage}
        columns={`${
          selectedData ? '15px ' : ''
        }minmax(200px, 4fr) minmax(200px, 5fr) minmax(150px, 1fr) 50px 100px 70px 90px`}
      >
        <STableHeader>
          {selectedData && <STableHRow></STableHRow>}
          <STableHRow>Clínica</STableHRow>
          <STableHRow>Endereço</STableHRow>
          <STableHRow>Cidade</STableHRow>
          <STableHRow>UF</STableHRow>
          <STableHRow>Telefone</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
          <STableHRow justifyContent="center">Status</STableHRow>
        </STableHeader>
        <STableBody<typeof companies[0]>
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          rowsData={companies}
          renderRow={(row) => {
            return (
              <STableRow
                clickable
                onClick={() => onSelectRow(row)}
                key={row.id}
              >
                {selectedData && (
                  <SCheckBox
                    label=""
                    checked={
                      !!selectedData.find((company) => company.id === row.id)
                    }
                  />
                )}
                <TextIconRow clickable text={row.fantasy} />
                <TextIconRow clickable text={getAddress(row.address)} />
                <TextIconRow clickable text={row?.address?.city || '-'} />
                <TextIconRow clickable text={row?.address?.state} />
                <TextIconRow
                  clickable
                  text={row?.contacts?.[0]?.phone || '-'}
                />
                <IconButtonRow icon={<EditIcon />} />
                <StatusSelect
                  sx={{ maxWidth: '120px' }}
                  selected={row.status}
                  disabled={isSelect}
                  statusOptions={[
                    StatusEnum.PENDING,
                    StatusEnum.ACTIVE,
                    StatusEnum.INACTIVE,
                  ]}
                  handleSelectMenu={(option, e) => {
                    e.stopPropagation();
                    handleEditStatus(option.value);
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
        totalCountOfRegisters={isLoading ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
    </>
  );
};
