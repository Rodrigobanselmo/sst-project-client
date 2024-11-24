export type IStringTransformationType = (v: string) => string;

export type IStringTransformationsType =
  | IStringTransformationType
  | IStringTransformationType[];

export const stringTransformations = (
  value: string,
  transformation: IStringTransformationsType,
) => {
  if (Array.isArray(transformation)) {
    return transformation.reduce((acc, func) => func(acc), value);
  } else if (transformation instanceof Function) {
    return transformation(value);
  }
  return value;
};
