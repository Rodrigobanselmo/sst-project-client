import React, { useRef, useState } from 'react';
import { useStore } from 'react-redux';
import { Wizard } from 'react-use-wizard';

import CircleIcon from '@mui/icons-material/Circle';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box } from '@mui/material';
import { SDeleteButton } from 'components/molecules/SDeleteButton/SDeleteButton';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { EmployeeSelect } from 'components/organisms/tagSelects/EmployeeSelect';
import { WorkspacesSelect } from 'components/organisms/tagSelects/WorkspacesSelect';
import { useSnackbar } from 'notistack';
import { selectHierarchyTreeSelectItem } from 'store/reducers/hierarchy/hierarchySlice';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { QueryEnum } from 'core/enums/query.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import {
  IQueryEmployee,
  useQueryEmployees,
} from 'core/services/hooks/queries/useQueryEmployees';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import { queryClient } from 'core/services/queryClient';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

import { ModalEnum } from '../../../../../../../core/enums/modal.enums';
import { useAppSelector } from '../../../../../../../core/hooks/useAppSelector';
import { useHierarchyTreeActions } from '../../../../../../../core/hooks/useHierarchyTreeActions';
import { useRegisterModal } from '../../../../../../../core/hooks/useRegisterModal';
import { SButton } from '../../../../../../atoms/SButton';
import SFlex from '../../../../../../atoms/SFlex';
import { SInput } from '../../../../../../atoms/SInput';
import { SSwitch } from '../../../../../../atoms/SSwitch';
import { STagAction } from '../../../../../../atoms/STagAction';
import SText from '../../../../../../atoms/SText';
import SModal, {
  SModalHeader,
  SModalPaper,
} from '../../../../../../molecules/SModal';
import { nodeTypesConstant } from '../../constants/node-type.constant';
import { TreeTypeEnum } from '../../enums/tree-type.enums';
import { usePreventNode } from '../../hooks/usePreventNode';
import { ITreeMap, ITreeSelectedItem } from '../../interfaces';
import { TypeSelect } from '../Selects/TypeSelect';
import { ModalViewExamsData } from './components/ModalViewExamsData/ModalViewExamsData';
import { ModalViewRiskData } from './components/ModalViewRiskData';
import { useModalCard } from './hooks/useModalCard';

export const ModalEditCard = () => {
  const selectedNode = useAppSelector(selectHierarchyTreeSelectItem);
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const { data: hierarchies } = useQueryHierarchies();

  const isOffice = [TreeTypeEnum.OFFICE, TreeTypeEnum.SUB_OFFICE].includes(
    selectedNode?.type || ('' as any),
  );

  const isSubOffice =
    TreeTypeEnum.SUB_OFFICE == (selectedNode?.type || ('' as any));

  const isNotHierarchy = ![
    TreeTypeEnum.COMPANY,
    TreeTypeEnum.WORKSPACE,
  ].includes(selectedNode?.type || ('' as any));

  const query = {} as IQueryEmployee;

  if (isOffice && !isSubOffice)
    query.hierarchyId = isOffice
      ? String(selectedNode?.id).split('//')[0] || ''
      : '';

  if (isSubOffice)
    query.hierarchySubOfficeId = isOffice
      ? String(selectedNode?.id).split('//')[0] || ''
      : '';

  const {
    data: selectedEmployees,
    isLoading,
    refetch,
  } = useQueryEmployees(1, query, 1000);

  const { registerModal } = useRegisterModal();
  const { onCloseModal } = useModal();
  const { nodePath, setEditNodeSelectedItem } = useModalCard();
  const { editNodes, removeNodes, createEmptyCard } = useHierarchyTreeActions();

  const { preventDelete } = usePreventNode();
  const { enqueueSnackbar } = useSnackbar();
  const { preventUnwantedChanges } = usePreventAction();

  const store = useStore<any>();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const switchRef = useRef<HTMLInputElement>(null);
  const [workspacesIds, setWorkspaces] = useState<string[]>([]);

  // useControlClick('s', () => {
  //   if (isOpen(ModalEnum.HIERARCHY_TREE_CARD)) onSave();
  // });

  const onSave = () => {
    if (selectedNode) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { action, ...newNode } = selectedNode;
      setEmployees([]);
      setWorkspaces([]);
      queryClient.invalidateQueries([QueryEnum.EMPLOYEES]);
      editNodes([newNode], false, {
        isAdd: true,
        employeesIds: employees.map((e) => e.id),
        callBack: refetch,
        workspacesIds: workspacesIds.length > 0 ? workspacesIds : undefined,
      });
      if (!switchRef.current?.checked)
        onCloseModal(ModalEnum.HIERARCHY_TREE_CARD);
      if (switchRef.current?.checked && newNode.parentId) {
        inputRef.current?.focus();
        createEmptyCard(newNode.parentId, { type: newNode.type });
      }
    }
  };

  const onCloseUnsaved = () => {
    const nodesMap = store.getState().hierarchy.nodes as ITreeMap;
    setEmployees([]);
    setWorkspaces([]);

    const close = () => {
      onCloseModal(ModalEnum.HIERARCHY_TREE_CARD);
      setEditNodeSelectedItem(null);
      if (selectedNode?.action === 'add') {
        removeNodes(selectedNode.id, true);
      }
    };

    const beforeNode = {
      action: selectedNode?.action,
      ...nodesMap[selectedNode?.id || ''],
    };

    if (preventUnwantedChanges(selectedNode, beforeNode, close)) return;
    close();
  };

  const onRemoveNode = () => {
    if (selectedNode?.id) {
      return preventDelete(
        () => {
          onCloseModal(ModalEnum.HIERARCHY_TREE_CARD);
          setWorkspaces([]);
          setEmployees([]);
          removeNodes(selectedNode.id);
          setEditNodeSelectedItem(null);
        },
        <span>
          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            Deletar {selectedNode?.name}
          </p>
          Você tem certeza que deseja remover permanentemente? Remover esse
          item, você também removerá todos os items decendentes dele. <br />
        </span>,
        { inputConfirm: true },
      );
    }
  };

  const preventAddEmployee = () => {
    if (selectedNode?.action === 'add')
      return {
        preventOpen: true,
        onClick: () =>
          enqueueSnackbar('É preciso salvar antes de adicionar um empregado', {
            variant: 'warning',
          }),
      };

    return {};
  };

  const type = selectedNode?.type || TreeTypeEnum.COMPANY;

  if (!selectedNode) return null;
  const allEmployees = removeDuplicate([...employees, ...selectedEmployees], {
    removeById: 'id',
  });
  const workspace = hierarchies[String(selectedNode.id).split('//')[0]]
    ? removeDuplicate([
        ...hierarchies[String(selectedNode.id).split('//')[0]].workspaceIds,
        ...(workspacesIds || []),
      ])
    : [...(workspacesIds || [])];

  return (
    <SModal
      {...registerModal(ModalEnum.HIERARCHY_TREE_CARD)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper width={['100%', 600, 800, 1000]} center p={8}>
        <SModalHeader
          onClose={onCloseUnsaved}
          // secondIcon={type === TreeTypeEnum.COMPANY ? undefined : SDeleteIcon}
          // secondIconClick={onRemoveNode}
          onDelete={onRemoveNode}
          title={
            <Box width="100%">
              <SFlex mb={2} align="center">
                <STagAction action={selectedNode?.action} />
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
        <Wizard
          header={
            <WizardTabs
              height={45}
              options={[
                { label: 'Dados Principais', sx: { fontSize: 12 } },
                { label: 'Riscos', sx: { fontSize: 12 } },
                { label: 'Exames', sx: { fontSize: 12 } },
              ]}
            />
          }
        >
          <Box mt={8}>
            <SInput
              size="small"
              labelPosition="center"
              label={'Nome'}
              inputRef={inputRef}
              autoFocus
              fullWidth
              value={selectedNode?.label}
              onChange={(e) =>
                setEditNodeSelectedItem({ label: e.target.value })
              }
              sx={{ mb: 10 }}
              placeholder={nodeTypesConstant[type]?.placeholder}
            />
            {nodeTypesConstant[type]?.placeholderDesc && (
              <SInput
                value={selectedNode?.description || ''}
                label={'Descrição'}
                onChange={(e) =>
                  setEditNodeSelectedItem({ description: e.target.value })
                }
                labelPosition="center"
                fullWidth
                size="small"
                multiline
                minRows={2}
                maxRows={6}
                sx={{ mb: 10 }}
                placeholder={nodeTypesConstant[type]?.placeholderDesc || ''}
              />
            )}
            {!isSubOffice && nodeTypesConstant[type]?.placeholderRealDesc && (
              <SInput
                value={selectedNode?.realDescription || ''}
                onChange={(e) =>
                  setEditNodeSelectedItem({ realDescription: e.target.value })
                }
                multiline
                labelPosition="center"
                label={'Descrição real (Entrevista)'}
                fullWidth
                size="small"
                minRows={2}
                maxRows={6}
                sx={{ mb: 10 }}
                placeholder={nodeTypesConstant[type]?.placeholderRealDesc || ''}
              />
            )}
          </Box>
          <ModalViewRiskData selectedNode={selectedNode} />
          <ModalViewExamsData selectedNode={selectedNode} />
        </Wizard>
        <SFlex gap={8} mt={10} align="center">
          <TypeSelect
            large
            node={selectedNode as ITreeSelectedItem}
            parentId={selectedNode?.parentId || 'no-node'}
            add={selectedNode?.action === 'add'}
            handleSelect={(option) =>
              setEditNodeSelectedItem({
                type: option.value as TreeTypeEnum,
              })
            }
          />
          {isOffice && (
            <EmployeeSelect
              multiple={false}
              editOnSelection
              large
              addButton={false}
              filterByHierarchyId={String(selectedNode.id)}
              text={'funcionários'}
              actualHierarchy={selectedNode}
              handleSelect={(_, list) => setEmployees(list)}
              selectedEmployees={allEmployees}
              loading={isLoading}
              searchAllEmployees
              {...preventAddEmployee()}
            />
          )}
          {isNotHierarchy && (
            <WorkspacesSelect
              large
              handleSelect={(item) =>
                Array.isArray(item) && setWorkspaces(item)
              }
              selected={workspace}
            />
          )}
        </SFlex>
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
            <>
              {/* <SDeleteButton>Deletar</SDeleteButton> */}
              <SButton
                variant={'outlined'}
                size="small"
                onClick={onCloseUnsaved}
              >
                Cancelar
              </SButton>
            </>
          )}
          <SButton variant={'contained'} size="small" onClick={onSave}>
            Salvar
          </SButton>
        </Box>
      </SModalPaper>
    </SModal>
  );
};
