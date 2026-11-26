import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from 'core/services/apiClient';

type IllustrationSet = {
  id: string;
  reportId: string;
  status: 'PROCESSING' | 'DONE' | 'FAILED';
  model: string;
  total: number;
  completed: number;
  errorCode: string | null;
  images: {
    index: number;
    title: string;
    ready: boolean;
    sourceHash: string;
  }[];
};
export function useCampaignReportIllustrations(
  companyId: string,
  applicationId: string,
  reportId?: string,
) {
  const path = `/v2/companies/${encodeURIComponent(companyId)}/forms/applications/${encodeURIComponent(applicationId)}/reports/${encodeURIComponent(reportId ?? '')}/illustrations`;
  const query = useQuery<IllustrationSet | null>({
    queryKey: [
      'campaign-report-illustrations',
      companyId,
      applicationId,
      reportId,
    ],
    enabled: !!reportId,
    queryFn: async () => (await api.get(path)).data || null,
    refetchInterval: (q) =>
      q.state.data?.status === 'PROCESSING' ? 3000 : false,
    retry: false,
  });
  const generate = useMutation({
    mutationFn: async () =>
      (await api.post<IllustrationSet>(`${path}/generation`)).data,
    onSuccess: () => query.refetch(),
  });
  return { path, query, generate };
}

export function CampaignReportIllustrationsButton({
  art,
  available,
}: {
  art: ReturnType<typeof useCampaignReportIllustrations>;
  available: boolean;
}) {
  const status = art.query.data;
  return (
    <Stack gap={4} sx={{ my: '20px' }}>
      <Box>
        <Button
          startIcon={<AutoAwesomeOutlinedIcon />}
          variant="outlined"
          disabled={
            !available ||
            art.query.isPending ||
            art.query.isError ||
            art.generate.isPending ||
            status?.status === 'PROCESSING' ||
            status?.status === 'DONE'
          }
          onClick={() => art.generate.mutate()}
        >
          {status?.status === 'PROCESSING'
            ? `Gerando ilustrações… ${status.completed}/${status.total}`
            : status?.status === 'DONE'
              ? 'Ilustrações salvas nesta versão'
              : status?.status === 'FAILED'
                ? 'Retomar ilustrações pendentes'
                : 'Gerar ilustrações da apresentação'}
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary">
        Uma imagem conceitual por bloco da escuta, com gpt-image-2.5-sunburst.
        Geração visual com consumo separado; imagens salvas nesta versão. Textos
        individuais não são enviados.
      </Typography>
      {status?.status === 'DONE' && (
        <Typography variant="body2" color="text.secondary">
          {status.completed} ilustrações disponíveis na apresentação HTML.
        </Typography>
      )}
      {(art.generate.isError ||
        art.query.isError ||
        status?.status === 'FAILED') && (
        <Alert severity="warning">
          {art.generate.isError
            ? ((art.generate.error as any)?.response?.data?.message ??
              'Não foi possível iniciar a geração.')
            : art.query.isError
              ? 'Não foi possível consultar as ilustrações. Atualize para tentar novamente.'
              : status?.errorCode === 'PROVIDER_RATE_LIMITED'
                ? 'O provedor bloqueou a geração por cota ou limite de uso. As imagens concluídas foram preservadas.'
                : status?.errorCode === 'BUDGET_BLOCKED'
                  ? 'O controle de gastos bloqueou a geração. As imagens concluídas foram preservadas.'
                  : 'A geração foi interrompida. As imagens concluídas foram preservadas; consulte o status antes de retomar.'}
        </Alert>
      )}
    </Stack>
  );
}

export function CampaignReportConceptImage({
  path,
  index,
  title,
}: {
  path: string;
  index: number;
  title: string;
}) {
  const image = useQuery<{ dataUrl: string }>({
    queryKey: ['campaign-report-concept-image', path, index],
    queryFn: async () => (await api.get(`${path}/${index}`)).data,
    staleTime: Infinity,
    retry: false,
  });
  if (!image.data)
    return (
      <Typography variant="body2" color="text.secondary">
        {image.isError
          ? 'Ilustração indisponível no momento.'
          : 'Carregando ilustração…'}
      </Typography>
    );
  return (
    <Box
      component="figure"
      sx={{
        m: '0 !important',
        mb: '24px !important',
        maxWidth: '560px',
        width: '100%',
        flexShrink: 0,
      }}
    >
      <Box
        component="img"
        src={image.data.dataUrl}
        alt={`Ilustração conceitual: ${title}`}
        sx={{
          display: 'block',
          width: '100%',
          aspectRatio: '1',
          objectFit: 'contain',
          borderRadius: '16px',
        }}
      />
      <Box
        component="figcaption"
        sx={{ fontSize: '0.65em', opacity: 0.75, mt: '8px' }}
      >
        Ilustração conceitual gerada por IA · Não representa registro real da
        organização.
      </Box>
    </Box>
  );
}
