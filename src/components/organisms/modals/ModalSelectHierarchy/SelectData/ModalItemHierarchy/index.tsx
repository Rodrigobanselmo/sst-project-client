import React, { FC, ReactNode } from 'react';

import { BoxProps, useTheme } from '@mui/material';
import { SSelectList } from 'components/molecules/SSelectList';
import { nodeTypesConstant } from 'components/organisms/main/Tree/OrgTree/constants/node-type.constant';
import { selectModalIdIsSelected } from 'store/reducers/hierarchy/hierarchySlice';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { IListHierarchyQuery } from 'core/hooks/useListHierarchyQuery';
import { getGseCargoBadgeSx } from '../../gse-cargo-row-presentation.util';

interface IItem extends BoxProps {
  data: IListHierarchyQuery;
  active?: boolean;
  activeRemove?: boolean;
  text?: string;
  tooltipText?: string;
  selectedOverride?: boolean;
  startContent?: ReactNode;
  endIcon?: ReactNode;
  textNoBreak?: boolean;
  gseLabelContrast?: boolean;
}

export const ModalItemHierarchy: FC<{ children?: any } & IItem> = ({
  data,
  active,
  activeRemove,
  text,
  tooltipText,
  selectedOverride,
  startContent,
  endIcon,
  textNoBreak,
  gseLabelContrast,
  onClick,
  ...rest
}) => {
  const theme = useTheme();
  const isSelectedFromStore = useAppSelector(selectModalIdIsSelected(data.id));
  const isSelected = selectedOverride ?? isSelectedFromStore;

  if ((isSelected && !active) || (!isSelected && active)) {
    return null;
  }

  return (
    <SSelectList
      active={active}
      activeRemove={activeRemove}
      tooltipText={tooltipText ?? data.parentsName + ' > ' + data.name}
      tooltipMinLength={15}
      text={text || data.name}
      label={nodeTypesConstant[data.type].name}
      startContent={startContent}
      endIcon={endIcon}
      textNoBreak={textNoBreak}
      labelSx={
        gseLabelContrast ? getGseCargoBadgeSx(theme.palette.mode) : undefined
      }
      onClick={onClick}
      {...rest}
    />
  );
};
