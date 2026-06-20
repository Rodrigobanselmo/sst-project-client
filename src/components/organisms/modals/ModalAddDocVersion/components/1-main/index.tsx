/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
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
import {
  CREATION_DATE_LOCKED_MESSAGE,
  DOCUMENT_VERSION_FAMILY_OPTIONS,
} from '../../helpers/document-dates.helpers';
import { formatRevisionDisplayLabel } from '../../helpers/document-version.helpers';
import { modalDatePickerCalendarProps } from '../../constants/date-picker-props';
import { DocumentFiltersModal } from './components/DocumentFiltersModal';
import { DocumentRiskFilterModal } from './components/DocumentRiskFilterModal';
import { DocumentAppliedFiltersSummary } from './components/DocumentAppliedFiltersSummary';
import { DocumentAppliedRiskFilterSummary } from './components/DocumentAppliedRiskFilterSummary';
import { SignatureAndValidation } from './components/SignatureAndValidation';
import { useMainStep } from './hooks/useMainStep';
import { SButton } from 'components/atoms/SButton';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { useDocumentRiskFilterRisks } from './hooks/useDocumentRiskFilterRisks';
import {
  buildDocumentRiskFilterSummary,
  buildDocumentRiskFilterTree,
} from './helpers/document-risk-filter.helpers';

export const MainModalStep = (props: IUseMainActionsModal) => {
  const propsStep = useMainStep(props);
  const {
    onSubmit,
    control,
    onCloseUnsaved,
    loading,
    setValue,
    company,
    creationDateLocked,
    nextVersion,
    onVersionFamilyChange,
    documentFilters,
    setDocumentFilters,
    clearDocumentFilters,
    removeDocumentFilterItem,
    riskFilter,
    setRiskFilter,
    clearRiskFilter,
    isRegenerateMode,
    lockedVersion,
    missingGenerationSnapshot,
  } = propsStep;

  const { data, setData, type } = props;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [riskFiltersOpen, setRiskFiltersOpen] = useState(false);
  const isPgrDocument = type === DocumentTypeEnum.PGR;
  const scopeIds = useMemo(
    () => documentFilters.selecteds.map((item) => item.id),
    [documentFilters.selecteds],
  );
  const { risks: contextualPgrRisks } = useDocumentRiskFilterRisks({
    companyId: data.companyId,
    workspaceId: data.workspaceId,
    scopeIds,
    enabled: isPgrDocument,
  });
  const riskFilterSummary = useMemo(() => {
    if (!isPgrDocument || !riskFilter) return null;

    return buildDocumentRiskFilterSummary(
      buildDocumentRiskFilterTree(contextualPgrRisks),
      riskFilter,
    );
  }, [contextualPgrRisks, isPgrDocument, riskFilter]);

  const creationDefaultDate = useMemo(() => {
    const raw =
      (data as { documentCreatedAt?: string | Date | null })
        ?.documentCreatedAt ?? data?.validityStart;
    if (!raw) return undefined;

    const parsed = raw instanceof Date ? raw : new Date(raw);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }, [
    (data as { documentCreatedAt?: string | Date | null })?.documentCreatedAt,
    data?.validityStart,
  ]);

  const emissionDefaultDate = useMemo(() => {
    const raw = (data as { documentDate?: string | Date | null })?.documentDate;
    if (!raw) return creationDefaultDate;

    const parsed = raw instanceof Date ? raw : new Date(raw);
    return Number.isNaN(parsed.getTime()) ? creationDefaultDate : parsed;
  }, [
    (data as { documentDate?: string | Date | null })?.documentDate,
    creationDefaultDate,
  ]);
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
      text: isRegenerateMode ? 'Salvar e regerar' : 'Criar versão',
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <div>
      <AnimatedStep>
        <SFlex gap={8} direction="column" mt={8}>
          {!isRegenerateMode && (
            <RadioForm
              setValue={setValue}
              defaultValue={data.versionFamily ?? 'test'}
              label="Família da versão"
              control={control}
              name="versionFamily"
              options={[...DOCUMENT_VERSION_FAMILY_OPTIONS]}
              onChange={(e) => {
                onVersionFamilyChange(e.target.value as 'test' | 'official');
              }}
            />
          )}

          <SFlex direction="column" gap={2}>
            <SText color="text.label" fontSize={14}>
              {isRegenerateMode ? 'Revisão selecionada' : 'Próxima versão'}
            </SText>
            <SText fontSize={18} fontWeight={500}>
              {formatRevisionDisplayLabel(
                isRegenerateMode
                  ? lockedVersion ?? '0.0.0'
                  : nextVersion ?? '0.0.0',
              )}
            </SText>
          </SFlex>

          {missingGenerationSnapshot && (
            <SText color="warning.main" fontSize={13}>
              Esta revisão não possui filtros salvos. Selecione os filtros antes
              de regerar para preservar o recorte desejado.
            </SText>
          )}

          <InputForm
            setValue={setValue}
            defaultValue={data?.name}
            label="Nome do documento"
            control={control}
            placeholder={'nome do documento...'}
            name="name"
            size="small"
            smallPlaceholder
            firstLetterCapitalize
          />

          <InputForm
            label="Descrição da revisão*"
            minRows={2}
            setValue={setValue}
            maxRows={4}
            control={control}
            placeholder={'ex.: Primeira emissão, Revisão anual...'}
            name="doc_description"
            defaultValue={(data as { doc_description?: string }).doc_description}
            size="small"
            smallPlaceholder
            multiline
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
            <DatePickerForm
              label="Data de criação do documento"
              setValue={setValue}
              control={control}
              {...(creationDefaultDate ? { defaultValue: creationDefaultDate } : {})}
              name="documentCreatedAt"
              superSmall
              uneditable={creationDateLocked}
              calendarProps={modalDatePickerCalendarProps}
              unmountOnChangeDefault={false}
            />
            {creationDateLocked && (
              <SText color="text.secondary" fontSize={11} sx={{ mt: -3 }}>
                {CREATION_DATE_LOCKED_MESSAGE}
              </SText>
            )}
            <DatePickerForm
              label="Data de emissão do documento"
              setValue={setValue}
              control={control}
              {...(emissionDefaultDate ? { defaultValue: emissionDefaultDate } : {})}
              name="documentDate"
              superSmall
              calendarProps={modalDatePickerCalendarProps}
              unmountOnChangeDefault={false}
            />
          </Box>

          <SignatureAndValidation {...propsStep} />

          <Box>
            <SFlex gap={4} flexWrap="wrap">
              <SButton variant="outlined" onClick={() => setFiltersOpen(true)}>
                Selecionar filtros
              </SButton>
              {isPgrDocument && (
                <SButton variant="outlined" onClick={() => setRiskFiltersOpen(true)}>
                  Filtrar riscos
                </SButton>
              )}
            </SFlex>
            <SText color="text.secondary" fontSize={12} mt={4}>
              Opcional. Sem filtros, o documento será gerado completo.
            </SText>
            <DocumentAppliedFiltersSummary
              selection={documentFilters}
              onRemoveItem={removeDocumentFilterItem}
              onClear={clearDocumentFilters}
            />
            {isPgrDocument && (
              <DocumentAppliedRiskFilterSummary
                summary={riskFilterSummary}
                onClear={clearRiskFilter}
              />
            )}
          </Box>

          <InputForm
            sx={{ display: 'none' }}
            setValue={setValue}
            control={control}
            name="version"
            defaultValue={nextVersion}
          />
        </SFlex>
      </AnimatedStep>

      <DocumentFiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onConfirm={setDocumentFilters}
        selection={documentFilters}
        companyId={data.companyId}
        workspaceId={data.workspaceId}
      />

      {isPgrDocument && (
        <DocumentRiskFilterModal
          open={riskFiltersOpen}
          onClose={() => setRiskFiltersOpen(false)}
          onConfirm={setRiskFilter}
          value={riskFilter}
          companyId={data.companyId}
          workspaceId={data.workspaceId}
          scopeIds={scopeIds}
        />
      )}

      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </div>
  );
};
