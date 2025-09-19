import { Box, Skeleton, Typography } from '@mui/material';
import { useState, useMemo } from 'react';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import { SAccordionBody } from '@v2/components/organisms/SAccordion/components/SAccordionBody/SAccordionBody';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { useFetchBrowseFormQuestionsAnswersRisks } from '@v2/services/forms/form-questions-answers/browse-form-questions-answers-risks/hooks/useFetchBrowseFormQuestionsAnswersRisks';
import { SRiskChip } from '@v2/components/molecules/SRiskChip/SRiskChip';
import { hierarchyTypeTranslation } from '@v2/models/security/translations/hierarchy-type.translation';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { useMutateAssignRisksFormApplication } from '@v2/services/forms/form-application/assign-risks-form-application/hooks/useMutateAssignRisksFormApplication';
import { useFetchBrowseFormApplicationRiskLog } from '@v2/services/forms/form-application/form-application-risk-log/hooks/useFetchBrowseFormApplicationRiskLog';
import CheckIcon from '@mui/icons-material/Check';
import { SText } from '@v2/components/atoms/SText/SText';

interface FormRisksAnalysisProps {
  formApplication: FormApplicationReadModel;
}

export const probabilityMap: Record<number, { label: string; color: string }> =
  {
    1: { label: 'Desprezível', color: '#3cbe7d' },
    2: { label: 'Pequena', color: '#8fa728' },
    3: { label: 'Moderada', color: '#d9d10b' },
    4: { label: 'Significativa', color: '#d96c2f' },
    5: { label: 'Excessiva', color: '#F44336' },
    0: { label: 'não contabilizar', color: '#eeeeee' },
  };

export const FormRisksAnalysis = ({
  formApplication,
}: FormRisksAnalysisProps) => {
  const [expandedRisks, setExpandedRisks] = useState<Record<string, boolean>>(
    {},
  );

  const { mutate: mutateAssignRisksFormApplication } =
    useMutateAssignRisksFormApplication();

  const { riskLogs } = useFetchBrowseFormApplicationRiskLog({
    companyId: formApplication.companyId,
    applicationId: formApplication.id,
  });

  const { formQuestionsAnswersRisks, isLoading } =
    useFetchBrowseFormQuestionsAnswersRisks({
      companyId: formApplication.companyId,
      applicationId: formApplication.id,
    });

  // Create a map to check if risk has been added to entity
  const riskLogMap = useMemo(() => {
    const map = new Map<string, boolean>();
    riskLogs.forEach((log) => {
      const key = `${log.riskId}-${log.entityId}-${log.probability}`;
      map.set(key, true);
    });
    return map;
  }, [riskLogs]);

  // Helper function to check if risk is added to entity
  const isRiskAddedToEntity = (
    riskId: string,
    entityId: string,
    probability: number,
  ) => {
    return riskLogMap.has(`${riskId}-${entityId}-${probability}`);
  };

  const handleAccordionChange = (riskId: string) => {
    setExpandedRisks((prev) => ({
      ...prev,
      [riskId]: !prev[riskId],
    }));
  };

  if (isLoading || !formQuestionsAnswersRisks) {
    return (
      <SPaper sx={{ p: 4 }}>
        <Skeleton height={400} />
      </SPaper>
    );
  }

  const { entityMap, riskMap, entityRiskMap } = formQuestionsAnswersRisks;

  // Get all risks that have data
  const risksWithData = Object.keys(riskMap).filter((riskId) =>
    Object.values(entityRiskMap).some((entityRisks) => entityRisks[riskId]),
  );

  if (risksWithData.length === 0) {
    return (
      <SPaper sx={{ p: 4 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight={400}
        >
          <Typography variant="h5" color="primary.main" mb={2}>
            Análise de Riscos
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Nenhum risco foi identificado para este formulário.
          </Typography>
        </Box>
      </SPaper>
    );
  }

  const handleAddRiskToAllEntities = (riskId: string, entityIds: string[]) => {
    mutateAssignRisksFormApplication({
      companyId: formApplication.companyId,
      applicationId: formApplication.id,
      risks: entityIds.map((entityId) => ({
        riskId,
        probability: entityRiskMap[entityId][riskId].probability,
        hierarchyId: entityId,
      })),
    });
  };

  const handleAddRiskToEntity = (riskId: string, entityId: string) => {
    mutateAssignRisksFormApplication({
      companyId: formApplication.companyId,
      applicationId: formApplication.id,
      risks: [
        {
          riskId,
          probability: entityRiskMap[entityId][riskId].probability,
          hierarchyId: entityId,
        },
      ],
    });
  };

  const handleAddAllRisk = () => {
    const risks = Object.entries(entityRiskMap)
      .map(([entityId, riskMap]) => {
        return Object.entries(riskMap).map(([riskId, risk]) => {
          return {
            hierarchyId: entityId,
            riskId,
            probability: risk.probability,
          };
        });
      })
      .flat();

    mutateAssignRisksFormApplication({
      companyId: formApplication.companyId,
      applicationId: formApplication.id,
      risks,
    });
  };

  return (
    <SPaper sx={{ p: 4 }}>
      <SFlex justifyContent="space-between" my={4} mx={8} mb={16}>
        <SText fontSize={18} fontWeight="bold">
          Análise de Riscos
        </SText>
        <SButton
          variant="shade"
          text="Adicionar todos os riscos a todos os setores"
          color="success"
          onClick={() => {
            handleAddAllRisk();
          }}
        />
      </SFlex>

      <SFlex direction="column" gap={2}>
        {risksWithData.map((riskId) => {
          const risk = riskMap[riskId];
          const isExpanded = expandedRisks[riskId] || false;

          // Get all entities that have this risk
          const entitiesWithRisk = Object.keys(entityRiskMap).filter(
            (entityId) => entityRiskMap[entityId][riskId],
          );

          return (
            <SAccordion
              key={riskId}
              expanded={isExpanded}
              onChange={() => handleAccordionChange(riskId)}
              endComponent={
                <>
                  {entitiesWithRisk.every((entityId) =>
                    isRiskAddedToEntity(
                      riskId,
                      entityId,
                      entityRiskMap[entityId][riskId].probability,
                    ),
                  ) && (
                    <SText color="success.main" fontSize={12} ml="auto" mr={5}>
                      Risco adicionado a todos os setores
                    </SText>
                  )}
                </>
              }
              title={
                <SFlex alignItems="center" gap={2} flex={1}>
                  <SRiskChip
                    size="lg"
                    type={risk.type}
                    subTypes={risk.subTypes.map((subType) => ({
                      id: subType.sub_type.id,
                      name: subType.sub_type.name,
                    }))}
                  />
                  <Typography fontWeight="500" fontSize={18} color="text.main">
                    {risk.name}
                  </Typography>
                </SFlex>
              }
            >
              <SAccordionBody>
                <SFlex direction="column" gap={3} mt={8}>
                  <Typography color="text.secondary">
                    Setores Identificados:
                  </Typography>

                  <SFlex direction="column" gap={4}>
                    {entitiesWithRisk.map((entityId) => {
                      const entity = entityMap[entityId];
                      const riskData = entityRiskMap[entityId][riskId];

                      return (
                        <Box
                          key={entityId}
                          sx={{
                            p: 4,
                            backgroundColor: 'grey.50',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'grey.200',
                          }}
                        >
                          <SFlex alignItems="center" gap={4} mb={2}>
                            <Box
                              sx={{
                                backgroundColor: 'grey.100',
                                padding: '2px 4px',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'grey.200',
                              }}
                            >
                              <Typography fontSize={12} color="text.secondary">
                                {hierarchyTypeTranslation[entity.type]}
                              </Typography>
                            </Box>
                            <Typography variant="body1" fontWeight="medium">
                              {entity.name}
                            </Typography>
                            {isRiskAddedToEntity(
                              riskId,
                              entityId,
                              riskData.probability,
                            ) ? (
                              <SFlex
                                color="success.main"
                                fontSize={12}
                                gap={3}
                                width="180px"
                                textAlign="center"
                                ml="auto"
                              >
                                <CheckIcon sx={{ fontSize: 16 }} />
                                <SText color="success.main" fontSize={12}>
                                  Risco adicionado
                                </SText>
                              </SFlex>
                            ) : (
                              <SButton
                                variant="shade"
                                color="paper"
                                buttonProps={{
                                  sx: { ml: 'auto', width: '180px' },
                                }}
                                text="Adicionar risco a este setor"
                                onClick={() =>
                                  handleAddRiskToEntity(riskId, entityId)
                                }
                              />
                            )}
                            <SFlex
                              center
                              sx={{
                                minWidth: 200,
                                backgroundColor:
                                  probabilityMap[riskData.probability || 0]
                                    .color,
                                padding: '4px 8px',
                                borderRadius: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.main"
                                mb={1}
                              >
                                Probabilidade: {riskData.probability} (
                                {
                                  probabilityMap[riskData.probability || 0]
                                    .label
                                }
                                )
                              </Typography>
                            </SFlex>
                          </SFlex>
                        </Box>
                      );
                    })}

                    {/* Only show "Add to all entities" button if not all entities have the risk added */}
                    {!entitiesWithRisk.every((entityId) =>
                      isRiskAddedToEntity(
                        riskId,
                        entityId,
                        entityRiskMap[entityId][riskId].probability,
                      ),
                    ) && (
                      <SButton
                        variant="text"
                        buttonProps={{
                          sx: {
                            width: 'fit-content',
                            textDecoration: 'underline',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          },
                        }}
                        text="Adicionar risco a todos os setores"
                        onClick={() =>
                          handleAddRiskToAllEntities(
                            riskId,
                            entitiesWithRisk.filter(
                              (entityId) =>
                                !isRiskAddedToEntity(
                                  riskId,
                                  entityId,
                                  entityRiskMap[entityId][riskId].probability,
                                ),
                            ),
                          )
                        }
                      />
                    )}
                  </SFlex>
                </SFlex>
              </SAccordionBody>
            </SAccordion>
          );
        })}
      </SFlex>
    </SPaper>
  );
};
