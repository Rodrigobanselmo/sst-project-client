import { onlyNumbers } from '@brazilian-utils/brazilian-utils';
import { IStringTransformationType } from '../string-transformation';

export interface NumberLimitsOptions {
  min?: number;
  max?: number;
}

export const createMaskOnlyNumberWithLimits = (
  options: NumberLimitsOptions = {},
): IStringTransformationType => {
  const { min, max } = options;

  return (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbersOnly = onlyNumbers(value);

    // Se não há números, retorna string vazia
    if (!numbersOnly) return '';

    // Converte para número para validar limites
    const numValue = parseInt(numbersOnly, 10);

    // Se há limite mínimo e o valor é menor, retorna o mínimo
    if (min !== undefined && numValue < min) {
      return min.toString();
    }

    // Se há limite máximo e o valor é maior, retorna o máximo
    if (max !== undefined && numValue > max) {
      return max.toString();
    }

    return numbersOnly;
  };
};

// Máscara específica para percentual (1-100)
export const maskPercentage: IStringTransformationType =
  createMaskOnlyNumberWithLimits({
    min: 1,
    max: 100,
  });
