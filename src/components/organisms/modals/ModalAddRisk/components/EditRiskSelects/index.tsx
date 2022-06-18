/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useMemo } from 'react';

import { Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import STooltip from 'components/atoms/STooltip';
import { STagSearchSelect } from 'components/molecules/STagSearchSelect';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';

import SGenerateSource from 'assets/icons/SGenerateSource';
import SMeasureControlIcon from 'assets/icons/SMeasureControlIcon';
import SRecommendationIcon from 'assets/icons/SRecommendationIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import {
  IGenerateSourceCreate,
  IGenerateSource,
  IRecMed,
  IRecMedCreate,
} from 'core/interfaces/api/IRiskFactors';

interface IEditRiskSelects {
  riskData: {
    status: StatusEnum;
    recMed: IRecMedCreate[];
    generateSource: IGenerateSourceCreate[];
  };
  setRiskData: React.Dispatch<any>;
  id?: number;
}

export const EditRiskSelects: FC<IEditRiskSelects> = ({
  setRiskData,
  riskData,
}) => {
  const { onOpenModal } = useModal();

  const handleSelectRecMed = (option: IRecMed & IRecMedCreate) => {
    if (option?.medName || option?.recName)
      onOpenModal(ModalEnum.REC_MED_ADD, {
        passDataBack: true,
        edit: true,
        onlyInput: '',
        localId: option?.localId,
        ...option,
      });
  };

  const handleSelectGenerateSource = (
    option: IGenerateSource & IGenerateSourceCreate,
  ) => {
    if (option?.name)
      onOpenModal(ModalEnum.GENERATE_SOURCE_ADD, {
        passDataBack: true,
        edit: true,
        localId: option?.localId,
        showRecMed: true,
        ...option,
      });
  };

  const handleAddRecMed = () => {
    onOpenModal(ModalEnum.REC_MED_ADD, { passDataBack: true, onlyInput: '' });
  };

  const handleAddGenerateSource = () => {
    onOpenModal(ModalEnum.GENERATE_SOURCE_ADD, {
      passDataBack: true,
      showRecMed: true,
    });
  };

  const optionsRec = useMemo(() => {
    return riskData.recMed.filter((r) => r.recName);
  }, [riskData]);

  const optionsMed = useMemo(() => {
    return riskData.recMed.filter((r) => r.medName);
  }, [riskData]);

  const optionsGenerateSource = useMemo(() => {
    return riskData.generateSource.filter((r) => r.name);
  }, [riskData]);

  const recLength = String(optionsRec.length);
  const medLength = String(optionsMed.length);
  const generateSourceLength = String(optionsGenerateSource.length);

  return (
    <SFlex gap={8} mt={10} align="center">
      <StatusSelect
        selected={riskData.status}
        statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
        handleSelectMenu={(option: any) =>
          setRiskData({ ...riskData, status: option.value })
        }
      />
      <STagSearchSelect
        options={optionsGenerateSource}
        icon={SGenerateSource}
        additionalButton={handleAddGenerateSource}
        tooltipTitle={`${generateSourceLength} fontes geradoras`}
        text={generateSourceLength}
        keys={['name']}
        large={true}
        handleSelectMenu={handleSelectGenerateSource}
        optionsFieldName={{ valueField: 'id', contentField: 'name' }}
      />
      <STagSearchSelect
        options={optionsRec}
        icon={SRecommendationIcon}
        additionalButton={handleAddRecMed}
        tooltipTitle={`${recLength} recomendações`}
        text={recLength}
        keys={['recName']}
        large={true}
        handleSelectMenu={handleSelectRecMed}
        startAdornment={(options: IRecMed | undefined) => {
          if (!options?.medName) return <></>;

          return (
            <STooltip enterDelay={1200} withWrapper title={options.medName}>
              <Icon
                sx={{ color: 'text.light', fontSize: '18px', mr: '10px' }}
                component={SMeasureControlIcon}
              />
            </STooltip>
          );
        }}
        optionsFieldName={{ valueField: 'id', contentField: 'recName' }}
      />
      <STagSearchSelect
        options={optionsMed}
        icon={SMeasureControlIcon}
        additionalButton={handleAddRecMed}
        tooltipTitle={`${medLength} medidas de controle`}
        text={medLength}
        keys={['medName']}
        large={true}
        handleSelectMenu={handleSelectRecMed}
        startAdornment={(options: IRecMed | undefined) => {
          if (!options?.recName) return <></>;

          return (
            <STooltip enterDelay={1200} withWrapper title={options.recName}>
              <Icon
                sx={{ color: 'text.light', fontSize: '18px', mr: '10px' }}
                component={SMeasureControlIcon}
              />
            </STooltip>
          );
        }}
        optionsFieldName={{ valueField: 'id', contentField: 'medName' }}
      />
    </SFlex>
  );
};
