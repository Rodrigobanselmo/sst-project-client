import { useEffect, useRef, useState } from 'react';
import {
  getPresentationHref,
  PRESENTATION_PATH,
  type PresentationCardDefinition,
} from '../constants/presentation.constant';
import { downloadPresentationCardPng } from '../export/download-presentation-png';
import { downloadPresentationPdf } from '../export/download-presentation-pdf';
import { isPresentationExportBusy, runPresentationExport } from '../export/presentation-export-lock';

type PresentationShareMenuProps = {
  card: PresentationCardDefinition;
};

type CopyKind = 'deck' | 'card' | null;

function getAbsolutePresentationUrl(path: string) {
  return `${window.location.origin}${path}`;
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const field = document.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.left = '-9999px';
  document.body.appendChild(field);
  field.select();
  document.execCommand('copy');
  field.remove();
}

export function PresentationShareMenu({ card }: PresentationShareMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<CopyKind>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (busy) {
        return;
      }
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, busy]);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timer = window.setTimeout(() => setCopied(null), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const runExport = async (label: string, task: () => Promise<void>) => {
    if (busyRef.current || isPresentationExportBusy()) {
      return;
    }

    busyRef.current = true;
    setError('');
    setBusy(true);
    setProgress(label);

    try {
      await runPresentationExport(task);
      setOpen(false);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Não foi possível concluir a exportação.',
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
      setProgress('');
    }
  };

  const handleDownloadCard = () => {
    void runExport('Baixando PNG…', () => downloadPresentationCardPng(card));
  };

  const handleDownloadPdf = () => {
    void runExport('Baixando PDF…', () => downloadPresentationPdf());
  };

  const handleCopy = async (kind: Exclude<CopyKind, null>) => {
    try {
      const path = kind === 'deck' ? PRESENTATION_PATH : getPresentationHref(card);
      await copyText(getAbsolutePresentationUrl(path));
      setCopied(kind);
      setError('');
    } catch {
      setError('Não foi possível copiar o link.');
    }
  };

  return (
    <div className="lp-pres-share" ref={rootRef}>
      <button
        type="button"
        className="lp-btn lp-btn--ghost-light lp-btn--compact"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        disabled={busy}
      >
        {busy ? progress || 'Exportando…' : 'Exportar'}
      </button>

      {open ? (
        <div className="lp-pres-share__menu" role="menu" aria-label="Exportar e compartilhar">
          <button type="button" role="menuitem" disabled={busy} onClick={handleDownloadCard}>
            Baixar este card
          </button>
          <button type="button" role="menuitem" disabled={busy} onClick={handleDownloadPdf}>
            {busy && progress ? progress : 'Baixar PDF completo'}
          </button>
          <button type="button" role="menuitem" disabled={busy} onClick={() => void handleCopy('deck')}>
            {copied === 'deck' ? 'Link da apresentação copiado' : 'Copiar link da apresentação'}
          </button>
          <button type="button" role="menuitem" disabled={busy} onClick={() => void handleCopy('card')}>
            {copied === 'card' ? 'Link deste card copiado' : 'Copiar link deste card'}
          </button>
          {error ? <p className="lp-pres-share__error">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
