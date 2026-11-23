import { useCallback, useEffect, useRef, useState } from 'react';

import { transcribeAiAnalyzeCharacterizationAudio } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/transcribe-ai-analyze-characterization-audio.service';

import {
  MIN_AI_ANALYZE_AUDIO_BYTES,
  isRecorderBlobTooShort,
  stopAndCollectMediaRecorderBlob,
  withAudioTranscriptionTimeout,
  type MediaRecorderLike,
} from './collect-media-recorder-blob.util';

export type AiAnalyzeAudioRecorderState =
  | 'idle'
  | 'starting'
  | 'recording'
  | 'stopping'
  | 'transcribing';

export type TranscribeAiAnalyzeAudioFn = (params: {
  companyId: string;
  workspaceId: string;
  characterizationId?: string;
  audio: Blob;
  fileName?: string;
}) => Promise<{ text: string }>;

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
  characterizationId?: string;
  transcribe?: TranscribeAiAnalyzeAudioFn;
  onTranscription: (text: string) => void;
}) {
  const [state, setStateValue] = useState<AiAnalyzeAudioRecorderState>('idle');
  const phaseRef = useRef<AiAnalyzeAudioRecorderState>('idle');
  const sessionRef = useRef(0);
  const setState = useCallback((next: AiAnalyzeAudioRecorderState) => {
    phaseRef.current = next;
    setStateValue(next);
  }, []);
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
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.onerror = null;
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
      sessionRef.current += 1;
      cleanupStream();
    };
  }, [cleanupStream]);

  const cancelRecording = useCallback(() => {
    cancelledRef.current = true;
    sessionRef.current += 1;
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try {
        mediaRecorder.stop();
      } catch {
        // already stopping
      }
    }
    cleanupStream();
    setDuration(0);
    setError(null);
    setState('idle');
  }, [cleanupStream]);

  const stopAndTranscribe = useCallback(async () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder || phaseRef.current !== 'recording') return;
    const session = sessionRef.current;
    setState('stopping');
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    cancelledRef.current = false;

    let blob: Blob;
    try {
      blob = await stopAndCollectMediaRecorderBlob({
        mediaRecorder: mediaRecorder as unknown as MediaRecorderLike,
        chunks: audioChunksRef.current,
        dataAlreadyCollected: true,
        mimeType: mediaRecorder.mimeType || mimeTypeRef.current,
      });
    } catch (err) {
      if (session === sessionRef.current) {
        setError(
          extractErrorMessage(
            err,
            'Não foi possível finalizar a gravação. Tente novamente.',
          ),
        );
        setState('idle');
      }
      return;
    } finally {
      if (session === sessionRef.current) cleanupStream();
    }

    if (cancelledRef.current || session !== sessionRef.current) return;

    if (!blob || isRecorderBlobTooShort(blob, MIN_AI_ANALYZE_AUDIO_BYTES)) {
      setError(
        'O microfone não forneceu áudio suficiente. Confira a entrada de som e grave novamente.',
      );
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
            : blob.type.includes('mpeg')
              ? 'mp3'
              : 'webm';
      const result = await withAudioTranscriptionTimeout(
        (async () => {
          if (params.transcribe) {
            return params.transcribe({
              companyId: params.companyId,
              workspaceId: params.workspaceId,
              characterizationId: params.characterizationId,
              audio: blob,
              fileName: `recording.${extension}`,
            });
          }

          if (!params.characterizationId) {
            throw new Error(
              'Identificador do elemento não encontrado para transcrever o áudio.',
            );
          }

          return transcribeAiAnalyzeCharacterizationAudio({
            companyId: params.companyId,
            workspaceId: params.workspaceId,
            characterizationId: params.characterizationId,
            audio: blob,
            fileName: `recording.${extension}`,
          });
        })(),
      );

      if (cancelledRef.current || session !== sessionRef.current) return;

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
      if (cancelledRef.current || session !== sessionRef.current) return;
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
    params.transcribe,
    params.workspaceId,
  ]);

  const startRecording = useCallback(async () => {
    if (phaseRef.current !== 'idle') return;
    const session = ++sessionRef.current;
    setState('starting');
    try {
      cancelledRef.current = false;
      setError(null);
      setDuration(0);
      cleanupStream();

      if (
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === 'undefined'
      )
        throw new Error(
          'Este navegador não oferece suporte à gravação de áudio.',
        );
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (session !== sessionRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType || 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
        audioBitsPerSecond: 32000,
      });

      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => {
        if (session === sessionRef.current && event.data.size > 0)
          audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onerror = () => {
        if (session !== sessionRef.current) return;
        sessionRef.current += 1;
        cleanupStream();
        setError(
          'O navegador interrompeu a gravação. Confira o microfone e tente novamente.',
        );
        setState('idle');
      };
      mediaRecorder.onstop = () => {
        if (session === sessionRef.current && phaseRef.current === 'recording')
          void stopAndTranscribe();
      };
      // Preserve all encoded chunks from the beginning, including container headers.
      mediaRecorder.start(1000);
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
      if (session !== sessionRef.current) return;
      cleanupStream();
      if ((err as Error).name === 'NotAllowedError') {
        setError('Permissão de microfone negada.');
      } else if ((err as Error).name === 'NotFoundError') {
        setError('Nenhum microfone encontrado.');
      } else {
        setError(
          extractErrorMessage(err, 'Não foi possível iniciar a gravação.'),
        );
      }
      setState('idle');
    }
  }, [cleanupStream, stopAndTranscribe]);

  return {
    state,
    error,
    duration,
    durationLabel: formatDuration(duration),
    isBusy: state !== 'idle',
    startRecording,
    stopAndTranscribe,
    cancelRecording,
  };
}
