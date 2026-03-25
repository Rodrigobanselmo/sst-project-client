import { STableFilterChip } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { STableFilterChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChipList/STableFilterChipList';
import { STableInfoSection } from '@v2/components/organisms/STable/addons/addons-table/STableInfoSection/STableInfoSection';
import { STableAddButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableAddButton/STableAddButton';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import { STableFilterButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableFilterButton/STableFilterButton';
import { STableSearchContent } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchContent/STableSearchContent';
import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { useTableState } from '@v2/components/organisms/STable/hooks/useTableState';
import { FormModelColumnsEnum } from '@v2/components/organisms/STable/implementation/SFormModelTable/enums/form-model-columns.enum';
import { commentColumns } from '@v2/components/organisms/STable/implementation/SFormModelTable/maps/fomr-model-column-map';
import { useOrderBy } from '@v2/hooks/useOrderBy';
import { persistKeys, usePersistedState } from '@v2/hooks/usePersistState';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { useFormModelActions } from './hooks/useFormModelActions';
import { IFormModelFilterProps } from '@v2/components/organisms/STable/implementation/SFormModelTable/SFormModelTable.types';
import { useFetchBrowseFormModel } from '@v2/services/forms/form/browse-form-model/hooks/useFetchBrowseFormModel';
import { FormModelOrderByEnum } from '@v2/services/forms/form/browse-form-model/service/browse-form-model.types';
import { orderByTranslation } from '@v2/models/.shared/translations/orden-by.translation';
import { orderByFormModelTranslation } from '@v2/models/form/translations/orden-by-form-model.translation';
import { FormModelTableFilter } from './components/FormApplicationTableFilter/FormApplicationTableFilter';
import { SFormModelTable } from '@v2/components/organisms/STable/implementation/SFormModelTable/SFormModelTable';
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import NoteAddOutlined from '@mui/icons-material/NoteAddOutlined';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useRef, useState } from 'react';
import { FormModelDuplicateDialog } from './components/FormModelDuplicateDialog/FormModelDuplicateDialog';

const limit = 15;

export const FormModelTable = ({ companyId }: { companyId: string }) => {
  const [hiddenColumns, setHiddenColumns] = usePersistedState<
    Record<FormModelColumnsEnum, boolean>
  >(persistKeys.COLUMNS_FORMS_MODEL, {} as any);

  const addMenuAnchorRef = useRef<HTMLDivElement>(null);
  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);

  const { onFormModelAdd, onFormModelClick } = useFormModelActions({
    companyId,
  });

  const { queryParams, setQueryParams } =
    useQueryParamsState<IFormModelFilterProps>();

  const { formModel, isLoading } = useFetchBrowseFormModel({
    companyId,
    filters: {
      search: queryParams.search,
      types: queryParams.types,
    },
    orderBy: queryParams.orderBy || [
      {
        field: FormModelOrderByEnum.NAME,
        order: 'asc',
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
    getLeftLabel: ({ field }) => orderByFormModelTranslation[field],
  });

  const { onCleanData, onFilterData, paramsChipList } = useTableState({
    data: queryParams,
    setData: setQueryParams,
    chipMap: {
      search: null,
      types: (value) => ({
        leftLabel: 'Tipo',
        label: value,
        onDelete: () =>
          setQueryParams({
            page: 1,
            types: queryParams.types?.filter((type) => type !== value),
          }),
      }),
    },
    cleanData: {
      search: '',
      types: [],
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
          <div ref={addMenuAnchorRef}>
            <STableAddButton
              onClick={() =>
                setAddMenuAnchor(addMenuAnchorRef.current)
              }
            />
          </div>
          <Menu
            anchorEl={addMenuAnchor}
            open={Boolean(addMenuAnchor)}
            onClose={() => setAddMenuAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <MenuItem
              onClick={() => {
                setAddMenuAnchor(null);
                onFormModelAdd();
              }}
            >
              <ListItemIcon>
                <NoteAddOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Formulário em branco" />
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAddMenuAnchor(null);
                setDuplicateDialogOpen(true);
              }}
            >
              <ListItemIcon>
                <ContentCopyOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Copiar modelo existente" />
            </MenuItem>
          </Menu>
          <FormModelDuplicateDialog
            open={duplicateDialogOpen}
            onClose={() => setDuplicateDialogOpen(false)}
            companyId={companyId}
          />
          <STableColumnsButton
            showLabel
            hiddenColumns={hiddenColumns}
            setHiddenColumns={setHiddenColumns}
            columns={commentColumns}
          />
          <STableFilterButton>
            <FormModelTableFilter
              data={formModel?.filters}
              onFilterData={onFilterData}
              filters={queryParams}
              companyId={companyId}
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
      <SFormModelTable
        filters={queryParams}
        setFilters={onFilterData}
        filterColumns={{}}
        setHiddenColumns={(hidden) =>
          setHiddenColumns({ ...hiddenColumns, ...hidden })
        }
        hiddenColumns={hiddenColumns}
        onSelectRow={(row) => onFormModelClick(row.id)}
        data={formModel?.results || []}
        isLoading={isLoading}
        pagination={formModel?.pagination}
        setPage={(page) => onFilterData({ page })}
        setOrderBy={onOrderBy}
      />
    </>
  );
};
