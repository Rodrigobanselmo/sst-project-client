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
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';

export const GhoAllTable: FC<
  { children?: any } & BoxProps & {
      companyId?: string;
      onSelectData?: (company: IGho) => void;
      selectedData?: IGho[];
    }
> = ({ onSelectData, selectedData, companyId }) => {
  const { data, isLoading } = useQueryGHOAll(companyId);
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
