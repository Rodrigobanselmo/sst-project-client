import { BoxProps } from '@mui/material';

import { IEpi } from 'core/interfaces/api/IEpi';
import { IExam } from 'core/interfaces/api/IExam';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRecMed, IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';

import { IRiskDataRow } from '../../types';

export interface RowColumnsProps extends BoxProps {
  handleSelect: (values: Partial<IUpsertRiskData>) => Promise<void>;
  handleRemove: (values: Partial<IUpsertRiskData>) => Promise<void>;
  riskData?: IRiskData | IRiskDataRow;
  risk: IRiskFactors | null;
  handleEditEpi: (epi: IEpi) => Promise<void>;
  handleEditEngs: (epi: IRecMed) => Promise<void>;
  handleEditExams: (exam: IExam) => Promise<void>;
  handleHelp: (data: Partial<IUpsertRiskData>) => Promise<void>;
  isSelected?: boolean;
  hide?: boolean;
  isLoading?: boolean;
  isRepresentAll?: boolean;
  isDeleteLoading?: boolean;
  showEndDate?: boolean;
  selectedRisks?: IRiskFactors[];
  handleDeleteRiskData?: () => void;
}
