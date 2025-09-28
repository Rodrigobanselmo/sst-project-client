import { IStringTransformationType } from '../string-transformation';

export const maskPhone: IStringTransformationType = (value) => {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '');

  // Don't allow empty or invalid phone numbers
  if (!numbers || numbers.length === 0) {
    return '';
  }

  // Limit to maximum 11 digits (Brazilian phone format)
  const limitedNumbers = numbers.slice(0, 11);

  // Apply progressive masking based on current length
  if (limitedNumbers.length <= 2) {
    // Just area code: (XX
    return `(${limitedNumbers}`;
  } else if (limitedNumbers.length <= 6) {
    // Area code + partial number: (XX) XXXX
    return limitedNumbers.replace(/(\d{2})(\d{1,4})/, '($1) $2');
  } else if (limitedNumbers.length <= 10) {
    // Landline format: (XX) XXXX-XXXX
    return limitedNumbers.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
  } else {
    // Mobile format: (XX) XXXXX-XXXX
    return limitedNumbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
};
