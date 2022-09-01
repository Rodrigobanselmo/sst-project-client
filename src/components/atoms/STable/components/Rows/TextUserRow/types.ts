/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, ReactNode } from 'react';

import { IUser } from 'core/interfaces/api/IUser';

import { TextIconRowProps } from '../TextIconRow/types';

export type TextUserRowProps = TextIconRowProps & {
  user?: IUser;
};
