export type HierarchySanitizationCategory = 'OFFICE' | 'SUB_OFFICE';
export type HierarchySanitizationStatus = 'ELIGIBLE' | 'BLOCKED';

export type HierarchySanitizationItem = {
  hierarchyId: string;
  name: string;
  type: HierarchySanitizationCategory;
  typeLabel: string;
  parentId: string | null;
  parentName: string | null;
  path: string;
  status: HierarchySanitizationStatus;
  reason: string;
  activeEmployees: number;
  historicalEmployees: number;
  childrenCount: number;
  homoLinkCount: number;
  currentRiskCount: number;
  historicalRiskCount: number;
  directCurrentRiskCount: number;
  directHistoricalRiskCount: number;
  inheritedCurrentRiskCount: number;
  inheritedHistoricalRiskCount: number;
  examHistoryCount: number;
  employeesMissingPrimaryRoleCount: number;
  requiresEmployeeDetach: boolean;
};

export type HierarchySanitizationBrowseResponse = {
  summary: {
    analyzedRoles: number;
    officeWithoutEmployees: number;
    developedWithoutUse: number;
    eligible: number;
    blocked: number;
  };
  data: HierarchySanitizationItem[];
  total: number;
  page: number;
  limit: number;
};

export type HierarchySanitizationBulkResponse = {
  requested: number;
  located: number;
  eligible: number;
  blocked: number;
  ignored: number;
  eligibleOffices: number;
  eligibleDeveloped: number;
  deleted: number;
  dryRun: boolean;
  items: Array<{
    hierarchyId: string;
    name: string;
    type: HierarchySanitizationCategory | '';
    result: 'DELETED' | 'ELIGIBLE' | 'BLOCKED' | 'IGNORED';
    reason: string;
  }>;
};

export type HierarchySanitizationDetailsResponse = {
  hierarchyId: string;
  name: string;
  type: HierarchySanitizationCategory;
  typeLabel: string;
  parentId: string | null;
  parentName: string | null;
  path: string;
  status: HierarchySanitizationStatus;
  reason: string;
  requiresEmployeeDetach: boolean;
  summary: {
    activeEmployees: number;
    historicalEmployees: number;
    childrenCount: number;
    homoLinkCount: number;
    directCurrentRiskCount: number;
    directHistoricalRiskCount: number;
    inheritedCurrentRiskCount: number;
    inheritedHistoricalRiskCount: number;
    examHistoryCount: number;
    employeesMissingPrimaryRoleCount: number;
  };
  employees: Array<{
    employeeId: number;
    employeeName: string;
    primaryRoleId: string | null;
    primaryRoleName: string | null;
    missingPrimaryRole: boolean;
  }>;
  hohLinks: Array<{
    hohId: number;
    homogeneousGroupId: string;
    groupName: string;
    groupType: string | null;
    isActiveLink: boolean;
    characterizationId: string | null;
    characterizationName: string | null;
    characterizationType: string | null;
    currentRiskCount: number;
    historicalRiskCount: number;
  }>;
  risks: Array<{
    riskFactorDataId: string;
    riskId: string;
    riskName: string;
    riskType: string | null;
    isCurrent: boolean;
    origin: 'DIRECT_HIERARCHY' | 'VIA_HOH_ELEMENT';
    elementId: string | null;
    elementName: string | null;
    elementType: string | null;
    blockReason: string;
  }>;
  exams: Array<{
    examHistoryId: number;
    employeeId: number;
    employeeName: string;
    doneDate: string | null;
    examName: string | null;
  }>;
  conclusion: string;
};
