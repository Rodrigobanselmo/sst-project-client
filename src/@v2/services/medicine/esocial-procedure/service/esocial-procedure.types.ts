export enum EsocialProcedureStatusEnum {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEPRECATED = 'DEPRECATED',
}

export enum EsocialProcedureSourceEnum {
  ESOCIAL_TABLE_27 = 'ESOCIAL_TABLE_27',
  SIMPLE_SST = 'SIMPLE_SST',
  TECHNICAL = 'TECHNICAL',
  OTHER = 'OTHER',
}

export enum EsocialProcedureTypeEnum {
  CLINICAL = 'CLINICAL',
  LABORATORY = 'LABORATORY',
  IMAGING = 'IMAGING',
  AUDIOMETRY = 'AUDIOMETRY',
  SPIROMETRY = 'SPIROMETRY',
  TOXICOLOGICAL = 'TOXICOLOGICAL',
  OTHER = 'OTHER',
}

export interface IEsocialProcedureCuration {
  id: string;
  procedureCode: string;
  procedureNameSnapshot: string | null;
  status: EsocialProcedureStatusEnum;
  isOccupationalRelevant: boolean;
  technicalType: EsocialProcedureTypeEnum | null;
  internalNotes: string | null;
  source: EsocialProcedureSourceEnum;
  createdById: number | null;
  updatedById: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface IEsocialProcedureItem {
  procedureCode: string;
  officialName: string | null;
  isOrphanCuration: boolean;
  curation: IEsocialProcedureCuration | null;
}

export interface IBrowseEsocialProceduresParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: EsocialProcedureStatusEnum;
  technicalType?: EsocialProcedureTypeEnum;
  isOccupationalRelevant?: boolean;
  onlyCurated?: boolean;
}

export interface IBrowseEsocialProceduresResponse {
  count: number;
  data: IEsocialProcedureItem[];
  page: number;
  limit: number;
}

export interface IUpsertEsocialProcedurePayload {
  status?: EsocialProcedureStatusEnum;
  isOccupationalRelevant?: boolean;
  technicalType?: EsocialProcedureTypeEnum | null;
  internalNotes?: string | null;
}
