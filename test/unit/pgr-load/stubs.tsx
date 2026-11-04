import React from 'react';
export const api = { get: async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('fixture failure');
  return { data: await response.json() };
}};
export function SAutocompleteSelect(props: any) {
  return <><span data-testid="selected">{props.value?.label || ''}</span><span data-testid="options">{props.options.length}</span><span>{props.errorMessage}</span></>;
}
