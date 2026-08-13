import { useEffect } from 'react';
import MicNoneIcon from '@mui/icons-material/MicNone';
import StopIcon from '@mui/icons-material/Stop';
import CloseIcon from '@mui/icons-material/Close';
import {
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';

import { useCharacterizationAiAnalyzeAudioRecorder } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/hooks/useCharacterizationAiAnalyzeAudioRecorder';

type Props = {
  companyId: string;
  workspaceId: string;
  characterizationId: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
  onTranscription: (text: string) => void;
};

export function AiAnalyzeGuidanceAudioField({
  companyId,
  workspaceId,
  characterizationId,
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
    onTranscription,
  });

  const recording = recorder.state === 'recording';
  const transcribing = recorder.state === 'transcribing';
  const busy = recorder.isBusy;

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  return (
    <TextField
      label="Orientações adicionais para análise de riscos"
      placeholder="Ex.: avaliar queda ao mar, ruído, movimentação de cargas, trabalho em altura, intempéries..."
      value={value}
      onChange={(event) => onChange(event.target.value)}
      multiline
      minRows={3}
      fullWidth
      size="small"
      error={Boolean(recorder.error)}
      helperText={
        recorder.error ||
        (recording ? `Gravando ${recorder.durationLabel}` : undefined)
      }
      InputProps={{
        endAdornment: (
          <InputAdornment position="end" sx={{ alignSelf: 'flex-end', mb: 0.5 }}>
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
            ) : transcribing ? (
              <>
                <SText variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                  Transcrevendo…
                </SText>
                <CircularProgress size={16} />
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
