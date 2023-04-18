import { SFlexProps } from 'components/atoms/SFlex/types';

import { IEmployeeExamsHistory } from 'core/interfaces/api/IEmployee';

export type TextHierarchyRowProps = SFlexProps & {
  historyExam: IEmployeeExamsHistory;
  employeeId?: number;
  onlyClinic?: boolean;
  onChangeEvaluation?: (data: Partial<IEmployeeExamsHistory>) => void;
};
