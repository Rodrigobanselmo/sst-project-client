import { IDocVariables } from 'core/interfaces/api/IDocumentModel';
import { isOdd } from 'core/utils/helpers/isOdd';

export const replaceAllVariables = (
  text: string,
  variables: IDocVariables,
  options?: { wrapper?: boolean },
) => {
  if (text) {
    return text
      .split('??')
      .map((variable, index) => {
        if (isOdd(index)) {
          const var_ = variables[variable]
            ? variables[variable].value ||
              variables[variable].label ||
              variables[variable].type
            : variable;

          if (options?.wrapper) return `{{${var_}}}`;
          return var_;
        }

        return variable;
      })
      .join('');
  }

  return text;
};
