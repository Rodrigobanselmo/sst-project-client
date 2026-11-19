import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Slider,
  TextField,
  Typography,
} from '@mui/material';
import {
  getLocalSpeechController,
  selectLocalPortugueseVoice,
} from './local-description-speech';
import {
  DEFAULT_SPEECH_SETTINGS,
  type SpeechSettings,
} from './speech-settings';

type Props = {
  settings: SpeechSettings;
  voices: SpeechSynthesisVoice[];
  onClose: () => void;
  onSave: (settings: SpeechSettings) => void;
};

export function SpeechSettingsDialog({
  settings,
  voices,
  onClose,
  onSave,
}: Props) {
  const [draft, setDraft] = useState(settings);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const owner = useRef(Symbol('voice-preview'));
  const local = voices.filter(
    (voice) => voice.localService && /^pt(?:[-_]|$)/i.test(voice.lang),
  );
  const selected = selectLocalPortugueseVoice(local, draft.voiceURI);
  const unavailable = !!draft.voiceURI && !selected;
  useEffect(() => {
    getLocalSpeechController()?.stop(owner.current);
    setTesting(false);
    setError('');
    return () => {
      getLocalSpeechController()?.stop(owner.current);
    };
  }, [draft]);
  useEffect(() => {
    const stop = () => getLocalSpeechController()?.stop(owner.current);
    const hidden = () => {
      if (document.hidden) stop();
    };
    window.addEventListener('pagehide', stop);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      window.removeEventListener('pagehide', stop);
      document.removeEventListener('visibilitychange', hidden);
      stop();
    };
  }, []);
  useEffect(() => {
    getLocalSpeechController()?.stop(owner.current);
  }, [settings]);
  useEffect(() => {
    if (!selected) getLocalSpeechController()?.stop(owner.current);
  }, [selected]);
  const test = () => {
    const controller = getLocalSpeechController();
    if (testing) {
      controller?.stop(owner.current);
      return;
    }
    if (!controller || !selected) return;
    setTesting(true);
    setError('');
    controller.speak(
      owner.current,
      'Esta é uma demonstração da leitura em voz alta do SimpleSST.',
      selected,
      {
        onStop: () => setTesting(false),
        onError: () =>
          setError(
            'Não foi possível testar esta voz local. Confira as vozes instaladas no dispositivo.',
          ),
      },
      draft,
    );
  };
  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="speech-settings-title"
      onClick={(event) => event.stopPropagation()}
    >
      <DialogTitle id="speech-settings-title" sx={{ color: 'text.primary' }}>
        Configurações de leitura
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pt: '8px !important',
        }}
      >
        <Typography color="text.secondary" variant="body2">
          Estas preferências valem para todos os campos neste navegador. A
          leitura usa apenas vozes locais em português, sem consumo de IA.
        </Typography>
        {!local.length && (
          <Alert severity="info">
            Nenhuma voz local em português está disponível. Instale ou habilite
            uma voz no dispositivo e confira se o navegador a disponibiliza.
          </Alert>
        )}
        {unavailable && (
          <Alert severity="warning">
            A voz selecionada não está disponível neste navegador. Escolha outra
            voz local ou a seleção automática para ouvir os textos.
          </Alert>
        )}
        <TextField
          select
          fullWidth
          label="Voz"
          value={draft.voiceURI || ''}
          onChange={(event) =>
            setDraft((previous) => ({
              ...previous,
              voiceURI: event.target.value || null,
            }))
          }
        >
          <MenuItem value="">
            Automática — priorizar português do Brasil
          </MenuItem>
          {unavailable && (
            <MenuItem value={draft.voiceURI!} disabled>
              Voz selecionada indisponível
            </MenuItem>
          )}
          {local.map((voice) => (
            <MenuItem key={voice.voiceURI} value={voice.voiceURI}>
              {voice.name} ({voice.lang})
            </MenuItem>
          ))}
        </TextField>
        <Box>
          <Typography id="speech-rate-label" color="text.primary">
            Velocidade: {draft.rate.toLocaleString('pt-BR')}×
          </Typography>
          <Slider
            aria-labelledby="speech-rate-label"
            min={0.5}
            max={2}
            step={0.05}
            value={draft.rate}
            valueLabelDisplay="auto"
            onChange={(_event, value) =>
              setDraft((previous) => ({ ...previous, rate: value as number }))
            }
            marks={[
              { value: 0.5, label: '0,5×' },
              { value: 1, label: 'Normal' },
              { value: 2, label: '2×' },
            ]}
            sx={{ mx: 3, width: 'calc(100% - 12px)' }}
          />
        </Box>
        <Box>
          <Typography id="speech-pitch-label" color="text.primary">
            Tom: {draft.pitch.toLocaleString('pt-BR')}
          </Typography>
          <Slider
            aria-labelledby="speech-pitch-label"
            min={0}
            max={2}
            step={0.1}
            value={draft.pitch}
            valueLabelDisplay="auto"
            onChange={(_event, value) =>
              setDraft((previous) => ({ ...previous, pitch: value as number }))
            }
            marks={[
              { value: 0, label: 'Mais grave' },
              { value: 1, label: 'Normal' },
              { value: 2, label: 'Mais agudo' },
            ]}
            sx={{ mx: 8, width: 'calc(100% - 32px)' }}
          />
        </Box>
        <Box>
          <Typography id="speech-volume-label" color="text.primary">
            Volume: {Math.round(draft.volume * 100)}%
            {draft.volume === 0 ? ' (silenciado)' : ''}
          </Typography>
          <Slider
            aria-labelledby="speech-volume-label"
            min={0}
            max={1}
            step={0.1}
            value={draft.volume}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
            onChange={(_event, value) =>
              setDraft((previous) => ({ ...previous, volume: value as number }))
            }
            sx={{ mx: 3, width: 'calc(100% - 12px)' }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary">
          As vozes e a resposta aos ajustes dependem do dispositivo e do
          navegador. O volume também depende do volume do aparelho.
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Button
          type="button"
          variant="outlined"
          onClick={test}
          disabled={!selected && !testing}
        >
          {testing ? 'Parar teste' : 'Testar voz'}
        </Button>
      </DialogContent>
      <DialogActions sx={{ p: 8, gap: 4, flexWrap: 'wrap' }}>
        <Button
          type="button"
          onClick={() => setDraft({ ...DEFAULT_SPEECH_SETTINGS })}
        >
          Restaurar padrão
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button type="button" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="button" variant="contained" onClick={() => onSave(draft)}>
          Salvar preferências
        </Button>
      </DialogActions>
    </Dialog>
  );
}
