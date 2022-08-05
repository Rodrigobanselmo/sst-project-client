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
import { ICompany } from 'core/interfaces/api/ICompany';
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
    { search, ...query, type: [CompanyTypesEnum.CLINIC] },
    rowsPerPage,
    type,
  );
  const { onStackOpenModal } = useModal();
  const uploadMutation = useMutUploadFile();
  // const downloadMutation = useMutDownloadFile(); //?download company

  const { push } = useRouter();

  const handleEditStatus = (status: StatusEnum) => {
    console.log(status); // TODO edit checklist status
  };

  const handleGoToCompany = (companyId: string) => {
    push(`${RoutesEnum.COMPANIES}/${companyId}`);
  };

  const onSelectRow = (company: ICompany) => {
    if (isSelect) {
      onSelectData(company);
    } else handleGoToCompany(company.id);
  };

  return (
    <>
      {!isSelect && <STableTitle icon={SClinicIcon}>Empresas</STableTitle>}
      <STableSearch
        onAddClick={() => onStackOpenModal(ModalEnum.COMPANY_EDIT)}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <STable
        loading={isLoading}
        rowsNumber={rowsPerPage}
        columns={`${
          selectedData ? '15px ' : ''
        }minmax(200px, 4fr) minmax(200px, 3fr) minmax(150px, 1fr) 130px 70px 90px`}
      >
        <STableHeader>
          {selectedData && <STableHRow></STableHRow>}
          <STableHRow>Empresa</STableHRow>
          <STableHRow>Fantasia</STableHRow>
          <STableHRow>Grupo</STableHRow>
          <STableHRow>CNPJ</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
          <STableHRow justifyContent="center">Status</STableHRow>
          {/* <STableHRow justifyContent="center">Baixar</STableHRow> //?download company */}
          {/* <STableHRow justifyContent="center">Enviar</STableHRow>  //?download company */}
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
                <TextIconRow clickable text={row.name} />
                <TextIconRow clickable text={row.fantasy} />
                <TextIconRow clickable text={row?.group?.name || '-- '} />
                <TextIconRow clickable text={cnpjMask.mask(row.cnpj)} />
                <IconButtonRow icon={<EditIcon />} />
                <StatusSelect
                  large
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
                {/* <STagButton  //?download company
                  text="Baixar"
                  loading={
                    downloadMutation.isLoading &&
                    !!downloadMutation.variables &&
                    !!downloadMutation.variables.includes(
                      ApiRoutesEnum.DOWNLOAD_EMPLOYEES,
                    )
                  }
                  onClick={() =>
                    downloadMutation.mutate(
                      ApiRoutesEnum.DOWNLOAD_EMPLOYEES + `/${row.id}`,
                    )
                  }
                  large
                  icon={SDownloadIcon}
                />
                <STagButton
                  text="Enviar"
                  large
                  icon={SUploadIcon}
                  onClick={() =>
                    onStackOpenModal(
                      ModalEnum.UPLOAD,
                      ApiRoutesEnum.UPLOAD_EMPLOYEES,
                    )
                  }
                />  //?download company */}
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
      <ModalUploadFile
        loading={uploadMutation.isLoading}
        onConfirm={async (files: File[], path: string) =>
          await uploadMutation
            .mutateAsync({
              file: files[0],
              path: path,
            })
            .catch(() => {})
        }
        maxFiles={1}
        accept={
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      />
    </>
  );
};
