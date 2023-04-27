import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import clone from 'clone';
/* eslint-disable no-param-reassign */
import {
  NodeDocumentModel,
  NodeDocumentModelElementData,
  NodeDocumentModelSectionData,
} from 'components/organisms/documentModel/DocumentModelTree/types/types';
import { initialEditDocumentModelState } from 'components/organisms/modals/ModalEditDocumentModel/hooks/useEditDocumentModel';
import { v4 } from 'uuid';

import {
  IDocumentModelData,
  IDocumentModelElement,
  IDocumentModelSection,
} from 'core/interfaces/api/IDocumentModel';

import { AppState } from '../..';
import { IVariableDocument } from 'components/organisms/tables/VariablesDocTable/VariablesDocTable';

export interface IDocumentSlice {
  model: IDocumentModelData | null;
  needSynchronization: boolean;
  modalEditData: Partial<typeof initialEditDocumentModelState>;
  dragItem: {
    index?: number;
    dropTargetId?: string | number;
  };
  selectItem: NodeDocumentModel | null;
}

const initialState: IDocumentSlice = {
  model: null,
  needSynchronization: false,
  dragItem: {},
  selectItem: null,
  modalEditData: {},
};

const name = 'document';

const getSection = (state: IDocumentSlice, id: string) => {
  const data = {
    sectionIndex: 0,
    sectionSecondIndex: 0,
    section: undefined as IDocumentModelSection | undefined,
    lastSection: undefined as IDocumentModelSection | undefined,
  };

  const sectionsGroup = state.model?.sections || [];
  let found = false;

  for (let i = 0; i < sectionsGroup.length; i++) {
    const sections = sectionsGroup[i];

    for (let i_sec = 0; i_sec < sections.data.length; i_sec++) {
      const section = sections.data[i_sec];

      if (section && section.id == id) {
        data.sectionSecondIndex = i_sec;
        data.sectionIndex = i;
        data.section = section;
        found = true;
        break;
      }

      if (sections.children?.[section.id]) data.lastSection = section;
    }

    if (found) break;
  }

  return data;
};

const getChild = (state: IDocumentSlice, id: string) => {
  const data = {
    sectionId: '',
    sectionIndex: 0,
    childrenIndex: 0,
    element: {} as IDocumentModelElement,
  };

  const sectionsGroup = state.model?.sections || [];
  let found = false;

  for (let i = 0; i < sectionsGroup.length; i++) {
    const sections = sectionsGroup[i];
    const children = sectionsGroup[i].children;

    for (let i_sec = 0; i_sec < sections.data.length; i_sec++) {
      const section = sections.data[i_sec];
      if (children?.[section.id]) {
        for (let i_el = 0; i_el < children[section.id].length; i_el++) {
          const element = children[section.id]?.[i_el];

          if (element && element.id == id) {
            data.childrenIndex = i_el;
            data.sectionIndex = i;
            data.sectionId = section.id;
            data.element = element;
            found = true;
            break;
          }
        }
      }
    }

    if (found) break;
  }

  return data;
};

const getManySectionAndChild = (state: IDocumentSlice, ids: string[]) => {
  const sectionsGroup = clone(state.model?.sections || []);

  for (let i = 0; i < sectionsGroup.length; i++) {
    const sections = sectionsGroup[i];
    const children = sectionsGroup[i].children;

    for (let i_sec = 0; i_sec < sections.data.length; i_sec++) {
      const section = sections.data[i_sec];

      if (section && ids.includes(section.id)) {
        sections.data.splice(i_sec, 1, null as unknown as any);
      }

      if (children?.[section.id]) {
        for (let i_el = 0; i_el < children[section.id].length; i_el++) {
          const element = children[section.id]?.[i_el];

          if (element && ids.includes(element.id)) {
            children[section.id].splice(i_el, 1, null as unknown as any);
          }
        }
      }
    }
  }

  for (let i = 0; i < sectionsGroup.length; i++) {
    const sections = sectionsGroup[i];
    const children = sectionsGroup[i].children;

    sections.data = sections.data.filter((item) => item !== null);
    if (children) {
      for (const key in children) {
        if (children[key]) {
          children[key] = children[key].filter((item) => item !== null);

          if (children[key].length == 0) delete children[key];
        }
      }
    }
  }

  return sectionsGroup;
};

export const documentSlice = createSlice({
  name,
  initialState,
  reducers: {
    setSaveDocument: (state) => {
      state.needSynchronization = false;
    },
    setDocumentModalEditData: (
      state,
      action: PayloadAction<IDocumentSlice['modalEditData']>,
    ) => {
      state.modalEditData = action.payload;
    },
    setDocumentEditElementChild: (
      state,
      action: PayloadAction<{
        element: Partial<NodeDocumentModelElementData>;
      }>,
    ) => {
      if (!action.payload.element.id) return state;

      const data = getChild(state, action.payload.element.id);

      const element = action.payload.element;
      const sectionsGroup = state.model?.sections || [];
      const children = sectionsGroup[data.sectionIndex].children;

      if (children)
        children[data.sectionId][data.childrenIndex] = {
          ...data.element,
          ...element,
        };

      state.needSynchronization = true;
    },
    setDocumentAddElementAfterChild: (
      state,
      action: PayloadAction<{
        element:
          | Partial<NodeDocumentModelElementData>
          | Partial<NodeDocumentModelElementData>[];
      }>,
    ) => {
      let elements: Partial<NodeDocumentModelElementData>[] = [];

      if (!Array.isArray(action.payload.element))
        elements = [action.payload.element];
      else {
        elements = action.payload.element;
      }

      elements.forEach((element) => {
        if (!element.id) return state;
        const data = getChild(state, element.id);

        const sectionsGroup = state.model?.sections || [];
        const children = sectionsGroup[data.sectionIndex].children;

        if (children) {
          const cloneChildren = clone(children[data.sectionId]);

          cloneChildren.splice(data.childrenIndex + 1, 0, {
            ...data.element,
            ...element,
            id: v4(),
          });

          children[data.sectionId] = cloneChildren;
        }
      });

      state.needSynchronization = true;
    },
    setDocumentAddElementAfterSection: (
      state,
      action: PayloadAction<{
        sectionId: string;
        element: Omit<NodeDocumentModelElementData, 'id'>;
      }>,
    ) => {
      if (!action.payload.sectionId) return state;
      const data = getSection(state, action.payload.sectionId);

      const element = action.payload.element;
      const sectionsGroup = state.model?.sections || [];
      const children = sectionsGroup[data.sectionIndex].children;

      if (children) {
        if (!children[action.payload.sectionId])
          children[action.payload.sectionId] = [];

        children[action.payload.sectionId] = [
          {
            ...element,
            id: v4(),
          },
          ...children[action.payload.sectionId],
        ];
      }

      state.needSynchronization = true;
    },
    setDocumentDeleteElementChild: (
      state,
      action: PayloadAction<{ id: string }>,
    ) => {
      if (!action.payload.id) return state;
      const data = getChild(state, action.payload.id);

      const sectionsGroup = state.model?.sections || [];
      const children = sectionsGroup[data.sectionIndex].children;

      if (children) {
        const cloneChildren = clone(children[data.sectionId]);

        cloneChildren.splice(data.childrenIndex, 1);

        children[data.sectionId] = cloneChildren;
      }

      state.needSynchronization = true;
    },
    setDocumentDeleteSection: (
      state,
      action: PayloadAction<{ id: string }>,
    ) => {
      if (!action.payload.id) return state;
      const data = getSection(state, action.payload.id);

      const sectionsGroup = state.model?.sections || [];
      const sections = sectionsGroup[data.sectionIndex].data;
      const children = sectionsGroup[data.sectionIndex].children;

      if (
        !data.lastSection &&
        data.section?.id &&
        children?.[data.section.id]
      ) {
        alert('Não é possivel remover a primeira seção do documento');
        return state;
      }

      if (sections) {
        const cloneSections = clone(sections);

        cloneSections.splice(data.sectionSecondIndex, 1);

        sectionsGroup[data.sectionIndex].data = cloneSections;

        if (data.section?.id && children) {
          const sectionChildren = children[data.section.id];

          if (sectionChildren && data.lastSection?.id) {
            const newChildren = clone(children);

            newChildren[data.lastSection.id].push(...sectionChildren);
            delete newChildren[data.section.id];

            sectionsGroup[data.sectionIndex].children = newChildren;
          }
        }
      }

      state.needSynchronization = true;
    },
    setDocumentDeleteMany: (
      state,
      action: PayloadAction<{ ids: string[] }>,
    ) => {
      if (!action.payload.ids) return state;
      const sectionsGroup = getManySectionAndChild(state, action.payload.ids);

      const stateModel = state.model;
      if (stateModel) stateModel.sections = sectionsGroup;

      state.needSynchronization = true;
      return state;
    },
    setDocumentAddSection: (
      state,
      action: PayloadAction<{
        section: NodeDocumentModelSectionData;
      }>,
    ) => {
      if (!action.payload.section.type) return state;
      if (!state.model?.sections?.[0]?.data) return state;
      const section = action.payload.section;

      state.model.sections[0].data = [section, ...state.model.sections[0].data];
      state.needSynchronization = true;
    },
    setDocumentModel: (
      state,
      action: PayloadAction<IDocumentSlice['model']>,
    ) => {
      state.model = action.payload;
      state.dragItem = {};
      state.needSynchronization = false;
    },
    setDocumentModelSections: (
      state,
      action: PayloadAction<IDocumentModelData['sections']>,
    ) => {
      if (state.model) {
        state.model.sections = action.payload;
        state.needSynchronization = true;
      }
    },
    setDocumentDragItem: (
      state,
      action: PayloadAction<IDocumentSlice['dragItem']>,
    ) => {
      state.dragItem = action.payload;
    },
    setDocumentSelectItem: (
      state,
      action: PayloadAction<NodeDocumentModel | null>,
    ) => {
      state.selectItem = action.payload;
    },
    setDocumentModelAddVariable: (
      state,
      action: PayloadAction<IVariableDocument>,
    ) => {
      if (state.model && state.model.variables) {
        const variable = action.payload;
        state.model.variables = [
          ...state.model.variables.filter((v) => v.type !== variable.type),
          variable,
        ];
      }
    },
    setDocumentModelRemoveVariable: (
      state,
      action: PayloadAction<IVariableDocument>,
    ) => {
      if (state.model && state.model.variables) {
        const variable = action.payload;
        state.model.variables = [
          ...state.model.variables.filter((v) => v.type !== variable.type),
        ];
      }
    },
  },
});

export const TreeName = name;

export const {
  setDocumentDragItem,
  setDocumentModel,
  setDocumentSelectItem,
  setSaveDocument,
  setDocumentModalEditData,
  setDocumentModelSections,
  setDocumentEditElementChild,
  setDocumentAddElementAfterChild,
  setDocumentDeleteElementChild,
  setDocumentAddSection,
  setDocumentDeleteSection,
  setDocumentDeleteMany,
  setDocumentAddElementAfterSection,
  setDocumentModelAddVariable,
  setDocumentModelRemoveVariable,
} = documentSlice.actions;

export const selectAllDocumentModel = (state: AppState) => state[name].model;
export const selectAllDocumentModelVariables = (state: AppState) =>
  state[name].model?.variables;

export const selectEqualDocumentDragItem =
  (id: string | number) => (state: AppState) =>
    state[name].dragItem.dropTargetId == id;

export const selectEqualDocumentSelectItem =
  (id: string | number) => (state: AppState) =>
    state[name].selectItem?.id == id;

export const selectEqualDocumentDragItemIndex =
  (index?: number) => (state: AppState) =>
    state[name].dragItem.index === index;

export const selectDocumentDragItem = (state: AppState) => state[name].dragItem;
export const selectDocumentSelectItem = (state: AppState) =>
  state[name].selectItem;

export default documentSlice.reducer;
