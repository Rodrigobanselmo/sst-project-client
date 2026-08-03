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
import { useRef, useState } from 'react';

import { usePreventAction } from 'core/hooks/usePreventAction';

import {
  buildBulkUnlinkConfirmMessage,
  buildDeleteManyWithCleanupMessage,
  CHARACTERIZATION_LINK_CLEANUP_TEXTS,
  countActiveLinksFromBrowseRows,
} from '../../quick-actions/characterization-link-cleanup.util';

interface CharacterizationTableSelectionProps {
  table: TablesSelectEnum;
  onEditMany: (props: { ids: string[]; stageId?: number | null }) => void;
  onDeleteMany: (ids: string[]) => Promise<boolean>;
  onBulkUnlink?: (ids: string[]) => Promise<boolean>;
  canBulkUnlink?: boolean;
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
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      return await fn();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
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
            text="Atualizar Status"
          />
        )}
        renderItem={SSearchSelectRenderOptionStatusRenderOptionStatus}
        label="Status"
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option?.id}
        onChange={(option) => {
          onEditMany({ ids: selectedIds, stageId: option?.id || null });
        }}
        options={stages}
        placeholder="selecione um ou mais status"
      />
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
