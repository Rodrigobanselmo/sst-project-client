import { FC } from 'react';

import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import { BoxProps } from '@mui/material';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { ModalEditCompany } from 'components/organisms/modals/company/ModalEditCompany';
import { ModalUploadFile } from 'components/organisms/modals/ModalUploadFile';
import { ModalUploadPhoto } from 'components/organisms/modals/ModalUploadPhoto';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { useRouter } from 'next/router';
import { StatusEnum } from 'project/enum/status.enum';

import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { useMutUploadFile } from 'core/services/hooks/mutations/useMutUploadFile';
import { useQueryCompanies } from 'core/services/hooks/queries/useQueryCompanies';
import { sortData } from 'core/utils/sorts/data.sort';

export const CompaniesTable: FC<BoxProps> = () => {
  const { data, isLoading } = useQueryCompanies();
  const { onOpenModal } = useModal();
  // const downloadMutation = useMutDownloadFile(); //?download company
  const uploadMutation = useMutUploadFile();

  const { push } = useRouter();
  const { handleSearchChange, results } = useTableSearch({
    data,
    keys: ['name', 'cnpj', 'fantasy'],
    sort: (a, b) => sortData(a, b, 'created_at'),
  });

  const handleEditStatus = (status: StatusEnum) => {
    console.log(status); // TODO edit checklist status
  };

  const handleGoToCompany = (companyId: string) => {
    console.log(companyId); // TODO edit checklist status
    push(`${RoutesEnum.COMPANIES}/${companyId}`);
  };

  return (
    <>
      <STableTitle icon={BusinessTwoToneIcon}>Empresas</STableTitle>
      <STableSearch
        onAddClick={() => onOpenModal(ModalEnum.COMPANY_EDIT)}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <STable
        loading={isLoading}
        columns="minmax(200px, 2fr) minmax(200px, 1fr) 70px 90px"
      >
        <STableHeader>
          <STableHRow>Empresa</STableHRow>
          <STableHRow>CNPJ</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
          <STableHRow justifyContent="center">Status</STableHRow>
          {/* <STableHRow justifyContent="center">Baixar</STableHRow> //?download company */}
          {/* <STableHRow justifyContent="center">Enviar</STableHRow>  //?download company */}
        </STableHeader>
        <STableBody<typeof data[0]>
          rowsData={results}
          renderRow={(row) => {
            return (
              <STableRow clickable key={row.id}>
                <TextIconRow
                  onClick={() => handleGoToCompany(row.id)}
                  text={row.name}
                />
                <TextIconRow
                  onClick={() => handleGoToCompany(row.id)}
                  text={row.cnpj}
                />
                <IconButtonRow
                  onClick={() => handleGoToCompany(row.id)}
                  icon={<EditIcon />}
                />
                <StatusSelect
                  large
                  sx={{ maxWidth: '120px' }}
                  selected={row.status}
                  statusOptions={[
                    StatusEnum.PENDING,
                    StatusEnum.ACTIVE,
                    StatusEnum.INACTIVE,
                  ]}
                  handleSelectMenu={(option) => handleEditStatus(option.value)}
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
                    onOpenModal(
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
      <ModalEditCompany />
      <ModalUploadPhoto />
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
