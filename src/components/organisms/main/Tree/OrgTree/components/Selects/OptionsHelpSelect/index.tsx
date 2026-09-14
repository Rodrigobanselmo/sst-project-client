import React, { FC } from 'react';

import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import {
  helpOptionsConstant,
  IHelpOption,
} from 'components/organisms/main/Tree/OrgTree/constants/help-options.constant';
import { HelpOptionsEnum } from 'components/organisms/main/Tree/OrgTree/enums/help-options.enums';
import { usePreventNode } from 'components/organisms/main/Tree/OrgTree/hooks/usePreventNode';
import { canCopyHierarchyNode } from 'components/organisms/main/Tree/OrgTree/utils/get-copy-hierarchy-destinations';
import { isEstablishmentGroupTreeType } from 'components/organisms/main/Tree/OrgTree/utils/attach-establishment-group-layer';

import { ModalEnum } from 'core/enums/modal.enums';
import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';
import { useModal } from 'core/hooks/useModal';

import { IMenuOptionResponse } from '../../../../../../../molecules/SMenu/types';
import { STagSelect } from '../../../../../../../molecules/STagSelect';
import { IOptionsHelpSelectProps } from './types';

export const OptionsHelpSelect: FC<
  { children?: any } & IOptionsHelpSelectProps
> = ({ large, node, menuRef, onEdit, ...props }) => {
  const { onExpandAll, removeNodes } = useHierarchyTreeActions();
  const { preventDelete } = usePreventNode();
  const { onOpenModal } = useModal();

  const handleAction = ({ value }: IMenuOptionResponse, e: any) => {
    if (HelpOptionsEnum.OPEN_ALL === value) {
      return onExpandAll(true, node.id);
    }

    if (HelpOptionsEnum.EDIT === value) {
      return onEdit?.(e);
    }

    if (HelpOptionsEnum.COPY_STRUCTURE === value) {
      return onOpenModal(ModalEnum.HIERARCHY_COPY_BRANCH, {
        sourceTreeId: String(node.id),
      });
    }

    if (HelpOptionsEnum.CLOSE_ALL === value) {
      return onExpandAll(false, node.id);
    }

    if (HelpOptionsEnum.DELETE === value) {
      if (node.parentId)
        return preventDelete(() => removeNodes(node.id), '', {
          inputConfirm: true,
        });
    }
  };

  const options = (Object.values(helpOptionsConstant) as IHelpOption[]).filter(
    (option) => {
      if (
        option.value === HelpOptionsEnum.COPY_STRUCTURE &&
        !canCopyHierarchyNode(node)
      ) {
        return false;
      }
      if (
        isEstablishmentGroupTreeType(node.type) &&
        (option.value === HelpOptionsEnum.DELETE ||
          option.value === HelpOptionsEnum.COPY_STRUCTURE)
      ) {
        return false;
      }
      return true;
    },
  );

  return (
    <STagSelect
      options={options}
      text={''}
      large={large}
      icon={MoreHorizOutlinedIcon}
      handleSelectMenu={handleAction}
      menuRef={menuRef}
      {...props}
    />
  );
};
