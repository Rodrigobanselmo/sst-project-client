import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { SButton } from 'components/atoms/SButton';

import { SelectGroup } from '../../last-version/SelectGroup';

type DocumentFiltersModalProps = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  workspaceId: string;
  groupsRef: React.MutableRefObject<{ selecteds: { id: string }[] } | null>;
};

export const DocumentFiltersModal = ({
  open,
  onClose,
  companyId,
  workspaceId,
  groupsRef,
}: DocumentFiltersModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Selecionar filtros</DialogTitle>
      <DialogContent>
        <SelectGroup
          compRef={groupsRef}
          companyId={companyId}
          workspaceId={workspaceId}
        />
      </DialogContent>
      <DialogActions sx={{ px: 8, pb: 6 }}>
        <SButton variant="outlined" onClick={onClose}>
          Fechar
        </SButton>
      </DialogActions>
    </Dialog>
  );
};
