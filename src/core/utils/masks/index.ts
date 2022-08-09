/* eslint-disable @typescript-eslint/no-explicit-any */
import IMask from 'imask';

export const masker = (masked: IMask.AnyMasked | any) => {
  const mask = IMask.createPipe(masked);

  const unmask = IMask.createPipe(
    masked,
    IMask.PIPE_TYPE.MASKED,
    IMask.PIPE_TYPE.UNMASKED,
  );

  const apply = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | string,
  ) => {
    if (typeof e !== 'string' && !e) return e;
    if (typeof e !== 'string' && !e.target?.value) return e;

    const unmasked = unmask(typeof e === 'string' ? e : e.target.value);
    const newValue = mask(unmasked);

    if (typeof e === 'string') {
      return newValue;
    }

    e.target.value = newValue;
  };

  return {
    mask: (value: string) => (value ? mask(value) : ''),
    apply,
    unmask,
  };
};
