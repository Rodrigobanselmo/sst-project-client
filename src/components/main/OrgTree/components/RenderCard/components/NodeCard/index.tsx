import React, { FC, MouseEvent } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { Box, Stack } from '@mui/material';
import STooltip from 'components/atoms/STooltip';
import { QuestionOptionsEnum } from 'components/main/OrgTree/enums/question-options.enums';
import { usePreventNode } from 'components/main/OrgTree/hooks/usePreventNode';

import { useModal } from 'core/hooks/useModal';

import { ModalEnum } from '../../../../../../../core/enums/modal.enums';
import { useTreeActions } from '../../../../../../../core/hooks/useTreeActions';
import { STagButton } from '../../../../../../atoms/STagButton';
import SText from '../../../../../../atoms/SText';
import { TreeTypeEnum } from '../../../../enums/tree-type.enums';
import { ITreeSelectedItem } from '../../../../interfaces';
import { MedSelect } from '../../../Selects/MedSelect';
import { OptionsHelpSelect } from '../../../Selects/OptionsHelpSelect';
import { QuestionTypeSelect } from '../../../Selects/QuestionTypeSelect';
import { RecSelect } from '../../../Selects/RecSelect';
import { RiskSelect } from '../../../Selects/RiskSelect';
import { TypeSelect } from '../../../Selects/TypeSelect';
import { INodeCardProps } from './types';

const NodeLabel: FC<{ label: string; type: TreeTypeEnum }> = ({
  label,
  type,
}) => {
  const hasLabel = [TreeTypeEnum.OPTION, TreeTypeEnum.QUESTION].includes(type);
  return (
    <STooltip
      minLength={60}
      withWrapper
      enterDelay={600}
      title={hasLabel ? label : ''}
    >
      <SText
        sx={{
          pr: 10,
          width: '100%',
          fontSize: '15px',
          lineHeight: '18px',
        }}
        lineNumber={2}
      >
        {label}
      </SText>
    </STooltip>
  );
};

export const NodeCard: FC<INodeCardProps> = ({ node, menuRef }) => {
  const { onOpenModal } = useModal();
  const { editNodes, createEmptyCard } = useTreeActions();
  const { preventMultipleTextOptions } = usePreventNode();

  const handleAddCard = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (preventMultipleTextOptions(node)) return;

    createEmptyCard(node.id);
    onOpenModal(ModalEnum.TREE_CARD);
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          {node.id !== 'mock_id' && (
            <SText
              className="node-tree-text-id"
              lineHeight="15px"
              fontSize="12px"
              color="text.light"
              mb={2}
            >
              {node.id}
            </SText>
          )}
          <NodeLabel label={node.label} type={node.type} />
        </Box>
        <STagButton sx={{ px: 2 }} onClick={handleAddCard} icon={AddIcon} />
      </Box>
      <Stack spacing={2} mt={3} direction="row">
        {node.type !== TreeTypeEnum.OPTION && (
          <TypeSelect
            node={node as ITreeSelectedItem}
            parentId={node?.parentId || 'no-node'}
            handleSelect={(option) =>
              editNodes([{ id: node.id, type: option.value as TreeTypeEnum }])
            }
          />
        )}
        {node.type === TreeTypeEnum.OPTION && (
          <>
            <RiskSelect
              node={node}
              handleSelect={(options) =>
                editNodes([{ id: node.id, risks: options }])
              }
            />
            <MedSelect
              node={node}
              handleSelect={(options) =>
                editNodes([{ id: node.id, med: options }])
              }
            />
            <RecSelect
              node={node}
              handleSelect={(options) =>
                editNodes([{ id: node.id, rec: options }])
              }
            />
          </>
        )}
        {node.type === TreeTypeEnum.QUESTION && (
          <QuestionTypeSelect
            node={node}
            handleSelect={(option) =>
              editNodes([
                {
                  id: node.id,
                  answerType: option.value as QuestionOptionsEnum,
                },
              ])
            }
          />
        )}
        <OptionsHelpSelect menuRef={menuRef} node={node} />
      </Stack>
    </>
  );
};
