import { FC, useMemo } from 'react';

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
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STagSelect } from 'components/molecules/STagSelect';
import { initialCharacterizationState } from 'components/organisms/modals/ModalAddCharacterization/hooks/useEditCharacterization';
import dayjs from 'dayjs';
import {
  CharacterizationTypeEnum,
  getIsEnvironment,
} from 'project/enum/characterization-type.enum';

import SCharacterizationIcon from 'assets/icons/SCharacterizationIcon';
import EditIcon from 'assets/icons/SEditIcon';
import SOrderIcon from 'assets/icons/SOrderIcon';

import { characterizationMap } from 'core/constants/maps/characterization.map';
import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { ICharacterization } from 'core/interfaces/api/ICharacterization';
import { useMutUpsertCharacterization } from 'core/services/hooks/mutations/manager/useMutUpsertCharacterization';
import { useQueryCharacterizations } from 'core/services/hooks/queries/useQueryCharacterizations';
import { dateToString } from 'core/utils/date/date-format';
import { sortNumber } from 'core/utils/sorts/number.sort';
import { sortString } from 'core/utils/sorts/string.sort';

interface ITableProps extends BoxProps {
  filterType?: CharacterizationTypeEnum;
  onSelectData?: (notification: ICharacterization) => void;
  selectedData?: ICharacterization[];
  companyId?: string;
  workspaceId?: string;
}

export const CharacterizationTable: FC<ITableProps> = ({
  filterType,
  children,
  onSelectData,
  selectedData,
  companyId: _companyId,
  workspaceId: _workspaceId,
}) => {
  const { onOpenModal } = useModal();
  const { companyId: __companyId, workspaceId: __workspaceId } =
    useGetCompanyId();

  const companyId = _companyId || __companyId;
  const workspaceId = _workspaceId || __workspaceId;

  const { data, isLoading } = useQueryCharacterizations(1, {
    companyId,
    workspaceId,
  });

  const isSelect = !!onSelectData;
  const upsertMutation = useMutUpsertCharacterization();

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
    if (isSelect) {
      onSelectData(data);
    } else
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

  const isEnvironment = getIsEnvironment(filterType);

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
            ...(filterType && {
              type: filterType,
              characterizationType: isEnvironment
                ? 'environment'
                : 'characterization',
            }),
          } as Partial<typeof initialCharacterizationState>)
        }
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      {children}
      <STable
        loading={isLoading}
        columns={`${
          selectedData ? '15px ' : ''
        }minmax(200px, 2fr) minmax(200px, 2fr) 150px 70px 100px 110px 90px`}
      >
        <STableHeader>
          {selectedData && <div />}
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
              <STableRow clickable onClick={() => handleEdit(row)} key={row.id}>
                {selectedData && (
                  <SCheckBox
                    label=""
                    checked={!!selectedData.find((exam) => exam.id === row.id)}
                  />
                )}
                <TextIconRow clickable text={row.name || '--'} />
                <TextIconRow clickable text={row.description || '--'} />
                <TextIconRow
                  clickable
                  justifyContent="center"
                  textAlign={'center'}
                  text={text}
                />
                <TextIconRow
                  clickable
                  justifyContent="center"
                  text={row?.photos?.length ? String(row?.photos?.length) : '0'}
                />
                <TextIconRow
                  clickable
                  text={dateToString(row.created_at)}
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
