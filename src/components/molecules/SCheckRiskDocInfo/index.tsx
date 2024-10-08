import { FC, useRef } from 'react';
import { RiCloseFill } from 'react-icons/ri';

import { Icon } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import SFlex from 'components/atoms/SFlex';
import { useDebouncedCallback } from 'use-debounce';

import { IRiskDocInfo } from 'core/interfaces/api/IRiskFactors';

import { UnmountBox } from '../form/unmount-box';
import { ISCheckRiskDocInfo } from './types';

export const SCheckRiskDocInfo: FC<{ children?: any } & ISCheckRiskDocInfo> = ({
  riskDocInfo,
  onUnmount,
  onSelectCheck,
  ...props
}) => {
  const ref = useRef({} as Partial<IRiskDocInfo>);
  const old = {
    isPGR: riskDocInfo?.isPGR,
    isPPP: riskDocInfo?.isPPP,
    isAso: riskDocInfo?.isAso,
    isPCMSO: riskDocInfo?.isPCMSO,
  };

  const handleDebounceChange = useDebouncedCallback(() => {
    onSelectCheck(ref.current);
    // ref.current = {};
  }, 800);

  const onChange = (data: Partial<IRiskDocInfo>) => {
    ref.current = { ...old, ...ref.current, ...data };
    handleDebounceChange();
  };

  return (
    <UnmountBox
      unmountOnChangeDefault
      defaultValue={onUnmount || riskDocInfo}
      sx={{
        display: 'flex',
        '.MuiFormControlLabel-root': {
          span: { fontSize: 10, input: { fontSize: 10 } },
          svg: { fontSize: 15 },
        },
      }}
      {...props}
    >
      <SCheckBox
        label="PGR"
        defaultChecked={riskDocInfo?.isPGR ?? true}
        onChange={(e) => {
          e.stopPropagation();
          onChange({ isPGR: e.target?.checked });
        }}
      />
      <SCheckBox
        label="PPP"
        defaultChecked={riskDocInfo?.isPPP ?? true}
        onChange={(e) => {
          e.stopPropagation();
          onChange({ isPPP: e.target?.checked });
        }}
      />
      <SCheckBox
        label="PCMSO"
        defaultChecked={riskDocInfo?.isPCMSO ?? true}
        onChange={(e) => {
          e.stopPropagation();
          onChange({ isPCMSO: e.target?.checked });
        }}
      />
      <SCheckBox
        label="ASO"
        defaultChecked={riskDocInfo?.isAso ?? true}
        onChange={(e) => {
          e.stopPropagation();
          onChange({ isAso: e.target?.checked });
        }}
      />
    </UnmountBox>
  );
};
