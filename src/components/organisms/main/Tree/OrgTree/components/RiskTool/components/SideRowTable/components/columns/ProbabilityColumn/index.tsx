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

  const onAddQuantity = () => {
    console.log('risk', risk);
    onStackOpenModal(ModalEnum.QUANTITY_ADD, {
      ...(data?.json ? data?.json : {}),
      risk,
      type: hasQuality,
      onCreate: (value) =>
        handleSelect({ json: value, probabilityAfter: undefined }),
    } as typeof initialQuantityState);
  };

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
      {hasQuality && (
        <STagButton
          active={data?.isQuantity}
          onClick={onAddQuantity}
          text={data?.isQuantity ? 'Quantitativo' : 'Medição'}
          mt={4}
          bg={data?.isQuantity ? 'gray.500' : undefined}
        />
      )}
    </SFlex>
  );
};
