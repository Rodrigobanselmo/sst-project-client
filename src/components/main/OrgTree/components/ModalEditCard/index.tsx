import React, { useRef } from 'react';
import { useStore } from 'react-redux';

import CircleIcon from '@mui/icons-material/Circle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box } from '@mui/material';
import { QuestionOptionsEnum } from 'components/main/OrgTree/enums/question-options.enums';

import { useControlClick } from 'core/hooks/useControlClick';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';

import SModal, {
  SModalHeader,
  SModalPaper,
} from '../../../../../components/molecules/SModal';
import { ModalEnum } from '../../../../../core/enums/modal.enums';
import { useAppSelector } from '../../../../../core/hooks/useAppSelector';
import { useRegisterModal } from '../../../../../core/hooks/useRegisterModal';
import { useTreeActions } from '../../../../../core/hooks/useTreeActions';
import { selectTreeSelectItem } from '../../../../../store/reducers/tree/treeSlice';
import { SButton } from '../../../../atoms/SButton';
import SFlex from '../../../../atoms/SFlex';
import { SInput } from '../../../../atoms/SInput';
import { SSwitch } from '../../../../atoms/SSwitch';
import { STag } from '../../../../atoms/STag';
import SText from '../../../../atoms/SText';
import STextarea from '../../../../atoms/STextarea';
import { nodeTypesConstant } from '../../constants/node-type.constant';
import { TreeTypeEnum } from '../../enums/tree-type.enums';
import { usePreventNode } from '../../hooks/usePreventNode';
import { ITreeMap, ITreeSelectedItem } from '../../interfaces';
import { MedSelect } from '../Selects/MedSelect';
import { QuestionTypeSelect } from '../Selects/QuestionTypeSelect';
import { RecSelect } from '../Selects/RecSelect';
import { RiskSelect } from '../Selects/RiskSelect';
import { TypeSelect } from '../Selects/TypeSelect';
import { useModalCard } from './hooks/useModalCard';

export const ModalEditCard = () => {
  const selectedNode = useAppSelector(selectTreeSelectItem);

  const { registerModal, isOpen } = useRegisterModal();
  const { onCloseModal } = useModal();
  const { nodePath, setEditNodeSelectedItem } = useModalCard();
  const { editNodes, removeNodes, createEmptyCard } = useTreeActions();

  const { preventDelete } = usePreventNode();
  const { preventUnwantedChanges } = usePreventAction();

  const store = useStore();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const switchRef = useRef<HTMLInputElement>(null);

  useControlClick('s', () => {
    if (isOpen(ModalEnum.TREE_CARD)) onSave();
  });

  const onSave = () => {
    if (selectedNode) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { action, ...newNode } = selectedNode;

      editNodes([newNode]);
      if (!switchRef.current?.checked) onCloseModal(ModalEnum.TREE_CARD);
      if (switchRef.current?.checked && newNode.parentId) {
        inputRef.current?.focus();
        createEmptyCard(newNode.parentId, { type: newNode.type });
      }
    }
  };

  const onCloseUnsaved = () => {
    const nodesMap = store.getState().tree.nodes as ITreeMap;

    const close = () => {
      onCloseModal(ModalEnum.TREE_CARD);
      setEditNodeSelectedItem(null);
      if (selectedNode?.action === 'add') {
        removeNodes(selectedNode.id, true);
      }
    };

    const beforeNode =
      { action: selectedNode?.action, ...nodesMap[selectedNode?.id || ''] } ||
      {};

    if (preventUnwantedChanges(selectedNode, beforeNode, close)) return;
    close();
  };

  const onRemoveNode = () => {
    if (selectedNode?.id) {
      return preventDelete(() => {
        onCloseModal(ModalEnum.TREE_CARD);
        removeNodes(selectedNode.id);
        setEditNodeSelectedItem(null);
      });
    }
  };

  const type = selectedNode?.type || 1;

  const isTextArea = TreeTypeEnum.QUESTION === type;

  if (!selectedNode) return null;
  return (
    <SModal
      {...registerModal(ModalEnum.TREE_CARD)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper p={8}>
        <SModalHeader
          onClose={onCloseUnsaved}
          secondIcon={
            type === TreeTypeEnum.CHECKLIST ? undefined : DeleteOutlineIcon
          }
          secondIconClick={onRemoveNode}
          title={
            <Box width="100%">
              <SFlex mb={2} align="center">
                <STag action={selectedNode?.action} />
                <SText>
                  {selectedNode?.action === 'add'
                    ? nodeTypesConstant[type]?.title
                    : nodeTypesConstant[type]?.name}
                </SText>
              </SFlex>
              <SFlex align="center">
                <CircleIcon sx={{ fontSize: '10px', color: 'text.light' }} />
                {nodePath.map((path, index) => (
                  <SFlex align="center" key={`${path}-${index}`}>
                    <SText
                      className="noBreakText"
                      maxWidth={100}
                      color={'text.light'}
                      fontSize="13px"
                    >
                      {path}
                    </SText>
                    {!(index == nodePath.length - 1) && (
                      <NavigateNextIcon
                        sx={{ fontSize: '18px', color: 'text.light' }}
                      />
                    )}
                  </SFlex>
                ))}
              </SFlex>
            </Box>
          }
        />
        <Box mt={8}>
          {isTextArea && (
            <STextarea
              ref={inputRef}
              autoFocus
              value={selectedNode?.label}
              onChange={(e) =>
                setEditNodeSelectedItem({ label: e.target.value })
              }
              unstyled
              maxRows={20}
              minRows={2}
              sx={{ width: ['100%', 600] }}
              preventResize
              placeholder={nodeTypesConstant[type]?.placeholder}
            />
          )}
          {!isTextArea && (
            <SInput
              inputRef={inputRef}
              autoFocus
              value={selectedNode?.label}
              onChange={(e) =>
                setEditNodeSelectedItem({ label: e.target.value })
              }
              unstyled
              variant="standard"
              sx={{ width: ['100%', 600], mb: 10 }}
              placeholder={nodeTypesConstant[type]?.placeholder}
            />
          )}
          <SFlex gap={8} mt={10} align="center">
            <TypeSelect
              large
              node={selectedNode as ITreeSelectedItem}
              parentId={selectedNode?.parentId || 'no-node'}
              handleSelect={(option) =>
                setEditNodeSelectedItem({
                  type: option.value as TreeTypeEnum,
                })
              }
            />
            {selectedNode.type === TreeTypeEnum.OPTION && (
              <>
                <RiskSelect
                  large
                  node={selectedNode}
                  handleSelect={(options) =>
                    setEditNodeSelectedItem({
                      risks: options,
                    })
                  }
                />
                <MedSelect
                  large
                  node={selectedNode}
                  handleSelect={(options) =>
                    setEditNodeSelectedItem({
                      med: options,
                    })
                  }
                />
                <RecSelect
                  large
                  node={selectedNode}
                  handleSelect={(options) =>
                    setEditNodeSelectedItem({
                      rec: options,
                    })
                  }
                />
              </>
            )}
            {selectedNode.type === TreeTypeEnum.QUESTION && (
              <QuestionTypeSelect
                large
                node={selectedNode}
                handleSelect={(option) =>
                  setEditNodeSelectedItem({
                    answerType: option.value as QuestionOptionsEnum,
                  })
                }
              />
            )}
          </SFlex>
        </Box>
        <Box
          pt={6}
          mt={6}
          sx={{ borderTop: '1px solid', borderColor: 'background.divider' }}
          display="flex"
          width="100%"
          justifyContent="flex-end"
          gap={5}
        >
          {selectedNode?.action === 'add' ? (
            <SSwitch
              inputRef={switchRef}
              label="Criar mais"
              sx={{ mr: 4 }}
              color="text.light"
            />
          ) : (
            <SButton variant={'outlined'} size="small" onClick={onCloseUnsaved}>
              Cancelar
            </SButton>
          )}
          <SButton variant={'contained'} size="small" onClick={onSave}>
            Savar
          </SButton>
        </Box>
      </SModalPaper>
    </SModal>
  );
};
