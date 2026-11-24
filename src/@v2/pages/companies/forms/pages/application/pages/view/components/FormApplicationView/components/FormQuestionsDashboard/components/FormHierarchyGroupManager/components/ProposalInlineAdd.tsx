import { useState } from 'react';
import { Alert, Autocomplete, Button, Stack, TextField } from '@mui/material';
import type {
  RefinementGroup,
  RefinementSector,
} from './ProposalRefinementDialog';
import { labeledHierarchyContext } from '../helpers/formatHierarchyGroupOptionLabel';
import { HierarchyLabel } from './HierarchyLabel';

const category = (ids: string[], sectors: RefinementSector[]) =>
  ids.every((id) => sectors.find((s) => s.id === id)!.respondents >= 3)
    ? 'MACRO'
    : ids.every((id) => sectors.find((s) => s.id === id)!.respondents < 3)
      ? 'LOW_RESPONSE'
      : 'MIXED';
export function ProposalInlineAdd({
  index,
  groups,
  sectors,
  mode,
  busy,
  onAdd,
}: {
  index: number;
  groups: RefinementGroup[];
  sectors: RefinementSector[];
  mode: string;
  busy: boolean;
  onAdd: (sector: RefinementSector) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false),
    [pending, setPending] = useState<RefinementSector | null>(null);
  const group = groups[index];
  const candidates = sectors.filter((s) => {
    if (group.hierarchyIds.includes(s.id)) return false;
    if (
      mode === 'SEPARATE' &&
      s.companyId !==
        sectors.find((s) => s.id === group.hierarchyIds[0])?.companyId
    )
      return false;
    if (category([...group.hierarchyIds, s.id], sectors) !== group.category)
      return false;
    const source = groups.findIndex((g) => g.hierarchyIds.includes(s.id));
    if (source >= 0) {
      const remainder = groups[source].hierarchyIds.filter((id) => id !== s.id);
      if (
        remainder.length < 2 ||
        category(remainder, sectors) !== groups[source].category
      )
        return false;
    }
    return true;
  });
  const source = pending
    ? groups.findIndex((g) => g.hierarchyIds.includes(pending.id))
    : -1;
  const participantLabel = (s: RefinementSector) =>
    `(${s.participants} ${s.participants === 1 ? 'participante' : 'participantes'})`;
  const contextLabel = (s: RefinementSector) =>
    labeledHierarchyContext({
      ...s,
      establishment: s.establishments.join(', '),
    }).join(' — ');
  const label = (s: RefinementSector) =>
    `Setor: ${s.name} ${participantLabel(s)} — ${contextLabel(s)}`;
  async function add(s: RefinementSector) {
    if (await onAdd(s)) {
      setPending(null);
      setOpen(false);
    }
  }
  return (
    <Stack spacing={4} sx={{ width: '100%', minWidth: 0 }}>
      {!open ? (
        <Button
          size="small"
          sx={{ alignSelf: 'flex-start' }}
          disabled={busy}
          onClick={() => setOpen(true)}
        >
          Adicionar setor
        </Button>
      ) : (
        <>
          <Autocomplete
            fullWidth
            options={candidates}
            value={null}
            disabled={busy || !!pending}
            getOptionLabel={label}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            onChange={(_, s) => {
              if (!s) return;
              const origin = groups.findIndex((g) =>
                g.hierarchyIds.includes(s.id),
              );
              if (origin >= 0) setPending(s);
              else void add(s);
            }}
            renderOption={(props, s) => {
              const { key, ...rest } = props;
              return (
                <li key={key} {...rest}>
                  <span>
                    <HierarchyLabel
                      text={`Setor: ${s.name}`}
                      emphasizeLevel="Setor"
                    />{' '}
                    <span style={{ fontWeight: 400 }}>
                      {participantLabel(s)}
                    </span>
                    {contextLabel(s) && (
                      <>
                        {' '}
                        — <HierarchyLabel text={contextLabel(s)} />
                      </>
                    )}
                  </span>
                </li>
              );
            }}
            noOptionsText="Nenhum setor elegível disponível. A transferência deve preservar ao menos dois setores e a categoria na proposta de origem."
            renderInput={(p) => (
              <TextField
                {...p}
                label="Adicionar setor à proposta"
                placeholder="Buscar setor"
              />
            )}
          />
          {pending && source >= 0 && (
            <Alert severity="warning">
              O setor {pending.name} está na proposta “{groups[source].name}”.
              Deseja retirá-lo de lá e adicioná-lo a “{group.name}”?
              <Stack direction="row" spacing={4} sx={{ mt: 3 }}>
                <Button disabled={busy} onClick={() => void add(pending)}>
                  Sim, transferir setor
                </Button>
                <Button disabled={busy} onClick={() => setPending(null)}>
                  Cancelar transferência
                </Button>
              </Stack>
            </Alert>
          )}
          <Button
            size="small"
            sx={{ alignSelf: 'flex-start' }}
            disabled={busy}
            onClick={() => {
              setPending(null);
              setOpen(false);
            }}
          >
            Cancelar adição
          </Button>
        </>
      )}
    </Stack>
  );
}
