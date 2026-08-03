import { transcribeCharacterizationAiProfileAudio } from '@v2/services/security/characterization/characterization-ai-profile/service/characterization-ai-profile.service';
import { useCallback, useEffect, useRef, useState } from 'react';

export type ProfileAudioRecorderState =
  | 'idle'
  | 'recording'
  | 'ready'
  | 'transcribing'
  | 'error';

const MAX_DURATION_SECONDS = 600;

const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
  'audio/mpeg',
];

function getSupportedMimeType(): string {
  for (const mimeType of PREFERRED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }
  return '';
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function useCharacterizationAiProfileAudioRecorder(params: {
  companyId: string;
}) {
  const [state, setState] = useState<ProfileAudioRecorderState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [maxDurationReached, setMaxDurationReached] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const audioBlobRef = useRef<Blob | null>(null);
  const mimeTypeRef = useRef('audio/webm');

  const revokePlaybackUrl = useCallback(() => {
    if (playbackUrl) {
      URL.revokeObjectURL(playbackUrl);
      setPlaybackUrl(null);
    }
  }, [playbackUrl]);

  const cleanupStream = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  }, []);

  const discard = useCallback(() => {
    cleanupStream();
    revokePlaybackUrl();
    audioBlobRef.current = null;
    setDuration(0);
    setTranscription(null);
    setMaxDurationReached(false);
    setError(null);
    setState('idle');
  }, [cleanupStream, revokePlaybackUrl]);

  useEffect(() => {
    return () => {
      cleanupStream();
      if (playbackUrl) {
        URL.revokeObjectURL(playbackUrl);
      }
    };
  }, [cleanupStream, playbackUrl]);

  const finalizeRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      cleanupStream();
      return;
    }

    mediaRecorder.onstop = () => {
      const mimeType = mediaRecorder.mimeType || mimeTypeRef.current;
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      cleanupStream();

      if (audioBlob.size < 1024) {
        setError('Gravação muito curta. Tente novamente.');
        setState('error');
        return;
      }

      revokePlaybackUrl();
      audioBlobRef.current = audioBlob;
      setPlaybackUrl(URL.createObjectURL(audioBlob));
      setState('ready');
    };

    mediaRecorder.stop();
  }, [cleanupStream, revokePlaybackUrl]);

  const startRecording = useCallback(async () => {
    try {
      discard();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType || 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
        audioBitsPerSecond: 32000,
      });

      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setState('recording');

      const startTime = Date.now();
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setDuration(elapsed);
        if (elapsed >= MAX_DURATION_SECONDS) {
          setMaxDurationReached(true);
          finalizeRecording();
        }
      }, 1000);
    } catch (err) {
      cleanupStream();
      if ((err as Error).name === 'NotAllowedError') {
        setError('Permissão de microfone negada.');
      } else if ((err as Error).name === 'NotFoundError') {
        setError('Nenhum microfone encontrado.');
      } else {
        setError('Não foi possível iniciar a gravação.');
      }
      setState('error');
    }
  }, [cleanupStream, discard, finalizeRecording]);

  const stopRecording = useCallback(() => {
    finalizeRecording();
  }, [finalizeRecording]);

  const transcribe = useCallback(async () => {
    const blob = audioBlobRef.current;
    if (!blob) return null;

    setState('transcribing');
    setError(null);

    try {
      const extension = blob.type.includes('webm') ? 'webm' : 'mp3';
      const result = await transcribeCharacterizationAiProfileAudio({
        companyId: params.companyId,
        audio: blob,
        fileName: `recording.${extension}`,
      });
      setTranscription(result.text);
      setState('ready');
      return result;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message ?? 'Falha na transcrição.';
      setError(Array.isArray(message) ? message.join(' ') : String(message));
      setState('error');
      return null;
    }
  }, [params.companyId]);

  return {
    state,
    error,
    duration,
    durationLabel: formatDuration(duration),
    playbackUrl,
    transcription,
    maxDurationReached,
    startRecording,
    stopRecording,
    transcribe,
    discard,
    hasRecording: Boolean(audioBlobRef.current),
  };
}
