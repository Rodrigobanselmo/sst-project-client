import {
  analysisItemPillSchema,
  analysisItemPillSx,
} from '../analysis-item-pill.styles';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import type { FrpsAnalysisListItemType } from '@v2/services/forms/form-questions-answers-analysis/frps-explainability';
import { useFrpsExplainabilityOptional } from './FrpsExplainabilityContext';

type ExplainFrpsItemButtonProps = {
  analysisId: string;
  listItemType: FrpsAnalysisListItemType;
  itemName: string;
  itemKey?: string | null;
  riskFactorName?: string | null;
};

export function ExplainFrpsItemButton({
  analysisId,
  listItemType,
  itemName,
  itemKey,
  riskFactorName,
}: ExplainFrpsItemButtonProps) {
  const explainability = useFrpsExplainabilityOptional();
  if (!explainability) return null;

  return (
    <SButton
      variant="outlined"
      schema={analysisItemPillSchema}
      textProps={{ fontSize: 11, fontWeight: 500 }}
      size="s"
      text="Entender este item"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        explainability.openExplainItem({
          analysisId,
          listItemType,
          itemName,
          itemKey,
          riskFactorName,
        });
      }}
      buttonProps={{
        type: 'button',
        title: 'Abrir explicação técnica deste item',
        sx: analysisItemPillSx,
      }}
    />
  );
}
