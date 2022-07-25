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
import { initialCharacterizationState } from 'components/organisms/modals/ModalAddCharacterization/hooks/useEditCharacterization';
import dayjs from 'dayjs';
import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';

import SCharacterizationIcon from 'assets/icons/SCharacterizationIcon';
import EditIcon from 'assets/icons/SEditIcon';
import SOrderIcon from 'assets/icons/SOrderIcon';

import { characterizationMap } from 'core/constants/maps/characterization.map';
import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';
import { useModal } from 'core/hooks/useModal';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { ICharacterization } from 'core/interfaces/api/ICharacterization';
import { useMutUpsertCharacterization } from 'core/services/hooks/mutations/manager/useMutUpsertCharacterization';
import { useQueryCharacterizations } from 'core/services/hooks/queries/useQueryCharacterizations';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import { sortNumber } from 'core/utils/sorts/number.sort';
import { sortString } from 'core/utils/sorts/string.sort';
interface ITableProps extends BoxProps {
  filterType?: CharacterizationTypeEnum;
}

export const CharacterizationTable: FC<ITableProps> = ({
  filterType,
  children,
}) => {
  const { data, isLoading } = useQueryCharacterizations();
  const { onOpenModal } = useModal();
  const { companyId, workspaceId } = useGetCompanyId();

  const { data: company } = useQueryCompany();
  const { data: hierarchies } = useQueryHierarchies();
  const { setTree, transformToTreeMap } = useHierarchyTreeActions();
  const upsertMutation = useMutUpsertCharacterization();

  useEffect(() => {
    if (hierarchies && company)
      setTree(transformToTreeMap(hierarchies, company));
  }, [setTree, company, transformToTreeMap, hierarchies]);

  const dataResult = useMemo(() => {
    if (!data) return [];

    if (filterType)
      return data
        .filter((data) => data.type == filterType)
        .sort((a, b) =>
          sortNumber(a.order ? a : 10000, b.order ? b : 10000, 'order'),
        );

    return [
      ...data
        .filter((e) => e.type === CharacterizationTypeEnum.GENERAL)
        .sort((a, b) =>
          sortNumber(a.order ? a : 10000, b.order ? b : 10000, 'order'),
        ),
      ...data
        .filter((e) =>
          [
            CharacterizationTypeEnum.ADMINISTRATIVE,
            CharacterizationTypeEnum.OPERATION,
            CharacterizationTypeEnum.SUPPORT,
          ].includes(e.type),
        )
        .sort((a, b) =>
          sortNumber(a.order ? a : 10000, b.order ? b : 10000, 'order'),
        )
        .sort((a, b) => sortString(a, b, 'type')),
      ...data
        .filter((e) =>
          [
            CharacterizationTypeEnum.WORKSTATION,
            CharacterizationTypeEnum.ACTIVITIES,
            CharacterizationTypeEnum.EQUIPMENT,
          ].includes(e.type),
        )
        .sort((a, b) =>
          sortNumber(a.order ? a : 10000, b.order ? b : 10000, 'order'),
        )
        .sort((a, b) => sortString(a, b, 'type')),
    ];
  }, [data, filterType]);

  const { handleSearchChange, results } = useTableSearch({
    data: dataResult,
    keys: ['name'],
  });

  const handleEdit = (data: ICharacterization) => {
    onOpenModal(ModalEnum.CHARACTERIZATION_ADD, { ...data } as Partial<
      typeof initialCharacterizationState
    >);
  };

  const handleEditPosition = async (
    { id, name, type }: ICharacterization,
    order: number,
  ) => {
    await upsertMutation
      .mutateAsync({ id, name, type, order, companyId, workspaceId })
      .catch(() => {});
  };

  return (
    <>
      <STableTitle icon={SCharacterizationIcon} iconSx={{ fontSize: 30 }}>
        Caracterização Básica
      </STableTitle>
      <STableSearch
        onAddClick={() =>
          onOpenModal(ModalEnum.CHARACTERIZATION_ADD, {
            companyId,
            workspaceId,
          } as Partial<typeof initialCharacterizationState>)
        }
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      {children}
      <STable
        loading={isLoading}
        columns="minmax(200px, 2fr) minmax(200px, 2fr) 150px 70px 100px 110px 90px"
      >
        <STableHeader>
          <STableHRow>Nome</STableHRow>
          <STableHRow>Descrição</STableHRow>
          <STableHRow justifyContent="center">Tipo</STableHRow>
          <STableHRow justifyContent="center">N.º Fotos</STableHRow>
          <STableHRow justifyContent="center">Criação</STableHRow>
          <STableHRow justifyContent="center">Posição</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody<typeof data[0]>
          rowsData={results}
          renderRow={(row) => {
            const text =
              (characterizationMap[row.type]?.type
                ? characterizationMap[row.type]?.type + '\n'
                : '') + characterizationMap[row.type]?.name || '--';

            return (
              <STableRow key={row.id}>
                <TextIconRow text={row.name || '--'} />
                <TextIconRow text={row.description || '--'} />
                <TextIconRow
                  justifyContent="center"
                  textAlign={'center'}
                  text={text}
                />
                <TextIconRow
                  justifyContent="center"
                  text={row?.photos?.length ? String(row?.photos?.length) : '0'}
                />
                <TextIconRow
                  text={dayjs(row.created_at).format('DD/MM/YYYY')}
                  justifyContent="center"
                />{' '}
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
