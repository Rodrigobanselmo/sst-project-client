import { CircularProgress, Icon } from '@mui/material';
import SText from 'components/atoms/SText';

import SFlex from '../SFlex';
import STooltip from '../STooltip';
import { STBox } from './styles';
import { ISActionButtonProps } from './types';

export const SActionGroupButton = ({
  text,
  icon,
  active,
  tooltipText,
  loading,
  disabled,
  color,
  infos,
  ...props
}: ISActionButtonProps) => {
  return (
    <STooltip title={tooltipText}>
      <STBox
        active={active ? 1 : 0}
        width={'fit-content'}
        disabled={disabled || loading ? 1 : 0}
        color={color}
        {...props}
      >
        <SFlex align={'center'} gap={5} px={2}>
          {!loading && (
            <>
              <Icon component={icon} sx={{ fontSize: 30 }} />
              <SText fontSize={15} fontWeight={500}>
                {text}
              </SText>
            </>
          )}
          {loading && (
            <>
              <CircularProgress color="primary" size={18} />
              <SText fontSize={15} fontWeight={500}>
                Carregando...
              </SText>
            </>
          )}
        </SFlex>
        <SFlex>
          <SFlex p={10} px={4} pb={5} flexDirection={'column'}>
            {infos &&
              infos.slice(0, 3).map((item) => (
                <SText
                  key={item.label}
                  fontSize={13}
                  fontWeight={500}
                  color={'text.light'}
                >
                  {item.label}: {item.value}
                </SText>
              ))}
          </SFlex>
          <SFlex p={10} pr={0} pb={5} flexDirection={'column'}>
            {infos &&
              infos?.length > 3 &&
              infos.slice(3, 6).map((item) => (
                <SText
                  key={item.label}
                  fontSize={13}
                  fontWeight={500}
                  color={'text.light'}
                >
                  {item.label}: {item.value}
                </SText>
              ))}
          </SFlex>
        </SFlex>
      </STBox>
    </STooltip>
  );
};
