import { CharacterizationBrowseResultModel } from '@v2/models/security/models/characterization/characterization-browse-result.model';

export interface ICharacterizationTableTableProps {
  data?: CharacterizationBrowseResultModel[];
  isLoading?: boolean;
  setPage: (page: number) => void;
  pagination?: {
    total: number;
    limit: number;
    page: number;
  };
}
