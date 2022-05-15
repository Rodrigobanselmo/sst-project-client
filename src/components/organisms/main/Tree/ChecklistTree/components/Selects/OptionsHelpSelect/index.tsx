import React, { FC } from 'react';

import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import {
  helpOptionsConstant,
  IHelpOption,
} from 'components/organisms/main/Tree/ChecklistTree/constants/help-options.constant';
import { nodeTypesConstant } from 'components/organisms/main/Tree/ChecklistTree/constants/node-type.constant';
import { HelpOptionsEnum } from 'components/organisms/main/Tree/ChecklistTree/enums/help-options.enums';
import { usePreventNode } from 'components/organisms/main/Tree/ChecklistTree/hooks/usePreventNode';
import { useSnackbar } from 'notistack';
import { selectTreeCopyItem } from 'store/reducers/tree/treeSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { useChecklistTreeActions } from 'core/hooks/useChecklistTreeActions';

import { IMenuOptionResponse } from '../../../../../../../molecules/SMenu/types';
import { STagSelect } from '../../../../../../../molecules/STagSelect';
import { questionsTextTypesConstant } from '../../../constants/questions-text-types.constant';
import { IOptionsHelpSelectProps } from './types';

export const OptionsHelpSelect: FC<IOptionsHelpSelectProps> = ({
  large,
  node,
  menuRef,
  ...props
}) => {
  const copyItem = useAppSelector(selectTreeCopyItem);
  const { setCopyItem, onExpandAll, setPasteItem, removeNodes } =
    useChecklistTreeActions();
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
          !nodeTypesConstant[node.type].childOptions.includes(copyItem.type)
        ) {
          return enqueueSnackbar(
            'Este cartão não permite esse item de colagem',
            {
              variant: 'error',
            },
          );
        }
        if (
          node?.answerType &&
          questionsTextTypesConstant.includes(node.answerType) &&
          node.childrenIds.length > 0
        ) {
          return enqueueSnackbar(
            'Perguntas do tipo texto somente aceitam uma opção de resposta',
            { variant: 'error' },
          );
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
