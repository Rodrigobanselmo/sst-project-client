import {
  DOCUMENT_EDITOR_V2_BLOCK_SECTION_REASON,
  DOCUMENT_EDITOR_V2_BLOCK_SWITCH_REASON,
} from './document-editor-v2-notices';

export type DocumentEditorSurface = 'v1' | 'v2';

export type { DocumentEditorV2ViewMode } from './document-editor-v2-page-layout';

export function resolveVisibleSurface(args: {
  flagEnabled: boolean;
  surface: DocumentEditorSurface;
}): DocumentEditorSurface {
  if (!args.flagEnabled) return 'v1';
  return args.surface;
}

export function isEditorSwitchVisible(flagEnabled: boolean): boolean {
  return flagEnabled;
}

export function canLeaveV2WithoutProtection(v2LocalDirty: boolean): boolean {
  return !v2LocalDirty;
}

export function shouldBlockOfficialSave(args: {
  surface: DocumentEditorSurface;
  v2LocalDirty: boolean;
  saveEnabled?: boolean;
}): boolean {
  return args.surface === 'v2' && args.v2LocalDirty && !args.saveEnabled;
}

/** Expressão final de disabled de Salvar / Salvar e sair. */
export function resolveOfficialSaveButtonsDisabled(args: {
  hasSelection: boolean;
  saveBusy: boolean;
  surface: DocumentEditorSurface;
  v2LocalDirty: boolean;
  saveEnabled: boolean;
}): boolean {
  return (
    !args.hasSelection ||
    args.saveBusy ||
    shouldBlockOfficialSave({
      surface: args.surface,
      v2LocalDirty: args.v2LocalDirty,
      saveEnabled: args.saveEnabled,
    })
  );
}

export function requestSurfaceChange(args: {
  current: DocumentEditorSurface;
  next: DocumentEditorSurface;
  v2LocalDirty: boolean;
}): { allowed: boolean; reason?: string } {
  if (args.current === args.next) return { allowed: true };
  if (args.next === 'v1' && args.v2LocalDirty) {
    return {
      allowed: false,
      reason: DOCUMENT_EDITOR_V2_BLOCK_SWITCH_REASON,
    };
  }
  return { allowed: true };
}

export function resolvePinnedSelection<
  T extends { id: string | number },
>(args: {
  selectedItem: T | null;
  pinnedItem: T | null;
  v2LocalDirty: boolean;
  surface: DocumentEditorSurface;
}): { renderItem: T | null; blockedSectionSwitch: boolean } {
  if (args.surface !== 'v2') {
    return { renderItem: args.selectedItem, blockedSectionSwitch: false };
  }

  if (args.v2LocalDirty && args.pinnedItem) {
    const blocked =
      String(args.selectedItem?.id ?? '') !== String(args.pinnedItem.id);
    return {
      renderItem: args.pinnedItem,
      blockedSectionSwitch: blocked,
    };
  }

  return { renderItem: args.selectedItem, blockedSectionSwitch: false };
}

export function sectionSwitchProtectionNotice(
  blockedSectionSwitch: boolean,
): string | null {
  return blockedSectionSwitch ? DOCUMENT_EDITOR_V2_BLOCK_SECTION_REASON : null;
}

export function shouldIgnoreModalEscapeClose(args: {
  v2LocalDirty: boolean;
  reason?: string;
}): boolean {
  return Boolean(args.v2LocalDirty && args.reason === 'escapeKeyDown');
}

export function consumeEditorEscapeEvent(event: {
  key: string;
  stopPropagation: () => void;
  preventDefault?: () => void;
}): boolean {
  if (event.key !== 'Escape') return false;
  event.stopPropagation();
  event.preventDefault?.();
  return true;
}
