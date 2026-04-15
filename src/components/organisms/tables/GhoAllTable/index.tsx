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
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import dayjs from 'dayjs';

import SEnvironmentIcon from 'assets/icons/SEnvironmentIcon';

import { originRiskMap } from 'core/constants/maps/origin-risk';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { IGho } from 'core/interfaces/api/IGho';
import {
  type QueryGHOListFilters,
  useQueryGHOAll,
} from 'core/services/hooks/queries/useQueryGHOAll';

export const GhoAllTable: FC<
  { children?: any } & BoxProps & {
      companyId?: string;
      /** Filtra grupos que possuem o estabelecimento entre `workspaceIds` / `workspaces`. */
      workspaceIdFilter?: string;
      onSelectData?: (company: IGho) => void;
      selectedData?: IGho[];
      /** Ex.: importação de riscos — lista só origens com fatores ativos no PGR/SST informado. */
      originListQuery?: QueryGHOListFilters;
    }
> = ({
  onSelectData,
  selectedData,
  companyId,
  workspaceIdFilter,
  originListQuery,
}) => {
  const { data, isLoading } = useQueryGHOAll(companyId, originListQuery);
  // const { onOpenModal } = useModal();
  // const [filter, setFilter] = useState<HomoTypeEnum | undefined>(undefined);
  const isSelect = !!onSelectData;

  const dataResult = useMemo(() => {
    if (!data) return [];
    const getHierarchy = (gho: IGho) => {
      const char = gho.characterization;
      if (char?.type != null && originRiskMap[char.type]) {
        return {
          type: originRiskMap[char.type].name,
          name: char.name || gho.name,
        };
      }

      const env = gho.environment;
      if (env?.type != null && originRiskMap[env.type]) {
        return {
          type: originRiskMap[env.type].name,
          name: env.name || gho.name,
        };
      }

      if (gho.type === HomoTypeEnum.HIERARCHY) {
        if (gho.hierarchies?.[0])
          return {
            type: originRiskMap[gho.hierarchies?.[0].type]?.name,
            name: `${gho.hierarchies?.[0].name} (GSE Desenvolvido)`,
          };

        return { name: gho.name, type: '--' };
      }

      if (gho.type != null && originRiskMap[String(gho.type)]) {
        return {
          type: originRiskMap[String(gho.type)]?.name || '--',
          name: gho.description?.split('(//)')[0] || gho.name,
        };
      }

      if (gho.type === undefined || gho.type === null) {
        return {
          name: gho.name,
          type: originRiskMap[HomoTypeEnum.GSE]?.name ?? 'GSE',
        };
      }

      return {
        type: '--',
        name: gho.description?.split('(//)')[0] || gho.name,
      };
    };

    const filtered = !workspaceIdFilter
      ? data
      : data.filter((gho) => {
          const ids = gho.workspaceIds?.map(String) ?? [];
          const fromNested = (gho.workspaces || []).map((w) => String(w.id));
          const merged = [...new Set([...ids, ...fromNested])];
          if (!merged.length) return true;
          return merged.includes(String(workspaceIdFilter));
        });

    return [
      ...filtered
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
  }, [data, workspaceIdFilter]);

  const { handleSearchChange, results } = useTableSearch({
    data: dataResult,
    keys: ['name'],
  });

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
        <STableBody<(typeof dataResult)[0]>
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
                  text={row.type || '--'}
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
