import { SFlexProps } from 'components/atoms/SFlex/types';
import { ICompany } from 'core/interfaces/api/ICompany';

import { IEmployeeExamsHistory } from 'core/interfaces/api/IEmployee';
import { TextIconRowProps } from '../TextIconRow/types';

export type TextCompanyRowProps = TextIconRowProps & {
  clinic?: ICompany;
};
