import deepEqual from 'deep-equal';

export function getFormModelEditorSnapshot(values: Record<string, any> = {}) {
  return {
    title: values.title || '',
    description: values.description || '',
    anonymous: !!values.anonymous,
    shareableLink: values.shareableLink?.value || '',
    type: values.type?.value || '',
    sections: (values.sections || []).map((section) => ({
      apiId: section.apiId || '',
      title: section.title || '',
      description: section.description || '',
      items: (section.items || []).map((item) => ({
        apiId: item.apiId || '',
        content: item.content || '',
        required: !!item.required,
        type: item.type?.value || '',
        options: (item.options || []).map((option) => ({
          apiId: option.apiId || '',
          label: option.label || '',
          value: option.value?.value ?? null,
        })),
        riskIds: (item.risks || []).map((risk) => risk.id).sort(),
      })),
    })),
  };
}

export function isFormModelEditorDirty(
  current: Record<string, any> | undefined,
  baseline: ReturnType<typeof getFormModelEditorSnapshot>,
) {
  return !deepEqual(getFormModelEditorSnapshot(current || {}), baseline);
}
