import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { STextRow } from '@v2/components/organisms/STable/addons/addons-rows/STextRow/STextRow';
import { STable } from '@v2/components/organisms/STable/common/STable/STable';
import { ITableData } from '@v2/components/organisms/STable/common/STable/STable.types';
import { STableBody } from '@v2/components/organisms/STable/common/STableBody/STableBody';
import { STableHeader } from '@v2/components/organisms/STable/common/STableHeader/STableHeader';
import { STableRow } from '@v2/components/organisms/STable/common/STableRow/STableRow';
import type { ChemicalProductListItem } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import { Box, Button, Chip, Stack, Tooltip } from '@mui/material';

import {
  isUnindividualizedDisclosure,
  UNINDIVIDUALIZED_COMPOSITION_LABEL,
} from './chemical-composition-disclosure.util';
import {
  ChemicalProductColumnMap as columnMap,
  ChemicalProductColumnsEnum as columnsEnum,
  getHiddenChemicalProductColumn,
} from './chemical-product-table-columns';
import { ChemicalProductTableHeaderRow } from './ChemicalProductTableHeaderRow';
import {
  formatChemicalProductStatusLabel,
  formatIngredientRiskFactorSuffix,
  UNLINKED_RISK_FACTOR_CHIP_LABEL,
  UNLINKED_RISK_FACTOR_CHIP_TOOLTIP,
  type ChemicalProductTableSort,
  type ChemicalProductTableSortField,
} from './chemical-product-table-view.util';

const filledChipSx = {
  color: 'common.white',
  border: '1px solid',
  fontWeight: 700,
  '& .MuiChip-label': { color: 'common.white' },
} as const;

const activeStatusChipSx = {
  ...filledChipSx,
  backgroundColor: 'success.dark',
  borderColor: 'success.dark',
};

const archivedStatusChipSx = {
  ...filledChipSx,
  backgroundColor: 'grey.600',
  borderColor: 'grey.600',
};

const unlinkedRiskFactorChipSx = {
  ...filledChipSx,
  backgroundColor: '#b45309',
  borderColor: '#b45309',
};

const employeesPublishedChipSx = {
  ...filledChipSx,
  backgroundColor: 'success.dark',
  borderColor: 'success.dark',
  fontWeight: 600,
};

const employeesUnpublishedChipSx = {
  ...filledChipSx,
  backgroundColor: 'grey.500',
  borderColor: 'grey.500',
  fontWeight: 600,
};

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
  if (item.concentrationKind === 'CONFIDENTIAL') return 'Confidencial';
  if (item.concentrationKind === 'NOT_INFORMED') return 'Não informada';
  if (item.concentrationKind === 'UNDETERMINED') return 'Indeterminada';
  return item.concentrationKind;
}

function ingredientsTooltip(product: ChemicalProductListItem) {
  const rows = product.ingredients || [];
  if (isUnindividualizedDisclosure(product.activeComposition?.compositionDisclosure)) {
    const note = product.activeComposition?.compositionDisclosureNote?.trim();
    return note
      ? `${UNINDIVIDUALIZED_COMPOSITION_LABEL}\n${note}`
      : UNINDIVIDUALIZED_COMPOSITION_LABEL;
  }
  if (!rows.length) return 'Sem componentes na composição vigente.';
  return rows
    .map((ingredient) => {
      return `${ingredient.chemicalName || '—'}${
        ingredient.cas ? ` · CAS ${ingredient.cas}` : ''
      } · ${formatConcentration(ingredient)}${formatIngredientRiskFactorSuffix(
        ingredient,
      )}`;
    })
    .join('\n');
}

function formatFispqCell(product: ChemicalProductListItem) {
  if (!product.activeFispq) return '—';
  const version = product.activeFispq.versionLabel || 'sem versão';
  const issued = product.activeFispq.issuedAt
    ? ` · ${String(product.activeFispq.issuedAt).slice(0, 10)}`
    : '';
  return `${version}${issued}`;
}

function IngredientsSummaryCell({
  product,
}: {
  product: ChemicalProductListItem;
}) {
  const ingredients = product.ingredients || [];
  const first = ingredients[0];
  const extraCount = Math.max(0, ingredients.length - 1);
  const chemicalName = first?.chemicalName?.trim() || null;
  const cas = first?.cas?.trim() || null;
  const firstHasNoRiskFactor = Boolean(first && !first.riskFactorId);
  const extraLabel =
    extraCount === 1
      ? '+1 componente'
      : extraCount > 1
        ? `+${extraCount} componentes`
        : null;

  if (!first) {
    const unindividualized = isUnindividualizedDisclosure(
      product.activeComposition?.compositionDisclosure,
    );
    return (
      <Tooltip
        title={
          unindividualized
            ? ingredientsTooltip(product)
            : 'Sem componentes na composição vigente.'
        }
      >
        <SText fontSize={13} color="text.secondary" sx={{ cursor: 'help' }}>
          {unindividualized
            ? UNINDIVIDUALIZED_COMPOSITION_LABEL
            : 'Sem componentes'}
        </SText>
      </Tooltip>
    );
  }

  return (
    <Stack spacing={0.35} sx={{ maxWidth: '100%', py: 0.25 }}>
      <Tooltip
        title={
          <Box component="span" sx={{ whiteSpace: 'pre-line' }}>
            {ingredientsTooltip(product)}
          </Box>
        }
      >
        <SText
          fontSize={13}
          fontWeight={600}
          lineNumber={1}
          noBreak
          title={chemicalName || '—'}
          sx={{ cursor: 'help', maxWidth: '100%' }}
        >
          {chemicalName || '—'}
        </SText>
      </Tooltip>
      <Stack
        direction="row"
        spacing={0.75}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
      >
        {cas ? (
          <SText
            fontSize={12}
            color="text.secondary"
            lineNumber={1}
            noBreak
            title={`CAS ${cas}`}
            sx={{ maxWidth: 140 }}
          >
            CAS {cas}
          </SText>
        ) : (
          <SText fontSize={12} color="text.disabled">
            Sem CAS
          </SText>
        )}
        {extraLabel ? (
          <Chip size="small" color="primary" variant="outlined" label={extraLabel} />
        ) : null}
        {firstHasNoRiskFactor || product.hasUnlinkedIngredient ? (
          <Tooltip title={UNLINKED_RISK_FACTOR_CHIP_TOOLTIP}>
            <Chip
              size="small"
              label={UNLINKED_RISK_FACTOR_CHIP_LABEL}
              sx={unlinkedRiskFactorChipSx}
            />
          </Tooltip>
        ) : null}
        {product.hasConfidentialIngredient ? (
          <Chip size="small" label="Confidencial" />
        ) : null}
        {product.compositionIncomplete ? (
          <Chip size="small" color="warning" label="<100%" />
        ) : null}
      </Stack>
    </Stack>
  );
}

export function ChemicalProductsTable({
  products,
  isLoading,
  hiddenColumns,
  sort,
  onSortField,
  emptyMessage,
  onOpen,
  onEdit,
  onArchive,
  onDelete,
  onRestore,
  archivePending,
  restorePending,
  deletePending,
}: {
  products: ChemicalProductListItem[];
  isLoading: boolean;
  hiddenColumns: Record<columnsEnum, boolean>;
  sort: ChemicalProductTableSort | null;
  onSortField: (field: ChemicalProductTableSortField) => void;
  emptyMessage: string;
  onOpen: (product: ChemicalProductListItem) => void;
  onEdit: (product: ChemicalProductListItem) => void;
  onArchive: (product: ChemicalProductListItem) => void;
  onDelete: (product: ChemicalProductListItem) => void;
  onRestore: (product: ChemicalProductListItem) => void;
  archivePending: boolean;
  restorePending: boolean;
  deletePending: boolean;
}) {
  const hidden = (column: columnsEnum) =>
    Boolean(getHiddenChemicalProductColumn(hiddenColumns, column));

  const tableRows: ITableData<ChemicalProductListItem>[] = [
    {
      column: 'minmax(180px, 1.4fr)',
      hidden: hidden(columnsEnum.TRADE_NAME),
      header: (
        <ChemicalProductTableHeaderRow
          text={columnMap[columnsEnum.TRADE_NAME].label}
          field="tradeName"
          sort={sort}
          onSortField={onSortField}
        />
      ),
      row: (row) => (
        <STextRow fontSize={13} lineNumber={2} tooltipMinLength={20} text={row.tradeName} />
      ),
    },
    {
      column: 'minmax(120px, 1fr)',
      hidden: hidden(columnsEnum.MANUFACTURER),
      header: (
        <ChemicalProductTableHeaderRow
          text={columnMap[columnsEnum.MANUFACTURER].label}
          field="manufacturer"
          sort={sort}
          onSortField={onSortField}
        />
      ),
      row: (row) => (
        <STextRow
          fontSize={13}
          lineNumber={2}
          tooltipMinLength={20}
          text={row.manufacturer || '—'}
        />
      ),
    },
    {
      column: 'minmax(88px, 96px)',
      hidden: hidden(columnsEnum.TYPE),
      header: (
        <ChemicalProductTableHeaderRow
          text={columnMap[columnsEnum.TYPE].label}
          field="type"
          sort={sort}
          onSortField={onSortField}
        />
      ),
      row: (row) => (
        <STextRow
          fontSize={13}
          lineNumber={1}
          text={row.isPureSubstance ? 'Puro' : 'Mistura'}
        />
      ),
    },
    {
      column: 'minmax(220px, 1.6fr)',
      hidden: hidden(columnsEnum.INGREDIENTS),
      header: (
        <ChemicalProductTableHeaderRow
          text={columnMap[columnsEnum.INGREDIENTS].label}
          sort={sort}
        />
      ),
      row: (row) => <IngredientsSummaryCell product={row} />,
    },
    {
      column: 'minmax(140px, 1fr)',
      hidden: hidden(columnsEnum.FISPQ),
      header: (
        <ChemicalProductTableHeaderRow
          text={columnMap[columnsEnum.FISPQ].label}
          field="fispq"
          sort={sort}
          onSortField={onSortField}
        />
      ),
      row: (row) => (
        <STextRow fontSize={13} lineNumber={2} text={formatFispqCell(row)} />
      ),
    },
    {
      column: 'minmax(110px, 120px)',
      hidden: hidden(columnsEnum.EMPLOYEES),
      header: (
        <ChemicalProductTableHeaderRow
          text={columnMap[columnsEnum.EMPLOYEES].label}
          sort={sort}
          justify="center"
        />
      ),
      row: (row) => (
        <SFlex justify="center">
          {row.activeFispq?.publishedForEmployees ? (
            <Chip
              size="small"
              label="Disponível"
              sx={employeesPublishedChipSx}
            />
          ) : (
            <Chip size="small" label="Não" sx={employeesUnpublishedChipSx} />
          )}
        </SFlex>
      ),
    },
    {
      column: 'minmax(96px, 108px)',
      hidden: hidden(columnsEnum.STATUS),
      header: (
        <ChemicalProductTableHeaderRow
          text={columnMap[columnsEnum.STATUS].label}
          field="status"
          sort={sort}
          onSortField={onSortField}
          justify="center"
        />
      ),
      row: (row) => (
        <SFlex justify="center">
          <Chip
            size="small"
            label={formatChemicalProductStatusLabel(row.status)}
            sx={
              row.status === 'ACTIVE' ? activeStatusChipSx : archivedStatusChipSx
            }
          />
        </SFlex>
      ),
    },
    {
      column: 'minmax(320px, 320px)',
      hidden: hidden(columnsEnum.ACTIONS),
      header: (
        <ChemicalProductTableHeaderRow
          text={columnMap[columnsEnum.ACTIONS].label}
          sort={sort}
          justify="flex-end"
        />
      ),
      row: (row) => (
        <SFlex justify="flex-end" gap={1} flexWrap="nowrap">
          <Button size="small" onClick={() => onOpen(row)}>
            Abrir
          </Button>
          {row.status === 'ACTIVE' ? (
            <>
              <Button size="small" onClick={() => onEdit(row)}>
                Editar
              </Button>
              <Button
                size="small"
                color="warning"
                disabled={archivePending}
                onClick={() => onArchive(row)}
              >
                Arquivar
              </Button>
              <Button
                size="small"
                color="error"
                disabled={deletePending}
                onClick={() => onDelete(row)}
              >
                Excluir
              </Button>
            </>
          ) : (
            <Button
              size="small"
              color="success"
              disabled={restorePending}
              onClick={() => onRestore(row)}
            >
              Restaurar
            </Button>
          )}
        </SFlex>
      ),
    },
  ];

  return (
    <STable
      isLoading={isLoading}
      table={tableRows}
      data={products}
      renderHeader={(headers) => <STableHeader>{headers}</STableHeader>}
      renderBody={({ data, rows }) => (
        <STableBody
          rows={data}
          contentEmpty={<SText color="text.secondary">{emptyMessage}</SText>}
          renderRow={(row) => (
            <STableRow
              key={row.id}
              minHeight={52}
              sx={{
                '&:hover': {
                  backgroundColor: 'background.box',
                },
              }}
            >
              {rows.map((render) => render(row))}
            </STableRow>
          )}
        />
      )}
    />
  );
}
