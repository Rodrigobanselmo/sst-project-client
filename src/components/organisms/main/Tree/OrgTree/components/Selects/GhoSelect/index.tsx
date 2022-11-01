import React, { FC } from 'react';

import SGhoIcon from 'assets/icons/SGhoIcon';

import { originRiskMap } from 'core/constants/maps/origin-risk';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IGho } from 'core/interfaces/api/IGho';

import { STagSelect } from '../../../../../../../molecules/STagSelect';
import { IGhoSelectProps } from './types';

export const GhoSelect: FC<IGhoSelectProps> = ({
  showAll,
  large,
  node,
  ...props
}) => {
  const getName = (homogeneousGroup: IGho) => {
    const splitHomo = homogeneousGroup.description.split('(//)');
    if (splitHomo.length > 1)
      return `${splitHomo[0]}\n(${originRiskMap[splitHomo[1]]?.name})`;
    if (!homogeneousGroup.type) return `${homogeneousGroup.name}\n(GSE)`;
  };

  const ghos = node.ghos
    .filter((gho) => gho?.type !== HomoTypeEnum.HIERARCHY)
    .map((gho) => ({ ...gho, name: getName(gho) || '' }));

  return (
    <STagSelect
      options={ghos.map((gho) => ({ name: gho.name, value: gho.id }))}
      text={
        showAll
          ? `${String(ghos.length)} - ${ghos.map((gho) => gho.name).join(', ')}`
          : String(ghos.length)
      }
      title={'Grupos homogênios de exposição'}
      large={large}
      maxWidth={200}
      icon={SGhoIcon}
      {...props}
    />
  );
};
