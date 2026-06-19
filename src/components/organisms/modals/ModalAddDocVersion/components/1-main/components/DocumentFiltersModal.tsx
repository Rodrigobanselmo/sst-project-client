import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { SButton } from 'components/atoms/SButton';

import { SelectGroup } from '../../last-version/SelectGroup';
import {
  DocumentFilterSelection,
} from '../../last-version/document-filter.types';

type DocumentFiltersModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (selection: DocumentFilterSelection) => void;
  companyId: string;
  workspaceId: string;
  selection: DocumentFilterSelection;
};

export const DocumentFiltersModal = ({
  open,
  onClose,
  onConfirm,
  companyId,
  workspaceId,
  selection,
}: DocumentFiltersModalProps) => {
  const [draft, setDraft] = useState<DocumentFilterSelection>(selection);

  useEffect(() => {
    if (open) {
      setDraft(selection);
    }
  }, [open, selection]);

  const handleConfirm = () => {
    onConfirm(draft);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Selecionar filtros</DialogTitle>
      <DialogContent>
        <SelectGroup
          companyId={companyId}
          workspaceId={workspaceId}
          selecteds={draft.selecteds}
          onSelectedsChange={(selecteds) =>
            setDraft((current) => ({ ...current, selecteds }))
          }
          viewDataType={draft.viewDataType}
          onViewDataTypeChange={(viewDataType) =>
            setDraft((current) => ({ ...current, viewDataType }))
          }
        />
      </DialogContent>
      <DialogActions sx={{ px: 8, pb: 6, gap: 4 }}>
        <SButton variant="outlined" onClick={onClose}>
          Fechar
        </SButton>
        <SButton onClick={handleConfirm}>Confirmar</SButton>
      </DialogActions>
    </Dialog>
  );
};
