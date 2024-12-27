import { useRouter } from 'next/router';

import { STableFilterChip } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { STableFilterChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChipList/STableFilterChipList';
import { STableInfoSection } from '@v2/components/organisms/STable/addons/addons-table/STableInfoSection/STableInfoSection';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import { STableExportButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableExportButton/STableExportButton';
import { STableFilterButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableFilterButton/STableFilterButton';
import { STableButtonDivider } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButtonDivider/STableButtonDivider';
import { STableSearchContent } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchContent/STableSearchContent';
import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { TablesSelectEnum } from '@v2/components/organisms/STable/hooks/useTableSelect';
import { useTableState } from '@v2/components/organisms/STable/hooks/useTableState';
import { SCommentTable } from '@v2/components/organisms/STable/implementation/SCommentTable/SCommentTable';
import { ICommentFilterProps } from '@v2/components/organisms/STable/implementation/SCommentTable/SCommentTable.types';
import { useOrderBy } from '@v2/hooks/useOrderBy';
import { persistKeys, usePersistedState } from '@v2/hooks/usePersistState';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { ordenByTranslation } from '@v2/models/@shared/translations/orden-by.translation';
import { OcupationalRiskLevelTranslation } from '@v2/models/security/translations/ocupational-risk-level.translation';
import { useFetchBrowseComments } from '@v2/services/security/action-plan/comment/browse-comments/hooks/useFetchBrowseComments';
import { CommentColumnsEnum } from '@v2/components/organisms/STable/implementation/SCommentTable/enums/comment-columns.enum';
import { CommentOrderByEnum } from '@v2/services/security/action-plan/comment/browse-comments/service/browse-action-plan.types';
import { ordenByCommentTranslation } from '@v2/models/security/translations/orden-by-comment.translation';
import { commentColumns } from '@v2/components/organisms/STable/implementation/SCommentTable/maps/comment-column-map';
import { CommentTableFilter } from './components/CommentTableFilter/CommentTableFilter';
import { CommentTableSelection } from './components/CommentTableSelection/CommentTableSelection';

const limit = 15;
const table = TablesSelectEnum.COMMENTS;

export const CommentsTable = ({ workspaceId }: { workspaceId?: string }) => {
  const router = useRouter();

  const companyId = router.query.companyId as string;

  const [hiddenColumns, setHiddenColumns] = usePersistedState<
    Record<CommentColumnsEnum, boolean>
  >(persistKeys.COLUMNS_ACTION_PLAN, {} as any);

  const { queryParams, setQueryParams } =
    useQueryParamsState<ICommentFilterProps>();

  const { data, isLoading } = useFetchBrowseComments({
    companyId,
    filters: {
      search: queryParams.search,
      workspaceIds: workspaceId ? [workspaceId] : undefined,
    },
    orderBy: queryParams.orderBy || [
      {
        field: CommentOrderByEnum.CREATED_AT,
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
    getLeftLabel: ({ field }) => ordenByCommentTranslation[field],
  });

  const { onCleanData, onFilterData, paramsChipList } = useTableState({
    data: queryParams,
    setData: setQueryParams,
    chipMap: {
      search: null,
    },
    cleanData: {
      search: '',
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
          <STableColumnsButton
            showLabel
            hiddenColumns={hiddenColumns}
            setHiddenColumns={setHiddenColumns}
            columns={commentColumns}
          />
          <STableFilterButton>
            <CommentTableFilter
              onFilterData={onFilterData}
              filters={queryParams}
              companyId={companyId}
              workspaceId={workspaceId}
            />
          </STableFilterButton>
          <STableButtonDivider />
          <STableExportButton
            onClick={async () => {
              //
            }}
          />
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
        <CommentTableSelection table={table} companyId={companyId} />
      </STableInfoSection>
      <SCommentTable
        companyId={companyId}
        table={table}
        filterColumns={
          {
            // [CommentColumnsEnum.STAGE]: (
            //   <Box mx={4} mt={2} mb={2} width={250}>
            //     <CommentTableFilterStage
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
        data={data?.results}
        isLoading={isLoading}
        pagination={data?.pagination}
        setPage={(page) => onFilterData({ page })}
        setOrderBy={onOrderBy}
      />
    </>
  );
};
