import {
  Alert,
  Box,
  Button,
  Chip,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { SFormQuestionSection } from '../../../../components/SFormSection/SFormSection';
import { SFormQuestionGroup } from '../../../../components/SFormSection/components/SFormQuestionGroup';
import { SFormQuestionAccordion } from '../../../../components/SFormQuestionAccordion/SFormQuestionAccordion';
import {
  getFormModelInitialValues,
  getFormSectionInitialValues,
} from '../../schemas/form-model.schema';
import {
  resolveFormIndicatorHierarchy,
  type FormIndicatorHierarchy,
  type FormDimensionSectionAssignment,
} from '@v2/models/form/form-indicator-hierarchy';
import type { IFormModelForms } from '../../schemas/form-model.schema';
import { FormQuestionTypeMapList } from '../../constants/form-question-type-map';

import type {
  FormStructureDimension,
  FormStructureInput,
  FormStructureMode,
} from '@v2/services/forms/form-structures/form-structures.service';

const sectionLinkChipSx = {
  maxWidth: '100%',
  height: 'auto',
  '& .MuiChip-label': { whiteSpace: 'normal', py: 1 },
};

export const FormModelGroup = ({
  companyId,
  formId,
  savedHierarchy,
  dimensionNames: renamedDimensions,
  onRenameDimension,
  sectionAssignments,
  onChangeSectionAssignments,
  isEdit = false,
  creationStructure,
}: {
  companyId: string;
  formId?: string;
  savedHierarchy?: FormIndicatorHierarchy;
  dimensionNames?: Record<string, string>;
  onRenameDimension?: (id: string, name: string) => void;
  sectionAssignments?: FormDimensionSectionAssignment[];
  onChangeSectionAssignments?: (
    assignments: FormDimensionSectionAssignment[],
  ) => void;
  isEdit?: boolean;
  creationStructure?: FormStructureInput & {
    mode: FormStructureMode;
    linkOptions: FormStructureDimension[];
    linkSection: (sectionIndex: number, groupIds: string[]) => void;
  };
}) => {
  const hierarchy = formId
    ? resolveFormIndicatorHierarchy(formId, savedHierarchy)
    : undefined;
  const layoutHierarchy = savedHierarchy;
  const [linkDialog, setLinkDialog] = useState<{
    sectionId: string;
    sectionNumber: number;
    selected: string[];
  } | null>(null);
  const { control, getValues } = useFormContext<IFormModelForms>();

  // Calculate initial minimized sections only on edit mode when there are more than 30 total questions
  const getInitialMinimizedSections = (): Set<number> => {
    if (!isEdit) return new Set<number>();

    const sections = getValues('sections') || [];
    const totalQuestions = sections.reduce((total: number, section: any) => {
      return total + (section.items?.length || 0);
    }, 0);

    if (totalQuestions > 30) {
      // Return a set with all section indices to minimize all sections
      return new Set<number>(
        sections.flatMap((_, index) =>
          layoutHierarchy && index === 0 ? [] : [index],
        ),
      );
    }

    return new Set<number>();
  };

  const [minimizedSections, setMinimizedSections] = useState<Set<number>>(() =>
    getInitialMinimizedSections(),
  );
  const { fields, remove, replace, move } = useFieldArray({
    control,
    name: 'sections',
  });

  const handleMoveSection = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= fields.length) return;

    move(fromIndex, toIndex);

    setMinimizedSections((prev) => {
      const next = new Set<number>();
      for (const x of prev) {
        if (x === fromIndex) next.add(toIndex);
        else if (x === toIndex) next.add(fromIndex);
        else next.add(x);
      }
      return next;
    });
  };

  const handleDeleteSection = (index: number) => {
    if (fields.length === 1) {
      return;
    }
    remove(index);
  };

  const handleAddNewSectionFromQuestion = (
    currentSectionIndex: number,
    questionIndex: number,
  ) => {
    const scrollPosition = window.scrollY;

    const currentValues = getValues();
    const currentSection = currentValues.sections[currentSectionIndex];

    if (!currentSection || !currentSection.items) {
      return;
    }

    const newSection = getFormSectionInitialValues();

    const questionsToMove = currentSection.items.slice(questionIndex + 1);

    const updatedSections = [...currentValues.sections];

    updatedSections[currentSectionIndex] = {
      ...currentSection,
      items: currentSection.items.slice(0, questionIndex + 1),
    };

    const newSectionWithQuestions = {
      ...newSection,
      items: questionsToMove,
    };
    updatedSections.splice(currentSectionIndex + 1, 0, newSectionWithQuestions);

    replace(updatedSections);

    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPosition);
    });
  };

  const handleMinimizeSection = (sectionIndex: number) => {
    setMinimizedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionIndex)) {
        newSet.delete(sectionIndex);
      } else {
        newSet.add(sectionIndex);
      }
      return newSet;
    });
  };

  const linkOptions = layoutHierarchy
    ? layoutHierarchy.blocks.map((block) => ({
        id: block.groupId,
        name: block.name.replace(/^Escala — /, ''),
        dimensions: block.dimensions.map((dimension) => ({
          id: dimension.id,
          origin:
            dimension.sectionId ??
            (layoutHierarchy.mode === 'scales' ? block.groupId : dimension.id),
          questionIds: dimension.questionIds ?? [],
          name: (renamedDimensions?.[dimension.id] ?? dimension.name).replace(
            /^Dimensão — /,
            '',
          ),
        })),
      }))
    : [];
  const linkLabels = new Map<string, string>(
    linkOptions.flatMap((scale) => [
      [`scale:${scale.id}`, `Escala — ${scale.name}`] as const,
      ...scale.dimensions.map(
        (dimension) =>
          [
            `dimension:${dimension.id}`,
            `Dimensão — ${dimension.name}`,
          ] as const,
      ),
    ]),
  );

  const scaleKeys = linkOptions.map(({ id }) => `scale:${id}`);
  const allScalesSelected = scaleKeys.every((key) =>
    linkDialog?.selected.includes(key),
  );

  const destinationByDimension = new Map(
    sectionAssignments?.map(({ dimensionId, sectionId }) => [
      dimensionId,
      sectionId,
    ]),
  );
  const layoutDimensions = linkOptions.flatMap(({ dimensions }) => dimensions);
  const assignedSection = (dimension: { id: string; origin: string }) =>
    destinationByDimension.get(dimension.id) ?? dimension.origin;
  const selectedDimensionIds = new Set(
    linkOptions.flatMap((scale) =>
      scale.dimensions
        .filter(
          (dimension) =>
            linkDialog?.selected.includes(`scale:${scale.id}`) ||
            linkDialog?.selected.includes(`dimension:${dimension.id}`),
        )
        .map(({ id }) => id),
    ),
  );
  const removingOriginal = layoutDimensions.some(
    (dimension) =>
      dimension.origin === linkDialog?.sectionId &&
      assignedSection(dimension) === linkDialog.sectionId &&
      !selectedDimensionIds.has(dimension.id),
  );
  const dimensionByQuestionId = new Map(
    layoutDimensions.flatMap((dimension) =>
      dimension.questionIds.map(
        (questionId) => [questionId, dimension] as const,
      ),
    ),
  );
  const dimensionByOrigin = new Map(
    layoutDimensions.map((dimension) => [dimension.origin, dimension]),
  );
  const arrangedQuestionsBySection = new Map<
    string,
    {
      id: string;
      sectionIndex: number;
      questionIndex: number;
      dimensionId?: string;
    }[]
  >();
  getValues('sections').forEach((section, sectionIndex) => {
    const origin = section.apiId;
    if (!origin) return;
    section.items.forEach((question, questionIndex) => {
      const dimension =
        layoutHierarchy?.mode === 'dimensions'
          ? dimensionByOrigin.get(origin)
          : dimensionByQuestionId.get(question.apiId ?? '');
      const destination = dimension ? assignedSection(dimension) : origin;
      const questions = arrangedQuestionsBySection.get(destination) ?? [];
      questions.push({
        id: question.id ?? question.apiId ?? `${origin}-${questionIndex}`,
        sectionIndex,
        questionIndex,
        dimensionId: dimension?.id,
      });
      arrangedQuestionsBySection.set(destination, questions);
    });
  });

  return (
    <Box>
      <Stack gap={16}>
        {layoutHierarchy && (
          <Alert severity="info">
            Escolha em qual seção as dimensões devem aparecer para quem
            responde. A organização dos indicadores segue as escalas e
            dimensões.
          </Alert>
        )}
        {fields.map((field, idx) => {
          const { structureGroupId, structureGroupIds, items } = getValues(
            `sections.${idx}`,
          );
          const groupIds =
            structureGroupIds ?? (structureGroupId ? [structureGroupId] : []);
          const usedDimensionIds = new Set(items.map(({ dimensionId }) => dimensionId));
          // With one linked dimension, the form assigns it automatically.
          if (creationStructure?.mode === 'dimensions' && groupIds.length === 1) {
            usedDimensionIds.clear();
            if (items.some(({ content }) => content.trim())) {
              usedDimensionIds.add(groupIds[0]);
            }
          }
          const linkChipColor = (id: string, selected: boolean) =>
            (creationStructure?.mode === 'dimensions' ? usedDimensionIds.has(id) : selected)
              ? 'primary'
              : 'default';
          const creationDimensions =
            creationStructure?.scales.flatMap((scale) =>
              scale.dimensions
                .filter(({ id }) =>
                  creationStructure.mode === 'scales'
                    ? groupIds.includes(scale.id)
                    : groupIds.includes(id),
                )
                .map(({ id, name }) => ({
                  id,
                  name: groupIds.length > 1 ? `${scale.name} / ${name}` : name,
                })),
            ) ?? [];
          const scaleSection =
            hierarchy?.mode === 'scales'
              ? hierarchy.blocks.find((scale) => scale.groupId === field.apiId)
              : undefined;
          const parentScale =
            hierarchy?.mode === 'dimensions'
              ? hierarchy.blocks.find((scale) =>
                  scale.dimensions.some(
                    (dimension) => dimension.id === field.apiId,
                  ),
                )
              : undefined;
          const dimensionNames = new Map(
            scaleSection?.dimensions.flatMap((dimension) =>
              (dimension.questionIds ?? []).map(
                (id) =>
                  [
                    id,
                    {
                      id: dimension.id,
                      name:
                        renamedDimensions?.[dimension.id] ??
                        dimension.name.replace(/^Dimensão — /, ''),
                    },
                  ] as const,
              ),
            ),
          );
          const pilotScale = layoutHierarchy && (scaleSection ?? parentScale);
          const sectionId = field.apiId;
          const layoutLinks = linkOptions.flatMap((scale) => {
            const dimensions = scale.dimensions.filter(
              (dimension) => assignedSection(dimension) === sectionId,
            );
            return (dimensions.length > 1 ||
              layoutHierarchy?.mode === 'scales') &&
              dimensions.length > 0 &&
              dimensions.length === scale.dimensions.length
              ? [`scale:${scale.id}`]
              : dimensions.map(({ id }) => `dimension:${id}`);
          });
          const arrangedQuestions =
            arrangedQuestionsBySection.get(sectionId ?? '') ?? [];
          const questionNumbers = new Map(
            arrangedQuestions.map(({ id }, index) => [id, index + 1]),
          );
          const renderArrangedQuestion = ({
            id,
            sectionIndex,
            questionIndex,
          }: (typeof arrangedQuestions)[number]) => (
            <SFormQuestionAccordion
              key={id}
              companyId={companyId}
              sectionIndex={sectionIndex}
              questionIndex={questionIndex}
              questionNumber={questionNumbers.get(id) ?? questionIndex + 1}
              typeOptions={FormQuestionTypeMapList}
              disableQuestionCreation
              disableQuestionDuplication
            />
          );
          const hasLayout = !!layoutHierarchy && !!sectionId;
          const explicitLayout = layoutHierarchy?.blocks.some((block) =>
            block.dimensions.some(
              (dimension) => dimension.sectionId === sectionId && !!sectionId,
            ),
          );
          const layoutChanged =
            hasLayout &&
            (explicitLayout ||
              layoutDimensions.some(
                (dimension) =>
                  assignedSection(dimension) !== dimension.origin &&
                  (dimension.origin === sectionId ||
                    assignedSection(dimension) === sectionId),
              ));
          const linkedDimension = parentScale?.dimensions.find(
            ({ id }) => id === field.apiId,
          );
          const dimensionSection =
            pilotScale && linkedDimension
              ? {
                  id: linkedDimension.id,
                  name: (
                    renamedDimensions?.[linkedDimension.id] ??
                    linkedDimension.name
                  ).replace(/^Dimensão — /, ''),
                }
              : undefined;
          const sectionDimensions = [
            ...new Set(
              field.items.flatMap((item) => {
                const name = item.apiId
                  ? dimensionNames.get(item.apiId)
                  : undefined;
                return name ? [name.name] : [];
              }),
            ),
          ];
          return (
            <SFormQuestionSection
              key={field.id}
              companyId={companyId}
              initialValues={getFormModelInitialValues()}
              questionTypeOptions={FormQuestionTypeMapList}
              sectionIndex={idx}
              sectionNumber={idx + 1}
              sectionMetadata={
                creationStructure ? (
                  <Controller
                    control={control}
                    name={`sections.${idx}.structureGroupIds`}
                    render={({ field: linkField, fieldState }) => (
                      <TextField
                        {...linkField}
                        id={`section-${idx}-structure-link`}
                        label={
                          creationStructure.mode === 'scales'
                            ? 'Escalas vinculadas à seção'
                            : 'Dimensões vinculadas à seção'
                        }
                        value={linkField.value ?? groupIds}
                        SelectProps={{
                          multiple: true,
                          renderValue: (value) => {
                            const selectedIds = value as string[];
                            return (
                              <Stack direction="row" useFlexGap flexWrap="wrap" gap={2}>
                                {creationStructure.linkOptions
                                  .filter(({ id }) => selectedIds.includes(id))
                                  .map(({ id, name }) => (
                                    <Chip
                                      key={id}
                                      label={name}
                                      size="small"
                                      color={linkChipColor(id, true)}
                                      sx={sectionLinkChipSx}
                                    />
                                  ))}
                              </Stack>
                            );
                          },
                        }}
                        sx={{ '& .MuiSelect-select': { whiteSpace: 'normal' } }}
                        onChange={(event) => {
                          const value: unknown = event.target.value;
                          if (Array.isArray(value))
                            creationStructure.linkSection(idx, value);
                        }}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        select
                        size="small"
                        fullWidth
                      >
                        {creationStructure.linkOptions.map(({ id, name }) => (
                          <MenuItem
                            key={id}
                            value={id}
                            disabled={
                              !groupIds.includes(id) &&
                              getValues('sections').some(
                                (section, index) =>
                                  index !== idx &&
                                  (
                                    section.structureGroupIds ?? [
                                      section.structureGroupId,
                                    ]
                                  ).includes(id),
                              )
                            }
                          >
                            <Chip
                              label={name}
                              size="small"
                              color={linkChipColor(id, (linkField.value ?? groupIds).includes(id))}
                              sx={sectionLinkChipSx}
                            />
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                ) : hasLayout && sectionId ? (
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    aria-haspopup="dialog"
                    disabled={!onChangeSectionAssignments}
                    sx={{
                      alignSelf: 'flex-start',
                      textAlign: 'left',
                      textTransform: 'none',
                    }}
                    onClick={() =>
                      setLinkDialog({
                        sectionId,
                        sectionNumber: idx + 1,
                        selected: layoutLinks,
                      })
                    }
                  >
                    Vínculos da seção:{' '}
                    {layoutLinks.length === 1
                      ? linkLabels.get(layoutLinks[0])
                      : layoutLinks.length
                        ? `${layoutLinks.length} selecionados`
                        : 'Sem vínculos'}
                  </Button>
                ) : parentScale ? (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Escala vinculada
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      fontWeight={600}
                    >
                      {parentScale.name.replace(/^Escala — /, '')}
                    </Typography>
                  </Box>
                ) : scaleSection && sectionDimensions.length > 0 ? (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Dimensões desta escala
                    </Typography>
                    <Stack
                      direction="row"
                      useFlexGap
                      flexWrap="wrap"
                      gap={2}
                      mt={2}
                    >
                      {sectionDimensions.map((name) => (
                        <Chip
                          key={name}
                          label={name.replace(/^Dimensão — /, '')}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                ) : undefined
              }
              arrangedQuestions={
                layoutChanged ? (
                  <Stack gap={4}>
                    <Typography variant="subtitle2" sx={{ p: 4 }}>
                      {arrangedQuestions.length
                        ? `${arrangedQuestions.length} ${arrangedQuestions.length === 1 ? 'pergunta' : 'perguntas'} para quem responde`
                        : 'Sem perguntas para quem responde'}
                    </Typography>
                    {linkOptions.map((scale) => {
                      const dimensions = scale.dimensions.filter((dimension) =>
                        arrangedQuestions.some(
                          ({ dimensionId }) => dimensionId === dimension.id,
                        ),
                      );
                      if (!dimensions.length) return null;

                      return (
                        <SFormQuestionGroup
                          key={scale.id}
                          label="Escala"
                          name={scale.name}
                        >
                          {dimensions.map(({ id, name }) => (
                            <SFormQuestionGroup
                              key={id}
                              name={name}
                              initiallyCollapsed
                              onRename={
                                onRenameDimension &&
                                ((value) => onRenameDimension(id, value))
                              }
                            >
                              {arrangedQuestions
                                .filter(({ dimensionId }) => dimensionId === id)
                                .map(renderArrangedQuestion)}
                            </SFormQuestionGroup>
                          ))}
                        </SFormQuestionGroup>
                      );
                    })}
                    {arrangedQuestions
                      .filter(({ dimensionId }) => !dimensionId)
                      .map(renderArrangedQuestion)}
                  </Stack>
                ) : undefined
              }
              questionMetadata={
                creationDimensions.length > 0 &&
                (creationStructure?.mode === 'scales' || groupIds.length > 1)
                  ? (questionIndex) => (
                      <Controller
                        control={control}
                        name={`sections.${idx}.items.${questionIndex}.dimensionId`}
                        render={({ field: dimensionField, fieldState }) => (
                          <TextField
                            {...dimensionField}
                            value={dimensionField.value ?? ''}
                            id={`section-${idx}-question-${questionIndex}-dimension`}
                            label="Dimensão da pergunta"
                            size="small"
                            select
                            fullWidth
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            sx={{ mb: 2 }}
                          >
                            {creationDimensions.map(({ id, name }) => (
                              <MenuItem key={id} value={id}>
                                {name}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    )
                  : undefined
              }
              questionScaleName={
                pilotScale && !explicitLayout
                  ? pilotScale.name.replace(/^Escala — /, '')
                  : undefined
              }
              questionGroupLabels={scaleSection ? dimensionNames : undefined}
              defaultQuestionGroup={dimensionSection}
              onRenameQuestionGroup={
                scaleSection || dimensionSection ? onRenameDimension : undefined
              }
              onDeleteSection={
                layoutChanged ? undefined : () => handleDeleteSection(idx)
              }
              onAddNewSection={
                creationStructure
                  ? undefined
                  : (questionIndex) =>
                      handleAddNewSectionFromQuestion(idx, questionIndex)
              }
              onMinimizeSection={() => handleMinimizeSection(idx)}
              isMinimized={minimizedSections.has(idx)}
              onMoveSectionUp={
                idx > 0 ? () => handleMoveSection(idx, 'up') : undefined
              }
              onMoveSectionDown={
                idx < fields.length - 1
                  ? () => handleMoveSection(idx, 'down')
                  : undefined
              }
            />
          );
        })}
      </Stack>
      <Dialog
        open={!!linkDialog}
        onClose={() => setLinkDialog(null)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="section-link-title"
      >
        <DialogTitle id="section-link-title">
          Vincular Seção {linkDialog?.sectionNumber}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" mb={4}>
            As dimensões marcadas passam para esta seção ao salvar o modelo.
            Desmarcar uma dimensão recebida devolve suas perguntas à seção de
            origem.
          </Typography>
          <Button
            type="button"
            size="small"
            onClick={() =>
              setLinkDialog(
                (current) =>
                  current && {
                    ...current,
                    selected: allScalesSelected ? [] : scaleKeys,
                  },
              )
            }
          >
            {allScalesSelected
              ? 'Limpar seleção'
              : 'Selecionar todas as escalas'}
          </Button>
          <Box role="group" aria-labelledby="section-link-title">
            {linkOptions.map((scale) => {
              const scaleKey = `scale:${scale.id}`;
              const dimensionKeys = scale.dimensions.map(
                ({ id }) => `dimension:${id}`,
              );
              const wholeScale = !!linkDialog?.selected.includes(scaleKey);
              return (
                <Box key={scale.id} sx={{ mb: 4 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={wholeScale}
                        indeterminate={
                          !wholeScale &&
                          dimensionKeys.some((key) =>
                            linkDialog?.selected.includes(key),
                          )
                        }
                        onChange={(_, checked) =>
                          setLinkDialog((current) => {
                            if (!current) return current;
                            const remaining = current.selected.filter(
                              (key) =>
                                key !== scaleKey &&
                                !dimensionKeys.includes(key),
                            );
                            return {
                              ...current,
                              selected: checked
                                ? [...remaining, scaleKey]
                                : remaining,
                            };
                          })
                        }
                      />
                    }
                    label={`Escala — ${scale.name}`}
                  />
                  <Stack sx={{ pl: 12 }}>
                    {scale.dimensions.map((dimension) => {
                      const key = `dimension:${dimension.id}`;
                      return (
                        <FormControlLabel
                          key={dimension.id}
                          control={
                            <Checkbox
                              size="small"
                              checked={
                                wholeScale ||
                                !!linkDialog?.selected.includes(key)
                              }
                              disabled={wholeScale}
                              onChange={(_, checked) =>
                                setLinkDialog(
                                  (current) =>
                                    current && {
                                      ...current,
                                      selected: checked
                                        ? [...current.selected, key]
                                        : current.selected.filter(
                                            (selected) => selected !== key,
                                          ),
                                    },
                                )
                              }
                            />
                          }
                          label={`Dimensão — ${dimension.name}`}
                        />
                      );
                    })}
                  </Stack>
                </Box>
              );
            })}
          </Box>
          {removingOriginal && (
            <Alert severity="info">
              Para retirar uma dimensão que nasceu nesta seção, selecione-a na
              seção de destino.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setLinkDialog(null)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="contained"
            disabled={!linkDialog || removingOriginal}
            onClick={() => {
              if (!linkDialog || !onChangeSectionAssignments) return;
              const assignments = layoutDimensions.flatMap((dimension) => {
                const current = assignedSection(dimension);
                const target = selectedDimensionIds.has(dimension.id)
                  ? linkDialog.sectionId
                  : current === linkDialog.sectionId
                    ? dimension.origin
                    : current;
                return target === dimension.origin
                  ? []
                  : [{ dimensionId: dimension.id, sectionId: target }];
              });
              onChangeSectionAssignments(assignments);
              setMinimizedSections((current) => {
                const next = new Set(current);
                next.delete(linkDialog.sectionNumber - 1);
                return next;
              });
              setLinkDialog(null);
            }}
          >
            Aplicar vínculos
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
