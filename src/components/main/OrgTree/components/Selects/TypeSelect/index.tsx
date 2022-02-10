import React, { FC, useMemo } from 'react';

import MergeTypeIcon from '@mui/icons-material/MergeType';
import { usePreventNode } from 'components/main/OrgTree/hooks/usePreventNode';

import { useAppSelector } from '../../../../../../core/hooks/useAppSelector';
import { selectTreeData } from '../../../../../../store/reducers/tree/treeSlice';
import { IMenuOptionResponse } from '../../../../../molecules/SMenu/types';
import { STagSelect } from '../../../../../molecules/STagSelect';
import { nodeTypesConstant } from '../../../constants/node-type.constant';
import { TreeTypeEnum } from '../../../enums/tree-type.enums';
import { ITreeMapObject } from '../../../interfaces';
import { ITypeSelectProps } from './types';

export const TypeSelect: FC<ITypeSelectProps> = ({
  large,
  parentId,
  handleSelect,
  node,
  ...props
}) => {
  const parentNode = useAppSelector(
    selectTreeData(parentId),
  ) as ITreeMapObject | null;

  const { preventChangeCardType } = usePreventNode();

  const handleEditTypeCard = ({ name, value }: IMenuOptionResponse) => {
    if (preventChangeCardType(node)) return;
    handleSelect && handleSelect({ value: value as TreeTypeEnum, name });
  };

  const typeOptions = useMemo(() => {
    const parentType = parentNode?.type;

    if (!parentType) return [nodeTypesConstant[TreeTypeEnum.CHECKLIST]];

    if (nodeTypesConstant[parentType]?.childOptions)
      return nodeTypesConstant[parentType].childOptions.map(
        (value) => nodeTypesConstant[value],
      );

    return [];
  }, [parentNode]);

  return (
    <STagSelect
      options={typeOptions}
      text={nodeTypesConstant[node.type]?.name}
      large={large}
      icon={MergeTypeIcon}
      handleSelectMenu={handleEditTypeCard}
      {...props}
    />
  );
};
