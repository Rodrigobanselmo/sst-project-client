import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { api } from 'core/services/apiClient';
import { AiAnalyzeGuidanceAudioField } from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/AiAnalyzeGuidanceAudioField';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { useMutateEditFormApplication } from '@v2/services/forms/form-application/edit-form-application/hooks/useMutateEditFormApplication';
import { readVisualIdentity } from '@v2/services/enterprise/visual-identity/read-visual-identity/service/read-visual-identity.service';
import { IVisualIdentityModel } from '@v2/services/enterprise/visual-identity/read-visual-identity/service/read-visual-identity.types';
import { buildBannerHtml, generateQrSvgString } from './FormCampaignBanner';
import {
  BannerTexts,
  bannerLimits,
  bannerPrivacyText,
  defaultBannerTexts,
} from './campaignBannerContent';
import { exportCampaignBannerPdf } from './exportCampaignBannerPdf';

async function transcribe({
  audio,
  fileName,
}: {
  audio: Blob;
  fileName?: string;
}): Promise<{ text: string }> {
  const body = new FormData();
  body.append('audio', audio, fileName || 'recording.webm');
  return (
    await api.post<{ text: string }>('/ai-chat/transcribe', body, {
      timeout: 120000,
    })
  ).data;
}
const labels = {
  intro: 'Apresentação da campanha',
  why: 'Por que participar?',
  contact: 'Contato para dúvidas',
};
export function CampaignBannerAssistant({
  formApplication: application,
  companyId,
  modelQuestionCount,
}: {
  formApplication: FormApplicationReadModel;
  companyId: string;
  modelQuestionCount?: number | null;
}) {
  const { palette } = useTheme();
  const foreground = palette.mode === 'dark' ? '#E2E8F0' : '#1A202C';
  const muted = palette.mode === 'dark' ? '#A0AEC0' : '#4A5568';
  const [open, setOpen] = useState(false);
  const [texts, setTexts] = useState<BannerTexts>(() =>
    defaultBannerTexts(application),
  );
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [audioBusy, setAudioBusy] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [qr, setQr] = useState('');
  const [identity, setIdentity] = useState<IVisualIdentityModel | null>(null);
  const [url, setUrl] = useState('');
  const save = useMutateEditFormApplication();
  const locked = busy || audioBusy || save.isPending;
  useEffect(() => {
    if (!open) return;
    let active = true;
    const publicUrl = `${window.location.origin}${application.publicUrl()}`;
    setUrl(publicUrl);
    generateQrSvgString(publicUrl, 140)
      .then((value) => {
        if (active) setQr(value);
      })
      .catch(() => {
        if (active)
          setError('Não foi possível preparar o QR Code. Reabra o assistente.');
      });
    readVisualIdentity({ companyId })
      .then((value) => {
        if (active) setIdentity(value);
      })
      .catch(() => {
        if (active)
          setFeedback(
            'Prévia com a identidade padrão: a identidade visual da empresa não pôde ser carregada.',
          );
      });
    return () => {
      active = false;
    };
  }, [open, companyId, application]);
  const draft = Object.assign(
    Object.create(Object.getPrototypeOf(application)),
    application,
    {
      bannerIntroText: texts.intro,
      bannerWhyText: texts.why,
      bannerContactText: texts.contact,
    },
  );
  const html = qr
    ? buildBannerHtml({
        formApplication: draft,
        publicUrl: url,
        qrCodeSvg: qr,
        visualIdentity: identity,
        modelQuestionCount,
      })
    : '';
  const valid = Object.entries(bannerLimits).every(
    ([key, limit]) =>
      texts[key as keyof BannerTexts].trim().length > 0 &&
      texts[key as keyof BannerTexts].length <= limit,
  );
  const start = () => {
    const defaults = defaultBannerTexts(application);
    setTexts({
      intro: application.bannerIntroText || defaults.intro,
      why: application.bannerWhyText || defaults.why,
      contact: application.bannerContactText || defaults.contact,
    });
    setError('');
    setFeedback('');
    setOpen(true);
  };
  async function suggest() {
    setBusy(true);
    setError('');
    setFeedback('');
    try {
      const { data } = await api.post<{
        texts: BannerTexts;
        requestedModel: string;
        returnedModel?: string;
      }>(
        `/v2/companies/${companyId}/forms/applications/${application.id}/banner/suggest`,
        { current: texts, notes },
        { timeout: 125000 },
      );
      if (
        !data.texts ||
        Object.entries(bannerLimits).some(
          ([key, limit]) =>
            typeof data.texts[key as keyof BannerTexts] !== 'string' ||
            !data.texts[key as keyof BannerTexts].trim() ||
            data.texts[key as keyof BannerTexts].length > limit,
        )
      )
        throw new Error('invalid');
      setTexts(data.texts);
      setFeedback(
        `Sugestão aplicada à prévia. Revise antes de salvar. Modelo solicitado: ${data.requestedModel}${data.returnedModel ? ` · retornado: ${data.returnedModel}` : ''}.`,
      );
    } catch {
      setError(
        'Não foi possível gerar a sugestão de IA. Seus textos foram preservados. Você pode editar e salvar manualmente.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function persist() {
    setError('');
    try {
      await save.mutateAsync({
        companyId,
        applicationId: application.id,
        bannerIntroText: texts.intro.trim(),
        bannerWhyText: texts.why.trim(),
        bannerContactText: texts.contact.trim(),
      });
      setFeedback('Banner salvo nesta campanha.');
    } catch {
      setError(
        'Não foi possível salvar o banner. Seus textos continuam disponíveis nesta prévia.',
      );
    }
  }
  return (
    <>
      <Button
        variant="outlined"
        startIcon={<AutoAwesomeOutlinedIcon />}
        onClick={start}
      >
        {application.bannerIntroText
          ? 'Editar banner da campanha'
          : 'Criar banner da campanha'}
      </Button>
      <Dialog
        open={open}
        onClose={() => {
          if (!locked) setOpen(false);
        }}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            color: foreground,
            '& .MuiDialogTitle-root, & .MuiTypography-root': { color: foreground },
            '& .MuiFormHelperText-root': { color: muted },
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle sx={{ px: 12, pt: 10 }}>
          Banner da campanha
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Personalize o convite e acompanhe a prévia de impressão.
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 12 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'minmax(320px, 1fr) minmax(400px, 1fr)',
              },
              gap: 12,
            }}
          >
            <Stack spacing={8}>
              <Box>
                <Chip
                  size="small"
                  label={
                    application.isShareableLink
                      ? 'Link compartilhado'
                      : 'Acesso individual'
                  }
                  sx={{ mr: 3 }}
                />
                <Chip
                  size="small"
                  label={
                    application.isAnonymous
                      ? 'Modo anônimo'
                      : 'Modo identificado'
                  }
                />
              </Box>
              <Typography variant="h6">{application.name}</Typography>
              {(Object.keys(labels) as (keyof BannerTexts)[]).map((key) => (
                <TextField
                  key={key}
                  label={labels[key]}
                  multiline
                  minRows={key === 'contact' ? 2 : 3}
                  fullWidth
                  value={texts[key]}
                  disabled={locked}
                  inputProps={{ maxLength: bannerLimits[key] }}
                  helperText={`${texts[key].length}/${bannerLimits[key]}`}
                  onChange={(event) =>
                    setTexts((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                />
              ))}
              <Alert severity={application.isAnonymous ? 'info' : 'warning'}>
                <strong>Privacidade conforme a modalidade</strong>
                <br />
                {bannerPrivacyText(application)}
              </Alert>
              <Box
                sx={{
                  p: 8,
                  bgcolor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                }}
              >
                <Typography variant="subtitle1" sx={{ mb: 5 }}>
                  Ajustar com IA
                </Typography>
                <AiAnalyzeGuidanceAudioField
                  label="O que deseja ajustar?"
                  shrinkLabel
                  placeholder="Ex.: deixe o convite mais acolhedor e objetivo."
                  companyId={companyId}
                  workspaceId=""
                  transcribe={transcribe}
                  value={notes}
                  disabled={locked}
                  maxLength={2500}
                  onChange={(value) => setNotes(value.slice(0, 2500))}
                  onBusyChange={setAudioBusy}
                  onTranscription={(text) =>
                    setNotes((current) =>
                      [current, text].filter(Boolean).join('\n').slice(0, 2500),
                    )
                  }
                  helperText="Escreva ou grave um áudio e revise a transcrição. A IA recebe o título, objetivo e estes textos; não recebe respostas dos participantes."
                />
                <Button
                  sx={{ mt: 6 }}
                  variant="outlined"
                  disabled={locked || !valid}
                  onClick={() => void suggest()}
                  startIcon={
                    busy ? (
                      <CircularProgress size={16} />
                    ) : (
                      <AutoAwesomeOutlinedIcon />
                    )
                  }
                >
                  {busy ? 'Preparando sugestão…' : 'Sugerir ajustes'}
                </Button>
              </Box>
              {error && <Alert severity="error">{error}</Alert>}
              {feedback && <Alert severity="success">{feedback}</Alert>}
            </Stack>
            <Box
              sx={{
                p: 6,
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 5 }}>
                Prévia A4 · o PDF mantém fundo claro para impressão
              </Typography>
              {html ? (
                <Box
                  sx={{ width: '100%', overflow: 'auto', maxHeight: '75vh' }}
                >
                  <iframe
                    title="Prévia do banner da campanha"
                    sandbox=""
                    srcDoc={html}
                    style={{
                      width: 794,
                      height: 1123,
                      border: 0,
                      background: '#fff',
                      zoom: 0.65,
                    }}
                  />
                </Box>
              ) : (
                <CircularProgress size={24} />
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 12, py: 8, gap: 4 }}>
          <Button
            disabled={locked}
            onClick={() => setOpen(false)}
            startIcon={<CloseIcon />}
          >
            Fechar
          </Button>
          <Button
            variant="outlined"
            disabled={locked || !valid || !html}
            onClick={() => { if (!exportCampaignBannerPdf(html)) setError('O navegador bloqueou a janela de impressão. Permita pop-ups para este site e tente novamente.'); }}
          >
            Imprimir / salvar PDF
          </Button>
          <Button
            variant="contained"
            disabled={locked || !valid}
            onClick={() => void persist()}
          >
            {save.isPending ? 'Salvando…' : 'Salvar banner'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
