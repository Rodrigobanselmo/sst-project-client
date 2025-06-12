import { useRouter } from 'next/router';

import { STableFilterChip } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { STableFilterChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChipList/STableFilterChipList';
import { STableInfoSection } from '@v2/components/organisms/STable/addons/addons-table/STableInfoSection/STableInfoSection';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import { STableFilterButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableFilterButton/STableFilterButton';
import { STableSearchContent } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchContent/STableSearchContent';
import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { TablesSelectEnum } from '@v2/components/organisms/STable/hooks/useTableSelect';
import { useTableState } from '@v2/components/organisms/STable/hooks/useTableState';
import { CommentColumnsEnum } from '@v2/components/organisms/STable/implementation/SCommentTable/enums/comment-columns.enum';
import { commentColumns } from '@v2/components/organisms/STable/implementation/SCommentTable/maps/comment-column-map';
import { SCommentTable } from '@v2/components/organisms/STable/implementation/SCommentTable/SCommentTable';
import { ICommentFilterProps } from '@v2/components/organisms/STable/implementation/SCommentTable/SCommentTable.types';
import { useOrderBy } from '@v2/hooks/useOrderBy';
import { persistKeys, usePersistedState } from '@v2/hooks/usePersistState';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { orderByTranslation } from '@v2/models/.shared/translations/orden-by.translation';
import { ordenByCommentTranslation } from '@v2/models/security/translations/orden-by-comment.translation';
import { useFetchBrowseComments } from '@v2/services/security/action-plan/comment/browse-comments/hooks/useFetchBrowseComments';
import { CommentOrderByEnum } from '@v2/services/security/action-plan/comment/browse-comments/service/browse-action-plan.types';
import { CommentTableFilter } from './components/CommentTableFilter/CommentTableFilter';
import { CommentTableSelection } from './components/CommentTableSelection/CommentTableSelection';
import { useActionPlanTableActions } from '../ActionPlanTable/hooks/useActionPlanActions';
import { useCommentsActions } from './hooks/useCommentsActions';

const limit = 15;
const table = TablesSelectEnum.COMMENTS;

export const CommentsTable = ({
  workspaceId,
  companyId,
}: {
  workspaceId?: string;
  companyId: string;
}) => {
  const router = useRouter();

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
      creatorsIds: queryParams.creators?.map((creator) => creator.id),
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
    getLabel: ({ order }) => orderByTranslation[order],
    getLeftLabel: ({ field }) => ordenByCommentTranslation[field],
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

  const { onSelectRow } = useCommentsActions({ companyId });

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
            <CommentTableFilter
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
        data={data?.results}
        isLoading={isLoading}
        onSelectRow={(row) => onSelectRow(row)}
        pagination={data?.pagination}
        setPage={(page) => onFilterData({ page })}
        setOrderBy={onOrderBy}
      />
    </>
  );
};
