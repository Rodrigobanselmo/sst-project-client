import { useRef, useState, useEffect } from 'react';

interface UseTextToSpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface UseTextToSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  currentText: string | null;
  originalText: string | null;
}

/**
 * Hook for Text-to-Speech using the Web Speech API
 * Useful for accessibility, especially for users who cannot read
 */
export const useTextToSpeech = (
  options: UseTextToSpeechOptions = {},
): UseTextToSpeechReturn => {
  const { lang = 'pt-BR', rate = 0.9, pitch = 1, volume = 1 } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  const stripHtml = (html: string): string => {
    // Create a temporary div to parse HTML and extract text
    if (typeof document !== 'undefined') {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    }
    // Fallback: remove HTML tags with regex
    return html.replace(/<[^>]*>/g, '');
  };

  const speak = (text: string) => {
    if (!isSupported) {
      console.warn('Text-to-Speech is not supported in this browser');
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Strip HTML tags and clean the text
    const cleanText = stripHtml(text).trim();

    if (!cleanText) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Try to find a Portuguese voice
    const voices = window.speechSynthesis.getVoices();
    const portugueseVoice = voices.find(
      (voice) => voice.lang.startsWith('pt') && voice.localService,
    );
    if (portugueseVoice) {
      utterance.voice = portugueseVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentText(cleanText);
      setOriginalText(text);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentText(null);
      setOriginalText(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentText(null);
      setOriginalText(null);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentText(null);
      setOriginalText(null);
    }
  };

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    currentText,
    originalText,
  };
};
