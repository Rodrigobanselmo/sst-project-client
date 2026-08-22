import deepEqual from 'deep-equal';

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function getFormApplicationEditorSnapshot(
  values: Record<string, any> = {},
) {
  return {
    name: values.name || '',
    description: values.description || '',
    bannerIntroText: values.bannerIntroText || '',
    bannerWhyText: values.bannerWhyText || '',
    bannerContactText: values.bannerContactText || '',
    anonymous: !!values.anonymous,
    shareableLink: values.shareableLink?.value || '',
    participationGoal: values.participationGoal ?? null,
    formId: values.form?.id || '',
    scopeType: values.scopeType?.value || '',
    companyGroupId: values.companyGroup?.id ?? null,
    companyIds: asArray<{ id?: string }>(values.companyIds)
      .map((company) => company?.id)
      .filter(Boolean)
      .sort(),
    workspaceIds: asArray<{ id?: string }>(values.workspaceIds)
      .map((workspace) => workspace?.id)
      .filter(Boolean)
      .sort(),
    sections: asArray<{
      apiId?: string;
      title?: string;
      description?: string;
      items?: unknown;
    }>(values.sections).map((section) => ({
      apiId: section.apiId || '',
      title: section.title || '',
      description: section.description || '',
      items: asArray<{
        apiId?: string;
        content?: string;
        required?: boolean;
        type?: { value?: string };
        options?: unknown;
        risks?: unknown;
      }>(section.items).map((item) => ({
        apiId: item.apiId || '',
        content: item.content || '',
        required: !!item.required,
        type: item.type?.value || '',
        options: asArray<{
          apiId?: string;
          label?: string;
          value?: unknown;
          responseValue?: unknown;
        }>(item.options).map((option) => ({
          apiId: option.apiId || '',
          label: option.label || '',
          value: option.value ?? '',
          responseValue: option.responseValue ?? null,
        })),
        riskIds: asArray<{ id?: string }>(item.risks)
          .map((risk) => risk?.id)
          .filter(Boolean)
          .sort(),
      })),
    })),
  };
}

export function isFormApplicationEditorDirty(
  current: Record<string, any> | undefined,
  baseline: ReturnType<typeof getFormApplicationEditorSnapshot>,
) {
  return !deepEqual(getFormApplicationEditorSnapshot(current || {}), baseline);
}
