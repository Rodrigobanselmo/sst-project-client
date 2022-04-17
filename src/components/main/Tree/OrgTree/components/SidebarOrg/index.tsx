import React, { useMemo, useRef, useCallback } from 'react';

import { Box, Icon, Slide } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { SEndButton } from 'components/atoms/SIconButton/SEndButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import {
  selectGhoId,
  setGhoState,
  selectGhoOpen,
  setGhoOpen,
} from 'store/reducers/gho/ghoSlice';

import SCloseIcon from 'assets/icons/SCloseIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';
import SEditIcon from 'assets/icons/SEditIcon';
import SSaveIcon from 'assets/icons/SSaveIcon';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { IGho } from 'core/interfaces/api/IGho';
import { useMutCreateGho } from 'core/services/hooks/mutations/checklist/useMutCreateGho';
import { useMutDeleteGho } from 'core/services/hooks/mutations/checklist/useMutDeleteGho';
import { useMutUpdateGho } from 'core/services/hooks/mutations/checklist/useMutUpdateGho';
import { useQueryGHO } from 'core/services/hooks/queries/useQueryGHO';

import {
  STBoxContainer,
  STBoxInput,
  STBoxItem,
  STBoxStack,
  STSInput,
} from './styles';

export const SidebarOrg = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { preventDelete } = usePreventAction();
  const { data } = useQueryGHO();
  const dispatch = useAppDispatch();
  const selectedGhoId = useAppSelector(selectGhoId);
  const isGhoOpen = useAppSelector(selectGhoOpen);
  const addMutation = useMutCreateGho();
  const updateMutation = useMutUpdateGho();
  const deleteMutation = useMutDeleteGho();

  const handleAddGHO = async () => {
    if (inputRef.current?.value) {
      await addMutation.mutateAsync({
        name: inputRef.current.value,
      });

      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  const handleEditGHO = (id: string) => {
    if (inputRef.current?.value) {
      updateMutation.mutate({ name: inputRef.current.value, id });
    }
  };

  const handleDeleteGHO = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation],
  );

  const handleSelectGHO = useCallback(
    (gho: IGho | null, hierarchies: string[]) => {
      if (!gho) {
        if (inputRef.current) inputRef.current.value = '';
        return dispatch(setGhoState({ id: '', hierarchies: [] }));
      }

      const isSelected = selectedGhoId === gho.id;

      const data = {
        id: isSelected ? '' : gho.id,
        hierarchies: isSelected ? [] : hierarchies,
      };

      if (inputRef.current) inputRef.current.value = gho.name;

      dispatch(setGhoState(data));
    },
    [dispatch, selectedGhoId],
  );

  const memoItems = useMemo(() => {
    if (!data) return null;

    return data.map((gho) => {
      const hierarchies = gho.hierarchies
        ? gho.hierarchies.map((value) => value.id)
        : [];

      const isSelected = selectedGhoId === gho.id;

      return (
        <STBoxItem
          key={gho.id}
          sx={{
            border: isSelected ? ' 2px solid' : ' 1px solid',
            borderColor: isSelected ? 'info.main' : 'background.divider',
          }}
        >
          <STooltip minLength={15} enterDelay={1000} title={gho.name}>
            <Box sx={{ display: 'flex', width: '75%' }}>
              <SText lineNumber={2}>{gho.name}</SText>
            </Box>
          </STooltip>
          <SFlex>
            <SIconButton
              loading={deleteMutation.isLoading}
              onClick={() => preventDelete(() => handleDeleteGHO(gho.id))}
              size="small"
            >
              <Icon component={SDeleteIcon} sx={{ fontSize: '1.2rem' }} />
            </SIconButton>
            <SIconButton
              onClick={() => handleSelectGHO(gho, hierarchies)}
              size="small"
            >
              <Icon
                component={isSelected ? SCloseIcon : SEditIcon}
                sx={{
                  fontSize: '1.2rem',
                  color: isSelected ? 'info.main' : '',
                }}
              />
            </SIconButton>
          </SFlex>
        </STBoxItem>
      );
    });
  }, [
    data,
    deleteMutation.isLoading,
    handleDeleteGHO,
    handleSelectGHO,
    preventDelete,
    selectedGhoId,
  ]);

  return (
    <Slide direction="left" in={isGhoOpen} mountOnEnter unmountOnExit>
      <STBoxContainer>
        <STBoxInput>
          <SFlex align="center" gap="1" mb={2}>
            <SIconButton
              onClick={() => {
                dispatch(setGhoOpen());
                handleSelectGHO(null, []);
              }}
              size="small"
            >
              <Icon component={SCloseIcon} sx={{ fontSize: '1.2rem' }} />
            </SIconButton>
            <SText fontSize="0.9rem" color="GrayText">
              G.H.E
            </SText>
          </SFlex>
          <STSInput
            endAdornment={
              <SFlex gap={2} center>
                {selectedGhoId && (
                  <SIconButton
                    onClick={() => handleSelectGHO(null, [])}
                    size="small"
                  >
                    <Icon component={SCloseIcon} sx={{ fontSize: '1.2rem' }} />
                  </SIconButton>
                )}
                <STooltip
                  withWrapper
                  title={selectedGhoId ? 'Salvar' : 'Adicionar'}
                >
                  <SEndButton
                    icon={selectedGhoId ? SSaveIcon : undefined}
                    bg={selectedGhoId ? 'info.main' : 'tag.add'}
                    onClick={
                      selectedGhoId
                        ? () => handleEditGHO(selectedGhoId)
                        : () => handleAddGHO()
                    }
                  />
                </STooltip>
              </SFlex>
            }
            loading={addMutation.isLoading}
            size="small"
            variant="outlined"
            placeholder={'Adicionar novo G.H.E'}
            subVariant="search"
            inputRef={inputRef}
            fullWidth
          />
        </STBoxInput>
        <STBoxStack mt={50}>{memoItems}</STBoxStack>
      </STBoxContainer>
    </Slide>
  );
};
