/* eslint-disable @typescript-eslint/no-explicit-any */
import { Children, cloneElement, FC, isValidElement, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Wizard as ReactWizard } from 'react-use-wizard';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';

import { mergeValidationSchemas } from 'core/utils/helpers/mergeValidationSchemas';

import { IWizardLeadProps } from './types';

const resolver = (schemas: any[]) =>
  yupResolver(mergeValidationSchemas(...schemas));

export const Wizard: FC<IWizardLeadProps> = ({ children, header, schemas }) => {
  const prevStepRef = useRef<number>(0);
  const methods = useForm({ resolver: resolver(schemas) });

  const childrenWithProps = Children.map(children, (child) => {
    if (isValidElement(child)) {
      return cloneElement(child, { prevStepRef: prevStepRef });
    }
    return child;
  });
  return (
    <FormProvider {...methods}>
      <ReactWizard header={header}>{childrenWithProps}</ReactWizard>
    </FormProvider>
  );
};
