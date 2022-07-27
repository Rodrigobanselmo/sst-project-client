import { FC, useEffect, useMemo, useState } from 'react';

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
import dayjs from 'dayjs';
import { EnvironmentTypeEnum } from 'project/enum/environment-type.enum';
import { isNullOrUndefined } from 'util';

import EditIcon from 'assets/icons/SEditIcon';
import SEnvironmentIcon from 'assets/icons/SEnvironmentIcon';
import SOrderIcon from 'assets/icons/SOrderIcon';

import { environmentMap } from 'core/constants/maps/environment.map';
import { originRiskMap } from 'core/constants/maps/origin-risk';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';
import { useModal } from 'core/hooks/useModal';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { IEnvironment } from 'core/interfaces/api/IEnvironment';
import { IGho } from 'core/interfaces/api/IGho';
import { useMutUpsertEnvironment } from 'core/services/hooks/mutations/manager/useMutUpsertEnvironment';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryEnvironments } from 'core/services/hooks/queries/useQueryEnvironments';
import { useQueryGHO } from 'core/services/hooks/queries/useQueryGHO';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import { sortNumber } from 'core/utils/sorts/number.sort';
import { sortString } from 'core/utils/sorts/string.sort';

export const GhoTable: FC<
  BoxProps & {
    companyId?: string;
    onSelectData?: (company: IGho) => void;
    selectedData?: IGho[];
  }
> = ({ onSelectData, selectedData }) => {
  const { data, isLoading } = useQueryGHO();
  // const { onOpenModal } = useModal();
  // const [filter, setFilter] = useState<HomoTypeEnum | undefined>(undefined);
  const isSelect = !!onSelectData;

  const dataResult = useMemo(() => {
    if (!data) return [];
    const getHierarchy = (gho: IGho) => {
      if (!gho.type) return { name: gho.name, type: 'GSE' };

      if (gho.type === HomoTypeEnum.HIERARCHY) {
        if (gho.hierarchies?.[0])
          return {
            type: originRiskMap[gho.hierarchies?.[0].type]?.name,
            name: `${gho.hierarchies?.[0].name} (GSE Desenvolvido)`,
          };

        return {};
      }
      return {
        type: (gho.type && originRiskMap[gho.type]?.name) || '--',
        name: gho.description.split('(//)')[0],
      };
    };

    return [
      ...data
        // .filter((e) => (filter ? e.type == filter : !e.type))
        .map((gho) => {
          return {
            ...gho,
            created_at: dayjs(gho.created_at).format('DD/MM/YYYY'),
            ...getHierarchy(gho),
          };
        }),
      // .sort((a, b) =>
      //   sortString(a.order ? a : 10000, b.order ? b : 10000, 'order'),
      // ),
    ];
  }, [data]);

  const { handleSearchChange, results } = useTableSearch({
    data: dataResult,
    keys: ['name'],
  });

  // const handleEdit = (data: IEnvironment) => {
  //   onOpenModal(ModalEnum.ENVIRONMENT_ADD, { ...data });
  // };

  const onSelectRow = (company: IGho) => {
    if (isSelect) {
      onSelectData(company);
    }
  };

  return (
    <>
      {!isSelect && (
        <STableTitle icon={SEnvironmentIcon} iconSx={{ fontSize: 30 }}>
          Grupos Similares de Exposição
        </STableTitle>
      )}
      <STableSearch
        // onAddClick={() =>
        //   onOpenModal(ModalEnum.ENVIRONMENT_ADD, { companyId, workspaceId })
        // }
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <STable
        loading={isLoading}
        columns={`${selectedData ? '15px ' : ''}minmax(200px, 2fr) 150px 110px`}
        minWidth={['100%', 600, 800]}
      >
        <STableHeader>
          <STableHRow>Nome</STableHRow>
          <STableHRow justifyContent="center">Tipo</STableHRow>
          <STableHRow justifyContent="center">Criação</STableHRow>
        </STableHeader>
        <STableBody<typeof dataResult[0]>
          rowsData={results}
          renderRow={(row) => {
            return (
              <STableRow
                clickable
                onClick={() => onSelectRow(row as unknown as IGho)}
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
                <TextIconRow clickable text={row.name || '--'} />
                <TextIconRow
                  clickable
                  justifyContent="center"
                  text={row.type}
                />
                <TextIconRow
                  clickable
                  text={row.created_at}
                  justifyContent="center"
                />
                {/* <IconButtonRow
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(row);
                  }}
                  icon={<EditIcon />}
                /> */}
              </STableRow>
            );
          }}
        />
      </STable>
    </>
  );
};
