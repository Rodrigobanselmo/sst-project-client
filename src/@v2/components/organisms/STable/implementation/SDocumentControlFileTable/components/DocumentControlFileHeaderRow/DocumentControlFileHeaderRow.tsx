import { FC } from 'react';

import { STableHRow } from '@v2/components/organisms/STable/common/STableHRow/STableHRow';
import { IDocumentControlFileHeaderRowProps } from './DocumentControlFileHeaderRow.types';

export const DocumentControlFileHeaderRow: FC<
  IDocumentControlFileHeaderRowProps
> = ({ text, justify }) => {
  return <STableHRow justify={justify}>{text}</STableHRow>;
};
