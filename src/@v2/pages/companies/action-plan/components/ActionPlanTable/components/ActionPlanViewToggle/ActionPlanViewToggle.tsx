import { ToggleButton, ToggleButtonGroup } from '@mui/material';

import { ActionPlanBrowseViewEnum } from '@v2/models/security/enums/action-plan-browse-view.enum';

export function ActionPlanViewToggle({
  value,
  onChange,
}: {
  value: ActionPlanBrowseViewEnum;
  onChange: (view: ActionPlanBrowseViewEnum) => void;
}) {
  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={value}
      onChange={(_, next: ActionPlanBrowseViewEnum | null) => {
        if (!next) return;
        onChange(next);
      }}
      aria-label="Visualização do plano de ação"
      sx={{ flexShrink: 0 }}
    >
      <ToggleButton value={ActionPlanBrowseViewEnum.LINKS}>
        Vínculos
      </ToggleButton>
      <ToggleButton value={ActionPlanBrowseViewEnum.GROUPED}>
        Ações
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
