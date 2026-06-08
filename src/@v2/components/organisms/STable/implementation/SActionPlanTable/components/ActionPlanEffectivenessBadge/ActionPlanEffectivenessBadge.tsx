import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { ActionPlanBrowseResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-result.model';
import { getEffectivenessDisplay } from '../../maps/action-plan-effectiveness-type-map';

export const ActionPlanEffectivenessBadge = ({
  row,
}: {
  row: ActionPlanBrowseResultModel;
}) => {
  const display = getEffectivenessDisplay(
    row.effectiveness?.status,
    row.status,
  );

  return (
    <SFlex
      m="auto"
      justify="center"
      align="center"
      px={4}
      py={1}
      width="fit-content"
      minWidth={95}
      sx={{
        borderRadius: '5px',
        borderColor: display.schema.borderColor,
        backgroundColor: display.schema.backgroundColor,
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
    >
      <SText color={display.schema.color} fontSize={12} lineNumber={1}>
        {display.label}
      </SText>
    </SFlex>
  );
};
