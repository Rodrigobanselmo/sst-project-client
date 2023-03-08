import {
  IDocumentModelElement,
  IDocumentModelSection,
} from 'core/interfaces/api/IDocumentModel';

import { NodeModel } from '../../../../dnd-tree/Main';

export type NodeDocumentModelSectionData = {
  type: string;
  section: true;
  childrenTree?: NodeDocumentModelElementData[];
} & IDocumentModelSection;

export type NodeDocumentModelElementData = {
  childrenTree?: NodeDocumentModelElementData[];
  element: true;
  sectionId?: string;
  sectionIndex?: number;
} & IDocumentModelElement;

export type NodeDocumentModel = NodeModel<
  NodeDocumentModelSectionData | NodeDocumentModelElementData
>;
