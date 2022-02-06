import { FC } from 'react';

import { Box, Icon } from '@mui/material';
import { RiCloseFill } from '@react-icons/all-files/ri/RiCloseFill';

import { useModal } from '../../../../../core/contexts/ModalContext';
import SFlex from '../../../../atoms/SFlex';
import SIconButton from '../../../../atoms/SIconButton';
import { STag } from '../../../../atoms/STag';
import SText from '../../../../atoms/SText';
import { SModalHeaderProps } from './types';

export const SModalHeaderTitle: FC<
  Pick<SModalHeaderProps, 'title' | 'subtitle' | 'tag'>
> = ({ title, tag }) => {
  if (tag && tag !== 'none' && title)
    return (
      <SFlex mb={2} align="center">
        <STag action={tag} />
        <SText>{title}</SText>
      </SFlex>
    );

  return (
    <>
      {typeof title === 'string' && <SText variant="h5">{title}</SText>}
      {!(typeof title === 'string') && title}
    </>
  );
};

export const SModalHeader: FC<SModalHeaderProps> = ({
  title,
  subtitle,
  modalName,
  onClose,
  tag,
  ...props
}) => {
  const { onCloseModal } = useModal();

  const onCloseAction = () => {
    onClose && onClose();
    onCloseModal(modalName);
  };

  return (
    <Box
      display="flex"
      width="100%"
      justifyContent="space-between"
      alignItems="flex-start"
      mb={5}
      {...props}
    >
      {subtitle && (
        <Box>
          <SModalHeaderTitle title={title} tag={tag} />
          <SText lineHeight="18px" fontSize="14px" color="text.light">
            {title}
          </SText>
        </Box>
      )}
      {!subtitle && typeof title === 'string' && (
        <SModalHeaderTitle title={title} tag={tag} />
      )}
      {!(typeof title === 'string') && title}
      <SIconButton
        sx={{ ml: [10, 10, 50], mt: -4, mr: -4 }}
        onClick={onCloseAction}
      >
        <Icon sx={{ fontSize: 25 }} component={RiCloseFill} />
      </SIconButton>
    </Box>
  );
};
