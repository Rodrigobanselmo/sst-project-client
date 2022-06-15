import { FC } from 'react';

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
import { ModalAddEnvironment } from 'components/organisms/modals/ModalAddEnvironment';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { StatusEnum } from 'project/enum/status.enum';

import EditIcon from 'assets/icons/SEditIcon';
import SEnvironmentIcon from 'assets/icons/SEnvironmentIcon';

import { environmentMap } from 'core/constants/maps/environment.map';
import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { IEnvironment } from 'core/interfaces/api/IEnvironment';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { useQueryEnvironments } from 'core/services/hooks/queries/useQueryEnvironments';
import { sortData } from 'core/utils/sorts/data.sort';

export const EnvironmentTable: FC<BoxProps> = () => {
  const { data, isLoading } = useQueryEnvironments();
  const { onOpenModal } = useModal();
  const { push } = useRouter();
  const { companyId, workspaceId } = useGetCompanyId();

  const { handleSearchChange, results } = useTableSearch({
    data,
    keys: ['name'],
    sort: (a, b) => sortData(a, b, 'created_at'),
  });

  const handleEditStatus = (status: StatusEnum) => {
    console.log(status); // TODO edit checklist status
  };

  const handleEdit = (data: IEnvironment) => {
    onOpenModal(ModalEnum.ENVIRONMENT_ADD, { ...data });
  };

  const getParentName = (id?: string) => {
    if (!id) return '--';

    const parent = data.find((item) => item.id === id);
    if (!parent) return '--';

    return parent.name || '--';
  };

  return (
    <>
      <STableTitle icon={SEnvironmentIcon} iconSx={{ fontSize: 30 }}>
        Ambientes de Trabalho
      </STableTitle>
      <STableSearch
        onAddClick={() =>
          onOpenModal(ModalEnum.ENVIRONMENT_ADD, { companyId, workspaceId })
        }
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <STable
        loading={isLoading}
        columns="minmax(200px, 2fr) minmax(200px, 2fr) minmax(250px, 1fr)  150px 70px 100px 90px"
      >
        <STableHeader>
          <STableHRow>Nome</STableHRow>
          <STableHRow>Descrição</STableHRow>
          <STableHRow>Pertencente ao Ambiente</STableHRow>
          <STableHRow justifyContent="center">Tipo</STableHRow>
          <STableHRow justifyContent="center">N.º Fotos</STableHRow>
          <STableHRow justifyContent="center">Criação</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody<typeof data[0]>
          rowsData={results}
          renderRow={(row) => {
            return (
              <STableRow key={row.id}>
                <TextIconRow text={row.name || '--'} />
                <TextIconRow text={row.description || '--'} />
                <TextIconRow text={getParentName(row.parentEnvironmentId)} />
                <TextIconRow
                  justifyContent="center"
                  text={environmentMap[row.type]?.name || '--'}
                />
                <TextIconRow
                  justifyContent="center"
                  text={row?.photos?.length ? String(row?.photos?.length) : '0'}
                />
                <TextIconRow
                  text={dayjs(row.created_at).format('DD/MM/YYYY')}
                  justifyContent="center"
                />
                <IconButtonRow
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(row);
                  }}
                  icon={<EditIcon />}
                />
              </STableRow>
            );
          }}
        />
      </STable>
      <ModalAddEnvironment />
    </>
  );
};
