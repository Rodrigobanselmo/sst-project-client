/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import { InputForm } from 'components/molecules/form/input';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { DocumentModelSelect } from 'components/organisms/inputSelect/DocumentModelSelect/DocumentModelSelect';
import { DocumentModelPgrClassificationFilters } from 'components/organisms/tables/DocumentModelTable/DocumentModelPgrClassificationFilters';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import {
  DocumentModelClassificationEnum,
  documentModelMatchesClassificationFilters,
  filterClassificationsForDocumentType,
} from 'project/enum/document-model-classification.enum';

import { IUseMainActionsModal } from '../../hooks/useMainActions';
import { IUsePGRHandleModal } from '../../hooks/usePGRHandleActions';
import { SignatureAndValidation } from './components/SignatureAndValidation';
import { useMainStep } from './hooks/useMainStep';

export const MainModalStep = (props: IUseMainActionsModal) => {
  const propsStep = useMainStep(props);
  const { onSubmit, control, onCloseUnsaved, loading, setValue, company } =
    propsStep;

  const { data, setData, type } = props;
  const [classificationFilters, setClassificationFilters] = useState<
    DocumentModelClassificationEnum[]
  >([]);

  const modelQuery = useMemo(
    () => ({
      type,
      ...(classificationFilters.length > 0 && {
        classifications: classificationFilters,
      }),
    }),
    [type, classificationFilters],
  );

  const handleClassificationFiltersChange = (
    next: DocumentModelClassificationEnum[],
  ) => {
    const filtered = type
      ? filterClassificationsForDocumentType(next, type)
      : next;
    setClassificationFilters(filtered);

    setData((current) => {
      if (
        !current.model ||
        documentModelMatchesClassificationFilters(
          current.model.classifications,
          filtered,
        )
      ) {
        return current;
      }

      setValue('model', null);
      return { ...current, modelId: undefined, model: undefined };
    });
  };

  const buttons = [
    {},
    {
      text: 'Confirmar Dados',
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <div>
      <AnimatedStep>
        <SFlex gap={8} direction="column" mt={8}>
          <InputForm
            setValue={setValue}
            defaultValue={data?.name}
            multiline
            minRows={2}
            maxRows={4}
            label="Descrição"
            control={control}
            placeholder={'descrição...'}
            name="name"
            size="small"
            smallPlaceholder
            firstLetterCapitalize
          />

          {type && (
            <Box sx={{ ml: 0, '& > div': { ml: 0 } }}>
              <DocumentModelPgrClassificationFilters
                documentType={type}
                active={classificationFilters}
                onChange={handleClassificationFiltersChange}
              />
            </Box>
          )}

          <Box mb={5} mt={3} maxWidth={['400px']}>
            <DocumentModelSelect
              key={classificationFilters.join(',') || 'all'}
              fullWidth
              onChange={(data) => {
                setData((d) => ({
                  ...d,
                  modelId: data ? data.id : undefined,
                  model: data,
                }));
              }}
              query={modelQuery}
              inputProps={{
                labelPosition: 'top',
                placeholder: 'selecione...',
              }}
              unmountOnChangeDefault
              defaultValue={data?.model}
              name="model"
              label={'Selecionar modelo de documento'}
              control={control}
            />
          </Box>

          <Box
            mt={5}
            sx={{
              gap: 10,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))',
            }}
          >
            <InputForm
              setValue={setValue}
              defaultValue={data?.elaboratedBy}
              label="Elabora por*"
              control={control}
              placeholder={'nome do elaborador do documento...'}
              name="elaboratedBy"
              size="small"
              smallPlaceholder
              inputProps={{
                textTransform: 'capitalize',
              }}
            />
            <InputForm
              setValue={setValue}
              defaultValue={data?.revisionBy}
              label="Revisado por (opcional)"
              control={control}
              placeholder={' nome do resonsável pela revisão do documento...'}
              name="revisionBy"
              size="small"
              smallPlaceholder
              inputProps={{
                textTransform: 'capitalize',
              }}
            />
            <InputForm
              setValue={setValue}
              defaultValue={data?.approvedBy}
              label="Aprovado por (opcional)"
              control={control}
              placeholder={'nome de quem aprovou o documento...'}
              name="approvedBy"
              size="small"
              smallPlaceholder
              inputProps={{
                textTransform: 'capitalize',
              }}
            />
            <InputForm
              setValue={setValue}
              defaultValue={data?.coordinatorBy}
              label="Coordenador do programa (opcional)"
              control={control}
              placeholder={'pessoa responsavél por operacionalizar o PRG...'}
              name="coordinatorBy"
              size="small"
              smallPlaceholder
              inputProps={{
                textTransform: 'capitalize',
              }}
            />
            <InputForm
              setValue={setValue}
              defaultValue={
                (data as any)?.json?.legalResponsibleBy ||
                company?.responsibleName ||
                ''
              }
              label="Responsável legal da empresa"
              control={control}
              placeholder={'nome do responsável legal...'}
              name="legalResponsibleBy"
              size="small"
              smallPlaceholder
              inputProps={{
                textTransform: 'capitalize',
              }}
            />
          </Box>

          <SignatureAndValidation {...propsStep} />
        </SFlex>
      </AnimatedStep>
      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </div>
  );
};
