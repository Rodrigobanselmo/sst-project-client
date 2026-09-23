import { StatusEnum } from 'project/enum/status.enum';

import { DocumentGenerationSnapshot } from './document-generation-snapshot.types';

import { QuantityTypeEnum } from 'core/constants/maps/quantity-risks';
import { IEpi } from 'core/interfaces/api/IEpi';

import {
  RiskRecTextTypeEnum,
  RiskRecTypeEnum,
} from './../../../project/enum/RiskRecType.enum';
import { IDocumentData } from './IDocumentData';
import { IExam } from './IExam';
import { IGho } from './IGho';
import { IHierarchy } from './IHierarchy';
import { IGenerateSource, IRecMed, IRiskFactors } from './IRiskFactors';
import { ExposureTypeEnum } from 'core/enums/exposure.enum';

/** Critérios de evidência quantitativa de ruído (API). */
export type NoiseQuantityEvidenceCriterion =
  | 'NHO01_Q3'
  | 'NR15_Q5'
  | 'IMPACT_NR15'
  | 'IMPACT_NHO01';

export type NoiseQuantityEvidenceSource = 'ltcatq3' | 'nr15q5' | 'impactPeak';

/**
 * Snapshot autoritativo do canal que determinou o RO quantitativo de ruído.
 * Produzido pela API — o client apenas formata para exibição.
 */
export type NoiseQuantityEvidence = {
  criterion: NoiseQuantityEvidenceCriterion;
  source: NoiseQuantityEvidenceSource;
  value: string;
  unit: string;
  band: number;
  riskLevel: number;
};

export type IRiskDataActivities = {
  activities: {
    description?: string;
    subActivity?: string;
    activityType?: string;
  }[];
  realActivity?: string;
};

export interface IRiskDataRecDerivedMeasureRead {
  derivedRecMedId: string;
  sourceRecMedId: string;
  workspaceId: string;
  riskFactorDataRec: { status: StatusEnum };
}

export interface IRiskData {
  id: string;
  probability?: number;
  probabilityAfter?: number;
  companyId: string;
  riskId: string;
  homogeneousGroupId?: string;
  endDate?: Date;
  startDate?: Date;
  hierarchyId?: string;
  riskFactorGroupDataId: string;
  /** Contexto de overlay/cálculo; não é identidade do RFD. */
  workspaceId?: string | null;
  hierarchy?: IHierarchy;
  homogeneousGroup?: IGho;
  generateSources?: IGenerateSource[];
  adms?: IRecMed[];
  recs?: IRecMed[];
  engs?: IRecMed[];
  epis?: IEpi[];
  exams?: IExam[];
  isQuantity?: boolean;
  exposure?: ExposureTypeEnum;
  standardExams?: boolean;
  json?: IRiskDataJsonQui | IRiskDataJsonNoise;
  activities?: IRiskDataActivities;
  riskFactor?: IRiskFactors;
  origin?: string;
  originKind?: 'GSE' | 'CHARACTERIZATION' | 'HIERARCHY';
  originId?: string;
  originName?: string;
  originTypeLabel?: string;
  resolutionSource?: string;
  isDirect?: boolean;
  canEditOnThisEntity?: boolean;
  openOrigin?: {
    kind: 'CHARACTERIZATION' | 'GSE';
    id: string;
    workspaceId?: string;
  } | null;
  ro?: string;
  level?: number;
  intervention?: string;
  /**
   * Snapshot autoritativo das evidências que determinaram o level quantitativo (ruído).
   * Somente leitura — não enviar como input metodológico no upsert.
   */
  determiningEvidences?: NoiseQuantityEvidence[] | null;
  /**
   * Snapshot metodológico qualitativo (Fase 1C / API).
   * CUSTOM: autoridade de label/cor/classification; level = ponte operacional.
   * null / ausente = legado SYSTEM (SimpleSST).
   */
  matrixSource?: 'SYSTEM' | 'CUSTOM' | null;
  matrixVersionId?: string | null;
  matrixClassificationId?: string | null;
  matrixEvaluatedAt?: string | Date | null;
  resolvedLabel?: string | null;
  resolvedColor?: string | null;
  resolvedLegacyBand?: number | null;
  residualClassificationId?: string | null;
  residualLabel?: string | null;
  residualColor?: string | null;
  residualLegacyBand?: number | null;
  dataRecs?: IRiskDataRec[];
  riskFactorDataRecDerivedMeasures?: IRiskDataRecDerivedMeasureRead[];
  created_at: Date;
  updated_at: Date;
}

export interface IRiskDataRec {
  id: string;
  responsibleName: string;
  endDate: Date;
  comment: IRiskDataRecComment[];
  status: StatusEnum;
  recMedId: string;
  riskFactorDataId: string;
  workspaceId?: string;
  created_at: Date;
  updated_at: Date;
  companyId: string;
}

export interface IRiskDataRecComment {
  id: string;
  text: string;
  type: RiskRecTypeEnum;
  textType: RiskRecTextTypeEnum;
  riskFactorDataRecId: string;
  updated_at: Date;
  created_at: Date;
}

export interface IRiskDataJsonQui {
  stel?: string;
  twa?: string;
  nr15lt?: string;
  stelValue?: string;
  twaValue?: string;
  nr15ltValue?: string;
  type: QuantityTypeEnum;
}

export interface IRiskDataJsonNoise {
  ltcatq3?: string;
  ltcatq5?: string;
  nr15q3?: string;
  nr15q5?: string;
  impactPeak?: string;
  impactCircuit?: 'FAST_C' | 'LINEAR';
  impactMethod?: 'NR15' | 'NHO01';
  impactCount?: string;
  type: QuantityTypeEnum;
}

export interface IRiskGroupData {
  id: string;
  name: string;
  created_at: Date;
  companyId: string;
  status: StatusEnum;
  data?: IRiskData[];
}

export interface IRiskDocument {
  id: string;
  name: string;
  description: string;
  fileUrl: string;
  version: string;
  documentDataId: string;
  documentData: IDocumentData;
  created_at: Date;
  updated_at: Date;
  documentDate?: string | Date | null;
  documentCreatedAt?: string | Date | null;
  validityYears?: number | null;
  validityMonths?: number | null;
  validityEndSnapshot?: string | Date | null;
  companyId: string;
  status: StatusEnum;
  workspaceId: string;
  workspaceName: string;
  officialRevisionSeries?: number | null;
  approvedBy?: string | null;
  elaboratedBy?: string | null;
  revisionBy?: string | null;
  generationSnapshot?: DocumentGenerationSnapshot | null;
  attachments?: IPgrDocAttachment[];
}

export interface IPgrDocAttachment {
  id: string;
  name: string;
  url: string;
  created_at: Date;
  deleted_at: Date;
  updated_at: Date;
  riskFactorDocumentId: string;
}
