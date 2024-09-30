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
  options?: {
    wrapper?: boolean;
    keepOriginal?: boolean;
    beforeWrapper?: string;
    afterWrapper?: string;
    addSpan?: boolean;
  },
) => {
  if (text) {
    let actualLength = 0;
    const varArray: IReplaceAllVarItem[] = [];
    let textReplaced: any = text.split('??').map((variable, index) => {
      if (isOdd(index)) {
        let textVariable = variable;

        if (!options?.keepOriginal) {
          textVariable = variables[variable]
            ? variables[variable].value ||
              variables[variable].label ||
              variables[variable].type
            : variable;
        }

        let transformedVariable = textVariable;
        if (options?.wrapper) {
          if (!options?.beforeWrapper)
            transformedVariable = `@${transformedVariable}`;

          if (options?.beforeWrapper) {
            transformedVariable = `${options.beforeWrapper}${transformedVariable}`;
          }

          if (options?.afterWrapper) {
            transformedVariable = `${transformedVariable}${options.afterWrapper}`;
          }
        }

        varArray.push({
          variable: textVariable,
          wrapperVariable: transformedVariable,
          data: variables[variable],
          offset: actualLength,
          length: transformedVariable.length,
        });

        actualLength = actualLength + transformedVariable.length;
        if (options?.addSpan)
          // eslint-disable-next-line react/jsx-key
          return <span style={{ color: 'blue' }}>{transformedVariable}</span>;

        return transformedVariable;
      }

      actualLength = actualLength + variable.length;

      // eslint-disable-next-line react/jsx-key
      if (options?.addSpan) return <span>{variable}</span>;

      return variable;
    });

    if (!options?.addSpan) textReplaced = textReplaced.join('');
    return {
      text: textReplaced as string | JSX.Element[],
      variables: varArray,
    };
  }

  return { text, variables: [] };
};
