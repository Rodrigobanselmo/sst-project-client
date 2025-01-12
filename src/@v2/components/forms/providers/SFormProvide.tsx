import React from 'react';
import { FormProvider, UseFormReturn } from 'react-hook-form';

interface IForm {
  form: UseFormReturn<any, any>;
  children: React.ReactNode;
}
export const SForm: React.FC<IForm> = (props) => {
  const { form } = props;

  return (
    <FormProvider {...form}>
      <form>{props.children}</form>
    </FormProvider>
  );
};
