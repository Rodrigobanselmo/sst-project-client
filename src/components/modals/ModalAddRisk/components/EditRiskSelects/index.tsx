/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useMemo } from 'react';

import StraightenIcon from '@mui/icons-material/Straighten';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import STooltip from 'components/atoms/STooltip';
import { STagSearchSelect } from 'components/molecules/STagSearchSelect';
import { StatusSelect } from 'components/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IRecMed, IRecMedCreate } from 'core/interfaces/api/IRiskFactors';

interface IEditRiskSelects {
  riskData: { status: StatusEnum; recMed: IRecMedCreate[] };
  setRiskData: React.Dispatch<any>;
  id?: number;
}

export const EditRiskSelects: FC<IEditRiskSelects> = ({
  setRiskData,
  riskData,
}) => {
  const { onOpenModal } = useModal();

  const handleSelectRecMed = (option: string) => {
    //
  };

  const handleAddRecMed = () => {
    onOpenModal(ModalEnum.REC_MED_ADD, { passDataBack: true });
  };

  const optionsRec = useMemo(() => {
    return riskData.recMed.filter((r) => r.recName);
  }, [riskData]);

  const recMedLength = String(optionsRec.length);

  return (
    <SFlex gap={8} mt={10} align="center">
      <StatusSelect
        selected={riskData.status}
        statusOptions={[
          StatusEnum.PROGRESS,
          StatusEnum.ACTIVE,
          StatusEnum.INACTIVE,
        ]}
        handleSelectMenu={(option: any) =>
          setRiskData({ ...riskData, status: option.value })
        }
      />
      <STagSearchSelect
        options={optionsRec}
        icon={ThumbUpOffAltIcon}
        additionalButton={handleAddRecMed}
        tooltipTitle={`${recMedLength} recomendações`}
        text={recMedLength}
        keys={['recName']}
        large={true}
        handleSelectMenu={handleSelectRecMed}
        startAdornment={(options: IRecMed | undefined) => {
          if (!options?.medName) return <></>;

          return (
            <STooltip enterDelay={1200} withWrapper title={options.medName}>
              <Icon
                sx={{ color: 'text.light', fontSize: '18px', mr: '10px' }}
                component={StraightenIcon}
              />
            </STooltip>
          );
        }}
        optionsFieldName={{ valueField: 'id', contentField: 'recName' }}
      />
    </SFlex>
  );
};
