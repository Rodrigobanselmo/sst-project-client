import { featureFlags } from '@v2/constants/feature-flags';
import { useAccess } from 'core/hooks/useAccess';

export type DocumentEditorV2AccessInput = {
  surfaceFlag: boolean;
  saveFlag: boolean;
  isMaster: boolean;
};

export type DocumentEditorV2Access = {
  canUseV2: boolean;
  canPersistV2: boolean;
};

/**
 * Exposição do V2: env global OU override MASTER.
 * `isMaster` deve vir da fonte canônica (`isMaster` / `useAccess().isMaster`).
 */
export function resolveDocumentEditorV2Access(
  input: DocumentEditorV2AccessInput,
): DocumentEditorV2Access {
  return {
    canUseV2: input.surfaceFlag || input.isMaster,
    canPersistV2: input.saveFlag || input.isMaster,
  };
}

export function useDocumentEditorV2Access(): DocumentEditorV2Access {
  const { isMaster } = useAccess();
  return resolveDocumentEditorV2Access({
    surfaceFlag: featureFlags.documentEditorV2,
    saveFlag: featureFlags.documentEditorV2Save,
    isMaster,
  });
}
