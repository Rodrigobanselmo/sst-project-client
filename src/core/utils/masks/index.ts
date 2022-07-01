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
    const unmasked = unmask(typeof e === 'string' ? e : e.target.value);
    const newValue = mask(unmasked);

    if (typeof e === 'string') {
      return newValue;
    }

    e.target.value = newValue;
  };

  return {
    mask,
    apply,
    unmask,
  };
};
