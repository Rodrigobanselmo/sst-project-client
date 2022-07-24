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
import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';
import { EnvironmentTypeEnum } from 'project/enum/environment-type.enum';

import EditIcon from 'assets/icons/SEditIcon';
import SEnvironmentIcon from 'assets/icons/SEnvironmentIcon';
import SOrderIcon from 'assets/icons/SOrderIcon';

import { allCharacterizationMap } from 'core/constants/maps/all-characterization.map';
import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';
import { useModal } from 'core/hooks/useModal';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { ICharacterization } from 'core/interfaces/api/ICharacterization';
import { IEnvironment } from 'core/interfaces/api/IEnvironment';
import { useMutUpsertCharacterization } from 'core/services/hooks/mutations/manager/useMutUpsertCharacterization';
import { useMutUpsertEnvironment } from 'core/services/hooks/mutations/manager/useMutUpsertEnvironment';
import { useQueryCharacterizations } from 'core/services/hooks/queries/useQueryCharacterizations';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryEnvironments } from 'core/services/hooks/queries/useQueryEnvironments';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import { isKeyOfEnum } from 'core/utils/helpers/iskeyOfEnum.utils';
import { sortNumber } from 'core/utils/sorts/number.sort';
import { sortString } from 'core/utils/sorts/string.sort';

interface ITableProps extends BoxProps {
  filterType?: EnvironmentTypeEnum | CharacterizationTypeEnum;
}

export const AllCharacterizationTable: FC<ITableProps> = ({
  filterType,
  children,
}) => {
  const { data: environments, isLoading: isLoadingEnv } =
    useQueryEnvironments();
  const { data: characterization, isLoading: isLoadingChar } =
    useQueryCharacterizations();

  const { onOpenModal } = useModal();
  const { companyId, workspaceId } = useGetCompanyId();

  const { data: company } = useQueryCompany();
  const { data: hierarchies } = useQueryHierarchies();
  const { setTree, transformToTreeMap } = useHierarchyTreeActions();
  const upsertEnvMutation = useMutUpsertEnvironment();
  const upsertCharMutation = useMutUpsertCharacterization();

  useEffect(() => {
    if (hierarchies && company)
      setTree(transformToTreeMap(hierarchies, company));
  }, [setTree, company, transformToTreeMap, hierarchies]);

  const dataResult = useMemo(() => {
    if (!environments || !characterization) return [];

    if (filterType)
      return [...environments, ...characterization].filter(
        (data) => data.type == filterType,
      );

    return [
      ...environments
        .filter((e) => e.type === EnvironmentTypeEnum.GENERAL)
        .sort((a, b) =>
          sortNumber(a.order ? a : 10000, b.order ? b : 10000, 'order'),
        ),
      ...environments
        .filter((e) => e.type !== EnvironmentTypeEnum.GENERAL)
        .sort((a, b) =>
          sortNumber(a.order ? a : 10000, b.order ? b : 10000, 'order'),
        )
        .sort((a, b) => sortString(a, b, 'type')),
      ...characterization
        .sort((a, b) =>
          sortNumber(a.order ? a : 10000, b.order ? b : 10000, 'order'),
        )
        .sort((a, b) => sortString(a, b, 'type')),
    ];
  }, [environments, characterization, filterType]);

  const { handleSearchChange, results } = useTableSearch({
    data: dataResult,
    keys: ['name'],
  });

  const handleEditPosition = async (
    { id, name, type }: IEnvironment | ICharacterization,
    order: number,
  ) => {
    if (isKeyOfEnum(type, EnvironmentTypeEnum))
      await upsertEnvMutation
        .mutateAsync({
          id,
          name,
          type: type as any,
          order,
          companyId,
          workspaceId,
        })
        .catch(() => {});

    if (isKeyOfEnum(type, CharacterizationTypeEnum))
      await upsertCharMutation
        .mutateAsync({
          id,
          name,
          type: type as any,
          order,
          companyId,
          workspaceId,
        })
        .catch(() => {});
  };

  const handleEdit = (data: IEnvironment) => {
    onOpenModal(ModalEnum.ALL_CHARACTERIZATION_ADD, { ...data });
  };

  return (
    <>
      <STableTitle icon={SEnvironmentIcon} iconSx={{ fontSize: 30 }}>
        Caracterização Básica
      </STableTitle>
      <STableSearch
        onAddClick={() =>
          onOpenModal(ModalEnum.ALL_CHARACTERIZATION_ADD, {
            companyId,
            workspaceId,
          } as typeof dataResult[0])
        }
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      {children}
      <STable
        loading={isLoadingEnv || isLoadingChar}
        columns="minmax(200px, 2fr) minmax(200px, 2fr) 150px 70px 100px 110px 90px"
      >
        <STableHeader>
          <STableHRow>Nome</STableHRow>
          <STableHRow>Descrição</STableHRow>
          <STableHRow justifyContent="center" ml={-5}>
            Tipo
          </STableHRow>
          <STableHRow justifyContent="center">N.º Fotos</STableHRow>
          <STableHRow justifyContent="center">Criação</STableHRow>
          <STableHRow justifyContent="center">Posição</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody<typeof environments[0]>
          rowsData={results}
          renderRow={(row) => {
            const text =
              (allCharacterizationMap[row.type]?.type
                ? allCharacterizationMap[row.type]?.type + '\n'
                : '') + allCharacterizationMap[row.type]?.name || '--';

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
                />
                <STagSelect
                  options={results.map((_, index) => ({
                    name: `posição ${index + 1}`,
                    value: index + 1,
                  }))}
                  loading={
                    upsertEnvMutation.isLoading &&
                    upsertEnvMutation.variables &&
                    upsertEnvMutation.variables.id === row.id
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

// <>
//   <ModalAddEnvironment />
//   <ModalSelectDocPgr />
//   <ModalAddRisk />
//   <ModalAddGho />
//   <ModalAddGenerateSource />
//   <ModalAddRecMed />
//   <ModalAddEpi />
//   <ModalAddProbability />
//   <ModalAddQuantity />
// </>
// <ModalAddWorkspace />
// <ModalSingleInput />
// <ModalExcelHierarchies />
// <ModalSelectHierarchy />

// import { ModalAddEnvironment } from 'components/organisms/modals/ModalAddEnvironment';
// import { ModalAddEpi } from 'components/organisms/modals/ModalAddEpi';
// import { ModalAddGenerateSource } from 'components/organisms/modals/ModalAddGenerateSource';
// import { ModalAddGho } from 'components/organisms/modals/ModalAddGHO';
// import { ModalAddProbability } from 'components/organisms/modals/ModalAddProbability';
// import { ModalAddQuantity } from 'components/organisms/modals/ModalAddQuantity';
// import { ModalAddRecMed } from 'components/organisms/modals/ModalAddRecMed';
// import { ModalAddRisk } from 'components/organisms/modals/ModalAddRisk';
// import { ModalAddWorkspace } from 'components/organisms/modals/ModalAddWorkspace';
// import { ModalExcelHierarchies } from 'components/organisms/modals/ModalExcelHierarchies';
// import { ModalSelectDocPgr } from 'components/organisms/modals/ModalSelectDocPgr';
// import { ModalSelectHierarchy } from 'components/organisms/modals/ModalSelectHierarchy';
// import { ModalSingleInput } from 'components/organisms/modals/ModalSingleInput';
