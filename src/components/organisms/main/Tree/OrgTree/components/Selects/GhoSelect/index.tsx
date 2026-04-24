import React, { FC } from 'react';

import SGhoIcon from 'assets/icons/SGhoIcon';

import { originRiskMap } from 'core/constants/maps/origin-risk';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IGho } from 'core/interfaces/api/IGho';

import { STagSelect } from '../../../../../../../molecules/STagSelect';
import { IGhoSelectProps } from './types';

export const getHomoGroupName = (homogeneousGroup: IGho) => {
  const splitHomo = homogeneousGroup?.description?.split('(//)');
  if (splitHomo.length > 1)
    return `${splitHomo[0]}\n(${originRiskMap[splitHomo[1]]?.name})`;
  if (!homogeneousGroup.type) return `${homogeneousGroup.name}\n(GSE)`;
};

export const GhoSelect: FC<{ children?: any } & IGhoSelectProps> = ({
  showAll,
  large,
  node,
  cornerBadge,
  sx,
  ...props
}) => {
  const seenIds = new Set<string>();
  const ghos = (node.ghos || [])
    .filter((gho) => gho?.type !== HomoTypeEnum.HIERARCHY)
    .filter((gho) => {
      if (seenIds.has(gho.id)) return false;
      seenIds.add(gho.id);
      return true;
    })
    .map((gho) => ({ ...gho, name: getHomoGroupName(gho) || '' }));

  const tooltipTitle =
    ghos.length === 0
      ? 'Nenhum GSE, ambiente, atividade, posto de trabalho ou equipamento vinculado a este cargo'
      : `Vínculos (${ghos.length}):\n${ghos
          .map((gho) => {
            const line = getHomoGroupName(gho) || gho.name || '';
            return line.replace(/\n/g, ' — ');
          })
          .join('\n')}`;

  const countLabel = String(ghos.length);

  const cornerSx = cornerBadge
    ? {
        minWidth: 26,
        maxWidth: 40,
        height: 22,
        pl: '4px',
        pr: '6px',
        borderRadius: '11px',
        '& .icon_main': { mr: ghos.length ? '4px' : 0, fontSize: '13px !important' },
        ...sx,
      }
    : sx;

  return (
    <STagSelect
      options={ghos.map((gho) => ({ name: gho.name, value: gho.id }))}
      text={
        cornerBadge
          ? countLabel
          : showAll
            ? `${countLabel} - ${ghos.map((gho) => gho.name).join(', ')}`
            : countLabel
      }
      tooltipTitle={tooltipTitle}
      large={cornerBadge ? false : large}
      maxWidth={cornerBadge ? 44 : 200}
      icon={SGhoIcon}
      sx={cornerSx}
      {...props}
    />
  );
};
