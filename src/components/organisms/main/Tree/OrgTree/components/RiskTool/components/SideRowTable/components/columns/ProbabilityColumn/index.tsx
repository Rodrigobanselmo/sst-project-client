import React, { FC } from 'react';

import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import { initialQuantityState } from 'components/organisms/modals/ModalAddQuantity/hooks/useModalAddQuantity';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { isQuantity } from 'core/utils/helpers/isQuantity';

import { SelectedNumber } from '../../SelectedNumber';
import { EpiColumnProps as ProbabilityColumnProps } from './types';

export const ProbabilityColumn: FC<ProbabilityColumnProps> = ({
  handleSelect,
  data,
  handleHelp,
  risk,
}) => {
  const dataSelect = {} as Partial<IUpsertRiskData>;
  const { onOpenModal } = useModal();

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

  const onAddQuantity = () => {
    onOpenModal(ModalEnum.QUANTITY_ADD, {
      risk,
      type: hasQuality,
    } as typeof initialQuantityState);
  };

  return (
    <SFlex gap={0} direction="column">
      <SelectedNumber
        handleSelect={(number) =>
          handleSelect({ probability: setProbability(number), ...dataSelect })
        }
        selectedNumber={data?.probability}
        disabledGtEqual={6}
        handleHelp={() => handleHelp && handleHelp(dataSelect)}
      />
      {hasQuality && (
        <STagButton onClick={onAddQuantity} text="Medição" mt={4} />
      )}
    </SFlex>
  );
};
