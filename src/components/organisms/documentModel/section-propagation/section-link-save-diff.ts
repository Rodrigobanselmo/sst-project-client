/**
 * Detects which structural-section windows actually changed between two
 * DocumentModel snapshots. Used after Strong Save so the link prompt is not
 * tied to the heading selected at click time.
 */

import { itemLevelMap } from 'components/organisms/documentModel/DocumentModelContent/constants/item-types.map';
import {
  computeElementWindow,
  readSectionChildren,
} from 'components/organisms/documentModel/editor-v2/domain/document-editor-slice';
import { IDocumentModelData, IDocumentModelElement } from 'core/interfaces/api/IDocumentModel';

export type ChangedLinkedSection = {
  headingId: string;
  headingType: string;
  sectionId: string;
  label: string;
  fingerprint: string;
};

export type LinkedSaveEvent = {
  seq: number;
  intent: 'stay' | 'exit';
  changed: ChangedLinkedSection[];
};

function isHeadingType(type?: string): boolean {
  return Boolean(type && itemLevelMap[type]);
}

export function listHeadingWindowFingerprints(
  model: IDocumentModelData | null | undefined,
): ChangedLinkedSection[] {
  if (!model) return [];
  const found: ChangedLinkedSection[] = [];
  const seen = new Set<string>();
  for (const group of model.sections || []) {
    for (const section of group.data || []) {
      const sectionId = String(section.id || '');
      if (!sectionId) continue;
      const children = readSectionChildren(group, section);
      children.forEach((element: IDocumentModelElement) => {
        if (!isHeadingType(element.type) || !element.id) return;
        const headingId = String(element.id);
        if (seen.has(headingId)) return;
        seen.add(headingId);
        const window = computeElementWindow(children, {
          id: headingId,
          data: { type: element.type },
        });
        if (window.start < 0) return;
        const slice = children.slice(window.start, window.end);
        found.push({
          headingId,
          headingType: String(element.type),
          sectionId,
          label: String(element.text || '').trim(),
          fingerprint: JSON.stringify(slice),
        });
      });
    }
  }
  return found;
}

export function resolveAfterSaveQueueAdvance(args: {
  queueLength: number;
  currentIndex: number;
}): { nextIndex: number; done: boolean } {
  const nextIndex = args.currentIndex + 1;
  if (nextIndex >= args.queueLength) return { nextIndex: args.currentIndex, done: true };
  return { nextIndex, done: false };
}

export function diffChangedHeadingWindows(
  before: ChangedLinkedSection[],
  after: ChangedLinkedSection[],
): ChangedLinkedSection[] {
  const previous = new Map(before.map((item) => [item.headingId, item.fingerprint]));
  return after.filter((item) => {
    const prior = previous.get(item.headingId);
    return prior != null && prior !== item.fingerprint;
  });
}
