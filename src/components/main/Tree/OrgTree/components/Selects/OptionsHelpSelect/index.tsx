import React, { FC } from 'react';

import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import {
  helpOptionsConstant,
  IHelpOption,
} from 'components/main/Tree/OrgTree/constants/help-options.constant';
import { nodeTypesConstant } from 'components/main/Tree/OrgTree/constants/node-type.constant';
import { HelpOptionsEnum } from 'components/main/Tree/OrgTree/enums/help-options.enums';
import { usePreventNode } from 'components/main/Tree/OrgTree/hooks/usePreventNode';
import { useSnackbar } from 'notistack';
import { selectHierarchyTreeCopyItem } from 'store/reducers/hierarchy/hierarchySlice';

import { useAppSelector } from 'core/hooks/useAppSelector';
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
  const copyItem = useAppSelector(selectHierarchyTreeCopyItem);
  const { setCopyItem, onExpandAll, setPasteItem, removeNodes } =
    useHierarchyTreeActions();
  const { enqueueSnackbar } = useSnackbar();
  const { preventDelete } = usePreventNode();

  const handleAction = ({ value }: IMenuOptionResponse) => {
    if (HelpOptionsEnum.OPEN_ALL === value) {
      return onExpandAll(true, node.id);
    }

    if (HelpOptionsEnum.CLOSE_ALL === value) {
      return onExpandAll(false, node.id);
    }

    if (
      [HelpOptionsEnum.COPY, HelpOptionsEnum.COPY_ALL].includes(
        value as HelpOptionsEnum,
      )
    ) {
      const isCopyAll = HelpOptionsEnum.COPY_ALL === value;
      enqueueSnackbar('Item copiado', {
        variant: 'success',
        autoHideDuration: 1500,
      });
      return setCopyItem(node, isCopyAll);
    }

    if (HelpOptionsEnum.PASTE === value) {
      if (copyItem) {
        if (
          !nodeTypesConstant[node.type].childOptions.includes(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            copyItem.type as any,
          )
        ) {
          enqueueSnackbar('Este cartão não permite esse item de colagem', {
            variant: 'error',
          });
        }

        return setPasteItem(node);
      }
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
