import { FC, MouseEvent } from 'react';

import EditIcon from 'assets/icons/SEditIcon';
import { Box, IconButton, Tooltip } from '@mui/material';
import { CharacterizationBrowseResultModel } from '@v2/models/security/models/characterization/characterization-browse-result.model';
import { CharacterizationQuickCountCell } from '@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/CharacterizationQuickCountCell';
import { CharacterizationRisksQuickCell } from '@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/CharacterizationRisksQuickCell';
import { CharacterizationTechnicalContentCell } from '@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/CharacterizationTechnicalContentCell';
import { CharacterizationEnvironmentalParamsCell } from '@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/CharacterizationEnvironmentalParamsCell';
import { INACTIVE_ACTION_TOOLTIP } from '@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/invalidate-characterization-inventory';
import { shouldShowQuickUnlink } from '@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/characterization-link-cleanup.util';
import { CharacterizationOrderByEnum } from '@v2/services/security/characterization/characterization/browse-characterization/service/browse-characterization.types';
import { SIconButtonRow } from '../../addons/addons-rows/SIconButtonRow/SIconButtonRow';
import { SInputNumberButtonRow } from '../../addons/addons-rows/SInputNumberButtonRow/SInputNumberButtonRow';
import { SSelectHRow } from '../../addons/addons-rows/SCheckSelectFullRow/SCheckSelectHRow';
import { SSelectRow } from '../../addons/addons-rows/SCheckSelectFullRow/SCheckSelectRow';
import { SStatusButtonRow } from '../../addons/addons-rows/SStatusButtonRow/SStatusButtonRow';
import { STextRow } from '../../addons/addons-rows/STextRow/STextRow';
import { STablePagination } from '../../addons/addons-table/STablePagination/STablePagination';
import { STable } from '../../common/STable/STable';
import { ITableData } from '../../common/STable/STable.types';
import { STableBody } from '../../common/STableBody/STableBody';
import { STableHeader } from '../../common/STableHeader/STableHeader';
import { STableHRow } from '../../common/STableHRow/STableHRow';
import { STableRow } from '../../common/STableRow/STableRow';
import { mapOrderByTable } from '../../helpers/map-order-by-table.helper';
import { CharacterizationHeaderRow } from './components/CharacterizationHeaderRow/CharacterizationHeaderRow';
import { CharacterizationColumnsEnum as columnsEnum } from './enums/characterization-columns.enum';
import { getHiddenColumn } from './helpers/get-hidden-column';
import { CharacterizationColumnMap as columnMap } from './maps/characterization-column-map';
import { CharacterizationTypeMap } from './maps/characterization-type-map';
import { HirarchyTypeMap } from './maps/hierarchy-type-map';
import { ICharacterizationTableTableProps } from './SCharacterizationTable.types';

export const SCharacterizationTable: FC<ICharacterizationTableTableProps> = ({
  data = [],
  table,
  filters,
  setFilters,
  isLoading,
  hideEmpty,
  contentEmpty,
  pagination,
  setPage,
  setOrderBy,
  statusButtonProps,
  onEditStage,
  onEditPosition,
  onSelectRow,
  onEditRow,
  onQuickRisks,
  onQuickCargos,
  onQuickUnlinkCargo,
  canQuickUnlinkCargo = false,
  quickUnlinkCargoLoadingId = null,
  onQuickPhotos,
  onQuickRename,
  onQuickType,
  onQuickTechnicalContent,
  onQuickAiAssist,
  onQuickAiSummary,
  onQuickEnvironmentalParams,
  hiddenColumns,
  filterColumns,
  setHiddenColumns,
  pageSizeOptions,
  onPageSizeChange,
  part = 'full',
}) => {
  const orderByMap = mapOrderByTable(filters.orderBy);

  const tableRows: ITableData<CharacterizationBrowseResultModel>[] = [
    {
      column: '20px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.CHECK_BOX),
      header: <SSelectHRow table={table} ids={data.map((row) => row.id)} />,
      row: (row) => <SSelectRow table={table} id={row.id} />,
    },
    {
      column: 'minmax(200px, 1fr)',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.NAME),
      header: (
        <CharacterizationHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={CharacterizationOrderByEnum.NAME}
          text={columnMap[columnsEnum.NAME].label}
        />
      ),
      row: (row) => (
        <Box
          display="flex"
          alignItems="center"
          gap={0.5}
          onClick={(e: MouseEvent) => e.stopPropagation()}
        >
          <Box flex={1} minWidth={0}>
            <STextRow text={row.name} />
          </Box>
          {onQuickRename ? (
            <Tooltip
              title={
                row.isInactive
                  ? INACTIVE_ACTION_TOOLTIP
                  : 'Renomear elemento'
              }
            >
              <span>
                <IconButton
                  size="small"
                  disabled={row.isInactive}
                  aria-label="Renomear elemento"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!row.isInactive) onQuickRename(row);
                  }}
                  sx={{ p: 0.25 }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>
          ) : null}
        </Box>
      ),
    },
    {
      column: '150px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.TYPE),
      header: (
        <CharacterizationHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({ ...hiddenColumns, [columnsEnum.TYPE]: true })
          }
          field={CharacterizationOrderByEnum.TYPE}
          text={columnMap[columnsEnum.TYPE].label}
        />
      ),
      row: (row) =>
        onQuickType ? (
          <Box onClick={(e: MouseEvent) => e.stopPropagation()}>
            <Tooltip
              title={
                row.isInactive
                  ? INACTIVE_ACTION_TOOLTIP
                  : 'Alterar tipo do elemento'
              }
            >
              <span>
                <Box
                  component="button"
                  type="button"
                  disabled={row.isInactive}
                  onClick={() => {
                    if (!row.isInactive) onQuickType(row);
                  }}
                  sx={{
                    border: 0,
                    background: 'none',
                    cursor: row.isInactive ? 'not-allowed' : 'pointer',
                    color: row.isInactive ? 'text.disabled' : 'primary.main',
                    textDecoration: row.isInactive ? 'none' : 'underline',
                    fontSize: 13,
                    p: 0,
                    textAlign: 'left',
                  }}
                >
                  {CharacterizationTypeMap[row.type].rowLabel}
                </Box>
              </span>
            </Tooltip>
          </Box>
        ) : (
          <STextRow text={CharacterizationTypeMap[row.type].rowLabel} />
        ),
    },
    {
      column: '90px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.PHOTOS),
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({ ...hiddenColumns, [columnsEnum.PHOTOS]: true })
          }
          field={CharacterizationOrderByEnum.PHOTOS}
          text={columnMap[columnsEnum.PHOTOS].label}
        />
      ),
      row: (row) =>
        onQuickPhotos ? (
          <CharacterizationQuickCountCell
            count={(row.photos ?? []).length}
            disabled={row.isInactive}
            disabledReason={INACTIVE_ACTION_TOOLTIP}
            emptyTooltip="Adicionar fotografia"
            countTooltip="Gerenciar fotografias"
            addTooltip="Adicionar fotografia"
            onOpen={() => onQuickPhotos(row, false)}
            onAdd={() => onQuickPhotos(row, true)}
          />
        ) : (
          <STextRow
            justify="center"
            text={String(row.photos?.length ?? 0)}
          />
        ),
    },
    {
      column: '100px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.CREATED_AT),
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({
              ...hiddenColumns,
              [columnsEnum.CREATED_AT]: true,
            })
          }
          field={CharacterizationOrderByEnum.CREATED_AT}
          text={columnMap[columnsEnum.CREATED_AT].label}
        />
      ),
      row: (row) => (
        <STextRow
          justify="center"
          text={row.formatedCreatedAt.date}
          tooltipTitle={row.formatedCreatedAt.fullTime}
        />
      ),
    },
    {
      column: '100px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.UPDATED_AT),
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({
              ...hiddenColumns,
              [columnsEnum.UPDATED_AT]: true,
            })
          }
          field={CharacterizationOrderByEnum.UPDATED_AT}
          text={columnMap[columnsEnum.UPDATED_AT].label}
        />
      ),
      row: (row) => (
        <STextRow
          justify="center"
          text={row.formatedUpdatedAt.date}
          tooltipTitle={row.formatedUpdatedAt.fullTime}
        />
      ),
    },
    {
      column: '70px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.ORDER),
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({ ...hiddenColumns, [columnsEnum.ORDER]: true })
          }
          field={CharacterizationOrderByEnum.ORDER}
          text={columnMap[columnsEnum.ORDER].label}
        />
      ),
      row: (row) => (
        <SInputNumberButtonRow
          label={row.order}
          onSelect={(order) => onEditPosition(order, row)}
        />
      ),
    },
    {
      column: '70px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.RISKS),
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({ ...hiddenColumns, [columnsEnum.RISKS]: true })
          }
          field={CharacterizationOrderByEnum.RISKS}
          text={columnMap[columnsEnum.RISKS].label}
        />
      ),
      row: (row) =>
        onQuickRisks ? (
          <CharacterizationRisksQuickCell
            count={(row.risks ?? []).length}
            countTooltip={
              (row.risks ?? []).map((risk) => risk.name).join('\n') ||
              'Abrir Fatores de Risco'
            }
            onOpenFactors={() => onQuickRisks(row, 'factors')}
            onOpenAiAnalysis={() => onQuickRisks(row, 'ai')}
            aiDisabled={row.isInactive}
            aiDisabledReason={INACTIVE_ACTION_TOOLTIP}
            aiTooltip="Analisar riscos com IA"
          />
        ) : (
          <STextRow
            justify="center"
            text={(row.risks ?? []).length || '-'}
            tooltipTitle={
              <div>
                {(row.risks ?? []).map((risk) => (
                  <p key={risk.id}>{risk.name}</p>
                ))}
              </div>
            }
          />
        ),
    },
    {
      column: '70px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.PROFILES),
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({ ...hiddenColumns, [columnsEnum.PROFILES]: true })
          }
          field={CharacterizationOrderByEnum.PROFILES}
          text={columnMap[columnsEnum.PROFILES].label}
        />
      ),
      row: (row) => (
        <STextRow
          justify="center"
          text={(row.profiles ?? []).length || '-'}
          tooltipTitle={
            <div>
              {(row.profiles ?? []).map((profile) => (
                <p key={profile.id}>{profile.name}</p>
              ))}
            </div>
          }
        />
      ),
    },
    {
      column: '128px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.TECHNICAL_CONTENT),
      header: (
        <STableHRow boxProps={{ justifyContent: 'center' }}>
          {columnMap[columnsEnum.TECHNICAL_CONTENT].label}
        </STableHRow>
      ),
      row: (row) =>
        onQuickTechnicalContent || onQuickAiAssist || onQuickAiSummary ? (
          <CharacterizationTechnicalContentCell
            row={row}
            onOpen={() => onQuickTechnicalContent?.(row)}
            onOpenAssist={() => onQuickAiAssist?.(row)}
            onOpenSummary={() => onQuickAiSummary?.(row)}
          />
        ) : (
          <STextRow justify="center" text="-" />
        ),
    },
    {
      column: '130px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.ENVIRONMENTAL_PARAMS),
      header: (
        <STableHRow boxProps={{ justifyContent: 'center' }}>
          {columnMap[columnsEnum.ENVIRONMENTAL_PARAMS].label}
        </STableHRow>
      ),
      row: (row) =>
        onQuickEnvironmentalParams ? (
          <CharacterizationEnvironmentalParamsCell
            row={row}
            onOpen={() => onQuickEnvironmentalParams(row)}
          />
        ) : (
          <STextRow justify="center" text="-" />
        ),
    },
    {
      column: '90px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.HIERARCHY),
      header: (
        <CharacterizationHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({
              ...hiddenColumns,
              [columnsEnum.HIERARCHY]: true,
            })
          }
          field={CharacterizationOrderByEnum.HIERARCHY}
          text={columnMap[columnsEnum.HIERARCHY].label}
        />
      ),
      row: (row) =>
        onQuickCargos ? (
          <CharacterizationQuickCountCell
            count={(row.hierarchies ?? []).length}
            disabled={row.isInactive}
            disabledReason={INACTIVE_ACTION_TOOLTIP}
            emptyTooltip="Adicionar cargo ao elemento"
            countTooltip={
              (row.hierarchies ?? [])
                .map(
                  (hierarchy) =>
                    `(${HirarchyTypeMap[hierarchy.type]?.label || hierarchy.type}) ${hierarchy.name}`,
                )
                .join('\n') || 'Gerenciar cargos vinculados'
            }
            addTooltip="Adicionar cargo ao elemento"
            onOpen={() => onQuickCargos(row, false)}
            onAdd={() => onQuickCargos(row, true)}
            showQuickUnlink={
              canQuickUnlinkCargo &&
              shouldShowQuickUnlink((row.hierarchies ?? []).length)
            }
            onQuickUnlink={
              onQuickUnlinkCargo
                ? () => onQuickUnlinkCargo(row)
                : undefined
            }
            quickUnlinkLoading={quickUnlinkCargoLoadingId === row.id}
            quickUnlinkTooltip="Remover vínculo do cargo"
          />
        ) : (
          <STextRow
            justify="center"
            text={(row.hierarchies ?? []).length || '-'}
            tooltipTitle={
              <div>
                {(row.hierarchies ?? []).map((hierarchy) => (
                  <p key={hierarchy.id}>
                    ({HirarchyTypeMap[hierarchy.type]?.label || hierarchy.type}){' '}
                    {hierarchy.name}
                  </p>
                ))}
              </div>
            }
          />
        ),
    },
    {
      column: '180px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.STAGE),
      header: (
        <CharacterizationHeaderRow
          justify="center"
          isFiltered={!!filters.stageIds?.length}
          onClean={() => setFilters({ ...filters, stageIds: [] })}
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({ ...hiddenColumns, [columnsEnum.STAGE]: true })
          }
          filters={filterColumns[columnsEnum.STAGE]}
          field={CharacterizationOrderByEnum.STAGE}
          text={columnMap[columnsEnum.STAGE].label}
        />
      ),
      row: (row) => (
        <SStatusButtonRow
          label={row.stage?.name || '-'}
          color={row.stage?.color}
          popperStatusProps={{
            ...statusButtonProps,
            onSelect: (id) => onEditStage(id, row),
          }}
        />
      ),
    },
    {
      column: '80px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.EDIT),
      header: (
        <STableHRow justify="center">{columnMap[columnsEnum.EDIT].label}</STableHRow>
      ),
      row: (row) => (
        <SIconButtonRow onClick={() => (onEditRow ?? onSelectRow)(row)}>
          <EditIcon />
        </SIconButtonRow>
      ),
    },
  ];

  if (part === 'header') {
    return (
      <STable
        table={tableRows}
        data={[]}
        renderHeader={(headers) => <STableHeader>{headers}</STableHeader>}
        renderBody={() => null}
      />
    );
  }

  if (part === 'body') {
    return (
      <>
        <STable
          isLoadingMore={isLoading}
          table={tableRows}
          data={data}
          renderHeader={() => null}
          renderBody={({ data: rowsData, rows }) => (
            <STableBody
              rows={rowsData}
              hideEmpty={hideEmpty}
              contentEmpty={contentEmpty}
              renderRow={(row) => (
                <STableRow
                  status={row.isInactive ? 'inactive' : 'none'}
                  clickable
                  onClick={() => onSelectRow(row)}
                  key={row.id}
                  minHeight={35}
                >
                  {rows.map((render) => render(row))}
                </STableRow>
              )}
            />
          )}
        />
        <STablePagination
          isLoading={isLoading}
          total={pagination?.total}
          limit={pagination?.limit}
          page={pagination?.page}
          setPage={setPage}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={onPageSizeChange}
        />
      </>
    );
  }

  return (
    <>
      <STable
        isLoadingMore={isLoading}
        table={tableRows}
        data={data}
        renderHeader={(headers) => <STableHeader>{headers}</STableHeader>}
        renderBody={({ data: rowsData, rows }) => (
          <STableBody
            rows={rowsData}
            hideEmpty={hideEmpty}
            contentEmpty={contentEmpty}
            renderRow={(row) => {
              return (
                <STableRow
                  status={row.isInactive ? 'inactive' : 'none'}
                  clickable
                  onClick={() => onSelectRow(row)}
                  key={row.id}
                  minHeight={35}
                >
                  {rows.map((render) => render(row))}
                </STableRow>
              );
            }}
          />
        )}
      />
      <STablePagination
        isLoading={isLoading}
        total={pagination?.total}
        limit={pagination?.limit}
        page={pagination?.page}
        setPage={setPage}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={onPageSizeChange}
      />
    </>
  );
};
