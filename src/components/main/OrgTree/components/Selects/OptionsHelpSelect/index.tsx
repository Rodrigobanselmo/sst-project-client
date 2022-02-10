import React, { FC } from 'react';

import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import {
  helpOptionsConstant,
  IHelpOption,
} from 'components/main/OrgTree/constants/help-options.constant';
import { nodeTypesConstant } from 'components/main/OrgTree/constants/node-type.constant';
import { HelpOptionsEnum } from 'components/main/OrgTree/enums/help-options.enums';
import { QuestionOptionsEnum } from 'components/main/OrgTree/enums/question-options.enums';
import { useSnackbar } from 'notistack';
import { selectTreeCopyItem } from 'store/reducers/tree/treeSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { useTreeActions } from 'core/hooks/useTreeActions';

import { IMenuOptionResponse } from '../../../../../molecules/SMenu/types';
import { STagSelect } from '../../../../../molecules/STagSelect';
import { IOptionsHelpSelectProps } from './types';

export const OptionsHelpSelect: FC<IOptionsHelpSelectProps> = ({
  large,
  node,
  menuRef,
  ...props
}) => {
  const copyItem = useAppSelector(selectTreeCopyItem);
  const { setCopyItem, onExpandAll, setPasteItem } = useTreeActions();
  const { enqueueSnackbar } = useSnackbar();

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
          enqueueSnackbar('Este cartão não permite esse item de colagem', {
            variant: 'error',
          });
        }
        if (
          node?.answerType &&
          node.answerType === QuestionOptionsEnum.TEXT &&
          node.childrenIds.length > 0
        ) {
          enqueueSnackbar(
            'Perguntas do tipo texto somente aceitam uma opção de resposta',
            { variant: 'error' },
          );
        }

        return setPasteItem(node);
      }
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
