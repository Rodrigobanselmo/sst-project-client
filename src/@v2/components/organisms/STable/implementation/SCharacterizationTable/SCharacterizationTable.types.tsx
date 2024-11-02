import { CharacterizationBrowseResultModel } from '@v2/models/security/models/characterization/characterization-browse-result.model';
import { CharacterizationOrderByEnum } from '@v2/services/security/characterization/browse/service/browse-characterization.types';
import { IOrderByParams } from '@v2/types/order-by-params.type';
import { SStatusButtonRowProps } from '../../addons/addons-rows/SStatusButtonRow/SStatusButtonRow';
import { ICharacterizationFilterProps } from '@v2/pages/companies/characterizations/components/CharacterizationTable/CharacterizationTable.types';
import { CharacterizationColumnsEnum } from './enums/characterization-columns.enum';
import { TablesSelectEnum } from '../../hooks/useTableSelect';
import { ReactNode } from 'react';

export interface ICharacterizationTableTableProps {
  data?: CharacterizationBrowseResultModel[];
  table: TablesSelectEnum;
  hiddenColumns: Record<CharacterizationColumnsEnum, boolean>;
  filterColumns: Partial<Record<CharacterizationColumnsEnum, ReactNode>>;
  setHiddenColumns: (
    hiddenColumns: Record<CharacterizationColumnsEnum, boolean>,
  ) => void;
  isLoading?: boolean;
  filters: ICharacterizationFilterProps;
  setFilters: (values: ICharacterizationFilterProps) => void;
  setPage: (page: number) => void;
  setOrderBy: (order: IOrderByParams<CharacterizationOrderByEnum>) => void;
  onSelectRow: (row: CharacterizationBrowseResultModel) => void;
  onEditStage: (
    stageId: number | null,
    row: CharacterizationBrowseResultModel,
  ) => void;
  onEditPosition: (
    position: number | null,
    row: CharacterizationBrowseResultModel,
  ) => void;
  statusButtonProps: Pick<
    SStatusButtonRowProps,
    'onDelete' | 'onEdit' | 'onAdd' | 'options' | 'isLoading'
  >;
  pagination?: {
    total: number;
    limit: number;
    page: number;
  };
}
