import { useCallback, useEffect, useRef, useState } from 'react';

import { transcribeAiAnalyzeCharacterizationAudio } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/transcribe-ai-analyze-characterization-audio.service';

export type AiAnalyzeAudioRecorderState = 'idle' | 'recording' | 'transcribing';

const MAX_DURATION_SECONDS = 600;

const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
  'audio/mpeg',
];

function getSupportedMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';
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

function extractErrorMessage(error: unknown, fallback: string): string {
  const responseMessage = (
    error as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;
  if (Array.isArray(responseMessage)) {
    return responseMessage.join(' ') || fallback;
  }
  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function useCharacterizationAiAnalyzeAudioRecorder(params: {
  companyId: string;
  workspaceId: string;
  characterizationId: string;
  onTranscription: (text: string) => void;
}) {
  const [state, setState] = useState<AiAnalyzeAudioRecorderState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const mimeTypeRef = useRef('audio/webm');
  const cancelledRef = useRef(false);
  const onTranscriptionRef = useRef(params.onTranscription);
  onTranscriptionRef.current = params.onTranscription;

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

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      cleanupStream();
    };
  }, [cleanupStream]);

  const cancelRecording = useCallback(() => {
    cancelledRef.current = true;
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.onstop = () => {
        cleanupStream();
      };
      mediaRecorder.stop();
    } else {
      cleanupStream();
    }
    setDuration(0);
    setError(null);
    setState('idle');
  }, [cleanupStream]);

  const stopAndTranscribe = useCallback(async () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      cleanupStream();
      setState('idle');
      return;
    }

    cancelledRef.current = false;

    const blob = await new Promise<Blob | null>((resolve) => {
      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || mimeTypeRef.current;
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        cleanupStream();
        resolve(audioBlob);
      };
      mediaRecorder.stop();
    });

    if (cancelledRef.current) {
      setState('idle');
      return;
    }

    if (!blob || blob.size < 1024) {
      setError('Gravação muito curta. Tente novamente.');
      setState('idle');
      return;
    }

    setState('transcribing');
    setError(null);

    try {
      const extension = blob.type.includes('webm')
        ? 'webm'
        : blob.type.includes('ogg')
          ? 'ogg'
          : blob.type.includes('mp4')
            ? 'mp4'
            : 'webm';
      const result = await transcribeAiAnalyzeCharacterizationAudio({
        companyId: params.companyId,
        workspaceId: params.workspaceId,
        characterizationId: params.characterizationId,
        audio: blob,
        fileName: `recording.${extension}`,
      });

      if (cancelledRef.current) {
        setState('idle');
        return;
      }

      const text = result.text?.trim() || '';
      if (!text) {
        setError('A transcrição retornou vazia. Tente gravar novamente.');
        setState('idle');
        return;
      }

      onTranscriptionRef.current(text);
      setDuration(0);
      setState('idle');
    } catch (err) {
      if (cancelledRef.current) {
        setState('idle');
        return;
      }
      setError(
        extractErrorMessage(
          err,
          'Não foi possível transcrever o áudio. Tente novamente.',
        ),
      );
      setState('idle');
    }
  }, [
    cleanupStream,
    params.characterizationId,
    params.companyId,
    params.workspaceId,
  ]);

  const startRecording = useCallback(async () => {
    try {
      cancelledRef.current = false;
      setError(null);
      setDuration(0);
      cleanupStream();

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
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
          }
          void stopAndTranscribe();
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
      setState('idle');
    }
  }, [cleanupStream, stopAndTranscribe]);

  return {
    state,
    error,
    duration,
    durationLabel: formatDuration(duration),
    isBusy: state === 'recording' || state === 'transcribing',
    startRecording,
    stopAndTranscribe,
    cancelRecording,
  };
}
