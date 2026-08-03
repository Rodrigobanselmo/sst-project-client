import { SIconStatus } from '@v2/assets/icons/SIconStatus/SIconStatus';
import { SIconDelete } from '@v2/assets/icons/SIconDelete/SIconDelete';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SSearchSelectRenderOptionStatusRenderOptionStatus } from '@v2/components/forms/fields/SSearchSelect/addons/render-option/RenderOptionStatus/RenderOptionStatus';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { STableSelection } from '@v2/components/organisms/STable/addons/addons-table/STableSelectionUpdate/STableSelectionUpdate';
import {
  TablesSelectEnum,
  useTableSelect,
} from '@v2/components/organisms/STable/hooks/useTableSelect';
import { CharacterizationBrowseResultModel } from '@v2/models/security/models/characterization/characterization-browse-result.model';
import { StatusBrowseResultModel } from '@v2/models/security/models/status/status-browse-result.model';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import { useRef, useState } from 'react';

import { usePreventAction } from 'core/hooks/usePreventAction';

import {
  buildBulkUnlinkConfirmMessage,
  buildDeleteManyWithCleanupMessage,
  CHARACTERIZATION_LINK_CLEANUP_TEXTS,
  countActiveLinksFromBrowseRows,
} from '../../quick-actions/characterization-link-cleanup.util';
import {
  buildActivateConfirmMessage,
  buildInactivateConfirmMessage,
  CHARACTERIZATION_BULK_STATUS_TEXTS,
  CharacterizationOperationalStatus,
} from '../../quick-actions/characterization-bulk-status.util';
import type { BulkUpdateCharacterizationStatusResponse } from '../../quick-actions/characterization-bulk-status.api';

type OperationalStatusOption = {
  id: CharacterizationOperationalStatus;
  name: string;
};

const OPERATIONAL_STATUS_OPTIONS: OperationalStatusOption[] = [
  { id: 'ACTIVE', name: 'Ativar elementos' },
  { id: 'INACTIVE', name: 'Inativar elementos' },
];

interface CharacterizationTableSelectionProps {
  table: TablesSelectEnum;
  onEditMany: (props: { ids: string[]; stageId?: number | null }) => void;
  onDeleteMany: (ids: string[]) => Promise<boolean>;
  onBulkUnlink?: (ids: string[]) => Promise<boolean>;
  canBulkUnlink?: boolean;
  onBulkStatus?: (
    ids: string[],
    status: CharacterizationOperationalStatus,
  ) => Promise<boolean>;
  previewBulkStatus?: (
    ids: string[],
    status: CharacterizationOperationalStatus,
  ) => Promise<BulkUpdateCharacterizationStatusResponse | null>;
  canBulkStatus?: boolean;
  rows: CharacterizationBrowseResultModel[];
  stages: StatusBrowseResultModel[];
}

export const CharacterizationTableSelection = ({
  table,
  stages,
  onEditMany,
  onDeleteMany,
  onBulkUnlink,
  canBulkUnlink = false,
  onBulkStatus,
  previewBulkStatus,
  canBulkStatus = false,
  rows,
}: CharacterizationTableSelectionProps) => {
  useTableSelect((state) => state.versions[table]); // used to rerender page on id change
  const selectedIds = useTableSelect((state) => state.getIds)(table)();
  const clear = useTableSelect((state) => state.clear)(table);
  const { preventDelete } = usePreventAction();
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  const selectedRows = rows.filter((row) => selectedIds.includes(row.id));
  const linkStats = countActiveLinksFromBrowseRows(selectedRows);

  const runGuarded = async (fn: () => Promise<boolean>) => {
    if (busyRef.current) return false;
    busyRef.current = true;
    setBusy(true);
    try {
      return await fn();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const handleOperationalStatus = async (
    status: CharacterizationOperationalStatus,
  ) => {
    if (!onBulkStatus || !previewBulkStatus || busyRef.current) return;

    busyRef.current = true;
    setBusy(true);
    let summary: BulkUpdateCharacterizationStatusResponse | null = null;
    try {
      summary = await previewBulkStatus(selectedIds, status);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }

    if (!summary) return;

    if (status === 'ACTIVE') {
      const texts = CHARACTERIZATION_BULK_STATUS_TEXTS.activate;
      preventDelete(
        () => {
          void runGuarded(async () => {
            const ok = await onBulkStatus(selectedIds, status);
            if (ok) clear();
            return ok;
          });
        },
        buildActivateConfirmMessage({
          willUpdate: summary.eligibleElements,
          alreadyActive: summary.alreadyInTargetStatus,
        }),
        {
          title: texts.title,
          confirmText: texts.confirm,
          confirmCancel: texts.cancel,
          tag: 'warning',
        },
      );
      return;
    }

    const texts = CHARACTERIZATION_BULK_STATUS_TEXTS.inactivate;
    if (summary.eligibleElements === 0 && summary.blockedElements > 0) {
      preventDelete(
        () => undefined,
        buildInactivateConfirmMessage({
          willUpdate: 0,
          alreadyInactive: summary.alreadyInTargetStatus,
          blocked: summary.blockedElements,
        }),
        {
          title: 'Nenhum elemento elegível para inativação',
          confirmText: 'Entendi',
          confirmCancel: texts.cancel,
          tag: 'warning',
        },
      );
      return;
    }

    preventDelete(
      () => {
        void runGuarded(async () => {
          const ok = await onBulkStatus(selectedIds, status);
          if (ok) clear();
          return ok;
        });
      },
      buildInactivateConfirmMessage({
        willUpdate: summary.eligibleElements,
        alreadyInactive: summary.alreadyInTargetStatus,
        blocked: summary.blockedElements,
      }),
      {
        title: texts.title,
        confirmText: texts.confirm,
        confirmCancel: texts.cancel,
        tag: 'warning',
      },
    );
  };

  return (
    <STableSelection table={table}>
      <SSearchSelect
        inputProps={{ sx: { width: 300 } }}
        component={() => (
          <SButton
            icon={<SIconStatus />}
            color="paper"
            variant="outlined"
            text="Atualizar etapa"
          />
        )}
        renderItem={SSearchSelectRenderOptionStatusRenderOptionStatus}
        label="Etapa"
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option?.id}
        onChange={(option) => {
          onEditMany({ ids: selectedIds, stageId: option?.id || null });
        }}
        options={stages}
        placeholder="selecione a etapa do fluxo"
      />
      {canBulkStatus && onBulkStatus && previewBulkStatus ? (
        <SSearchSelect
          inputProps={{ sx: { width: 260 } }}
          component={() => (
            <SButton
              icon={<ToggleOnIcon fontSize="small" />}
              color="paper"
              variant="outlined"
              text="Atualizar Status"
              disabled={busy || selectedIds.length === 0}
            />
          )}
          label="Status operacional"
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option?.id}
          onChange={(option) => {
            if (!option?.id || busy) return;
            void handleOperationalStatus(option.id);
          }}
          options={OPERATIONAL_STATUS_OPTIONS}
          placeholder="Ativar ou Inativar"
        />
      ) : null}
      {canBulkUnlink && onBulkUnlink ? (
        <SButton
          icon={<LinkOffIcon fontSize="small" />}
          color="paper"
          variant="outlined"
          text="Remover vínculos de cargos"
          disabled={busy || selectedIds.length === 0}
          onClick={() => {
            const texts = CHARACTERIZATION_LINK_CLEANUP_TEXTS.bulkUnlink;
            preventDelete(
              () => {
                void runGuarded(async () => {
                  const ok = await onBulkUnlink(selectedIds);
                  if (ok) clear();
                  return ok;
                });
              },
              buildBulkUnlinkConfirmMessage({
                linksCount: linkStats.activeLinks,
                elementsWithLinks: linkStats.elementsWithLinks,
              }),
              {
                title: texts.title,
                confirmText: texts.confirm,
                confirmCancel: texts.cancel,
              },
            );
          }}
        />
      ) : null}
      <SButton
        icon={<SIconDelete />}
        color="paper"
        variant="outlined"
        text="Excluir"
        disabled={busy || selectedIds.length === 0}
        onClick={() => {
          const texts = CHARACTERIZATION_LINK_CLEANUP_TEXTS.deleteWithCleanup;
          const hasLinks = linkStats.activeLinks > 0;
          preventDelete(
            () => {
              void runGuarded(async () => {
                const deleted = await onDeleteMany(selectedIds);
                if (deleted) clear();
                return deleted;
              });
            },
            buildDeleteManyWithCleanupMessage({
              elements: selectedIds.length,
              activeLinks: linkStats.activeLinks,
            }),
            {
              title: hasLinks
                ? texts.title
                : 'Excluir caracterizações selecionadas?',
              confirmText: hasLinks ? texts.confirm : 'Excluir',
              confirmCancel: texts.cancel,
            },
          );
        }}
      />
    </STableSelection>
  );
};
