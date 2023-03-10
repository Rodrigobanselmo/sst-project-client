import { IDocVariables } from 'core/interfaces/api/IDocumentModel';
import { isOdd } from 'core/utils/helpers/isOdd';

export interface IReplaceAllVarItem {
  data: IDocVariables['string'];
  offset: number;
  length: number;
  variable: string;
  wrapperVariable: string;
}

export const replaceAllVariables = (
  text: string,
  variables: IDocVariables,
  options?: { wrapper?: boolean },
) => {
  if (text) {
    let actualLength = 0;
    const varArray: IReplaceAllVarItem[] = [];
    const textReplaced = text
      .split('??')
      .map((variable, index) => {
        if (isOdd(index)) {
          const textVariable = variables[variable]
            ? variables[variable].value ||
              variables[variable].label ||
              variables[variable].type
            : variable;

          let transformedVariable = textVariable;
          if (options?.wrapper) transformedVariable = `@${transformedVariable}`;

          varArray.push({
            variable: textVariable,
            wrapperVariable: transformedVariable,
            data: variables[variable],
            offset: actualLength,
            length: transformedVariable.length,
          });

          actualLength = actualLength + transformedVariable.length;
          return transformedVariable;
        }

        actualLength = actualLength + variable.length;
        return variable;
      })
      .join('');
    return { text: textReplaced, variables: varArray };
  }

  return { text, variables: [] };
};
