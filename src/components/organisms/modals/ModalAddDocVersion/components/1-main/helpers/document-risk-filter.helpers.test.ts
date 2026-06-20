import { RiskEnum } from 'project/enum/risk.enums';

import {
  applyRiskFilterToCheckedState,
  buildDocumentRiskFilterFromCheckedState,
  createDefaultRiskFilterCheckedState,
  DocumentRiskFilterTreeCategory,
  toggleRiskFilterRisk,
} from './document-risk-filter.helpers';

const buildTree = (): DocumentRiskFilterTreeCategory[] => [
  {
    type: RiskEnum.ACI,
    label: 'Acidente',
    subcategories: [],
    risksWithoutSubcategory: [
      { id: 'risk-1', name: 'Risco 1', type: RiskEnum.ACI },
      { id: 'risk-2', name: 'Risco 2', type: RiskEnum.ACI },
      { id: 'risk-3', name: 'Risco 3', type: RiskEnum.ACI },
    ],
  },
];

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runDocumentRiskFilterHelperTests = () => {
  const tree = buildTree();
  let checked = createDefaultRiskFilterCheckedState(tree);

  checked = toggleRiskFilterRisk(tree, checked, 'risk-1', false);
  checked = toggleRiskFilterRisk(tree, checked, 'risk-2', false);

  const partialFilter = buildDocumentRiskFilterFromCheckedState(tree, checked);

  assert(Boolean(partialFilter), 'partial filter should exist');
  assert(
    !partialFilter?.excludedCategoryIds?.includes(RiskEnum.ACI),
    'partial exclusion must not use excludedCategoryIds',
  );
  assert(
    partialFilter?.excludedRiskFactorIds?.length === 2,
    'partial exclusion must use excludedRiskFactorIds only',
  );
  assert(
    partialFilter?.excludedRiskFactorIds?.includes('risk-1') === true,
    'risk-1 must be excluded',
  );
  assert(
    partialFilter?.excludedRiskFactorIds?.includes('risk-2') === true,
    'risk-2 must be excluded',
  );

  checked = toggleRiskFilterRisk(tree, checked, 'risk-3', false);
  const fullCategoryFilter = buildDocumentRiskFilterFromCheckedState(tree, checked);

  assert(
    fullCategoryFilter?.excludedCategoryIds?.includes(RiskEnum.ACI) === true,
    'full category exclusion must use excludedCategoryIds',
  );
  assert(
    !fullCategoryFilter?.excludedRiskFactorIds?.length,
    'full category exclusion should not duplicate risk ids',
  );

  const restored = applyRiskFilterToCheckedState(tree, partialFilter);

  assert(restored.risks['risk-1'] === false, 'restored risk-1 must stay unchecked');
  assert(restored.risks['risk-2'] === false, 'restored risk-2 must stay unchecked');
  assert(restored.risks['risk-3'] !== false, 'restored risk-3 must stay checked');
};
