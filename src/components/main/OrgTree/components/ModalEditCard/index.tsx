import React from 'react';

import CircleIcon from '@mui/icons-material/Circle';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box } from '@mui/material';

import SModal, {
  SModalHeader,
  SModalPaper,
} from '../../../../../components/molecules/SModal';
import { useModal } from '../../../../../core/contexts/ModalContext';
import { ModalEnum } from '../../../../../core/enums/modal.enums';
import { TreeTypeEnum } from '../../../../../core/enums/tree-type.enums';
import { useAppSelector } from '../../../../../core/hooks/useAppSelector';
import { useRegisterModal } from '../../../../../core/hooks/useRegisterModal';
import { selectTreeSelectItem } from '../../../../../store/reducers/tree/treeSlice';
import { SButton } from '../../../../atoms/SButton';
import SFlex from '../../../../atoms/SFlex';
import { SInput } from '../../../../atoms/SInput';
import { SSwitch } from '../../../../atoms/SSwitch';
import { STag } from '../../../../atoms/STag';
import SText from '../../../../atoms/SText';
import STextarea from '../../../../atoms/STextarea';
import { ITreeSelectedItem } from '../../interfaces';
import { TypeSelect } from '../Selects/TypeSelect';
import { useModalCard } from './hooks/useModalCard';
import { nodeTypesConstant } from './utils/node-type.constant';

export const ModalEditCard = () => {
  const selectedNode = useAppSelector(selectTreeSelectItem);

  const { registerModal } = useRegisterModal();
  const { onCloseModal } = useModal();
  const { nodePath, setNodeSelectedItem } = useModalCard();

  // const {  } = useTreeActions();

  const type = selectedNode?.type || 1;

  const isTextArea = [TreeTypeEnum.OPTION, TreeTypeEnum.QUESTION].includes(
    type,
  );

  return (
    <SModal keepMounted={false} {...registerModal(ModalEnum.TREE_CARD)}>
      <SModalPaper p={8}>
        <SModalHeader
          modalName={ModalEnum.TREE_CARD}
          title={
            <Box>
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
              onChange={(e) => setNodeSelectedItem({ label: e.target.value })}
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
              onChange={(e) => setNodeSelectedItem({ label: e.target.value })}
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
                setNodeSelectedItem({ type: option.value as TreeTypeEnum })
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
          <SSwitch label="Criar mais" sx={{ mr: 4 }} color="text.light" />
          <SButton
            variant={'contained'}
            size="small"
            onClick={() => onCloseModal(ModalEnum.TREE_CARD)}
          >
            Savar
          </SButton>
        </Box>
      </SModalPaper>
    </SModal>
  );
};
