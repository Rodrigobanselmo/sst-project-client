import catalog from './copsoq-long-dimensions.json';

export type FormIndicatorHierarchy = {
  mode: 'scales' | 'dimensions';
  sectionAssignments?: FormDimensionSectionAssignment[];
  blocks: {
    groupId: string;
    name: string;
    dimensions: {
      id: string;
      name: string;
      sectionId?: string;
      questionIds?: string[];
    }[];
  }[];
};

export function resolveFormIndicatorHierarchy(
  formId: string,
  saved?: FormIndicatorHierarchy,
): FormIndicatorHierarchy | undefined {
  if (saved) return saved;
  if (formId === catalog.formId)
    return { mode: 'scales', blocks: catalog.blocks };
  if (formId === catalog.dimensionFormId)
    return { mode: 'dimensions', blocks: catalog.blocks };
  return undefined;
}

export type FormDimensionSectionAssignment = {
  dimensionId: string;
  sectionId: string;
};
