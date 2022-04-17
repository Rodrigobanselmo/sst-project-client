import React, { FC } from 'react';

import SGhoIcon from 'assets/icons/SGhoIcon';

import { STagSelect } from '../../../../../../molecules/STagSelect';
import { IGhoSelectProps } from './types';

export const GhoSelect: FC<IGhoSelectProps> = ({
  showAll,
  large,
  node,
  ...props
}) => {
  return (
    <STagSelect
      options={node.ghos.map((gho) => ({ name: gho.name, value: gho.id }))}
      text={
        showAll
          ? `${node.ghos.map((gho) => gho.name).join(', ')}`
          : String(node.ghos.length)
      }
      title={'Grupos homogênios de exposição'}
      large={large}
      icon={SGhoIcon}
      {...props}
    />
  );
};
