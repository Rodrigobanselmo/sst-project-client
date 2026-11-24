import { useEffect } from 'react';
import MicNoneIcon from '@mui/icons-material/MicNone';
import StopIcon from '@mui/icons-material/Stop';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';

import { useCharacterizationAiAnalyzeAudioRecorder } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/hooks/useCharacterizationAiAnalyzeAudioRecorder';
import type { TranscribeAiAnalyzeAudioFn } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/hooks/useCharacterizationAiAnalyzeAudioRecorder';

type Props = {
  label?: string;
  placeholder?: string;
  shrinkLabel?: boolean;
  helperText?: string;
  maxLength?: number;
  companyId: string;
  workspaceId: string;
  characterizationId?: string;
  transcribe?: TranscribeAiAnalyzeAudioFn;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
  onTranscription: (text: string) => void;
};

export function AiAnalyzeGuidanceAudioField({
  label = 'Orientações adicionais para análise de riscos',
  placeholder = 'Ex.: avaliar queda ao mar, ruído, movimentação de cargas, trabalho em altura, intempéries...',
  shrinkLabel,
  helperText,
  maxLength,
  companyId,
  workspaceId,
  characterizationId,
  transcribe,
  value,
  onChange,
  disabled,
  onBusyChange,
  onTranscription,
}: Props) {
  const recorder = useCharacterizationAiAnalyzeAudioRecorder({
    companyId,
    workspaceId,
    characterizationId,
    transcribe,
    onTranscription,
  });

  const recording = recorder.state === 'recording';
  const transcribing = recorder.state === 'transcribing';
  const starting = recorder.state === 'starting';
  const stopping = recorder.state === 'stopping';
  const busy = recorder.isBusy;

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      InputLabelProps={{ shrink: shrinkLabel }}
      disabled={disabled || busy}
      inputProps={{ maxLength }}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      multiline
      minRows={3}
      fullWidth
      size="small"
      error={Boolean(recorder.error)}
      helperText={
        recorder.error ||
        (starting ? (
          'Aguardando o microfone…'
        ) : stopping ? (
          'Finalizando gravação…'
        ) : transcribing ? (
          'Transcrevendo áudio…'
        ) : recording ? (
          <Box
            component="span"
            role="status"
            aria-live="off"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: 'error.main',
              fontWeight: 600,
            }}
          >
            <Box
              component="span"
              aria-hidden="true"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                height: '20px',
                '@keyframes guidanceRecordingWave': {
                  '0%, 100%': { transform: 'scaleY(0.25)' },
                  '50%': { transform: 'scaleY(1)' },
                },
              }}
            >
              {[12, 18, 14, 20, 15].map((height, index) => (
                <Box
                  component="span"
                  key={index}
                  sx={{
                    display: 'block',
                    width: '3px',
                    height: `${height}px`,
                    borderRadius: '3px',
                    backgroundColor: 'currentColor',
                    animation:
                      'guidanceRecordingWave 850ms ease-in-out infinite',
                    animationDelay: `${index * -130}ms`,
                    '@media (prefers-reduced-motion: reduce)': {
                      animation: 'none',
                    },
                  }}
                />
              ))}
            </Box>
            <Box component="span">Gravando {recorder.durationLabel}</Box>
          </Box>
        ) : (
          helperText
        ))
      }
      InputProps={{
        endAdornment: (
          <InputAdornment
            position="end"
            sx={{ alignSelf: 'flex-end', mb: 0.5 }}
          >
            {recording ? (
              <>
                <Tooltip title="Parar e transcrever">
                  <span>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label="Parar gravação"
                      onClick={() => void recorder.stopAndTranscribe()}
                    >
                      <StopIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Cancelar gravação">
                  <span>
                    <IconButton
                      size="small"
                      aria-label="Cancelar gravação"
                      onClick={recorder.cancelRecording}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            ) : transcribing || starting || stopping ? (
              <>
                <SText
                  variant="caption"
                  color="text.secondary"
                  sx={{ mr: 0.5 }}
                >
                  {starting
                    ? 'Abrindo microfone…'
                    : stopping
                      ? 'Finalizando…'
                      : 'Transcrevendo…'}
                </SText>
                <CircularProgress size={16} />
                <Tooltip title="Cancelar operação de áudio">
                  <IconButton
                    size="small"
                    aria-label="Cancelar operação de áudio"
                    onClick={recorder.cancelRecording}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Gravar orientação por voz">
                <span>
                  <IconButton
                    size="small"
                    aria-label="Gravar orientação por voz"
                    disabled={disabled}
                    onClick={() => void recorder.startRecording()}
                  >
                    <MicNoneIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </InputAdornment>
        ),
      }}
    />
  );
}
