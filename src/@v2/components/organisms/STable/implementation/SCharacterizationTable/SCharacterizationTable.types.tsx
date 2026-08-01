import { CharacterizationBrowseResultModel } from '@v2/models/security/models/characterization/characterization-browse-result.model';
import { CharacterizationOrderByEnum } from '@v2/services/security/characterization/characterization/browse-characterization/service/browse-characterization.types';
import { IOrderByParams } from '@v2/types/order-by-params.type';
import { SStatusButtonRowProps } from '../../addons/addons-rows/SStatusButtonRow/SStatusButtonRow';
import { CharacterizationColumnsEnum } from './enums/characterization-columns.enum';
import { TablesSelectEnum } from '../../hooks/useTableSelect';
import { ReactNode } from 'react';
import { SPopperStatusProps } from '@v2/components/organisms/SPopper/addons/SPopperStatus/SPopperStatus';

export interface ICharacterizationFilterProps {
  search?: string;
  stageIds?: number[];
  page?: number;
  limit?: number;
  orderBy?: IOrderByParams<CharacterizationOrderByEnum>[];
  /** Default false: apenas ativos. true: ativos + inativos. */
  includeInactive?: boolean;
}

export interface ICharacterizationTableTableProps {
  data?: CharacterizationBrowseResultModel[];
  table: TablesSelectEnum;
  hiddenColumns: Record<CharacterizationColumnsEnum, boolean>;
  filterColumns: Partial<Record<CharacterizationColumnsEnum, ReactNode>>;
  setHiddenColumns: (
    hiddenColumns: Record<CharacterizationColumnsEnum, boolean>,
  ) => void;
  isLoading?: boolean;
  /** When true, suppress the default empty-state placeholder (e.g. during error). */
  hideEmpty?: boolean;
  contentEmpty?: ReactNode;
  filters: ICharacterizationFilterProps;
  setFilters: (values: ICharacterizationFilterProps) => void;
  setPage: (page: number) => void;
  setOrderBy: (order: IOrderByParams<CharacterizationOrderByEnum>) => void;
  onSelectRow: (row: CharacterizationBrowseResultModel) => void;
  onEditRow?: (row: CharacterizationBrowseResultModel) => void;
  onEditStage: (
    stageId: number | null,
    row: CharacterizationBrowseResultModel,
  ) => void;
  onEditPosition: (
    position: number | null,
    row: CharacterizationBrowseResultModel,
  ) => void;
  /** Ações rápidas Fase 2 — inventário operacional na tabela. */
  /** Contagem → Fatores de Risco; ícone IA → Análise IA. */
  onQuickRisks?: (
    row: CharacterizationBrowseResultModel,
    target: 'factors' | 'ai',
  ) => void;
  onQuickCargos?: (
    row: CharacterizationBrowseResultModel,
    preferAdd?: boolean,
  ) => void;
  onQuickPhotos?: (
    row: CharacterizationBrowseResultModel,
    preferAdd?: boolean,
  ) => void;
  onQuickRename?: (row: CharacterizationBrowseResultModel) => void;
  onQuickType?: (row: CharacterizationBrowseResultModel) => void;
  statusButtonProps: Pick<
    SPopperStatusProps,
    'onDelete' | 'onEdit' | 'onAdd' | 'options' | 'isLoading'
  >;
  pagination?: {
    total: number;
    limit: number;
    page: number;
  };
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  /** Separa cabeçalho de colunas do corpo para sticky no fluxo empresarial. */
  part?: 'full' | 'header' | 'body';
}
