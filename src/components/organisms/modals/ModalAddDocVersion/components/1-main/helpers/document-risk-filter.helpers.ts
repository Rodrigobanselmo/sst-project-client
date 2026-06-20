import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import {
  DocumentGenerationRiskFilter,
  hasActiveDocumentRiskFilter,
} from 'core/interfaces/api/document-generation-risk-filter.types';
import { RiskEnum, RiskMap } from 'project/enum/risk.enums';

const NO_SUBCATEGORY_KEY = '__none__';

export type DocumentRiskFilterTreeCategory = {
  type: RiskEnum;
  label: string;
  subcategories: DocumentRiskFilterTreeSubcategory[];
  risksWithoutSubcategory: DocumentRiskFilterTreeRisk[];
};

export type DocumentRiskFilterTreeSubcategory = {
  id: number;
  name: string;
  risks: DocumentRiskFilterTreeRisk[];
};

export type DocumentRiskFilterTreeRisk = {
  id: string;
  name: string;
  type: RiskEnum;
  subcategoryId?: number;
};

export type DocumentRiskFilterCheckedState = {
  categories: Record<string, boolean>;
  subcategories: Record<number, boolean>;
  risks: Record<string, boolean>;
};

const resolveSubcategory = (risk: IRiskFactors) => {
  const subType = risk.subTypes?.[0]?.sub_type;

  if (!subType?.id) return undefined;

  return {
    id: Number(subType.id),
    name: subType.name,
  };
};

export const buildDocumentRiskFilterTree = (
  risks: IRiskFactors[],
): DocumentRiskFilterTreeCategory[] => {
  const byCategory = new Map<RiskEnum, DocumentRiskFilterTreeCategory>();

  risks.forEach((risk) => {
    const type = risk.type;
    const category =
      byCategory.get(type) ??
      ({
        type,
        label: RiskMap[type]?.name ?? type,
        subcategories: [],
        risksWithoutSubcategory: [],
      } satisfies DocumentRiskFilterTreeCategory);

    const treeRisk: DocumentRiskFilterTreeRisk = {
      id: risk.id,
      name: risk.name,
      type,
    };

    const subcategory = resolveSubcategory(risk);

    if (subcategory && !Number.isNaN(subcategory.id)) {
      treeRisk.subcategoryId = subcategory.id;

      let subcategoryNode = category.subcategories.find(
        (item) => item.id === subcategory.id,
      );

      if (!subcategoryNode) {
        subcategoryNode = {
          id: subcategory.id,
          name: subcategory.name,
          risks: [],
        };
        category.subcategories.push(subcategoryNode);
      }

      subcategoryNode.risks.push(treeRisk);
    } else {
      category.risksWithoutSubcategory.push(treeRisk);
    }

    byCategory.set(type, category);
  });

  return [...byCategory.values()]
    .map((category) => ({
      ...category,
      subcategories: category.subcategories.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR'),
      ),
      risksWithoutSubcategory: category.risksWithoutSubcategory.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR'),
      ),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
};

export const createDefaultRiskFilterCheckedState = (
  tree: DocumentRiskFilterTreeCategory[],
): DocumentRiskFilterCheckedState => {
  const categories: Record<string, boolean> = {};
  const subcategories: Record<number, boolean> = {};
  const risks: Record<string, boolean> = {};

  tree.forEach((category) => {
    categories[category.type] = true;

    category.subcategories.forEach((subcategory) => {
      subcategories[subcategory.id] = true;
      subcategory.risks.forEach((risk) => {
        risks[risk.id] = true;
      });
    });

    category.risksWithoutSubcategory.forEach((risk) => {
      risks[risk.id] = true;
    });
  });

  return { categories, subcategories, risks };
};

export const applyRiskFilterToCheckedState = (
  tree: DocumentRiskFilterTreeCategory[],
  filter?: DocumentGenerationRiskFilter | null,
): DocumentRiskFilterCheckedState => {
  const checked = createDefaultRiskFilterCheckedState(tree);

  if (!hasActiveDocumentRiskFilter(filter)) {
    return checked;
  }

  filter.excludedCategoryIds?.forEach((categoryId) => {
    const category = tree.find((item) => item.type === categoryId);
    if (!category) return;

    getCategoryRiskIds(category).forEach((riskId) => {
      checked.risks[riskId] = false;
    });
    checked.categories[categoryId] = false;
  });

  filter.excludedSubcategoryIds?.forEach((subcategoryId) => {
    tree.forEach((category) => {
      const subcategory = category.subcategories.find(
        (item) => item.id === subcategoryId,
      );
      if (!subcategory) return;

      getSubcategoryRiskIds(subcategory).forEach((riskId) => {
        checked.risks[riskId] = false;
      });
      checked.subcategories[subcategoryId] = false;
    });
  });

  filter.excludedRiskFactorIds?.forEach((riskId) => {
    checked.risks[riskId] = false;
  });

  return syncRiskFilterCheckedState(tree, checked);
};

export const getCategoryRiskIds = (category: DocumentRiskFilterTreeCategory) => [
  ...category.risksWithoutSubcategory.map((risk) => risk.id),
  ...category.subcategories.flatMap((subcategory) =>
    subcategory.risks.map((risk) => risk.id),
  ),
];

const getSubcategoryRiskIds = (subcategory: DocumentRiskFilterTreeSubcategory) =>
  subcategory.risks.map((risk) => risk.id);

const countUncheckedRiskIds = (
  riskIds: string[],
  risks: DocumentRiskFilterCheckedState['risks'],
) => riskIds.filter((riskId) => risks[riskId] === false).length;

export const getRiskFilterCategoryCheckState = (
  category: DocumentRiskFilterTreeCategory,
  checked: DocumentRiskFilterCheckedState,
) => {
  const riskIds = getCategoryRiskIds(category);
  const uncheckedCount = countUncheckedRiskIds(riskIds, checked.risks);

  return {
    checked: uncheckedCount === 0,
    indeterminate: uncheckedCount > 0 && uncheckedCount < riskIds.length,
  };
};

export const getRiskFilterSubcategoryCheckState = (
  subcategory: DocumentRiskFilterTreeSubcategory,
  checked: DocumentRiskFilterCheckedState,
) => {
  const riskIds = getSubcategoryRiskIds(subcategory);
  const uncheckedCount = countUncheckedRiskIds(riskIds, checked.risks);

  return {
    checked: uncheckedCount === 0,
    indeterminate: uncheckedCount > 0 && uncheckedCount < riskIds.length,
  };
};

const syncParentCheckState = (
  riskIds: string[],
  risks: DocumentRiskFilterCheckedState['risks'],
): boolean => {
  if (!riskIds.length) return true;

  const uncheckedCount = countUncheckedRiskIds(riskIds, risks);

  if (uncheckedCount === riskIds.length) return false;
  return true;
};

export const syncRiskFilterCheckedState = (
  tree: DocumentRiskFilterTreeCategory[],
  checked: DocumentRiskFilterCheckedState,
): DocumentRiskFilterCheckedState => {
  const next: DocumentRiskFilterCheckedState = {
    categories: { ...checked.categories },
    subcategories: { ...checked.subcategories },
    risks: { ...checked.risks },
  };

  tree.forEach((category) => {
    category.subcategories.forEach((subcategory) => {
      next.subcategories[subcategory.id] = syncParentCheckState(
        getSubcategoryRiskIds(subcategory),
        next.risks,
      );
    });

    next.categories[category.type] = syncParentCheckState(
      getCategoryRiskIds(category),
      next.risks,
    );
  });

  return next;
};

export const buildDocumentRiskFilterFromCheckedState = (
  tree: DocumentRiskFilterTreeCategory[],
  checked: DocumentRiskFilterCheckedState,
): DocumentGenerationRiskFilter | undefined => {
  const synced = syncRiskFilterCheckedState(tree, checked);
  const excludedCategoryIds: RiskEnum[] = [];
  const excludedSubcategoryIds: number[] = [];
  const excludedRiskFactorIds: string[] = [];

  tree.forEach((category) => {
    const categoryRiskIds = getCategoryRiskIds(category);
    const uncheckedCategoryRiskIds = categoryRiskIds.filter(
      (riskId) => synced.risks[riskId] === false,
    );

    if (
      categoryRiskIds.length > 0 &&
      uncheckedCategoryRiskIds.length === categoryRiskIds.length
    ) {
      excludedCategoryIds.push(category.type);
      return;
    }

    category.subcategories.forEach((subcategory) => {
      const subcategoryRiskIds = getSubcategoryRiskIds(subcategory);
      const uncheckedSubcategoryRiskIds = subcategoryRiskIds.filter(
        (riskId) => synced.risks[riskId] === false,
      );

      if (
        subcategoryRiskIds.length > 0 &&
        uncheckedSubcategoryRiskIds.length === subcategoryRiskIds.length
      ) {
        excludedSubcategoryIds.push(subcategory.id);
        return;
      }

      subcategory.risks.forEach((risk) => {
        if (synced.risks[risk.id] === false) {
          excludedRiskFactorIds.push(risk.id);
        }
      });
    });

    category.risksWithoutSubcategory.forEach((risk) => {
      if (synced.risks[risk.id] === false) {
        excludedRiskFactorIds.push(risk.id);
      }
    });
  });

  const filter: DocumentGenerationRiskFilter = {
    mode: 'EXCLUDE',
    ...(excludedCategoryIds.length ? { excludedCategoryIds } : {}),
    ...(excludedSubcategoryIds.length ? { excludedSubcategoryIds } : {}),
    ...(excludedRiskFactorIds.length ? { excludedRiskFactorIds } : {}),
  };

  return hasActiveDocumentRiskFilter(filter) ? filter : undefined;
};

export const countExcludedRisksFromFilter = (
  tree: DocumentRiskFilterTreeCategory[],
  filter?: DocumentGenerationRiskFilter | null,
): number => {
  const checked = applyRiskFilterToCheckedState(tree, filter);

  return Object.values(checked.risks).filter((value) => value === false).length;
};

export const buildDocumentRiskFilterSummary = (
  tree: DocumentRiskFilterTreeCategory[],
  filter?: DocumentGenerationRiskFilter | null,
): string | null => {
  if (!hasActiveDocumentRiskFilter(filter)) return null;

  const categoryLabels =
    filter.excludedCategoryIds?.map(
      (categoryId) => RiskMap[categoryId]?.name ?? categoryId,
    ) ?? [];

  if (categoryLabels.length === 1 && !filter.excludedSubcategoryIds?.length) {
    const onlyCategoryExcluded =
      !filter.excludedRiskFactorIds?.length ||
      countExcludedRisksFromFilter(tree, filter) ===
        tree
          .find((category) => category.type === filter.excludedCategoryIds?.[0])
          ?.subcategories.flatMap((subcategory) => subcategory.risks)
          .concat(
            tree.find((category) => category.type === filter.excludedCategoryIds?.[0])
              ?.risksWithoutSubcategory ?? [],
          ).length;

    if (onlyCategoryExcluded) {
      return `Riscos filtrados: ${categoryLabels[0]} removidos`;
    }
  }

  const removedCount = countExcludedRisksFromFilter(tree, filter);

  if (removedCount === 1) {
    return '1 fator de risco removido';
  }

  if (removedCount > 1) {
    return `${removedCount} fatores de risco removidos`;
  }

  if (categoryLabels.length) {
    return `Riscos filtrados: ${categoryLabels.join(', ')} removidos`;
  }

  return 'Filtro de riscos aplicado';
};

export const toggleRiskFilterCategory = (
  tree: DocumentRiskFilterTreeCategory[],
  checked: DocumentRiskFilterCheckedState,
  categoryType: RiskEnum,
  value: boolean,
): DocumentRiskFilterCheckedState => {
  const category = tree.find((item) => item.type === categoryType);
  if (!category) return checked;

  const next = {
    categories: { ...checked.categories, [categoryType]: value },
    subcategories: { ...checked.subcategories },
    risks: { ...checked.risks },
  };

  category.subcategories.forEach((subcategory) => {
    next.subcategories[subcategory.id] = value;
    subcategory.risks.forEach((risk) => {
      next.risks[risk.id] = value;
    });
  });

  category.risksWithoutSubcategory.forEach((risk) => {
    next.risks[risk.id] = value;
  });

  return syncRiskFilterCheckedState(tree, next);
};

export const toggleRiskFilterSubcategory = (
  tree: DocumentRiskFilterTreeCategory[],
  checked: DocumentRiskFilterCheckedState,
  subcategoryId: number,
  value: boolean,
): DocumentRiskFilterCheckedState => {
  const next = {
    categories: { ...checked.categories },
    subcategories: { ...checked.subcategories, [subcategoryId]: value },
    risks: { ...checked.risks },
  };

  tree.forEach((category) => {
    category.subcategories.forEach((subcategory) => {
      if (subcategory.id !== subcategoryId) return;

      subcategory.risks.forEach((risk) => {
        next.risks[risk.id] = value;
      });
    });
  });

  return syncRiskFilterCheckedState(tree, next);
};

export const toggleRiskFilterRisk = (
  tree: DocumentRiskFilterTreeCategory[],
  checked: DocumentRiskFilterCheckedState,
  riskId: string,
  value: boolean,
): DocumentRiskFilterCheckedState =>
  syncRiskFilterCheckedState(tree, {
    ...checked,
    risks: { ...checked.risks, [riskId]: value },
  });

export const getRiskFilterSubcategoryKey = (subcategoryId?: number) =>
  subcategoryId ?? NO_SUBCATEGORY_KEY;
