import { itemLevelMap } from 'components/organisms/documentModel/DocumentModelContent/constants/item-types.map';
import {
  IDocumentModelData,
  IDocumentModelElement,
  IDocumentModelGroup,
  IDocumentModelSection,
} from 'core/interfaces/api/IDocumentModel';

import { cloneJson } from '../adapter/json-clone';

export type DocumentEditorSelectionKind = 'section' | 'element';

export type DocumentEditorSelection = {
  id: string;
  data?: {
    section?: boolean;
    element?: boolean;
    type?: string;
    sectionId?: string;
  };
};

export type DocumentEditorChildrenOrigin = 'map' | 'inline' | 'none';

export type LocatedDocumentSection = {
  groupIndex: number;
  sectionIndex: number;
  group: IDocumentModelGroup;
  section: IDocumentModelSection;
  origin: DocumentEditorChildrenOrigin;
  children: IDocumentModelElement[];
};

export function isSectionSelection(
  selected: DocumentEditorSelection,
): boolean {
  return Boolean(selected.data && 'section' in selected.data && selected.data.section);
}

export function headingDepth(type?: string): number | undefined {
  if (!type) return undefined;
  return itemLevelMap[type]?.level;
}

export function resolveChildrenOrigin(
  group: IDocumentModelGroup,
  section: IDocumentModelSection,
): DocumentEditorChildrenOrigin {
  if (group.children && section.id in group.children) return 'map';
  if (section.children) return 'inline';
  return 'none';
}

export function readSectionChildren(
  group: IDocumentModelGroup,
  section: IDocumentModelSection,
): IDocumentModelElement[] {
  const origin = resolveChildrenOrigin(group, section);
  if (origin === 'map') return group.children?.[section.id] || [];
  if (origin === 'inline') return section.children || [];
  return [];
}

export function findSectionInModel(
  model: IDocumentModelData,
  sectionId: string,
): LocatedDocumentSection | null {
  const groups = model.sections || [];
  for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
    const group = groups[groupIndex];
    const data = group.data || [];
    for (let sectionIndex = 0; sectionIndex < data.length; sectionIndex += 1) {
      const section = data[sectionIndex];
      if (section?.id !== sectionId) continue;
      return {
        groupIndex,
        sectionIndex,
        group,
        section,
        origin: resolveChildrenOrigin(group, section),
        children: readSectionChildren(group, section),
      };
    }
  }
  return null;
}

export function resolveSelectedSectionId(
  model: IDocumentModelData,
  selected: DocumentEditorSelection,
): string | null {
  if (isSectionSelection(selected)) return String(selected.id);

  const hinted =
    typeof selected.data?.sectionId === 'string' && selected.data.sectionId
      ? selected.data.sectionId
      : null;
  if (hinted && findSectionInModel(model, hinted)) return hinted;

  const groups = model.sections || [];
  for (const group of groups) {
    for (const section of group.data || []) {
      const children = readSectionChildren(group, section);
      if (children.some((element) => element.id === selected.id)) {
        return section.id;
      }
    }
  }
  return null;
}

export function computeElementWindow(
  children: IDocumentModelElement[],
  selected: DocumentEditorSelection,
): { start: number; end: number } {
  if (isSectionSelection(selected)) {
    return { start: 0, end: children.length };
  }

  const start = children.findIndex((element) => element.id === selected.id);
  if (start < 0) return { start: -1, end: -1 };

  const selectedType = selected.data?.type || children[start].type;
  const actualDeep = headingDepth(selectedType);
  let end = children.length;

  if (actualDeep != null) {
    for (let index = start + 1; index < children.length; index += 1) {
      const deep = headingDepth(children[index].type);
      if (deep != null && deep <= actualDeep) {
        end = index;
        break;
      }
    }
  } else {
    end = start + 1;
  }

  return { start, end };
}

export function extractModelSectionElements(
  model: IDocumentModelData,
  sectionId: string,
): IDocumentModelElement[] {
  const located = findSectionInModel(model, sectionId);
  return located ? located.children : [];
}

export function projectEditorSlice(
  original: IDocumentModelData,
  selected: DocumentEditorSelection,
): IDocumentModelData {
  const sectionId = resolveSelectedSectionId(original, selected);
  if (!sectionId) {
    return {
      variables: cloneJson(original.variables || []),
      sections: [],
    };
  }

  const located = findSectionInModel(original, sectionId);
  if (!located) {
    return {
      variables: cloneJson(original.variables || []),
      sections: [],
    };
  }

  const window = computeElementWindow(located.children, selected);
  const sliceChildren =
    window.start < 0 ? [] : located.children.slice(window.start, window.end);
  const section = cloneJson(located.section);
  delete section.children;

  if (located.origin === 'inline') {
    return {
      variables: cloneJson(original.variables || []),
      sections: [
        {
          data: [
            {
              ...section,
              children: cloneJson(sliceChildren),
            },
          ],
        },
      ],
    };
  }

  return {
    variables: cloneJson(original.variables || []),
    sections: [
      {
        data: [section],
        ...(sliceChildren.length || located.origin === 'map'
          ? { children: { [sectionId]: cloneJson(sliceChildren) } }
          : {}),
      },
    ],
  };
}

export function createSectionSelection(id: string): DocumentEditorSelection {
  return { id, data: { section: true, type: 'SECTION' } };
}

export function createElementSelection(
  id: string,
  type: string,
  sectionId?: string,
): DocumentEditorSelection {
  return {
    id,
    data: {
      element: true,
      type,
      ...(sectionId ? { sectionId } : {}),
    },
  };
}
