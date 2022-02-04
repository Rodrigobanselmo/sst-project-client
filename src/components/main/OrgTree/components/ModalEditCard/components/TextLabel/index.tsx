import React, { ChangeEvent, FC, useEffect, useState } from 'react';

import { Icon, Input, TextareaAutosize, Typography } from '@mui/material';
import { RiMenu3Fill } from '@react-icons/all-files/ri/RiMenu3Fill';

import SIconButton from '../../../../../../atoms/SIconButton';
import SText from '../../../../../../atoms/SText';
import STextarea from '../../../../../../atoms/STextarea';
import { useHierarchyData } from '../../../../context/HierarchyContextProvider';
import { useDebounce } from '../../../../hooks/useDebounce';
import { StyledBoxLabel } from './styles';
import { ITextLabelProps } from './types';

export const TextLabel: FC<ITextLabelProps> = ({ data }) => {
  const { hierarchyMapRef, editById, setHierarchyRef } = useHierarchyData();

  const [labelText, setLabelText] = useState('');

  useEffect(() => {
    const label =
      (hierarchyMapRef.current &&
        hierarchyMapRef.current[data.id] &&
        hierarchyMapRef.current[data.id].label) ||
      '';

    setLabelText(
      label +
        'i1o2h3io 1h2io hio hio werewrh hi oh ioh i oh io ioh ioh o ih iohhiohiohio hiohi ohiohiohio ohihiohio',
    );
  }, [setLabelText, data.id, hierarchyMapRef, editById]);

  const editLabelHierarchy = (value: string) => {
    const newHierarchy = editById(data.id, { label: value });
    setHierarchyRef(newHierarchy);
  };

  const { onDebounce } = useDebounce(editLabelHierarchy, 300);

  const handleChangeText = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    onDebounce(e.target.value);
    setLabelText(e.target.value);
  };

  return (
    <StyledBoxLabel id={`label_text_${data.id}`}>
      <STextarea resize={false} value={labelText} onChange={handleChangeText} />
      <SText lineNumber={2}>{labelText || data.label || '...carregando'}</SText>
      {/* <SIconButton color="info" onClick={() => null}>
        <Icon
          component={RiMenu3Fill}
          sx={{
            alignSelf: 'center',
            fontSize: '1rem',
            color: 'grey.400',
          }}
        />
      </SIconButton> */}
    </StyledBoxLabel>
  );
};
