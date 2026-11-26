import { useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { browseFormApplication } from '@v2/services/forms/form-application/browse-form-application/service/browse-form-application.service';
import { useCampaignCycles } from './campaign-cycles.api';
import { CreateCycleDialog } from './CreateCycleDialog';
export function ContinueCampaign({ companyId }: { companyId: string }) {
  const [search, setSearch] = useState('');
  const [debounced] = useDebounce(search, 300);
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [open, setOpen] = useState(false);
  const options = useQuery({
    queryKey: ['cycle-campaign-picker', companyId, debounced],
    queryFn: () =>
      browseFormApplication({
        companyId,
        pagination: { page: 1, limit: 30 },
        filters: { search: debounced },
      }),
  });
  const cycles = useCampaignCycles(companyId, selected?.id);
  return (
    <Box
      sx={{
        maxWidth: '760px',
        py: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <Typography color="text.primary">
        Selecione a campanha de origem para continuar sua série histórica com o
        mesmo questionário.
      </Typography>
      <Autocomplete
        options={options.data?.results || []}
        loading={options.isLoading}
        value={selected}
        onChange={(_, v) => setSelected(v)}
        onInputChange={(_, v) => setSearch(v)}
        getOptionLabel={(o) => o.name}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        filterOptions={(v) => v}
        renderInput={(params) => (
          <TextField {...params} label="Pesquisar campanha existente" />
        )}
      />
      {(options.isError || cycles.isError) && (
        <Alert severity="warning">
          Não foi possível carregar a campanha. Verifique se você está na
          empresa responsável e tente novamente.
        </Alert>
      )}
      {cycles.isLoading && selected && <CircularProgress size={24} />}
      {cycles.data && (
        <>
          <Typography color="text.primary">
            {cycles.data.seriesName} · Ciclo {cycles.data.current.number} ·{' '}
            {cycles.data.current.referencePeriod}
          </Typography>
          {!cycles.data.canCreate && (
            <Alert severity="info">
              Para continuar, selecione o ciclo mais recente já concluído.
            </Alert>
          )}
          <Button
            sx={{ alignSelf: 'flex-start' }}
            variant="contained"
            disabled={!cycles.data.canCreate}
            onClick={() => setOpen(true)}
          >
            Criar próximo ciclo
          </Button>
        </>
      )}
      {open && selected && cycles.data && (
        <CreateCycleDialog
          companyId={companyId}
          applicationId={selected.id}
          data={cycles.data}
          onClose={() => setOpen(false)}
        />
      )}
    </Box>
  );
}
