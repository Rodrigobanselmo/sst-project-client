import { FC, useEffect, useMemo } from 'react';

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
import { STagSelect } from 'components/molecules/STagSelect';
import dayjs from 'dayjs';
import { EnvironmentTypeEnum } from 'project/enum/environment-type.enum';

import EditIcon from 'assets/icons/SEditIcon';
import SEnvironmentIcon from 'assets/icons/SEnvironmentIcon';
import SOrderIcon from 'assets/icons/SOrderIcon';

import { environmentMap } from 'core/constants/maps/environment.map';
import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';
import { useModal } from 'core/hooks/useModal';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { IEnvironment } from 'core/interfaces/api/IEnvironment';
import { useMutUpsertEnvironment } from 'core/services/hooks/mutations/manager/useMutUpsertEnvironment';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryEnvironments } from 'core/services/hooks/queries/useQueryEnvironments';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import { sortNumber } from 'core/utils/sorts/number.sort';
import { sortString } from 'core/utils/sorts/string.sort';

export const EnvironmentTable: FC<BoxProps> = () => {
  const { data, isLoading } = useQueryEnvironments();
  const { onOpenModal } = useModal();
  const { companyId, workspaceId } = useGetCompanyId();

  const { data: company } = useQueryCompany();
  const { data: hierarchies } = useQueryHierarchies();
  const { setTree, transformToTreeMap } = useHierarchyTreeActions();
  const upsertMutation = useMutUpsertEnvironment();

  useEffect(() => {
    if (hierarchies && company)
      setTree(transformToTreeMap(hierarchies, company));
  }, [setTree, company, transformToTreeMap, hierarchies]);

  const dataResult = useMemo(() => {
    if (!data) return [];

    return [
      ...data
        .filter((e) => e.type === EnvironmentTypeEnum.GENERAL)
        .sort((a, b) =>
          sortNumber(a.order ? a : 10000, b.order ? b : 10000, 'order'),
        ),
      ...data
        .filter((e) => e.type !== EnvironmentTypeEnum.GENERAL)
        .sort((a, b) =>
          sortNumber(a.order ? a : 10000, b.order ? b : 10000, 'order'),
        )
        .sort((a, b) => sortString(a, b, 'type')),
    ];
  }, [data]);

  const { handleSearchChange, results } = useTableSearch({
    data: dataResult,
    keys: ['name'],
  });

  const handleEditPosition = async (
    { id, name, type }: IEnvironment,
    order: number,
  ) => {
    await upsertMutation
      .mutateAsync({ id, name, type, order, companyId, workspaceId })
      .catch(() => {});
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
        columns="minmax(200px, 2fr) minmax(200px, 2fr) 150px 70px 100px 110px 90px"
      >
        <STableHeader>
          <STableHRow>Nome</STableHRow>
          <STableHRow>Descrição</STableHRow>
          {/* <STableHRow>Pertencente ao Ambiente</STableHRow> */}
          <STableHRow justifyContent="center">Tipo</STableHRow>
          <STableHRow justifyContent="center">N.º Fotos</STableHRow>
          <STableHRow justifyContent="center">Criação</STableHRow>
          <STableHRow justifyContent="center">Posição</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody<typeof data[0]>
          rowsData={results}
          renderRow={(row) => {
            return (
              <STableRow key={row.id}>
                <TextIconRow text={row.name || '--'} />
                <TextIconRow text={row.description || '--'} />
                {/* <TextIconRow text={getParentName(row.parentEnvironmentId)} /> */}
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
                <STagSelect
                  options={results.map((_, index) => ({
                    name: `posição ${index + 1}`,
                    value: index + 1,
                  }))}
                  loading={
                    upsertMutation.isLoading &&
                    upsertMutation.variables &&
                    upsertMutation.variables.id === row.id
                  }
                  tooltipTitle={
                    'escolha a posição que o ambiente deve aparecer no documento'
                  }
                  text={`Posição ${!row?.order ? '-' : row?.order}`}
                  maxWidth={120}
                  handleSelectMenu={(option) =>
                    handleEditPosition(row, option.value)
                  }
                  icon={SOrderIcon}
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
    </>
  );
};
