import { FC } from 'react';

import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import { initialQuantityState } from 'components/organisms/modals/ModalAddQuantity/hooks/useModalAddQuantity';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { isActivity, isQuantity } from 'core/utils/helpers/isQuantity';

import { SelectedNumber } from '../../SelectedNumber';
import { EpiColumnProps as ProbabilityColumnProps } from './types';
import { ExposureTypeEnum, ExposureTypeMap } from 'core/enums/exposure.enum';
import { SelectExposure } from './SelectExposure';

export const ProbabilityColumn: FC<
  { children?: any } & ProbabilityColumnProps
> = ({ handleSelect, data, handleHelp, risk }) => {
  const dataSelect = {} as Partial<IUpsertRiskData>;
  const { onStackOpenModal } = useModal();

  if (
    data &&
    data.probability &&
    data.probabilityAfter &&
    data.probability < data.probabilityAfter
  )
    dataSelect.probabilityAfter = undefined;

  const setProbability = (prob: number) => {
    if (data?.probability && prob && prob === data?.probability) return 0;

    return prob;
  };
  const hasQuality = isQuantity(risk);
  const hasActivity = isActivity(risk);

  const onAddQuantity = () => {
    onStackOpenModal(ModalEnum.QUANTITY_ADD, {
      ...(data?.json ? data?.json : {}),
      risk,
      type: hasQuality,
      onCreate: (value) =>
        handleSelect({ json: value, probabilityAfter: undefined }),
    } as typeof initialQuantityState);
  };

  const onAddActivity = () => {
    onStackOpenModal(ModalEnum.ACTIVITY_ADD, {
      ...(data?.activities ? data?.activities : {}),
      risk,
      onCreate: (value) => handleSelect({ activities: value }),
    } as typeof initialQuantityState);
  };

  const onChangeExposure = (exposure: ExposureTypeEnum) => {
    handleSelect({ exposure });
  };

  const selectedActivity = !!data?.activities?.activities?.length;
  const exposure = data?.exposure;

  return (
    <SFlex gap={0} direction="column">
      <SelectedNumber
        handleSelect={(number) => {
          handleSelect({ probability: setProbability(number), ...dataSelect });
        }}
        selectedNumber={data?.probability}
        disabledGtEqual={7}
        handleHelp={() => handleHelp && handleHelp(dataSelect)}
      />
      <SelectExposure exposure={exposure} onSelect={onChangeExposure} />
      {hasQuality && (
        <STagButton
          active={data?.isQuantity}
          onClick={onAddQuantity}
          text={data?.isQuantity ? 'Quantitativo' : 'Medição'}
          mt={4}
          bg={data?.isQuantity ? 'gray.500' : undefined}
        />
      )}
      {hasActivity && (
        <STagButton
          active={selectedActivity}
          onClick={onAddActivity}
          text={'Atividade'}
          mt={4}
          bg={selectedActivity ? 'gray.500' : undefined}
        />
      )}
    </SFlex>
  );
};
