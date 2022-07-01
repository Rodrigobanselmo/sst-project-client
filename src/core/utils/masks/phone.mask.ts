/* eslint-disable @typescript-eslint/no-explicit-any */
import IMask from 'imask';

import { masker } from './index';

export const masked = {
  mask: [
    {
      mask: '(00) 0000-0000',
      phone: 'landline',
    },
    {
      mask: '(00) 00000-0000',
      phone: 'mobile',
    },
  ],
  dispatch: (appended: string, dynamicMasked: IMask.MaskedDynamic | any) => {
    const landlineMask = dynamicMasked.compiledMasks.find(
      ({ phone }: { phone: string }) => phone === 'landline',
    );

    const mobileMask = dynamicMasked.compiledMasks.find(
      ({ phone }: { phone: string }) => phone === 'mobile',
    );

    if (`${dynamicMasked.value}${appended}`.length > landlineMask.mask.length) {
      return mobileMask;
    }

    return landlineMask;
  },
} as IMask.AnyMaskedOptions;

export const phoneMask = masker(masked);
