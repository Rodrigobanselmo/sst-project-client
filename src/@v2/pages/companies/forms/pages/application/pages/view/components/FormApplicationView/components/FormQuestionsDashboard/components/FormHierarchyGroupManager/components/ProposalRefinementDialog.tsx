import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { SectorPicker } from './SectorPicker';
export type RefinementSector = {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  companyFantasy?: string;
  establishments: string[];
  respondents: number;
  participants: number;
  hierarchyPath?: { id: string; name: string; type: string }[];
};
export type RefinementGroup = {
  name: string;
  hierarchyIds: string[];
  category: string;
  rationale: string;
};
const category = (ids: string[], sectors: RefinementSector[]) =>
  ids.every((id) => sectors.find((s) => s.id === id)!.respondents >= 3)
    ? 'MACRO'
    : ids.every((id) => sectors.find((s) => s.id === id)!.respondents < 3)
      ? 'LOW_RESPONSE'
      : 'MIXED';
export function ProposalRefinementDialog({
  index,
  groups,
  sectors,
  mode,
  onClose,
  onSave,
  busy,
  error,
}: {
  index: number;
  groups: RefinementGroup[];
  sectors: RefinementSector[];
  mode: string;
  onClose: () => void;
  onSave: (value: {
    name: string;
    hierarchyIds: string[];
    justification: string;
  }) => void;
  busy: boolean;
  error: string;
}) {
  const group = groups[index];
  const [name, setName] = useState(group.name),
    [ids, setIds] = useState(group.hierarchyIds),
    [justification, setJustification] = useState('');
  const originalCompany = sectors.find(
    (s) => s.id === group.hierarchyIds[0],
  )?.companyId;
  const candidates = sectors.filter((s) => {
    if (mode === 'SEPARATE' && s.companyId !== originalCompany) return false;
    if (group.category === 'LOW_RESPONSE' && s.respondents >= 3) return false;
    if (group.category === 'MACRO' && s.respondents < 3) return false;
    const source = groups.findIndex((g) => g.hierarchyIds.includes(s.id));
    if (source >= 0 && source !== index) {
      const remainder = groups[source].hierarchyIds.filter((id) => id !== s.id);
      if (
        remainder.length < 2 ||
        category(remainder, sectors) !== groups[source].category
      )
        return false;
    }
    return true;
  });
  const moves = groups.flatMap((g, i) =>
    i === index
      ? []
      : g.hierarchyIds
          .filter((id) => ids.includes(id))
          .map((id) => `${sectors.find((s) => s.id === id)?.name} (${g.name})`),
  );
  const valid =
    ids.length >= 2 &&
    category(ids, sectors) === group.category &&
    !!name.trim() &&
    !!justification.trim();
  return (
    <Dialog
      open
      maxWidth="md"
      fullWidth
      onClose={() => !busy && onClose()}
      aria-labelledby="refine-proposal-title"
    >
      <DialogTitle id="refine-proposal-title">
        Ajustar proposta · {group.name}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={8}>
          <Alert severity="info">
            Você pode renomear, retirar, adicionar ou transferir setores de
            outra proposta. As opções respeitam a categoria de respondentes e o
            tratamento das empresas. Cada proposta precisa manter pelo menos
            dois setores. A validação e as contagens serão refeitas sem chamar a
            IA.
          </Alert>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Nome da proposta"
            value={name}
            inputProps={{ maxLength: 100 }}
            disabled={busy}
            onChange={(e) => setName(e.target.value)}
          />
          <SectorPicker
            options={candidates.map((s) => ({
              ...s,
              establishment: s.establishments.join(', '),
              participantCount: s.participants,
              respondentCount: s.respondents,
            }))}
            selected={ids}
            onChange={setIds}
            disabled={busy}
          />
          <Typography fontWeight={700}>
            Composição:{' '}
            {ids
              .map((id) => sectors.find((s) => s.id === id)?.name)
              .join(' · ') || 'Nenhum setor'}
          </Typography>
          {moves.length > 0 && (
            <Alert severity="warning">
              Serão transferidos, saindo das propostas de origem:{' '}
              {moves.join('; ')}. As propostas afetadas precisarão de nova
              confirmação.
            </Alert>
          )}
          {!valid && (
            <Typography color="text.secondary">
              Mantenha ao menos dois setores, preserve a categoria e preencha
              nome e justificativa.
            </Typography>
          )}
          <TextField
            label="Justificativa do ajuste e da similaridade"
            multiline
            minRows={3}
            required
            value={justification}
            inputProps={{ maxLength: 450 }}
            helperText={`${justification.length}/450 · Registre por que a composição ajustada representa contextos de trabalho semelhantes.`}
            disabled={busy}
            onChange={(e) => setJustification(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 8, gap: 4 }}>
        <Button disabled={busy} onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={busy || !valid}
          onClick={() =>
            onSave({
              name: name.trim(),
              hierarchyIds: ids,
              justification: justification.trim(),
            })
          }
        >
          {busy ? 'Validando ajustes…' : 'Validar e usar ajustes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
