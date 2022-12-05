/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, ReactNode } from 'react';

import { ICompany } from 'core/interfaces/api/ICompany';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';

import { TextIconRowProps } from '../TextIconRow/types';

export type TextHierarchyRowProps = TextIconRowProps & {
  office: IHierarchy;
  sector: IHierarchy;
};
