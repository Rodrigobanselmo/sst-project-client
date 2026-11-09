import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { FormStructureDialog } from '@v2/pages/companies/forms/components/FormContent/components/FormStructuresContent/FormStructureDialog';
import {
  FormStructure,
  FormStructureInput,
  FormStructureMode,
  useFormStructures,
} from '@v2/services/forms/form-structures/form-structures.service';
import { validateFormOptions } from '@v2/pages/companies/forms/utils/validate-form-options';
import { useAddFormModel } from '@v2/services/forms/form/add-form-model/hooks/useAddFormModel';
import { useForm } from 'react-hook-form';
import { FormModelInfo } from '../../../../components/FormModelInfo/FormModelInfo';
import { FormQuestionsButtons } from '../../../../../../components/FormQuestionsButtons/FormQuestionsButtons';
import {
  formModelFormsInitialValues,
  IFormModelForms,
  getFormSectionInitialValues,
  schemaFormModelForms,
} from '../../../../schemas/form-model.schema';
import { useAppRouter } from '@v2/hooks/useAppRouter';
import { PageRoutes } from '@v2/constants/pages/routes';
import { FormModelGroup } from '../../../../components/FormModelGroup/FormModelGroup';
import { transformFormDataToApiFormat } from '../../../../helpers/transform-form-model-data';

const hasText = (value?: string) =>
  !!value?.replace(/<[^>]*>|&nbsp;/g, '').trim();

export const FormModelAddContent = ({ companyId }: { companyId: string }) => {
  const router = useAppRouter();
  const form = useForm<IFormModelForms>({
    resolver: yupResolver(schemaFormModelForms),
    defaultValues: formModelFormsInitialValues,
  });

  const psychosocial = form.watch('type')?.value === FormTypeEnum.PSYCHOSOCIAL;
  const library = useFormStructures(companyId, psychosocial);
  const [structure, setStructure] = useState<
    FormStructure | FormStructureInput
  >();
  const [mode, setMode] = useState<FormStructureMode>('scales');
  const [active, setActive] = useState(false);
  const [customDialog, setCustomDialog] = useState(false);
  const [setupError, setSetupError] = useState('');
  const sections = form.watch('sections');
  const usedGroups = new Set(
    sections.flatMap(
      ({ structureGroupIds, structureGroupId }) =>
        structureGroupIds ?? (structureGroupId ? [structureGroupId] : []),
    ),
  );
  const linkOptions =
    structure?.scales.flatMap((scale) =>
      mode === 'scales'
        ? [{ id: scale.id, name: scale.name }]
        : scale.dimensions.map(({ id, name }) => ({
            id,
            name: `${scale.name} / ${name}`,
          })),
    ) ?? [];
  const unlinkedGroups = linkOptions.filter(({ id }) => !usedGroups.has(id));

  const addSections = () => {
    if (!structure || !unlinkedGroups.length) return;
    const current = form.getValues('sections');
    const [initialSection] = current;
    const initialQuestion = initialSection?.items[0];
    const isUntouched =
      current.length === 1 &&
      !(
        initialSection.structureGroupIds ??
        (initialSection.structureGroupId
          ? [initialSection.structureGroupId]
          : [])
      ).length &&
      initialSection.items.length === 1 &&
      !hasText(initialSection.title) &&
      !hasText(initialSection.description) &&
      !hasText(initialQuestion.content) &&
      !initialQuestion.required &&
      !initialQuestion.risks?.length &&
      initialQuestion.type.value ===
        formModelFormsInitialValues.sections[0].items[0].type.value &&
      initialQuestion.options?.length ===
        formModelFormsInitialValues.sections[0].items[0].options?.length &&
      !initialQuestion.options?.some(
        ({ label, value }) => label.trim() || value?.value != null,
      );
    const groups = new Map(
      structure.scales.flatMap((scale) =>
        mode === 'scales'
          ? [[scale.id, scale.name] as const]
          : scale.dimensions.map(({ id, name }) => [id, name] as const),
      ),
    );
    const added = unlinkedGroups.map(({ id }) => ({
      ...getFormSectionInitialValues(),
      structureGroupIds: [id],
      title: groups.get(id)!,
    }));
    form.setValue('sections', isUntouched ? added : [...current, ...added], {
      shouldDirty: true,
    });
    setActive(true);
    setSetupError('');
  };

  const linkSection = (sectionIndex: number, groupIds: string[]) => {
    const section = form.getValues(`sections.${sectionIndex}`);
    const dimensionIds = new Set(
      mode === 'dimensions'
        ? groupIds
        : structure?.scales
            .filter(({ id }) => groupIds.includes(id))
            .flatMap(({ dimensions }) => dimensions.map(({ id }) => id)),
    );
    section.items.forEach(({ dimensionId }, questionIndex) => {
      if (dimensionId && !dimensionIds.has(dimensionId)) {
        form.setValue(
          `sections.${sectionIndex}.items.${questionIndex}.dimensionId`,
          '',
          {
            shouldDirty: true,
          },
        );
      }
    });
    form.setValue(`sections.${sectionIndex}.structureGroupIds`, groupIds, {
      shouldDirty: true,
    });
    form.clearErrors(`sections.${sectionIndex}.structureGroupIds`);
    setSetupError('');
    setActive(true);
  };

  const addFormMutation = useAddFormModel();

  const onSubmit = async (data: IFormModelForms) => {
    form.clearErrors();

    const hasValidationErrors = validateFormOptions(data, form);

    if (hasValidationErrors) return;

    const apiData = transformFormDataToApiFormat(data, companyId);
    if (psychosocial && structure) {
      let missingSection = false;
      data.sections.forEach((section, index) => {
        const groupIds =
          section.structureGroupIds ??
          (section.structureGroupId ? [section.structureGroupId] : []);
        if (groupIds.length) return;
        missingSection = true;
        form.setError(`sections.${index}.structureGroupIds`, {
          message:
            mode === 'scales'
              ? 'Vincule ao menos uma escala à seção'
              : 'Vincule ao menos uma dimensão à seção',
        });
      });
      if (missingSection) {
        setSetupError('Preencha os vínculos nas seções destacadas.');
        return;
      }

      let missingDimension = false;
      data.sections.forEach((section, sectionIndex) => {
        const groupIds =
          section.structureGroupIds ??
          (section.structureGroupId ? [section.structureGroupId] : []);
        if (mode === 'dimensions' && groupIds.length === 1) return;
        section.items.forEach((item, questionIndex) => {
          if (item.dimensionId) return;
          missingDimension = true;
          form.setError(
            `sections.${sectionIndex}.items.${questionIndex}.dimensionId`,
            { message: 'Selecione a dimensão da pergunta' },
          );
        });
      });
      if (missingDimension) return;

      apiData.structureMode = mode;
      if ('id' in structure) apiData.structureId = structure.id;
      else apiData.structure = structure;
      apiData.questionGroups?.forEach((group, sectionIndex) => {
        const section = data.sections[sectionIndex];
        group.structureGroupIds =
          section.structureGroupIds ??
          (section.structureGroupId ? [section.structureGroupId] : []);
        group.questions.forEach((question, questionIndex) => {
          question.dimensionId =
            mode === 'dimensions' && group.structureGroupIds?.length === 1
              ? group.structureGroupIds[0]
              : section.items[questionIndex].dimensionId || undefined;
        });
      });
    }
    await addFormMutation.mutateAsync(apiData);

    router.push(PageRoutes.FORMS.FORMS_MODEL.LIST, {
      pathParams: { companyId },
    });
  };

  const handleSubmit = form.handleSubmit(onSubmit);

  const onCancel = () => {
    router.push(PageRoutes.FORMS.FORMS_MODEL.LIST, {
      pathParams: { companyId },
    });
  };

  return (
    <SForm form={form}>
      <FormModelInfo containerProps={{ mb: 16 }} lockType={active} />

      {psychosocial && (
        <Stack gap={4} mb={10}>
          <Stack direction="row" gap={3}>
            <TextField
              select
              fullWidth
              id="new-form-structure"
              label="Estrutura de escalas e dimensões"
              value={
                structure ? ('id' in structure ? structure.id : 'custom') : ''
              }
              disabled={active}
              onChange={(event) => {
                setStructure(
                  library.data?.find(({ id }) => id === event.target.value),
                );
              }}
            >
              <MenuItem value="">Sem estrutura</MenuItem>
              {library.data?.map(({ id, name }) => (
                <MenuItem key={id} value={id}>
                  {name}
                </MenuItem>
              ))}
              {structure && !('id' in structure) && (
                <MenuItem value="custom">{structure.name}</MenuItem>
              )}
            </TextField>
            <Button
              variant="outlined"
              disabled={active}
              onClick={() => setCustomDialog(true)}
            >
              Criar estrutura
            </Button>
          </Stack>
          {library.isError && (
            <Alert severity="error">
              Não foi possível carregar as estruturas da biblioteca.
            </Alert>
          )}
          {structure && (
            <>
              <TextField
                select
                id="new-form-structure-mode"
                label="Organização inicial das seções"
                value={mode}
                disabled={active}
                onChange={(event) => {
                  setMode(event.target.value as FormStructureMode);
                }}
              >
                <MenuItem value="scales">Por escalas</MenuItem>
                <MenuItem value="dimensions">Por dimensões</MenuItem>
              </TextField>
              <Box
                component="fieldset"
                sx={{
                  m: 0,
                  minWidth: 0,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  px: 5,
                  pb: 4,
                }}
              >
                <Typography
                  component="legend"
                  variant="caption"
                  color="text.secondary"
                >
                  {mode === 'scales'
                    ? 'Escalas sem seção'
                    : 'Dimensões sem seção'}
                </Typography>
                {unlinkedGroups.length ? (
                  <Stack direction="row" useFlexGap flexWrap="wrap" gap={2}>
                    {unlinkedGroups.map(({ id, name }) => (
                      <Chip
                        key={id}
                        label={name}
                        size="small"
                        sx={{
                          maxWidth: '100%',
                          height: 'auto',
                          '& .MuiChip-label': { whiteSpace: 'normal', py: 1 },
                        }}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {mode === 'scales'
                      ? 'Todas as escalas estão vinculadas.'
                      : 'Todas as dimensões estão vinculadas.'}
                  </Typography>
                )}
              </Box>
              <Button
                variant="outlined"
                disabled={!unlinkedGroups.length}
                onClick={addSections}
              >
                Criar uma seção por item restante
              </Button>
            </>
          )}
          {setupError && <Alert severity="info">{setupError}</Alert>}
          {customDialog && (
            <FormStructureDialog
              submitLabel="Usar neste formulário"
              onClose={() => setCustomDialog(false)}
              onSubmit={(input) => {
                setStructure(input);
                setCustomDialog(false);
              }}
            />
          )}
        </Stack>
      )}

      <FormModelGroup
        companyId={companyId}
        creationStructure={
          psychosocial && structure
            ? { ...structure, mode, linkOptions, linkSection }
            : undefined
        }
      />

      <FormQuestionsButtons
        onCancel={onCancel}
        onSubmit={handleSubmit}
        errors={form.formState.errors}
        loading={addFormMutation.isPending}
      />
    </SForm>
  );
};
