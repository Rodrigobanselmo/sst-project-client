import React, { FC } from 'react';

import { SModalButtons } from './components/SModalButtons';
import { SModalHeader } from './components/SModalHeader';
import { SModalPaper } from './components/SModalPaper';
import { STModal } from './styles';
import { SModalProps } from './types';

const CModal: FC<SModalProps> = ({ ...props }) => {
  return <STModal {...props} />;
};

export { SModalPaper, SModalButtons, SModalHeader };
export default CModal;
