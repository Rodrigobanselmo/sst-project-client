import { DocumentTypeEnum } from 'project/enum/document.enums';
import { StatusEnum } from 'project/enum/status.enum';

export enum DocModelPageOrientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape',
}

export enum DocModelAlignmentType {
  START = 'start',
  END = 'end',
  CENTER = 'center',
  BOTH = 'both',
  JUSTIFIED = 'both',
  DISTRIBUTE = 'distribute',
  LEFT = 'left',
  RIGHT = 'right',
}

interface IBase {
  removeWithSomeEmptyVars?: string[];
  removeWithAllEmptyVars?: string[];
  removeWithAllValidVars?: string[];
  addWithAllVars?: string[];
}

export type IDocumentModelElement = {
  id: string;
  type: string;
  text: string;
  level?: number;
  size?: number;
  color?: string;
  align?: DocModelAlignmentType;
} & IBase;

export type IDocumentModelSection = {
  id: string;
  type: string;
  label?: string;
  hasChildren?: boolean;
  children?: IDocumentModelElement[];
  footerText?: string;
  text?: string;
  version?: string;
  imgPath?: string;
  properties?: {
    page?: {
      margin?: {
        left?: number;
        right?: number;
        top?: number;
        bottom?: number;
      };
      size?: {
        orientation: DocModelPageOrientation;
      };
    };
  };
} & IBase;

export type IDocumentModelGroup = {
  label?: string;
  data: IDocumentModelSection[];
  children?: Record<string, IDocumentModelElement[]>;
};

export type IDocVariables = Record<
  string,
  {
    label: string;
    value?: string;
    type: string;
  }
>;

export type IDocumentModelData = {
  variables: IDocVariables;
  sections: IDocumentModelGroup[];
};

export interface IDocumentModelFull {
  document: IDocumentModelData;
  variables: Record<
    string,
    IDocVariables['string'] & {
      active?: boolean;
      isBoolean?: boolean;
    }
  >;
  elements: Record<
    string,
    {
      type: string;
      order: number;
      label: string;
      text: string;
      active?: boolean;
      isParagraph?: boolean;
      isBullet?: boolean;
    }
  >;
  sections: Record<
    string,
    {
      type: string;
      label: string;
      active?: boolean;
      text?: string;
      isSection?: boolean;
      isBreakSection?: boolean;
    }
  >;
}

export interface IDocumentModel {
  id: number;
  name: string;
  description: string;
  companyId: string;
  system: boolean;
  status: StatusEnum;
  created_at: Date;
  updated_at: Date;
  type: DocumentTypeEnum;
  dataJson?: IDocumentModelData;
  errorParse?: any;
}

export type IDocVariablesAllType = IDocVariables &
  IDocumentModelFull['variables'];
