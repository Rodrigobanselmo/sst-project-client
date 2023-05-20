import React, { cloneElement, useMemo, useState } from 'react';

import { STagButton } from 'components/atoms/STagButton';
import { ISTagButtonProps } from 'components/atoms/STagButton/types';

import { SDeleteIcon } from 'assets/icons/SDeleteIcon';

type Props = {
  onHandleDeletion: (e: React.MouseEvent<HTMLDivElement> | undefined) => void;
} & ISTagButtonProps;

export const RemoveDoubleClickButton: React.FC<{ children?: any } & Props> = ({
  onHandleDeletion,
  ...props
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleDelete = (e: React.MouseEvent<HTMLDivElement> | undefined) => {
    setTimeout(() => {
      setDeleteConfirm(false);
    }, 3000);
    if (deleteConfirm) {
      onHandleDeletion?.(e);
    } else {
      setDeleteConfirm(true);
    }
  };

  return (
    <STagButton
      maxWidth={'300px'}
      marginLeft="auto"
      onClick={handleDelete}
      icon={SDeleteIcon}
      text={deleteConfirm ? 'Deseja remover?' : ''}
      {...(!props.disabled && {
        bg: 'error.dark',
        active: true,
      })}
      {...props}
    />
  );
};
