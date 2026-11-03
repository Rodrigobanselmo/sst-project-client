import { useState } from 'react';
import { Alert, Button, Stack } from '@mui/material';

import { useSstAccess } from './access';
import { HistoryView } from './HistoryView';
import { StructuralArchivedButton } from './StructuralArchivedButton';
import { StructuralRevisionDialog } from './StructuralRevisionDialog';
import type { StructuralTarget } from './structural-review-model';

export function StructuralSourceActions({
  companyId,
  target,
  disabled = false,
  onChanged,
}: {
  companyId: string;
  target: StructuralTarget;
  disabled?: boolean;
  onChanged?: () => void;
}) {
  const access = useSstAccess();
  const [mode, setMode] = useState<'history' | 'review' | null>(null);
  if (!access.canReadStructure(target.table) || !companyId || !target.id)
    return null;
  return (
    <Stack spacing={8} useFlexGap sx={{ my: '16px' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={8} useFlexGap>
        {access.canRead && (
          <Button
            type="button"
            variant="outlined"
            disabled={disabled}
            onClick={() => setMode('history')}
          >
            Consultar períodos deste cadastro
          </Button>
        )}
        {access.canUpdateStructure(target.table) && (
          <Button
            type="button"
            variant="outlined"
            disabled={disabled}
            onClick={() => setMode('review')}
          >
            {access.canConfigure
              ? 'Revisar dados e participações'
              : 'Revisar encerramento'}
          </Button>
        )}
        <StructuralArchivedButton
          companyId={companyId}
          table={target.table}
          disabled={disabled}
        />
      </Stack>
      {disabled && (
        <Alert severity="info">
          Salve ou desfaça as alterações do formulário antes de revisar os
          períodos deste cadastro.
        </Alert>
      )}
      {mode === 'history' && (
        <HistoryView
          companyId={companyId}
          table={target.table}
          id={target.id}
          onClose={() => setMode(null)}
        />
      )}
      {mode === 'review' && (
        <StructuralRevisionDialog
          companyId={companyId}
          target={target}
          action={access.canConfigure ? 'METADATA' : 'ARCHIVE'}
          onClose={() => setMode(null)}
          onApplied={() => {
            setMode(null);
            onChanged?.();
          }}
        />
      )}
    </Stack>
  );
}
