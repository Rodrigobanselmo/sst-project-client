import React, { FC } from 'react';

import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import {
  helpOptionsConstant,
  IHelpOption,
} from 'components/main/Tree/OrgTree/constants/help-options.constant';
import { HelpOptionsEnum } from 'components/main/Tree/OrgTree/enums/help-options.enums';
import { usePreventNode } from 'components/main/Tree/OrgTree/hooks/usePreventNode';

import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';

import { IMenuOptionResponse } from '../../../../../../molecules/SMenu/types';
import { STagSelect } from '../../../../../../molecules/STagSelect';
import { IOptionsHelpSelectProps } from './types';

export const OptionsHelpSelect: FC<IOptionsHelpSelectProps> = ({
  large,
  node,
  menuRef,
  ...props
}) => {
  const { onExpandAll, removeNodes } = useHierarchyTreeActions();
  const { preventDelete } = usePreventNode();

  const handleAction = ({ value }: IMenuOptionResponse) => {
    if (HelpOptionsEnum.OPEN_ALL === value) {
      return onExpandAll(true, node.id);
    }

    if (HelpOptionsEnum.CLOSE_ALL === value) {
      return onExpandAll(false, node.id);
    }

    if (HelpOptionsEnum.DELETE === value) {
      if (node.parentId) return preventDelete(() => removeNodes(node.id));
    }
  };

  return (
    <STagSelect
      options={Object.values(helpOptionsConstant) as IHelpOption[]}
      text={''}
      large={large}
      icon={MoreHorizOutlinedIcon}
      handleSelectMenu={handleAction}
      menuRef={menuRef}
      {...props}
    />
  );
};
