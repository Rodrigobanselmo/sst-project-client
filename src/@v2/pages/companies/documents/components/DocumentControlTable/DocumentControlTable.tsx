import { STableFilterChip } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { STableFilterChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChipList/STableFilterChipList';
import { STableInfoSection } from '@v2/components/organisms/STable/addons/addons-table/STableInfoSection/STableInfoSection';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import { STableFilterButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableFilterButton/STableFilterButton';
import { STableSearchContent } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchContent/STableSearchContent';
import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { TablesSelectEnum } from '@v2/components/organisms/STable/hooks/useTableSelect';
import { useTableState } from '@v2/components/organisms/STable/hooks/useTableState';
import { DocumentControlColumnsEnum } from '@v2/components/organisms/STable/implementation/SDocumentControlTable/enums/document-control-columns.enum';
import { commentColumns } from '@v2/components/organisms/STable/implementation/SDocumentControlTable/maps/document-control-column-map';
import { SDocumentControlTable } from '@v2/components/organisms/STable/implementation/SDocumentControlTable/SDocumentControlTable';
import { IDocumentControlFilterProps } from '@v2/components/organisms/STable/implementation/SDocumentControlTable/SDocumentControlTable.types';
import { useOrderBy } from '@v2/hooks/useOrderBy';
import { persistKeys, usePersistedState } from '@v2/hooks/usePersistState';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { ordenByTranslation } from '@v2/models/@shared/translations/orden-by.translation';
import { ordenByDocumentControlTranslation } from '@v2/models/security/translations/orden-by-document-control.translation';
import { useFetchBrowseDocumentControl } from '@v2/services/enterprise/document-control/document-control/browse-document-control/hooks/useFetchBrowseDocumentControl';
import { DocumentControlOrderByEnum } from '@v2/services/enterprise/document-control/document-control/browse-document-control/service/browse-document-control.types';
import { DocumentControlTableFilter } from './components/DocumentControlTableFilter/DocumentControlTableFilter';

const limit = 15;
const table = TablesSelectEnum.DOCUMENT_CONTROL;

export const DocumentControlTable = ({
  workspaceId,
  companyId,
}: {
  workspaceId: string;
  companyId: string;
}) => {
  const [hiddenColumns, setHiddenColumns] = usePersistedState<
    Record<DocumentControlColumnsEnum, boolean>
  >(persistKeys.COLUMNS_DOCUMENT_CONTROL, {} as any);

  const { queryParams, setQueryParams } =
    useQueryParamsState<IDocumentControlFilterProps>();

  const { documentControl, isLoading } = useFetchBrowseDocumentControl({
    companyId,
    workspaceId,
    filters: {
      search: queryParams.search,
    },
    orderBy: queryParams.orderBy || [
      {
        field: DocumentControlOrderByEnum.NAME,
        order: 'desc',
      },
    ],
    pagination: {
      page: queryParams.page || 1,
      limit: queryParams.limit || limit,
    },
  });

  const { onOrderBy, orderChipList } = useOrderBy({
    orderByList: queryParams.orderBy,
    setOrderBy: (orderBy) => setQueryParams({ orderBy }),
    getLabel: ({ order }) => ordenByTranslation[order],
    getLeftLabel: ({ field }) => ordenByDocumentControlTranslation[field],
  });

  const { onCleanData, onFilterData, paramsChipList } = useTableState({
    data: queryParams,
    setData: setQueryParams,
    chipMap: {
      search: null,
      creators: (value) => ({
        leftLabel: 'Criado por',
        label: value.name,
        onDelete: () =>
          setQueryParams({
            page: 1,
            creators: queryParams.creators?.filter(
              (user) => user.id !== value.id,
            ),
          }),
      }),
    },
    cleanData: {
      search: '',
      creators: [],
      orderBy: [],
      page: 1,
      limit,
    },
  });

  return (
    <>
      <STableSearch
        search={queryParams.search}
        onSearch={(search) => onFilterData({ search })}
      >
        <STableSearchContent>
          {null}
          <STableColumnsButton
            showLabel
            hiddenColumns={hiddenColumns}
            setHiddenColumns={setHiddenColumns}
            columns={commentColumns}
          />
          <STableFilterButton>
            <DocumentControlTableFilter
              onFilterData={onFilterData}
              filters={queryParams}
              companyId={companyId}
              workspaceId={workspaceId}
            />
          </STableFilterButton>
        </STableSearchContent>
      </STableSearch>
      <STableInfoSection>
        <STableFilterChipList onClean={onCleanData}>
          {[...orderChipList, ...paramsChipList]?.map((chip) => (
            <STableFilterChip
              key={1}
              leftLabel={chip.leftLabel}
              label={chip.label}
              onDelete={chip.onDelete}
            />
          ))}
        </STableFilterChipList>
      </STableInfoSection>
      <SDocumentControlTable
        companyId={companyId}
        table={table}
        filterColumns={
          {
            // [DocumentControlColumnsEnum.STAGE]: (
            //   <Box mx={4} mt={2} mb={2} width={250}>
            //     <DocumentControlTableFilterStage
            //       selectedStages={selectedStages}
            //       stages={stages}
            //       onFilterData={onFilterData}
            //     />
            //   </Box>
            // ),
          }
        }
        filters={queryParams}
        setFilters={onFilterData}
        setHiddenColumns={(hidden) =>
          setHiddenColumns({ ...hiddenColumns, ...hidden })
        }
        hiddenColumns={hiddenColumns}
        onSelectRow={(row) => null}
        data={documentControl?.results}
        isLoading={isLoading}
        pagination={documentControl?.pagination}
        setPage={(page) => onFilterData({ page })}
        setOrderBy={onOrderBy}
      />
    </>
  );
};
