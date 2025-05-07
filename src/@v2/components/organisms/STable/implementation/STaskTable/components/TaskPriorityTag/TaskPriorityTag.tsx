import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { TaskPriorityTranslation } from '@v2/models/tasks/translations/priority.translation';
import { TaskPriorityTagProps } from './TaskPriorityTag.types';

const colorMap: Record<number, any> = {
  [0]: {
    bgcolor: 'transparent',
    borderColor: 'grey.300',
    color: 'text.main',
  },
  [4]: {
    bgcolor: 'scale.low',
    color: 'white',
  },
  [3]: {
    bgcolor: 'scale.medium',
    color: 'white',
  },
  [2]: {
    bgcolor: 'scale.high',
    color: 'white',
  },
  [1]: {
    bgcolor: 'scale.veryHigh',
    color: 'white',
  },
};

const sizeMap = {
  md: {
    fontSize: 12,
    padding: '1px 2px',
  },
};

export const TaskPriorityTag = ({
  priority,
  size = 'md',
}: TaskPriorityTagProps) => {
  return (
    <SFlex
      borderRadius={'4px'}
      center
      bgcolor={colorMap[priority].bgcolor}
      p={sizeMap[size].padding}
      border={'1px solid'}
      borderColor={colorMap[priority].borderColor || colorMap[priority].bgcolor}
    >
      <SText
        fontWeight="500"
        color={colorMap[priority].color}
        fontSize={sizeMap[size].fontSize}
      >
        {TaskPriorityTranslation[priority]}
      </SText>
    </SFlex>
  );
};
