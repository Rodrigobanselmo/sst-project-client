import { FC } from 'react';
import { RiCloseFill } from 'react-icons/ri';

import { Box, Icon } from '@mui/material';

import { useModal } from 'core/hooks/useModal';

import SFlex from '../../../../atoms/SFlex';
import SIconButton from '../../../../atoms/SIconButton';
import { STagAction } from '../../../../atoms/STagAction';
import SText from '../../../../atoms/SText';
import { SModalHeaderProps } from './types';

export const SModalHeaderTitle: FC<
  Pick<SModalHeaderProps, 'title' | 'subtitle' | 'tag' | 'tagTitle'>
> = ({ title, tag, tagTitle }) => {
  if (tag && tag !== 'none' && title)
    return (
      <SFlex width="100%" mb={2} align="center">
        <STagAction text={tagTitle} action={tag} />
        <SText width="70%">{title}</SText>
      </SFlex>
    );

  return (
    <>
      {typeof title === 'string' && (
        <SText variant="h5" fontWeight="500">
          {title}
        </SText>
      )}
      {!(typeof title === 'string') && title}
    </>
  );
};

export const SModalHeader: FC<SModalHeaderProps> = ({
  title,
  subtitle,
  modalName,
  tagTitle,
  onClose,
  tag,
  secondIconClick,
  secondIcon,
  ...props
}) => {
  const { onCloseModal } = useModal();

  const onCloseAction = () => {
    onClose && onClose();
    if (modalName) onCloseModal(modalName);
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
          <SModalHeaderTitle tagTitle={tagTitle} title={title} tag={tag} />
          <SText
            sx={{ whiteSpace: 'pre-line' }}
            mt={5}
            lineHeight="18px"
            fontSize="14px"
            color="text.light"
          >
            {subtitle}
          </SText>
        </Box>
      )}

      {!subtitle && typeof title === 'string' && (
        <SModalHeaderTitle tagTitle={tagTitle} title={title} tag={tag} />
      )}

      {!(typeof title === 'string') && title}

      {secondIconClick && secondIcon && (
        <SIconButton sx={{ ml: 5, mt: -4, mr: -4 }} onClick={secondIconClick}>
          <Icon sx={{ fontSize: 25 }} component={secondIcon} />
        </SIconButton>
      )}

      <SIconButton sx={{ ml: 5, mt: -4, mr: -4 }} onClick={onCloseAction}>
        <Icon sx={{ fontSize: 25 }} component={RiCloseFill} />
      </SIconButton>
    </Box>
  );
};
