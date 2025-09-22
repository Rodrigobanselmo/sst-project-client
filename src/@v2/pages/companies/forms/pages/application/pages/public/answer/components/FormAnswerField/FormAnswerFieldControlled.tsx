import { Box } from '@mui/material';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SDatePickerForm } from '@v2/components/forms/controlled/SDatePickerForm/SDatePickerForm';
import { SInputForm } from '@v2/components/forms/controlled/SInputForm/SInputForm';
import { SRadioCheckboxForm } from '@v2/components/forms/controlled/SRadioCheckboxForm/SRadioCheckboxForm';
import { SRadioForm } from '@v2/components/forms/controlled/SRadioForm/SRadioForm';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { SSelectForm } from '@v2/components/forms/controlled/SSelectForm/SSelectForm';
import { useSearch } from '@v2/hooks/useSearch';
import { FormIdentifierTypeEnum } from '@v2/models/form/enums/form-identifier-type.enum';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import { FormQuestionReadModel } from '@v2/models/form/models/shared/form-question-read.model';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import React, { useState } from 'react';

type HierarchyOption = {
  id: string;
  name: string;
  type: HierarchyTypeEnum;
  parentId: string;
};

type TransformedHierarchy = {
  id: string;
  text: string;
  value: string;
};

const transformSectorHierarchies = (hierarchies: HierarchyOption[]): TransformedHierarchy[] => {
  // Create a map of hierarchies by ID for quick lookup
  const hierarchyMap = new Map(
    hierarchies.map(hierarchy => [hierarchy.id, hierarchy])
  );

  // Function to build hierarchy chain by following parentId
  const buildHierarchyChain = (hierarchyId: string): string[] => {
    const chain: string[] = [];
    let currentHierarchy = hierarchyMap.get(hierarchyId);

    while (currentHierarchy) {
      // Only add to chain if it's not a SUB_SECTOR
      if (currentHierarchy.type !== HierarchyTypeEnum.SUB_SECTOR) {
        chain.unshift(currentHierarchy.name); // Add to beginning of array
      }
      currentHierarchy = currentHierarchy.parentId
        ? hierarchyMap.get(currentHierarchy.parentId)
        : undefined;
    }

    return chain;
  };

  // Filter hierarchies to only include SECTOR type and transform them
  return hierarchies
    .filter(hierarchy => hierarchy.type === HierarchyTypeEnum.SECTOR)
    .map(hierarchy => {
      const hierarchyChain = buildHierarchyChain(hierarchy.id);
      const concatenatedName = hierarchyChain.join(' > ');

      return {
        id: hierarchy.id,
        text: concatenatedName,
        value: hierarchy.id
      };
    })
    .sort((a, b) => a.text.localeCompare(b.text));
};

interface FormAnswerFieldControlledProps {
  question: FormQuestionReadModel;
  name: string;
  options: {
    hierarchies: {
      id: string;
      name: string;
      type: HierarchyTypeEnum;
      parentId: string;
  }[];
  };
}

export const FormAnswerFieldControlled: React.FC<FormAnswerFieldControlledProps> = ({
  question,
  name,
  options,
}) => {
  const { type,identifierType } = question.details;

  const fieldMap: Record<FormQuestionTypeEnum, React.ReactNode> = {
    [FormQuestionTypeEnum.SHORT_TEXT]:  <SInputForm
            name={name}
            fullWidth
            placeholder="Digite a resposta..."
          />,
    [FormQuestionTypeEnum.LONG_TEXT]:  <SInputForm
            name={name}
            fullWidth
            placeholder="Digite a resposta..."
            textFieldProps={{ multiline: true, rows: 4 }}
          />,
    [FormQuestionTypeEnum.NUMBER]: <SInputForm
            name={name}
            type="number"
          />,
    [FormQuestionTypeEnum.DATE]: <SDatePickerForm
            name={name}
          />,
    [FormQuestionTypeEnum.SELECT]: <SSelectForm
            name={name}
            options={question.options}
            getOptionLabel={(option) => option.text}
            getOptionValue={(option) => option.value?.toString() || option.text}
          />,
    [FormQuestionTypeEnum.RADIO]: <SRadioForm
            name={name}
            options={question.options}
            getOptionLabel={(option) => option.text}
            getOptionValue={(option) => option.id}
          />,
    [FormQuestionTypeEnum.CHECKBOX]: <SRadioCheckboxForm
            name={name}
            options={question.options}
            getOptionLabel={(option) => option.text}
            getOptionValue={(option) => option.value?.toString() || option.text}
          />,
    [FormQuestionTypeEnum.TEXT]: <SInputForm
            name={name}
            fullWidth
            placeholder="Digite a resposta..."
          />,
    [FormQuestionTypeEnum.SYSTEM]: <SInputForm
            name={name}
            fullWidth
            placeholder="Digite a resposta..."
          />,
  };

  const renderField = () => {
      if (identifierType === FormIdentifierTypeEnum.SECTOR) {
        return <FormAnswerFieldControlledSector
              name={name}
              options={options}
              question={question}
            />;
      }

      return fieldMap[type];
  };
  
  return renderField();
}; 

const FormAnswerFieldControlledSector = ({  name, options }: FormAnswerFieldControlledProps) => {
  const transformedHierarchies = transformSectorHierarchies(options.hierarchies);

    const { results, onSearch } = useSearch({
      data: transformedHierarchies,
      keys: ['text'],
      threshold: 0.2,
    });

  return (
    <SSearchSelectForm
        name={name}
        placeholder="Selecione o setor..."
        options={results}
        onSearch={onSearch}
        getOptionLabel={(option) => option.text}
        renderItem={(option) => {
          const hierarchyChain = option.label.split(' > ');
          const lastHierarchy = hierarchyChain[hierarchyChain.length - 1];
          const restOfHierarchies = hierarchyChain.slice(0, -1).join(' > ');
          
          return (
            <SFlex sx={{ flexDirection: 'column' }}>
              <SText fontSize="11px !important" color="gray.500" sx={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word' }}>{restOfHierarchies}</SText>
              <SText fontSize="13px !important" width="100%" sx={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word' }}>{lastHierarchy}</SText>
            </SFlex>
          );
        }}
        getOptionValue={(option) => option.value}
      />
  );
}; 