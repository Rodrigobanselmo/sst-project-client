import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { PopulationPriorityEnum } from '../../helpers/compute-population-priority.helper';

const priorityStyles: Record<
  PopulationPriorityEnum,
  { bgcolor: string; borderColor: string; color: string }
> = {
  [PopulationPriorityEnum.HIGH]: {
    bgcolor: 'error.50',
    borderColor: 'error.main',
    color: 'error.dark',
  },
  [PopulationPriorityEnum.MEDIUM]: {
    bgcolor: 'warning.50',
    borderColor: 'warning.main',
    color: 'warning.dark',
  },
  [PopulationPriorityEnum.LOW]: {
    bgcolor: 'grey.50',
    borderColor: 'grey.300',
    color: 'text.secondary',
  },
};

export const ActionPlanExposedWorkersBadge = ({
  count,
  priority,
}: {
  count: number;
  priority?: PopulationPriorityEnum | null;
}) => {
  const styles = priority ? priorityStyles[priority] : null;

  return (
    <SFlex
      center
      borderRadius="4px"
      p="2px 6px"
      border="1px solid"
      borderColor={styles?.borderColor ?? 'grey.300'}
      bgcolor={styles?.bgcolor ?? 'transparent'}
      flexDirection="column"
      gap={0}
    >
      <SText
        fontSize={13}
        fontWeight={priority === PopulationPriorityEnum.HIGH ? 700 : 500}
        color={styles?.color ?? 'text.main'}
      >
        {count}
      </SText>
      {priority === PopulationPriorityEnum.HIGH && (
        <SText fontSize={9} fontWeight={600} color="error.dark">
          Prioridade
        </SText>
      )}
    </SFlex>
  );
};
