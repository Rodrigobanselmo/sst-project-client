import { FC, useState } from 'react';

import { Box, BoxProps, ClickAwayListener, Icon } from '@mui/material';
import { SDatePicker } from 'components/atoms/SDatePicker/SDatePicker';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import dayjs from 'dayjs';

import SArrowNextIcon from 'assets/icons/SArrowNextIcon';

export const PersonalDatePicker: FC<
  BoxProps & { actualDate: Date; onChangeDate: (date: Date) => void }
> = ({ actualDate, onChangeDate, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SFlex ml={'auto'} align="center" {...props}>
      <SIconButton
        onClick={() => onChangeDate(dayjs(actualDate).add(-1, 'day').toDate())}
        size="small"
      >
        <Icon
          component={SArrowNextIcon}
          sx={{ fontSize: '1rem', transform: 'rotate(180deg)' }}
        />
      </SIconButton>
      <ClickAwayListener onClickAway={() => setIsOpen(false)}>
        <Box sx={{ position: 'relative', flex: 1, width: '100%' }}>
          <STagButton
            onClick={() => setIsOpen(!isOpen)}
            active
            bg={'secondary.main'}
            textProps={{ sx: { fontSize: '14px' } }}
            text={
              dayjs(actualDate).isSame(dayjs(), 'day')
                ? 'Hoje'
                : dayjs(actualDate).format('DD/MM/YYYY')
            }
            tooltipTitle="Voltar para o dia atual"
          />
          {isOpen && (
            <Box
              sx={{
                position: 'absolute',
                right: -25,
                top: 40,
                zIndex: 10,
              }}
            >
              <SDatePicker
                selected={actualDate}
                onChange={(date) => {
                  date && onChangeDate(date);
                  setIsOpen(false);
                }}
                inline
              />
            </Box>
          )}
        </Box>
      </ClickAwayListener>
      <SIconButton
        onClick={() => onChangeDate(dayjs(actualDate).add(1, 'day').toDate())}
        size="small"
      >
        <Icon component={SArrowNextIcon} sx={{ fontSize: '1rem' }} />
      </SIconButton>
    </SFlex>
  );
};
