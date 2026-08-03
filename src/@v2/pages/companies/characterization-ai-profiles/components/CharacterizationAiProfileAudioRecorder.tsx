import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import { useCharacterizationAiProfileAudioRecorder } from '../hooks/use-characterization-ai-profile-audio-recorder';

type Props = {
  companyId: string;
  onApplyTranscription?: (text: string) => void;
};

export function CharacterizationAiProfileAudioRecorder({
  companyId,
  onApplyTranscription,
}: Props) {
  const recorder = useCharacterizationAiProfileAudioRecorder({ companyId });
  const [editableTranscription, setEditableTranscription] = useState('');

  const handleTranscribe = async () => {
    const result = await recorder.transcribe();
    if (result?.text) {
      setEditableTranscription(result.text);
    }
  };

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Gravação de áudio (opcional)</Typography>

      {recorder.maxDurationReached ? (
        <Alert severity="warning">
          Gravação interrompida automaticamente após 10 minutos.
        </Alert>
      ) : null}

      {recorder.error ? (
        <Alert severity="error">{recorder.error}</Alert>
      ) : null}

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {recorder.state === 'idle' || recorder.state === 'error' ? (
          <Button variant="outlined" onClick={() => void recorder.startRecording()}>
            Iniciar gravação
          </Button>
        ) : null}

        {recorder.state === 'recording' ? (
          <>
            <Button color="error" variant="contained" onClick={recorder.stopRecording}>
              Parar ({recorder.durationLabel})
            </Button>
            <Button variant="text" onClick={recorder.discard}>
              Cancelar
            </Button>
          </>
        ) : null}

        {recorder.state === 'ready' || recorder.state === 'transcribing' ? (
          <>
            {recorder.playbackUrl ? (
              <Box component="audio" controls src={recorder.playbackUrl} />
            ) : null}
            <Button
              variant="outlined"
              disabled={recorder.state === 'transcribing'}
              onClick={() => void handleTranscribe()}
            >
              {recorder.state === 'transcribing' ? 'Transcrevendo…' : 'Transcrever'}
            </Button>
            <Button variant="text" onClick={recorder.discard}>
              Descartar áudio
            </Button>
          </>
        ) : null}
      </Stack>

      {editableTranscription || recorder.transcription ? (
        <Stack spacing={1}>
          <TextField
            label="Transcrição (editável)"
            multiline
            minRows={3}
            fullWidth
            value={editableTranscription || recorder.transcription || ''}
            onChange={(e) => setEditableTranscription(e.target.value)}
          />
          {onApplyTranscription ? (
            <Button
              variant="contained"
              size="small"
              sx={{ alignSelf: 'flex-start' }}
              disabled={!(editableTranscription || recorder.transcription)?.trim()}
              onClick={() =>
                onApplyTranscription(
                  (editableTranscription || recorder.transcription || '').trim(),
                )
              }
            >
              Usar transcrição como orientação
            </Button>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  );
}
