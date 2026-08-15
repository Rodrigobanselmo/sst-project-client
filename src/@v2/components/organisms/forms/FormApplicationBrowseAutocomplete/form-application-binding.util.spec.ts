import { describe, expect, it } from '@jest/globals';

import { DocumentTypeEnum } from 'project/enum/document.enums';

import {
  documentTypeBindsFormApplication,
  resolveFormApplicationIdForCreate,
  resolveFormApplicationIdForRegenerate,
} from './form-application-binding.util';

describe('form-application-binding', () => {
  it('exposes the picker for FRPS and PGR only', () => {
    expect(documentTypeBindsFormApplication(DocumentTypeEnum.FRPS)).toBe(true);
    expect(documentTypeBindsFormApplication(DocumentTypeEnum.PGR)).toBe(true);
    expect(documentTypeBindsFormApplication(DocumentTypeEnum.PCSMO)).toBe(false);
    expect(documentTypeBindsFormApplication(undefined)).toBe(false);
  });

  it('omits formApplicationId on create when nothing is selected', () => {
    expect(resolveFormApplicationIdForCreate(null)).toBeUndefined();
    expect(resolveFormApplicationIdForCreate('app-1')).toBe('app-1');
  });

  it('sends null on regenerate to clear a previous binding', () => {
    expect(resolveFormApplicationIdForRegenerate(null)).toBeNull();
    expect(resolveFormApplicationIdForRegenerate('app-1')).toBe('app-1');
  });
});
