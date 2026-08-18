import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { STableFilterChip } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { STableFilterChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChipList/STableFilterChipList';
import { STableInfoSection } from '@v2/components/organisms/STable/addons/addons-table/STableInfoSection/STableInfoSection';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import { STableFilterButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableFilterButton/STableFilterButton';
import { STableSearchContent } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchContent/STableSearchContent';
import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { persistKeys, usePersistedState } from '@v2/hooks/usePersistState';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { useFetchBrowseAllWorkspaces } from '@v2/services/enterprise/workspace/browse-all-workspaces/hooks/useFetchBrowseAllWorkspaces';
import { useFetchBrowseChemicalProducts } from '@v2/services/security/characterization/chemical-product/hooks/useFetchBrowseChemicalProducts';
import { useMutateChemicalProduct } from '@v2/services/security/characterization/chemical-product/hooks/useMutateChemicalProduct';
import { getChemicalProductDeletionEligibility, readChemicalProduct } from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import type {
  ChemicalProductDetail,
  ChemicalProductListItem,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Alert,
  Box,
  Button,
  Divider,
  Menu,
  MenuItem,
  Stack,
} from '@mui/material';
import { CompanyFlowStickySubheader } from 'components/organisms/main/CompanyFlow/CompanyFlowStickySubheader';
import { STabs } from 'components/molecules/STabs';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import {
  COMPANY_SST_PATHNAME,
  COMPANY_SST_STAGE,
  getAssistenteGseHref,
  getCharacterizationAiProfilesHref,
  getCharacterizationSubareaNavItems,
  getChemicalProductsNavStep,
} from 'core/constants/characterization-navigation.constants';
import { CharacterizationSummarySection } from 'components/organisms/main/CompanyFlow/CharacterizationSummarySection';
import { useAccess } from 'core/hooks/useAccess';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import {
  enrichPickableWorkspaces,
  pickDefaultWorkspace,
} from 'core/utils/helpers/pick-default-workspace.util';

import { ChemicalExcelImportDialog } from './ChemicalExcelImportDialog';
import { ChemicalExcelPrepareDialog } from './ChemicalExcelPrepareDialog';
import { ChemicalExcelValidateDialog } from './ChemicalExcelValidateDialog';
import { ChemicalProductDetailDialog } from './ChemicalProductDetailDialog';
import { ChemicalProductFormDialog } from './ChemicalProductFormDialog';
import {
  ChemicalProductColumnsEnum,
  chemicalProductColumns,
} from './chemical-product-table-columns';
import {
  applyChemicalProductTableView,
  EMPTY_CHEMICAL_PRODUCT_TABLE_VIEW_FILTERS,
  hasActiveChemicalProductTableView,
  listChemicalProductManufacturers,
  listChemicalProductTableFilterChips,
  nextChemicalProductTableSort,
  type ChemicalProductTableSort,
  type ChemicalProductTableViewFilters,
} from './chemical-product-table-view.util';
import { ChemicalProductsTable } from './ChemicalProductsTable';
import { ChemicalProductsTableFilter } from './ChemicalProductsTableFilter';
import { ChemicalSurveyImportDialog } from './ChemicalSurveyImportDialog';
import { ChemicalUseScenariosPanel } from './ChemicalUseScenariosPanel';

export const ChemicalProductsPageContent = ({
  companyId,
}: {
  companyId: string;
}) => {
  const router = useRouter();
  const { data: company, isLoading: isLoadingCompany } =
    useQueryCompany(companyId);
  const { queryParams, setQueryParams } = useQueryParamsState<{
    tabWorkspaceId?: string;
  }>();
  const { workspaces, isLoadingAllWorkspaces } = useFetchBrowseAllWorkspaces({
    companyId,
  });

  const [includeArchived, setIncludeArchived] = useState(false);
  const [tableFilters, setTableFilters] =
    useState<ChemicalProductTableViewFilters>(
      EMPTY_CHEMICAL_PRODUCT_TABLE_VIEW_FILTERS,
    );
  const [tableSort, setTableSort] = useState<ChemicalProductTableSort | null>(
    null,
  );
  const [searchFieldKey, setSearchFieldKey] = useState(0);
  const [hiddenColumns, setHiddenColumns] = usePersistedState<
    Record<ChemicalProductColumnsEnum, boolean>
  >(
    persistKeys.COLUMNS_CHEMICAL_PRODUCTS,
    {} as Record<ChemicalProductColumnsEnum, boolean>,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ChemicalProductDetail | null>(
    null,
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [excelImportOpen, setExcelImportOpen] = useState(false);
  const [excelPrepareOpen, setExcelPrepareOpen] = useState(false);
  const [excelValidateOpen, setExcelValidateOpen] = useState(false);
  const [surveyImportOpen, setSurveyImportOpen] = useState(false);
  const [excelMenuAnchor, setExcelMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [viewMode, setViewMode] = useState<'products' | 'scenarios'>('products');
  const [scenariosRefreshKey, setScenariosRefreshKey] = useState(0);
  const { isMaster } = useAccess();

  const navItems = useMemo(
    () => getCharacterizationSubareaNavItems({ showAiProfiles: isMaster }),
    [isMaster],
  );
  const chemicalNavStep = getChemicalProductsNavStep();

  const defaultWorkspaceId = useMemo(() => {
    const pickable = enrichPickableWorkspaces(
      workspaces?.results,
      company?.workspace,
    );
    return pickDefaultWorkspace(pickable);
  }, [company?.workspace, workspaces?.results]);

  useEffect(() => {
    if (isLoadingAllWorkspaces || isLoadingCompany || !defaultWorkspaceId) {
      return;
    }
    if (queryParams.tabWorkspaceId) return;
    setQueryParams({ tabWorkspaceId: defaultWorkspaceId });
  }, [
    defaultWorkspaceId,
    isLoadingAllWorkspaces,
    isLoadingCompany,
    queryParams.tabWorkspaceId,
    setQueryParams,
  ]);

  const workspaceId = queryParams.tabWorkspaceId || '';
  const { data, isLoading, isError, error } = useFetchBrowseChemicalProducts(
    { companyId, workspaceId, includeArchived },
    Boolean(workspaceId),
  );
  const {
    archive,
    restore,
    hardDelete,
    downloadExcelTemplate,
    exportExcel,
  } = useMutateChemicalProduct();

  const loadedProducts = (data || []) as ChemicalProductListItem[];
  const manufacturers = useMemo(
    () => listChemicalProductManufacturers(loadedProducts),
    [data],
  );
  const products = useMemo(
    () =>
      applyChemicalProductTableView(loadedProducts, {
        filters: tableFilters,
        sort: tableSort,
      }),
    [data, tableFilters, tableSort],
  );
  const filterChips = useMemo(
    () => listChemicalProductTableFilterChips(tableFilters, tableSort),
    [tableFilters, tableSort],
  );
  const hasActiveView = hasActiveChemicalProductTableView(
    tableFilters,
    tableSort,
  );

  if (isLoadingAllWorkspaces) {
    return <SSkeleton height={400} />;
  }

  if (!workspaces?.results?.length) {
    return (
      <SFlex flex={1} center py={8} bgcolor="grey.100" borderRadius={1}>
        <SText>Cadastre um estabelecimento antes</SText>
      </SFlex>
    );
  }

  if (!workspaceId) {
    return (
      <Box mb={2} mt={1} color="text.secondary" fontSize={13}>
        Selecione um estabelecimento no header para carregar o inventário.
      </Box>
    );
  }

  const confirmArchive = (product: ChemicalProductListItem) => {
    const ok = window.confirm(
      `Arquivar o produto "${product.tradeName}"?\nA composição e a FISPQ serão preservadas.`,
    );
    if (!ok) return;
    archive.mutate({
      companyId,
      workspaceId,
      productId: product.id,
    });
  };

  const confirmRestore = (product: ChemicalProductListItem) => {
    const ok = window.confirm(
      `Restaurar o produto "${product.tradeName}" para ACTIVE?`,
    );
    if (!ok) return;
    restore.mutate({
      companyId,
      workspaceId,
      productId: product.id,
    });
  };

  const confirmHardDelete = async (product: ChemicalProductListItem) => {
    const readErrorMessage = (err: any) => {
      const data = err?.response?.data;
      const message = data?.message;
      if (typeof message === 'string') return message;
      if (message && typeof message === 'object' && typeof message.message === 'string') {
        return message.message;
      }
      if (Array.isArray(data?.blockers) && data.blockers.length) {
        return data.blockers.join('\n');
      }
      return 'Não foi possível excluir o produto.';
    };

    try {
      const eligibility = await getChemicalProductDeletionEligibility({
        companyId,
        workspaceId,
        productId: product.id,
      });
      if (!eligibility.canDelete) {
        const archiveInstead = window.confirm(
          `Exclusão definitiva bloqueada.\n${eligibility.blockers.join(
            '\n',
          )}\n\nDeseja arquivar o produto?`,
        );
        if (archiveInstead) {
          await archive.mutateAsync({
            companyId,
            workspaceId,
            productId: product.id,
          });
        }
        return;
      }
      const ok = window.confirm(
        `EXCLUIR DEFINITIVAMENTE "${product.tradeName}"?\nEsta ação não pode ser desfeita.`,
      );
      if (!ok) return;
      const strong = window.prompt(
        'Digite EXCLUIR para confirmar a exclusão definitiva:',
      );
      if (strong !== 'EXCLUIR') return;
      await hardDelete.mutateAsync({
        companyId,
        workspaceId,
        productId: product.id,
      });
    } catch (err: any) {
      const message = readErrorMessage(err);
      const suggestArchive =
        err?.response?.data?.suggestArchive === true ||
        /arquiv/i.test(message);
      if (suggestArchive) {
        const archiveInstead = window.confirm(
          `${message}\n\nDeseja arquivar o produto?`,
        );
        if (archiveInstead) {
          try {
            await archive.mutateAsync({
              companyId,
              workspaceId,
              productId: product.id,
            });
          } catch {
            window.alert('Não foi possível arquivar o produto.');
          }
        }
        return;
      }
      window.alert(message);
    }
  };

  return (
    <Box>
      <CharacterizationSummarySection />
      <CompanyFlowStickySubheader>
        <STabs
          shadow
          value={chemicalNavStep >= 0 ? chemicalNavStep : 0}
          options={navItems.map((item) => ({ label: item.label }))}
          onChange={(_, step) => {
            const item = navItems[step];
            if (!item) return;
            if (item.kind === 'external' && item.id === 'chemical-products') {
              return;
            }
            if (item.kind === 'external' && item.id === 'assistente-gse') {
              void router.push(
                getAssistenteGseHref({
                  companyId,
                  tabWorkspaceId: workspaceId || undefined,
                }),
              );
              return;
            }
            if (
              item.kind === 'external' &&
              item.id === 'characterization-ai-profiles'
            ) {
              void router.push(
                getCharacterizationAiProfilesHref({
                  companyId,
                  tabWorkspaceId: workspaceId || undefined,
                }),
              );
              return;
            }
            if (item.kind !== 'tab') return;
            void router.push({
              pathname: COMPANY_SST_PATHNAME,
              query: {
                companyId,
                stage: COMPANY_SST_STAGE,
                active: String(item.tab),
                tabWorkspaceId: workspaceId,
              },
            });
          }}
        />
      </CompanyFlowStickySubheader>

      <Box mb={2}>
        <Box mb={1.5}>
          <SText fontSize={18} fontWeight={700}>
            Inventário e Triagem de Produtos Químicos
          </SText>
          <SText fontSize={13} color="text.secondary">
            Cadastro manual, produto puro, FISPQ, Excel TECHNICAL, levantamento
            SURVEY (cenários de uso), composição versionada e exportação do
            inventário do estabelecimento.
          </SText>
        </Box>
        <SFlex
          justifyContent="space-between"
          alignItems="center"
          gap={2}
          flexWrap="wrap"
        >
          <Stack direction="row" spacing={1} flexShrink={0}>
            <Button
              variant={viewMode === 'products' ? 'contained' : 'outlined'}
              onClick={() => {
                setExcelMenuAnchor(null);
                setViewMode('products');
              }}
            >
              Produtos
            </Button>
            <Button
              variant={viewMode === 'scenarios' ? 'contained' : 'outlined'}
              onClick={() => {
                setExcelMenuAnchor(null);
                setViewMode('scenarios');
              }}
              disabled={!workspaceId}
            >
              Cenários de uso
            </Button>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            justifyContent="flex-end"
            sx={{ ml: 'auto' }}
          >
            {viewMode === 'products' ? (
              <>
                <Button
                  variant="outlined"
                  endIcon={<ExpandMoreIcon />}
                  onClick={(event) => setExcelMenuAnchor(event.currentTarget)}
                  disabled={!workspaceId}
                  aria-haspopup="menu"
                  aria-expanded={Boolean(excelMenuAnchor)}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Excel
                </Button>
                <Menu
                  anchorEl={excelMenuAnchor}
                  open={Boolean(excelMenuAnchor)}
                  onClose={() => setExcelMenuAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem
                    disabled={downloadExcelTemplate.isPending || !workspaceId}
                    onClick={() => {
                      setExcelMenuAnchor(null);
                      downloadExcelTemplate.mutate({ companyId, workspaceId });
                    }}
                  >
                    Baixar modelo Excel
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setExcelMenuAnchor(null);
                      setExcelPrepareOpen(true);
                    }}
                  >
                    Preparar planilha para importação
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setExcelMenuAnchor(null);
                      setExcelValidateOpen(true);
                    }}
                  >
                    Validar planilha preparada
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    disabled={exportExcel.isPending || !workspaceId}
                    onClick={() => {
                      setExcelMenuAnchor(null);
                      exportExcel.mutate({ companyId, workspaceId });
                    }}
                  >
                    Exportar Excel
                  </MenuItem>
                </Menu>
                <Button
                  variant="contained"
                  onClick={() => setExcelImportOpen(true)}
                  disabled={!workspaceId}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Importar Excel
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    setEditProduct(null);
                    setCreateOpen(true);
                  }}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Novo produto
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={() => setSurveyImportOpen(true)}
                disabled={!workspaceId}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Importar levantamento (SURVEY)
              </Button>
            )}
          </Stack>
        </SFlex>
      </Box>

      {viewMode === 'scenarios' && workspaceId ? (
        <Box mb={3}>
          <ChemicalUseScenariosPanel
            companyId={companyId}
            workspaceId={workspaceId}
            refreshKey={scenariosRefreshKey}
          />
        </Box>
      ) : null}

      {viewMode === 'products' ? (
        <>
          <STableSearch
            key={searchFieldKey}
            search={tableFilters.search}
            autoFocus={false}
            onSearch={(search) =>
              setTableFilters((current) => ({ ...current, search }))
            }
            inputProps={{
              placeholder: 'Buscar nome, fabricante, substância ou CAS',
            }}
          >
            <STableSearchContent>
              {null}
              <STableColumnsButton
                showLabel
                hiddenColumns={hiddenColumns}
                setHiddenColumns={setHiddenColumns}
                columns={chemicalProductColumns}
              />
              <STableFilterButton text="Filtros">
                <ChemicalProductsTableFilter
                  filters={tableFilters}
                  onFilterChange={(patch) =>
                    setTableFilters((current) => ({ ...current, ...patch }))
                  }
                  includeArchived={includeArchived}
                  onIncludeArchivedChange={setIncludeArchived}
                  manufacturers={manufacturers}
                />
              </STableFilterButton>
            </STableSearchContent>
          </STableSearch>
          {filterChips.length ? (
            <STableInfoSection>
              <STableFilterChipList
                onClean={() => {
                  setTableFilters({
                    ...EMPTY_CHEMICAL_PRODUCT_TABLE_VIEW_FILTERS,
                  });
                  setTableSort(null);
                  setSearchFieldKey((key) => key + 1);
                }}
              >
                {filterChips.map((chip) => (
                  <STableFilterChip
                    key={chip.key}
                    leftLabel={chip.leftLabel}
                    label={chip.label}
                    onDelete={() => {
                      if (chip.key === 'sort') {
                        setTableSort(null);
                        return;
                      }
                      setTableFilters((current) => ({
                        ...current,
                        [chip.key]:
                          EMPTY_CHEMICAL_PRODUCT_TABLE_VIEW_FILTERS[
                            chip.key as keyof ChemicalProductTableViewFilters
                          ],
                      }));
                    }}
                  />
                ))}
              </STableFilterChipList>
            </STableInfoSection>
          ) : null}
        </>
      ) : null}

      {viewMode === 'products' && isError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as Error)?.message ||
            'Não foi possível carregar os produtos.'}
        </Alert>
      ) : null}

      {viewMode === 'products' ? (
        <ChemicalProductsTable
          products={products}
          isLoading={isLoading}
          hiddenColumns={hiddenColumns}
          sort={tableSort}
          onSortField={(field) =>
            setTableSort((current) => nextChemicalProductTableSort(current, field))
          }
          emptyMessage={
            hasActiveView
              ? 'Nenhum produto encontrado com os filtros atuais.'
              : 'Nenhum produto cadastrado neste estabelecimento.'
          }
          onOpen={(product) => setSelectedProductId(product.id)}
          onEdit={async (product) => {
            try {
              const detail = await readChemicalProduct({
                companyId,
                workspaceId,
                productId: product.id,
              });
              setEditProduct(detail);
            } catch {
              window.alert('Não foi possível abrir a edição.');
            }
          }}
          onArchive={confirmArchive}
          onDelete={confirmHardDelete}
          onRestore={confirmRestore}
          archivePending={archive.isPending}
          restorePending={restore.isPending}
          deletePending={hardDelete.isPending}
        />
      ) : null}



      <ChemicalProductFormDialog
        open={createOpen || Boolean(editProduct)}
        onClose={() => {
          setCreateOpen(false);
          setEditProduct(null);
        }}
        companyId={companyId}
        workspaceId={workspaceId}
        editProduct={editProduct}
        onOpenExcelImport={() => {
          setCreateOpen(false);
          setExcelImportOpen(true);
        }}
      />

      <ChemicalExcelImportDialog
        open={excelImportOpen}
        onClose={() => setExcelImportOpen(false)}
        companyId={companyId}
        workspaceId={workspaceId}
      />

      <ChemicalSurveyImportDialog
        open={surveyImportOpen}
        onClose={() => setSurveyImportOpen(false)}
        companyId={companyId}
        workspaceId={workspaceId}
        onCommitted={() => {
          setViewMode('scenarios');
          setScenariosRefreshKey((value) => value + 1);
        }}
      />

      <ChemicalExcelPrepareDialog
        open={excelPrepareOpen}
        onClose={() => setExcelPrepareOpen(false)}
        companyId={companyId}
        workspaceId={workspaceId}
        onGoToValidate={() => {
          setExcelPrepareOpen(false);
          setExcelValidateOpen(true);
        }}
      />

      <ChemicalExcelValidateDialog
        open={excelValidateOpen}
        onClose={() => setExcelValidateOpen(false)}
        companyId={companyId}
        workspaceId={workspaceId}
      />

      {selectedProductId ? (
        <ChemicalProductDetailDialog
          open={Boolean(selectedProductId)}
          onClose={() => setSelectedProductId(null)}
          companyId={companyId}
          workspaceId={workspaceId}
          productId={selectedProductId}
          onEdit={(product) => {
            setSelectedProductId(null);
            setEditProduct(product);
          }}
        />
      ) : null}
    </Box>
  );
};
