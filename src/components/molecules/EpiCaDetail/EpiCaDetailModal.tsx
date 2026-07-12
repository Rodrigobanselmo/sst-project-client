import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import { IEpi } from 'core/interfaces/api/IEpi';

import { EpiCaDetailContent } from './EpiCaDetailContent';

export type EpiCaDetailModalProps = {
  epi: IEpi | null;
  open: boolean;
  onClose: () => void;
};

export function EpiCaDetailModal({ epi, open, onClose }: EpiCaDetailModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Detalhe do EPI / CA
        {epi?.ca ? ` · ${epi.ca}` : ''}
      </DialogTitle>
      <DialogContent dividers>
        {epi ? <EpiCaDetailContent epi={epi} /> : null}
      </DialogContent>
    </Dialog>
  );
}
