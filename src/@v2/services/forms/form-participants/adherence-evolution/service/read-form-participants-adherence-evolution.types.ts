export type ReadFormParticipantsAdherenceEvolutionFilters = {
  search?: string;
  hierarchyIds?: string[];
  workspaceIds?: string[];
};

export type ReadFormParticipantsAdherenceEvolutionParams = {
  companyId: string;
  applicationId: string;
  filters?: ReadFormParticipantsAdherenceEvolutionFilters;
};
