import { DocumentModelClassificationEnum } from 'project/enum/document-model-classification.enum';
import { StatusEnum } from 'project/enum/status.enum';

export type SectionPropagationUiStatus =
  | 'compatible'
  | 'old_version_compatible'
  | 'already_up_to_date'
  | 'page_break'
  | 'hierarchy'
  | 'extra_content'
  | 'structure'
  | 'not_found'
  | 'ambiguous'
  | 'stale'
  | 'source_stale'
  | 'unsafe'
  | 'permission'
  | 'apply_error'
  | 'broken';

export type SectionPropagationPreviewLine = {
  type: string;
  text: string;
};

export type SectionPropagationCandidate = {
  id: number;
  name: string;
  status: StatusEnum;
  system: boolean;
  classifications: DocumentModelClassificationEnum[];
  updated_at: string;
  dataHash: string | null;
  matchClass: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  uiStatus: SectionPropagationUiStatus;
  uiLabel: string;
  selectable: boolean;
  alreadyUpToDate: boolean;
  oldVersionCompatible?: boolean;
  linked?: boolean;
  groupId?: string | null;
  memberValid?: boolean;
  linkedStatus?: string;
  preview: {
    current: SectionPropagationPreviewLine[];
    next: SectionPropagationPreviewLine[];
    currentCount?: number;
    nextCount?: number;
  };
};

export type SectionPropagationAnalyzeResponse = {
  source: {
    id: number;
    name: string;
    type: string;
    headingId: string;
    headingType: string;
    headingText: string;
    sectionId: string;
    windowCount: number;
    updated_at: string;
    dataHash: string;
  };
  candidates: SectionPropagationCandidate[];
};

export type SectionPropagationApplyResult = {
  id: number;
  name?: string;
  outcome: 'updated' | 'already_up_to_date' | 'stale' | 'source_stale' | 'blocked' | 'unsafe' | 'conflict' | 'error';
  uiStatus: SectionPropagationUiStatus;
  uiLabel: string;
  wrote: boolean;
  updated_at?: string;
  dataHash?: string;
};

export type SectionPropagationApplyResponse = {
  summary: {
    updated: number;
    alreadyUpToDate: number;
    stale: number;
    sourceStale: number;
    blocked: number;
    errors: number;
    conflicts: number;
  };
  results: SectionPropagationApplyResult[];
};

export type SectionLinkMember = {
  documentModelId: number;
  name: string;
  status: StatusEnum | null;
  classifications: DocumentModelClassificationEnum[];
  sectionId: string;
  headingId: string;
  headingType: string;
  current?: boolean;
  memberValid: boolean;
  broken: boolean;
  contentSync?: 'synced' | 'divergent' | 'broken' | 'inactive';
};

export type SectionLinkGroupResponse = {
  group: {
    id: string;
    companyId: string;
    type: string;
    label: string | null;
    contentSyncRelativeToModelId?: number | null;
  } | null;
  members: SectionLinkMember[];
  dissolved?: boolean;
};
