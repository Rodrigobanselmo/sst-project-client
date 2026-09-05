import { useState } from 'react';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { SText } from '@v2/components/atoms/SText/SText';
import { usePermissionsAccess } from '@v2/hooks/usePermissionsAccess';
import { ActionPlanBrowseViewEnum } from '@v2/models/security/enums/action-plan-browse-view.enum';
import { useFetchOperationalActionSuggestions } from '@v2/services/security/action-plan/operational-action-group/hooks/useFetchOperationalActionSuggestions';
import {
  useMutateConfirmOperationalActionSuggestion,
  useMutateDismissOperationalActionSuggestion,
} from '@v2/services/security/action-plan/operational-action-group/hooks/useMutateOperationalActionSuggestion';
import { OperationalActionSuggestion } from '@v2/services/security/action-plan/operational-action-group/service/operational-action-group.types';

type Scope = 'GLOBAL' | 'COMPANY';

function SuggestionCard({
  suggestion,
  companyId,
}: {
  suggestion: OperationalActionSuggestion;
  companyId: string;
}) {
  const [scope, setScope] = useState<Scope>(suggestion.suggestedScope || 'GLOBAL');
  const confirm = useMutateConfirmOperationalActionSuggestion();
  const dismiss = useMutateDismissOperationalActionSuggestion();
  const busy = confirm.isPending || dismiss.isPending;

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 1.5,
        mb: 1,
      }}
    >
      <SText fontSize={13} fontWeight={600}>
        {suggestion.label}
      </SText>
      <Typography variant="caption" color="text.secondary" display="block">
        {suggestion.recType || '—'} · {suggestion.risks.length} fatores de risco ·{' '}
        {suggestion.applicationsCount}{' '}
        {suggestion.applicationsCount === 1 ? 'aplicação' : 'aplicações'}
      </Typography>
      <Box component="ul" sx={{ m: 0, mt: 1, pl: 2 }}>
        {suggestion.risks.map((risk) => (
          <Typography key={risk.id} component="li" variant="caption">
            {risk.name}
          </Typography>
        ))}
      </Box>
      <FormControl sx={{ mt: 1 }}>
        <RadioGroup
          row
          value={scope}
          onChange={(_, value) => setScope(value as Scope)}
        >
          <FormControlLabel
            value="GLOBAL"
            control={<Radio size="small" />}
            label="GLOBAL — todas as empresas"
          />
          <FormControlLabel
            value="COMPANY"
            control={<Radio size="small" />}
            label="Somente esta empresa"
          />
        </RadioGroup>
      </FormControl>
      <Box display="flex" gap={1} mt={1}>
        <Button
          size="small"
          variant="contained"
          disabled={busy}
          onClick={() =>
            confirm.mutate({
              recommendationIds: suggestion.recommendationIds,
              label: suggestion.label,
              viewingCompanyId: companyId,
              scope,
            })
          }
        >
          Confirmar equivalência
        </Button>
        <Button
          size="small"
          variant="text"
          disabled={busy}
          onClick={() =>
            dismiss.mutate({
              recommendationIds: suggestion.recommendationIds,
              label: suggestion.label,
              viewingCompanyId: companyId,
              scope,
            })
          }
        >
          Não são equivalentes
        </Button>
      </Box>
    </Box>
  );
}

export function ActionPlanEquivalentSuggestions({
  companyId,
  workspaceId,
  view,
}: {
  companyId: string;
  workspaceId: string;
  view: ActionPlanBrowseViewEnum;
}) {
  const { isMasterAdmin } = usePermissionsAccess();
  const enabled = isMasterAdmin && view === ActionPlanBrowseViewEnum.GROUPED;
  const { data, isLoading } = useFetchOperationalActionSuggestions({
    companyId,
    workspaceId,
    enabled,
  });

  if (!enabled) return null;

  const suggestions = data ?? [];
  if (!isLoading && suggestions.length === 0) return null;

  return (
    <Accordion
      disableGutters
      sx={{ mb: 1, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}
    >
      <AccordionSummary expandIcon={<KeyboardArrowDownIcon />}>
        <SText fontSize={13} fontWeight={600}>
          Possíveis ações equivalentes ({isLoading ? '…' : suggestions.length})
        </SText>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          GLOBAL vale automaticamente para todas as empresas atuais e futuras.
          COMPANY é só override desta empresa.
        </Typography>
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            companyId={companyId}
          />
        ))}
      </AccordionDetails>
    </Accordion>
  );
}
