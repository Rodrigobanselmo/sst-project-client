import { FC, PropsWithChildren, useState } from 'react';

import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Fade from '@mui/material/Fade';
import Popper from '@mui/material/Popper';

import defaultTheme from 'configs/theme';

import { STArrowStyled } from './SPopper.styles';
import { IPopperProps } from './SPopper.types';

export const SPopperArrow: FC<PropsWithChildren<IPopperProps>> = ({
  children,
  isOpen,
  close,
  anchorEl,
  sx,
  color = 'paper',
  disabledArrow,
  placement = 'bottom-end',
  popperProps,
  ...props
}) => {
  const [arrowRef, setArrowRef] = useState(null);
  const handleClickAway = () => {
    if (isOpen) close();
  };

  const canBeOpen = isOpen && Boolean(anchorEl.current);
  const id = canBeOpen ? 'transition-popper' : undefined;

  return (
    <Popper
      id={id}
      open={isOpen}
      anchorEl={anchorEl.current}
      transition
      placement={placement}
      style={{ zIndex: defaultTheme.mixins.popper, padding: 0 }}
      modifiers={[
        {
          name: 'flip',
          enabled: true,
        },
        {
          name: 'preventOverflow',
          enabled: true,
        },
        {
          name: 'arrow',
          enabled: true,
          options: {
            element: arrowRef,
          },
        },
      ]}
      {...popperProps}
    >
      {({ TransitionProps }) => (
        <ClickAwayListener onClickAway={handleClickAway} mouseEvent="onMouseUp">
          <Fade {...TransitionProps} timeout={250}>
            <Box
              sx={{
                borderRadius: '4px',
                boxShadow: 3,
                backgroundColor: `background.${color}`,
                color: 'gray.200',
                px: 0,
                py: 0,
                transform: !disabledArrow
                  ? 'translateY(15px)'
                  : 'translateY(5px)',
                ...sx,
              }}
              {...props}
            >
              {children}
              {!disabledArrow && (
                <STArrowStyled
                  color={color}
                  placement="bottom-end"
                  ref={setArrowRef as any}
                />
              )}
            </Box>
          </Fade>
        </ClickAwayListener>
      )}
    </Popper>
  );
};
