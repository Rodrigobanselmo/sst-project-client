import React from 'react';
import { useStore } from 'react-redux';

import CircleIcon from '@mui/icons-material/Circle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box } from '@mui/material';
import deepEqual from 'deep-equal';

import SModal, {
  SModalHeader,
  SModalPaper,
} from '../../../../../components/molecules/SModal';
import { useModal } from '../../../../../core/contexts/ModalContext';
import { useTreeActions } from '../../../../../core/contexts/TreeActionsContextProvider';
import { ModalEnum } from '../../../../../core/enums/modal.enums';
import { TreeTypeEnum } from '../../../../../core/enums/tree-type.enums';
import { useAppSelector } from '../../../../../core/hooks/useAppSelector';
import { useGlobalModal } from '../../../../../core/hooks/useGlobalModal';
import { useRegisterModal } from '../../../../../core/hooks/useRegisterModal';
import { IModalDataSlice } from '../../../../../store/reducers/modal/modalSlice';
import { selectTreeSelectItem } from '../../../../../store/reducers/tree/treeSlice';
import { SButton } from '../../../../atoms/SButton';
import SFlex from '../../../../atoms/SFlex';
import { SInput } from '../../../../atoms/SInput';
import { SSwitch } from '../../../../atoms/SSwitch';
import { STag } from '../../../../atoms/STag';
import SText from '../../../../atoms/SText';
import STextarea from '../../../../atoms/STextarea';
import { ITreeMap, ITreeSelectedItem } from '../../interfaces';
import { TypeSelect } from '../Selects/TypeSelect';
import { useModalCard } from './hooks/useModalCard';
import { nodeTypesConstant } from './utils/node-type.constant';

export const ModalEditCard = () => {
  const selectedNode = useAppSelector(selectTreeSelectItem);

  const { registerModal } = useRegisterModal();
  const { onCloseModal } = useModal();
  const { nodePath, setEditNodeSelectedItem } = useModalCard();
  const { editNodes, removeNodes } = useTreeActions();
  const { onOpenGlobalModal } = useGlobalModal();
  const store = useStore();

  const onSave = () => {
    if (selectedNode) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { action, ...newNode } = selectedNode;

      onCloseModal(ModalEnum.TREE_CARD);
      editNodes([newNode]);
    }
  };

  const type = selectedNode?.type || 1;

  const isTextArea = [TreeTypeEnum.OPTION, TreeTypeEnum.QUESTION].includes(
    type,
  );

  const onCloseUnsaved = () => {
    const nodesMap = store.getState().tree.nodes as ITreeMap;

    const close = () => {
      onCloseModal(ModalEnum.TREE_CARD);
      setEditNodeSelectedItem(null);
      if (selectedNode?.action === 'add') {
        removeNodes(selectedNode.id);
      }
    };

    if (
      !deepEqual(
        selectedNode,
        { action: selectedNode?.action, ...nodesMap[selectedNode?.id || ''] } ||
          {},
      )
    ) {
      const data = {
        title: 'Descartar mudançãs?',
        text: 'Você tem certeza que deseja descartar as mudanças realizadas?',
        confirmText: 'Descartar',
        tag: 'warning',
        confirmCancel: 'Cancel',
      } as IModalDataSlice;

      onOpenGlobalModal(data, close);
    } else {
      close();
    }
  };

  const onRemoveNode = () => {
    if (selectedNode?.id) {
      const data = {
        title: 'Você tem certeza?',
        text: 'Ao remover esse item, você também removerá todos os items decendentes dele.',
        confirmText: 'Deletar',
        tag: 'delete',
        confirmCancel: 'Cancel',
      } as IModalDataSlice;

      onOpenGlobalModal(data, () => {
        onCloseModal(ModalEnum.TREE_CARD);
        removeNodes(selectedNode.id);
        setEditNodeSelectedItem(null);
      });
    }
  };

  return (
    <SModal
      {...registerModal(ModalEnum.TREE_CARD)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper p={8}>
        <SModalHeader
          modalName={ModalEnum.TREE_CARD}
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
                setEditNodeSelectedItem({ type: option.value as TreeTypeEnum })
              }
            />
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
            <SSwitch label="Criar mais" sx={{ mr: 4 }} color="text.light" />
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
