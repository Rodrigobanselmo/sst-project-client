import { useEffect, useRef, useState } from 'react';
import { Alert, Button } from '@mui/material';
import axios from 'axios';
import {
  browseChemicalUseScenarioBoard,
  readChemicalPrioritizationDraft,
  saveChemicalPrioritizationDraft,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import type { ChemicalUseScenarioBoardRow } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import { ChemicalInventoryTransfer } from './ChemicalInventoryTransfer';
import type {
  ChemicalScenarioRatingReview,
  ChemicalStelReview,
} from './chemical-prioritization';

type Draft = {
  ratingReviews: Partial<Record<string, ChemicalScenarioRatingReview>>;
  contactComments: Partial<Record<string, string>>;
  stelReviews: Partial<Record<string, ChemicalStelReview>>;
  reviewed: boolean;
};

export type ChemicalPrioritizationAnalysis = Draft & {
  rows: ChemicalUseScenarioBoardRow[];
};

function draftPayload({
  ratingReviews,
  contactComments,
  stelReviews,
  reviewed,
}: Draft): Draft {
  return { ratingReviews, contactComments, stelReviews, reviewed };
}

function canonicalDraft(value: Draft) {
  return JSON.stringify(value, (_, item) =>
    item && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(
          Object.keys(item)
            .sort()
            .map((key) => [key, item[key]]),
        )
      : item,
  );
}

export function ChemicalPrioritizationDraftBackup({
  scope,
  companyId,
  workspaceId,
  draft,
  onRestore,
}: {
  scope: string;
  companyId: string;
  workspaceId: string;
  draft: ChemicalPrioritizationAnalysis | undefined;
  onRestore: (analysis: ChemicalPrioritizationAnalysis) => void;
}) {
  const [saved, setSaved] = useState<{
    revision: number;
    content: string | null;
  }>();
  const [status, setStatus] = useState<
    'ready' | 'saving' | 'error' | 'conflict'
  >('ready');
  const [attempt, setAttempt] = useState(0);
  const latest = useRef({ draft, onRestore });
  latest.current = { draft, onRestore };
  const writing = useRef(false);

  useEffect(() => {
    if (!draft) return;
    try {
      sessionStorage.setItem(scope, JSON.stringify(draft));
    } catch {
      // A gravação no servidor independe do armazenamento do navegador.
    }
  }, [scope, draft]);

  useEffect(() => {
    let active = true;
    const params = { companyId, workspaceId };

    async function load() {
      try {
        if (!latest.current.draft) {
          try {
            const backup = sessionStorage.getItem(scope);
            if (backup) {
              const analysis = JSON.parse(
                backup,
              ) as ChemicalPrioritizationAnalysis;
              if (Array.isArray(analysis.rows))
                latest.current.onRestore(analysis);
            }
          } catch {
            // A cópia temporária pode estar indisponível.
          }
        }
        const stored = await readChemicalPrioritizationDraft<Draft>(params);
        if (!active) return;
        const current = latest.current.draft;
        const content = stored.draft ? canonicalDraft(stored.draft) : null;
        const storedRevision = sessionStorage.getItem(scope + ':revision');
        if (
          current &&
          stored.draft &&
          canonicalDraft(draftPayload(current)) !== content &&
          storedRevision !== String(stored.revision)
        ) {
          setStatus('conflict');
          return;
        }
        if (!current && stored.draft) {
          const rows = await browseChemicalUseScenarioBoard({
            ...params,
            includePrioritization: true,
          });
          if (!active) return;
          latest.current.onRestore({ ...stored.draft, rows });
        }
        setSaved({ revision: stored.revision, content });
        setStatus('ready');
      } catch {
        if (active) setStatus('error');
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [scope, companyId, workspaceId, attempt]);

  const content = draft ? canonicalDraft(draftPayload(draft)) : null;
  useEffect(() => {
    if (
      !draft ||
      !saved ||
      !content ||
      content === saved.content ||
      writing.current ||
      status !== 'ready'
    )
      return;
    writing.current = true;
    setStatus('saving');
    void saveChemicalPrioritizationDraft(
      { companyId, workspaceId },
      { revision: saved.revision, draft: draftPayload(draft) },
    )
      .then(({ revision }) => {
        try {
          sessionStorage.setItem(scope + ':revision', String(revision));
        } catch {
          // O servidor já confirmou a gravação.
        }
        setSaved({ revision, content });
        setStatus('ready');
      })
      .catch((error: unknown) => {
        setStatus(
          axios.isAxiosError(error) && error.response?.status === 409
            ? 'conflict'
            : 'error',
        );
      })
      .finally(() => {
        writing.current = false;
      });
  }, [scope, companyId, workspaceId, draft, content, saved, status]);

  const hasUnsavedChanges = content !== null && content !== saved?.content;
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    function warnBeforeLeaving(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [hasUnsavedChanges]);

  if (status === 'conflict') {
    return (
      <Alert severity="warning">
        Outra sessão salvou uma versão diferente. O rascunho desta aba foi
        mantido aberto.
      </Alert>
    );
  }
  if (status === 'error') {
    return (
      <Alert
        severity="warning"
        action={
          <Button
            onClick={() => {
              setSaved(undefined);
              setStatus('ready');
              setAttempt((value) => value + 1);
            }}
          >
            Tentar novamente
          </Button>
        }
      >
        Não foi possível sincronizar o rascunho com o banco.
      </Alert>
    );
  }
  if (!draft) return null;
  return content === saved?.content ? (
    <>
      <Alert severity="success">Rascunho salvo no banco.</Alert>
      <ChemicalInventoryTransfer
        companyId={companyId}
        workspaceId={workspaceId}
      />
    </>
  ) : (
    <Alert severity="info">Salvando rascunho no banco…</Alert>
  );
}
