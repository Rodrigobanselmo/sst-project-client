export type WorkspaceCompanyJsonSectionFields = {
  isFromOtherCnpj?: boolean;
  useCustomSection?: boolean;
  customSectionHTML?: string;
};

export type WorkspaceSectionFlags = {
  isFromOtherCnpj: boolean;
  useCustomSection: boolean;
};

/**
 * Rehydrate the establishment flags from persisted companyJson.
 * Presence of customSectionHTML must not turn useCustomSection back on.
 */
export function hydrateWorkspaceSectionFlags(
  companyJson?: WorkspaceCompanyJsonSectionFields | null,
): WorkspaceSectionFlags {
  return {
    isFromOtherCnpj: companyJson?.isFromOtherCnpj === true,
    useCustomSection: companyJson?.useCustomSection === true,
  };
}

export function mergeWorkspaceCompanyJsonSectionFields<
  T extends WorkspaceCompanyJsonSectionFields,
>(
  companyJson: T | undefined,
  fields: {
    isFromOtherCnpj: boolean;
    useCustomSection: boolean;
    customSectionHTML?: string;
  },
): T & WorkspaceSectionFlags {
  return {
    ...(companyJson as T),
    isFromOtherCnpj: fields.isFromOtherCnpj,
    useCustomSection: fields.useCustomSection,
    ...(fields.customSectionHTML !== undefined && {
      customSectionHTML: fields.customSectionHTML,
    }),
  };
}
