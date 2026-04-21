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
import { StatusEnum } from 'project/enum/status.enum';

const CURRENT_PROBABILITY_LOCKED_REASON =
  'Como todas as recomendações aplicáveis a este risco foram concluídas com sucesso, o risco real deve ser igual ao risco residual. Para alterar essa probabilidade, adicione novas medidas de controle.';

const scopedRows = (data: ProbabilityColumnProps['data'], workspaceId?: string) => {
  const rows = data?.dataRecs || [];
  if (!workspaceId) return rows;
  const scoped = rows.filter((r) => r.workspaceId === workspaceId);
  return scoped.length ? scoped : rows;
};

const scopedDerivedLinks = (
  data: ProbabilityColumnProps['data'],
  workspaceId?: string,
) => {
  const links = data?.riskFactorDataRecDerivedMeasures || [];
  if (!workspaceId) return links;
  const scoped = links.filter((l) => l.workspaceId === workspaceId);
  return scoped.length ? scoped : links;
};

const isCurrentProbabilityLocked = (
  data: ProbabilityColumnProps['data'],
  workspaceId?: string,
) => {
  if (!data?.recs?.length) return false;
  if (!data?.probabilityAfter || data.probability !== data.probabilityAfter) {
    return false;
  }

  const rows = scopedRows(data, workspaceId);
  const links = scopedDerivedLinks(data, workspaceId);

  return data.recs.every((rec) => {
    const row = rows.find((r) => r.recMedId === rec.id);
    if (!row || row.status !== StatusEnum.DONE) return false;
    return links.some((l) => l.sourceRecMedId === rec.id);
  });
};

export const ProbabilityColumn: FC<
  { children?: any } & ProbabilityColumnProps
> = ({ handleSelect, data, handleHelp, risk, planWorkspaceId }) => {
  const dataSelect = {} as Partial<IUpsertRiskData>;
  const { onStackOpenModal } = useModal();
  const probabilityLockByPlan = isCurrentProbabilityLocked(
    data,
    planWorkspaceId,
  );
  const allowedLockedProbability = probabilityLockByPlan
    ? data?.probabilityAfter
    : undefined;
  const disabledNumbers = probabilityLockByPlan
    ? [1, 2, 3, 4, 5, 6].filter((n) => n !== allowedLockedProbability)
    : [];

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
        disabledNumbers={disabledNumbers}
        getDisabledReason={(number) =>
          disabledNumbers.includes(number)
            ? CURRENT_PROBABILITY_LOCKED_REASON
            : undefined
        }
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
