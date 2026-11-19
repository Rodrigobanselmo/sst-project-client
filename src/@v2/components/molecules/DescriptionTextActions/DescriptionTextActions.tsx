import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { SpeechSettingsDialog } from './SpeechSettingsDialog';
import { saveSpeechSettings, useSpeechSettings } from './use-speech-settings';
import { useEffect, useRef, useState } from 'react';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import {
  getLocalSpeechController,
  selectLocalPortugueseVoice,
} from './local-description-speech';

type Props = {
  text: string;
  label?: string;
  contextKey?: string;
  active?: boolean;
};

export function DescriptionTextActions({
  text,
  label = 'descrição',
  contextKey,
  active = true,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const owner = useRef(Symbol('description-reader'));
  const generation = useRef(0);
  const settings = useSpeechSettings();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const voice = selectLocalPortugueseVoice(voices, settings.voiceURI);
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const hasText = !!text.trim() && active;
  useEffect(() => {
    if (!getLocalSpeechController()) return;
    const synth = window.speechSynthesis;
    const update = () => setVoices(synth.getVoices());
    update();
    synth.addEventListener('voiceschanged', update);
    return () => synth.removeEventListener('voiceschanged', update);
  }, []);
  useEffect(() => {
    generation.current++;
    getLocalSpeechController()?.stop(owner.current);
    setPlaying(false);
    setCopied(false);
    setSettingsOpen(false);
    setError('');
    return () => {
      generation.current++;
      getLocalSpeechController()?.stop(owner.current);
    };
  }, [text, contextKey, active]);
  useEffect(() => {
    const stop = () => getLocalSpeechController()?.stop(owner.current);
    const visibility = () => {
      if (document.hidden) stop();
    };
    const collapse = (event: Event) => {
      const details = event.target;
      if (
        details instanceof HTMLDetailsElement &&
        !details.open &&
        container.current &&
        details.contains(container.current)
      )
        stop();
    };
    document.addEventListener('toggle', collapse, true);
    window.addEventListener('pagehide', stop);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('toggle', collapse, true);
      window.removeEventListener('pagehide', stop);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  useEffect(() => {
    getLocalSpeechController()?.stop(owner.current);
  }, [settings]);
  const copy = async () => {
    const request = generation.current;
    setError('');
    try {
      if (!navigator.clipboard?.writeText) throw Error('unavailable');
      await navigator.clipboard.writeText(text);
      if (request === generation.current) setCopied(true);
    } catch {
      if (request === generation.current)
        setError(
          'Não foi possível copiar. Selecione o texto e copie manualmente.',
        );
    }
  };
  const read = () => {
    const controller = getLocalSpeechController();
    if (playing) {
      controller?.stop(owner.current);
      return;
    }
    const localVoice =
      controller &&
      selectLocalPortugueseVoice(
        window.speechSynthesis.getVoices(),
        settings.voiceURI,
      );
    if (!hasText || !controller || !localVoice) return;
    setError('');
    setCopied(false);
    setPlaying(true);
    controller.speak(
      owner.current,
      text,
      localVoice,
      {
        onStop: () => setPlaying(false),
        onError: () =>
          setError(
            'Não foi possível ler com a voz local. Tente novamente ou confira as vozes do dispositivo.',
          ),
      },
      settings,
    );
  };
  return (
    <Box
      ref={container}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 2,
        flexWrap: 'wrap',
        mt: 2,
      }}
      role="group"
      aria-label={`Ações do texto: ${label}`}
    >
      <Typography
        component="span"
        variant="caption"
        color="text.secondary"
        role="status"
        aria-live="polite"
      >
        {error ||
          (copied ? 'Texto copiado.' : playing ? 'Lendo com voz local…' : '')}
      </Typography>
      <Tooltip title={copied ? 'Copiado' : 'Copiar texto'}>
        <span>
          <IconButton
            type="button"
            size="small"
            aria-label={`Copiar ${label}`}
            disabled={!hasText}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.stopPropagation();
              void copy();
            }}
            sx={{ color: 'text.secondary' }}
          >
            {copied ? (
              <CheckOutlinedIcon fontSize="small" />
            ) : (
              <ContentCopyOutlinedIcon fontSize="small" />
            )}
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip
        title={
          !voice
            ? settings.voiceURI
              ? 'A voz selecionada não está disponível. Abra as configurações de leitura.'
              : 'Leitura local em português indisponível neste dispositivo.'
            : playing
              ? 'Parar leitura'
              : 'Ouvir texto com voz local, sem consumo de IA'
        }
      >
        <span>
          <IconButton
            type="button"
            size="small"
            aria-label={
              playing ? `Parar leitura de ${label}` : `Ouvir ${label}`
            }
            aria-pressed={playing}
            disabled={!hasText || (!voice && !playing)}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.stopPropagation();
              read();
            }}
            sx={{ color: 'text.secondary' }}
          >
            {playing ? (
              <StopCircleOutlinedIcon fontSize="small" />
            ) : (
              <VolumeUpOutlinedIcon fontSize="small" />
            )}
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Configurações de leitura">
        <span>
          <IconButton
            type="button"
            size="small"
            aria-label={`Configurações de leitura de ${label}`}
            disabled={!active}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.stopPropagation();
              getLocalSpeechController()?.stop();
              setSettingsOpen(true);
            }}
            sx={{ color: 'text.secondary' }}
          >
            <SettingsOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      {settingsOpen && (
        <SpeechSettingsDialog
          settings={settings}
          voices={voices}
          onClose={() => setSettingsOpen(false)}
          onSave={(next) => {
            const persisted = saveSpeechSettings(next);
            setSettingsOpen(false);
            setError(
              persisted
                ? 'Preferências de leitura salvas.'
                : 'Preferências aplicadas nesta sessão. O navegador não permitiu salvá-las para o próximo acesso.',
            );
          }}
        />
      )}
    </Box>
  );
}
