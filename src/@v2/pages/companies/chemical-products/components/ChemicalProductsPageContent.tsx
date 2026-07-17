import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { useFetchBrowseAllWorkspaces } from '@v2/services/enterprise/workspace/browse-all-workspaces/hooks/useFetchBrowseAllWorkspaces';
import { useFetchBrowseChemicalProducts } from '@v2/services/security/characterization/chemical-product/hooks/useFetchBrowseChemicalProducts';
import { useMutateChemicalProduct } from '@v2/services/security/characterization/chemical-product/hooks/useMutateChemicalProduct';
import { getChemicalProductDeletionEligibility, readChemicalProduct } from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import type {
  ChemicalProductDetail,
  ChemicalProductListItem,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material';
import { CompanyFlowStickySubheader } from 'components/organisms/main/CompanyFlow/CompanyFlowStickySubheader';
import { STabs } from 'components/molecules/STabs';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import {
  COMPANY_SST_PATHNAME,
  COMPANY_SST_STAGE,
  getCharacterizationSubareaNavItems,
  getChemicalProductsNavStep,
} from 'core/constants/characterization-navigation.constants';
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

function formatConcentration(item: {
  concentrationKind: string;
  exactPercent: number | null;
  minPercent: number | null;
  maxPercent: number | null;
}) {
  if (item.concentrationKind === 'EXACT' && item.exactPercent != null) {
    return `${item.exactPercent}%`;
  }
  if (
    item.concentrationKind === 'RANGE' &&
    item.minPercent != null &&
    item.maxPercent != null
  ) {
    return `${item.minPercent}-${item.maxPercent}%`;
  }
  return item.concentrationKind;
}

function ingredientsTooltip(product: ChemicalProductListItem) {
  const rows = product.ingredients || [];
  if (!rows.length) return 'Sem componentes na composição vigente.';
  return rows
    .map((ingredient) => {
      const risk = ingredient.riskFactor?.name
        ? ` · RF: ${ingredient.riskFactor.name}`
        : ' · sem fator';
      return `${ingredient.chemicalName}${
        ingredient.cas ? ` · CAS ${ingredient.cas}` : ''
      } · ${formatConcentration(ingredient)}${risk}`;
    })
    .join('\n');
}

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
  const [search, setSearch] = useState('');
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

  const navItems = useMemo(() => getCharacterizationSubareaNavItems(), []);
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
    { companyId, workspaceId, includeArchived, search },
    Boolean(workspaceId),
  );
  const {
    archive,
    restore,
    hardDelete,
    downloadExcelTemplate,
    exportExcel,
  } = useMutateChemicalProduct();

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

  const products = (data || []) as ChemicalProductListItem[];

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
      <CompanyFlowStickySubheader>
        <STabs
          shadow
          value={chemicalNavStep >= 0 ? chemicalNavStep : 0}
          options={navItems.map((item) => ({ label: item.label }))}
          onChange={(_, step) => {
            const item = navItems[step];
            if (!item || item.kind === 'external') return;
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

      <SFlex justifyContent="space-between" alignItems="center" mb={2} gap={2}>
        <Box>
          <SText fontSize={18} fontWeight={700}>
            Inventário e Triagem de Produtos Químicos
          </SText>
          <SText fontSize={13} color="text.secondary">
            Cadastro manual, produto puro, FISPQ, Excel TECHNICAL, composição
            versionada e exportação do inventário do estabelecimento.
          </SText>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="outlined"
            disabled={downloadExcelTemplate.isPending || !workspaceId}
            onClick={() =>
              downloadExcelTemplate.mutate({ companyId, workspaceId })
            }
          >
            Baixar modelo Excel
          </Button>
          <Button
            variant="outlined"
            disabled={exportExcel.isPending || !workspaceId}
            onClick={() => exportExcel.mutate({ companyId, workspaceId })}
          >
            Exportar Excel
          </Button>
          <Button
            variant="outlined"
            onClick={() => setExcelImportOpen(true)}
          >
            Importar Excel
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setExcelPrepareOpen(true)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Preparar planilha para importação
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setExcelValidateOpen(true)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Validar planilha preparada
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
        </Stack>
      </SFlex>

      <SFlex mb={2} gap={2} alignItems="center" flexWrap="wrap">
        <TextField
          size="small"
          label="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 240 }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={includeArchived}
              onChange={(_, checked) => setIncludeArchived(checked)}
            />
          }
          label="Incluir arquivados"
        />
      </SFlex>

      {isError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as Error)?.message ||
            'Não foi possível carregar os produtos.'}
        </Alert>
      ) : null}

      {isLoading ? (
        <SSkeleton height={240} />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome comercial</TableCell>
              <TableCell>Fabricante</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Componentes</TableCell>
              <TableCell>FISPQ vigente</TableCell>
              <TableCell>Empregados</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell>{product.tradeName}</TableCell>
                <TableCell>{product.manufacturer || '—'}</TableCell>
                <TableCell>
                  {product.isPureSubstance ? 'Puro' : 'Mistura'}
                </TableCell>
                <TableCell>
                  <Tooltip
                    title={
                      <Box component="span" sx={{ whiteSpace: 'pre-line' }}>
                        {ingredientsTooltip(product)}
                      </Box>
                    }
                  >
                    <Stack spacing={0.5} sx={{ cursor: 'help' }}>
                      <SText fontSize={13}>{product.ingredientCount}</SText>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {product.compositionIncomplete ? (
                          <Chip size="small" color="warning" label="<100%" />
                        ) : null}
                        {product.hasConfidentialIngredient ? (
                          <Chip size="small" label="Confidencial" />
                        ) : null}
                        {product.hasUnlinkedIngredient ? (
                          <Chip size="small" color="info" label="Sem RF" />
                        ) : null}
                      </Stack>
                    </Stack>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  {product.activeFispq
                    ? `${product.activeFispq.versionLabel || 'sem versão'}${
                        product.activeFispq.issuedAt
                          ? ` · ${String(product.activeFispq.issuedAt).slice(0, 10)}`
                          : ''
                      }`
                    : '—'}
                </TableCell>
                <TableCell>
                  {product.activeFispq?.publishedForEmployees ? (
                    <Chip size="small" color="success" label="Disponível" />
                  ) : (
                    <Chip size="small" label="Não" />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={product.status}
                    color={
                      product.status === 'ACTIVE' ? 'primary' : 'default'
                    }
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    onClick={() => setSelectedProductId(product.id)}
                  >
                    Abrir
                  </Button>
                  {product.status === 'ACTIVE' ? (
                    <>
                      <Button
                        size="small"
                        onClick={async () => {
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
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="warning"
                        disabled={archive.isPending}
                        onClick={() => confirmArchive(product)}
                      >
                        Arquivar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        disabled={hardDelete.isPending}
                        onClick={() => confirmHardDelete(product)}
                      >
                        Excluir
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="small"
                      color="success"
                      disabled={restore.isPending}
                      onClick={() => confirmRestore(product)}
                    >
                      Restaurar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!products.length ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <SText color="text.secondary">
                    Nenhum produto cadastrado neste estabelecimento.
                  </SText>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      )}

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
