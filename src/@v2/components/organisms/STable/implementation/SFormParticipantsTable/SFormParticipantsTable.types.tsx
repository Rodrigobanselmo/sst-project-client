import { FormParticipantsBrowseResultModel } from '@v2/models/form/models/form-participants/form-participants-browse-result.model';
import { FormParticipantsOrderByEnum } from '@v2/services/forms/form-participants/browse-form-participants/service/browse-form-participants.types';
import { IOrderByParams } from '@v2/types/order-by-params.type';
import { ReactNode } from 'react';
import { FormParticipantsColumnsEnum } from './enums/form-participants-columns.enum';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';

export interface IFormParticipantsFilterProps {
  search?: string;
  status?: string[];
  hierarchies?: {
    id: string;
    name: string;
  }[];
  page?: number;
  limit?: number;
  orderBy?: IOrderByParams<FormParticipantsOrderByEnum>[];
}

export interface IFormParticipantsTableTableProps {
  data?: FormParticipantsBrowseResultModel[];
  hiddenColumns: Record<FormParticipantsColumnsEnum, boolean>;
  filterColumns: Partial<Record<FormParticipantsColumnsEnum, ReactNode>>;
  setHiddenColumns: (
    hiddenColumns: Partial<Record<FormParticipantsColumnsEnum, boolean>>,
  ) => void;
  isLoading?: boolean;
  filters: IFormParticipantsFilterProps;
  setFilters: (values: IFormParticipantsFilterProps) => void;
  setPage: (page: number) => void;
  setOrderBy: (order: IOrderByParams<FormParticipantsOrderByEnum>) => void;
  onSelectRow: (row: FormParticipantsBrowseResultModel) => void;
  formApplication?: FormApplicationReadModel;
  pagination?: {
    total: number;
    limit: number;
    page: number;
  };
}
