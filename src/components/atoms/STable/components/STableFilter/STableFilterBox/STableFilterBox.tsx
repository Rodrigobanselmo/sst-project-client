/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FC, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { getStates } from '@brazilian-utils/brazilian-utils';
import { Box, Divider } from '@mui/material';
import AutocompleteSelect from 'components/atoms/SAutocompleteSelect';
import SCheckBox from 'components/atoms/SCheckBox';
import { SDatePicker } from 'components/atoms/SDatePicker/SDatePicker';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import { STagButton, STagButtonLabelLeft } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { RadioFormText } from 'components/molecules/form/radio-text';
import { EsocialCitiesSelect } from 'components/organisms/inputSelect/EsocialCitiesSelect/EsocialCitiesSelect';
import { EmployeeSelect } from 'components/organisms/tagSelects/EmployeeSelect';
import dayjs from 'dayjs';
import { examAvaliationTypeList } from 'project/enum/employee-exam-history-avaliation.enum';
import { employeeExamEvaluationTypeList } from 'project/enum/employee-exam-history-evaluation.enum';
import { asoExamTypeList } from 'project/enum/employee-exam-history-type.enum';

import { statusOptionsConstant } from 'core/constants/maps/status-options.constant';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { dateToString } from 'core/utils/date/date-format';

import { useFetchBrowseRiskSubType } from '@v2/services/security/risk/sub-type/browse-sub-type/hooks/useFetchBrowseSubType';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';

import { useQueryAbsenteeismMotives } from 'core/services/hooks/queries/useQueryAbsenteeismMotives/useQueryAbsenteeismMotives';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { RiskEnum, RiskMap } from 'project/enum/risk.enums';
import { SeverityEnum } from 'project/enum/severity.enums';
import { FilterFieldEnum, filterFieldMap } from '../constants/filter.map';
import {
  ReportDownloadtypeEnum,
  reportDownloadtypeList,
} from './constants/report-type.constants';
import { IFilterBoxProps } from './types';
import { externalSystemEnumList } from 'project/enum/external-system.enum';

export const STableFilterBox: FC<{ children?: any } & IFilterBoxProps> = ({
  filterProps,
  closePopper,
  ...props
}) => {
  const statusConfig = Array.isArray(filterProps.filters)
    ? { statusOptions: [], statusSchema: undefined }
    : filterProps.filters;

  const filtersOptions = useMemo(() => {
    const filters = Array.isArray(filterProps.filters)
      ? filterProps.filters
      : filterProps.filters.fields;

    const fields = filters.reduce(
      (acc, curr) => {
        acc[curr] = true;
        return acc;
      },
      {} as Record<FilterFieldEnum, boolean>,
    );

    const options = {} as Record<FilterFieldEnum, { required?: boolean }>;

    if (!Array.isArray(filterProps.filters)) {
      filterProps.filters.required?.forEach((field) => {
        if (!options[field]) options[field] = {};

        options[field] = { ...options[field], required: true };
      });
    }

    return { fields, options };
  }, [filterProps.filters]);

  const filters = filtersOptions.fields;
  const options = filtersOptions.options;

  const ufs = useMemo(() => {
    return getStates().map((state) => state.code);
  }, []);

  const companySelected = filterProps.filter?.[FilterFieldEnum.COMPANY]
    ?.filters?.[0] as any;

  if (companySelected)
    companySelected.id =
      filterProps.filter?.[FilterFieldEnum.COMPANY]?.data?.[0]?.id;

  const { control, setValue } = useForm();
  const { data } = useQueryCompany(companySelected?.id);

  const { companyId: riskFilterCompanyId } = useGetCompanyId();
  const { data: absenteeismMotivesList = [] } = useQueryAbsenteeismMotives(
    1,
    {},
    500,
  );
  const selectedRiskTypesForBrowse = filterProps.filter?.[
    FilterFieldEnum.RISK_TYPES
  ]?.data as string[] | undefined;
  const riskSubTypeBrowseTypes =
    selectedRiskTypesForBrowse?.length && selectedRiskTypesForBrowse.length > 0
      ? (selectedRiskTypesForBrowse as unknown as RiskTypeEnum[])
      : (Object.values(RiskTypeEnum) as RiskTypeEnum[]);

  const { subTypes: riskSubTypesBrowse, isLoading: loadRiskSubTypesBrowse } =
    useFetchBrowseRiskSubType({
      companyId: riskFilterCompanyId || '',
      pagination: { page: 1, limit: 500 },
      filters: { types: riskSubTypeBrowseTypes },
    });

  const showRiskFactorsFilterBlock = [
    FilterFieldEnum.RISK_TYPES,
    FilterFieldEnum.RISK_SEVERITIES,
    FilterFieldEnum.RISK_SUB_TYPE_IDS,
    FilterFieldEnum.RISK_MUST_IS_PGR,
    FilterFieldEnum.RISK_MUST_IS_PPP,
    FilterFieldEnum.RISK_MUST_IS_PCMSO,
    FilterFieldEnum.RISK_MUST_IS_ASO,
  ].some((field) => filters[field]);

  return (
    <SFlex
      gap={4}
      direction={'column'}
      mt={4}
      maxHeight={550}
      overflow={'auto'}
      {...props}
    >
      {[
        FilterFieldEnum.END_DATE,
        FilterFieldEnum.START_DATE,
        FilterFieldEnum.LTE_EXPIRED_EXAM,
        FilterFieldEnum.ABSENTEEISM_OVERLAP_START,
        FilterFieldEnum.ABSENTEEISM_OVERLAP_END,
      ].find((field) => filters[field]) && (
        <>
          <SFlex direction="row" gap={10} mb={5}>
            {[
              FilterFieldEnum.START_DATE,
              FilterFieldEnum.END_DATE,
              FilterFieldEnum.LTE_EXPIRED_EXAM,
              FilterFieldEnum.ABSENTEEISM_OVERLAP_START,
              FilterFieldEnum.ABSENTEEISM_OVERLAP_END,
            ].map((field) => {
              if (!filters[field]) return null;

              const value = filterProps.filter?.[field]?.data?.[0];

              return (
                <Box key={field}>
                  <SDatePicker
                    inputProps={{
                      labelPosition: 'top',
                      superSmall: true,
                      error: options[field]?.required && !value,
                      helperText:
                        options[field]?.required &&
                        !value &&
                        'Campo obrigatório',
                    }}
                    {...(field == FilterFieldEnum.LTE_EXPIRED_EXAM && {
                      filterDate: (date) =>
                        dayjs().isBefore(dayjs(date).add(1, 'day')),
                    })}
                    placeholderText="__/__/__"
                    selected={value}
                    label={filterFieldMap[field].name}
                    onChange={(date) => {
                      if (date)
                        filterProps.addFilter(field, {
                          data: date,
                          getId: () => date.toISOString(),
                          getName: () => dateToString(date),
                        });
                    }}
                  />
                </Box>
              );
            })}
            {filters[FilterFieldEnum.LTE_EXPIRED_EXAM] &&
              filterProps.filter?.[FilterFieldEnum.LTE_EXPIRED_EXAM]
                ?.data?.[0] && (
                <Box mt={16}>
                  <SInput
                    labelPosition="center"
                    size="small"
                    superSmall
                    sx={{ width: 140 }}
                    value={
                      -dayjs().diff(
                        filterProps.filter?.[FilterFieldEnum.LTE_EXPIRED_EXAM]
                          ?.data?.[0],
                        'day',
                      ) + 1
                    }
                    endAdornment={
                      <SText fontSize={12} mr={3}>
                        dias de hoje
                      </SText>
                    }
                  />
                </Box>
              )}
          </SFlex>
          <Divider sx={{ mb: 2, mt: 2 }} />
        </>
      )}

      <>
        {filters[FilterFieldEnum.EXAM_TYPE] && (
          <Box mb={5}>
            <SText color="text.label" fontSize={14} mt={6} mb={3}>
              Filtrar por tipo de exames:
            </SText>
            <SFlex flexWrap={'wrap'}>
              {asoExamTypeList.map((evaluation) => {
                return (
                  <SCheckBox
                    key={evaluation.value}
                    label={evaluation.content}
                    checked={
                      !filterProps.filter?.[
                        FilterFieldEnum.EXAM_TYPE
                      ]?.data?.includes(evaluation.value)
                    }
                    onChange={() => {
                      filterProps.addFilter(
                        FilterFieldEnum.EXAM_TYPE,
                        {
                          data: evaluation.value,
                          getId: () => evaluation.value,
                          getName: () => evaluation.content,
                        },
                        { removeIfEqual: true, addOnly: true },
                      );
                    }}
                  />
                );
              })}
            </SFlex>
          </Box>
        )}

        {filters[FilterFieldEnum.EVALUATION_TYPE] && (
          <Box mb={5}>
            <SText color="text.label" fontSize={14} mt={6} mb={3}>
              Filtrar por tipo de avaliação:
            </SText>
            <SFlex flexWrap={'wrap'}>
              {employeeExamEvaluationTypeList.map((evaluation) => {
                return (
                  <SCheckBox
                    key={evaluation.value}
                    label={evaluation.content}
                    checked={
                      !filterProps.filter?.[
                        FilterFieldEnum.EVALUATION_TYPE
                      ]?.data?.includes(evaluation.value)
                    }
                    onChange={() => {
                      filterProps.addFilter(
                        FilterFieldEnum.EVALUATION_TYPE,
                        {
                          data: evaluation.value,
                          getId: () => evaluation.value,
                          getName: () => evaluation.content,
                        },
                        { removeIfEqual: true, addOnly: true },
                      );
                    }}
                  />
                );
              })}
            </SFlex>
          </Box>
        )}

        {filters[FilterFieldEnum.EXAM_AVALIATION_EXAM] && (
          <Box mb={5}>
            <SText color="text.label" fontSize={14} mt={6} mb={3}>
              Filtrar por tipo de avaliação:
            </SText>
            <SFlex flexWrap={'wrap'}>
              {examAvaliationTypeList.map((evaluation) => {
                return (
                  <SCheckBox
                    key={evaluation.value}
                    label={evaluation.content}
                    checked={
                      !filterProps.filter?.[
                        FilterFieldEnum.EXAM_AVALIATION_EXAM
                      ]?.data?.includes(evaluation.value)
                    }
                    onChange={() => {
                      filterProps.addFilter(
                        FilterFieldEnum.EXAM_AVALIATION_EXAM,
                        {
                          data: evaluation.value,
                          getId: () => evaluation.value,
                          getName: () => evaluation.content,
                        },
                        { removeIfEqual: true, addOnly: true },
                      );
                    }}
                  />
                );
              })}
            </SFlex>
          </Box>
        )}
        {!![FilterFieldEnum.EXAM_TYPE, FilterFieldEnum.EVALUATION_TYPE].find(
          (i) => filters[i],
        ) && <Divider sx={{ mb: 2, mt: 2 }} />}
      </>

      {/* // STATUS */}
      <>
        {filters[FilterFieldEnum.STATUS] &&
          !!statusConfig.statusOptions?.length && (
            <Box mb={5}>
              <SText color="text.label" fontSize={14} mt={6} mb={3}>
                Filtrar por status:
              </SText>
              <SFlex flexWrap={'wrap'}>
                {statusConfig.statusOptions.map((status) => {
                  const statusMap =
                    statusConfig.statusSchema || statusOptionsConstant;

                  return (
                    <SCheckBox
                      key={status}
                      label={statusMap[status].name}
                      checked={
                        !filterProps.filter?.[
                          FilterFieldEnum.STATUS
                        ]?.data?.includes(status)
                      }
                      onChange={() => {
                        filterProps.addFilter(
                          FilterFieldEnum.STATUS,
                          {
                            data: status,
                            getId: () => status,
                            getName: () => statusMap[status].name,
                          },
                          { removeIfEqual: true, addOnly: true },
                        );
                      }}
                    />
                  );
                })}
              </SFlex>
            </Box>
          )}

        {!![FilterFieldEnum.EXAM_TYPE, FilterFieldEnum.EVALUATION_TYPE].find(
          (i) => filters[i],
        ) && <Divider sx={{ mb: 2, mt: 2 }} />}
      </>

      <>
        {filters[FilterFieldEnum.UF] && (
          <Box mb={5}>
            <AutocompleteSelect
              inputProps={{
                labelPosition: 'left',
                placeholder: 'UF',
                superSmall: true,
              }}
              ListboxProps={{ sx: { fontSize: '14px' } } as any}
              name=""
              label={'Estado'}
              sx={{ minWidth: [200], maxWidth: [110] }}
              // value={
              //   (filterProps as any).filter[FilterFieldEnum.UF]?.filters?.[0]
              //     ?.filterValue
              // }
              onChange={(e, v: (typeof ufs)[0]) => {
                if (v)
                  filterProps.addFilter(
                    FilterFieldEnum.UF,
                    {
                      data: v,
                      getId: () => v,
                      getName: () => v,
                    },
                    { addOnly: true },
                  );
              }}
              options={ufs}
            />
          </Box>
        )}

        {filters[FilterFieldEnum.CITIES] && (
          <Box mb={5}>
            <EsocialCitiesSelect
              addressCompany
              onChange={(data) => {
                if (data)
                  filterProps.addFilter(
                    FilterFieldEnum.CITIES,
                    {
                      data: data,
                      getId: (d) => d.name,
                      getName: (d) => d.name,
                    },
                    { addOnly: true },
                  );
              }}
              inputProps={{
                labelPosition: 'left',
                placeholder: 'selecione...',
                superSmall: true,
              }}
              unmountOnChangeDefault
              name="city"
              label={'Cidade'}
              control={control}
            />
          </Box>
        )}
        {!![FilterFieldEnum.CITIES, FilterFieldEnum.UF].find(
          (i) => filters[i],
        ) && <Divider sx={{ mb: 2, mt: 2 }} />}
      </>

      <SFlex gap={10} direction={'column'}>
        {filters[FilterFieldEnum.COMPANY] && (
          <STagButtonLabelLeft text="Empresa" width="100%">
            <SInput
              superSmall
              fullWidth
              sx={{ width: '385px' }}
              placeholder="Empresa"
              value={companySelected?.name || ''}
              onChange={() => {
                filterProps.onFilterCompanies({ multiple: false });
                closePopper?.();
              }}
              onClick={() => {
                filterProps.onFilterCompanies({ multiple: false });
                closePopper?.();
              }}
            />
          </STagButtonLabelLeft>
        )}
        {filters[FilterFieldEnum.WORSKAPACE] &&
          !!companySelected &&
          !!data?.workspace && (
            <Box mb={5}>
              <SText color="text.label" fontSize={14} mt={6} mb={3}>
                Filtrar por estabelecimento:
              </SText>
              <SFlex flexWrap={'wrap'}>
                {data.workspace.map((workspace) => {
                  return (
                    <SCheckBox
                      key={workspace.id}
                      label={workspace.name}
                      checked={
                        !!filterProps.filter?.[
                          FilterFieldEnum.WORSKAPACE
                        ]?.data?.find((w) => w.id == workspace.id)
                      }
                      onChange={() => {
                        filterProps.addFilter(
                          FilterFieldEnum.WORSKAPACE,
                          {
                            data: workspace,
                            getId: () => workspace.id,
                            getName: () => workspace.name,
                          },
                          { removeIfEqual: true },
                        );
                      }}
                    />
                  );
                })}
              </SFlex>
            </Box>
          )}
        {filters[FilterFieldEnum.COMPANIES] && (
          <STagButtonLabelLeft text="Empresas" width="100%">
            <SInput
              superSmall
              fullWidth
              sx={{ width: '385px' }}
              placeholder="Empresa"
              value=""
              onChange={() => {
                filterProps.onFilterCompanies();
                closePopper?.();
              }}
              onClick={() => {
                filterProps.onFilterCompanies();
                closePopper?.();
              }}
            />
          </STagButtonLabelLeft>
        )}
        {filters[FilterFieldEnum.COMPANIES_GROUP] && (
          <STagButtonLabelLeft text="Grupos Empresariais">
            <SInput
              fullWidth
              superSmall
              sx={{ width: '308px' }}
              placeholder="Grupos Empresarial"
              value=""
              onChange={() => {
                filterProps.onFilterCompanies({ isGroup: true });
                closePopper?.();
              }}
              onClick={() => {
                filterProps.onFilterCompanies({ isGroup: true });
                closePopper?.();
              }}
            />
          </STagButtonLabelLeft>
        )}
        {filters[FilterFieldEnum.CLINICS] && (
          <STagButtonLabelLeft text="Clínicas">
            <STagButton
              width="60px"
              text={'Filtrar'}
              onClick={() => {
                filterProps.onFilterClinics();
                closePopper?.();
              }}
            />
          </STagButtonLabelLeft>
        )}

        {!![
          FilterFieldEnum.COMPANY,
          FilterFieldEnum.COMPANIES,
          FilterFieldEnum.COMPANIES_GROUP,
          FilterFieldEnum.CLINICS,
        ].find((i) => filters[i]) && <Divider sx={{ mb: 2, mt: 2 }} />}
      </SFlex>

      {!![
        FilterFieldEnum.ABSENTEEISM_EMPLOYEES,
        FilterFieldEnum.ABSENTEEISM_MOTIVE_IDS,
      ].find((i) => filters[i]) && (
        <>
          <Divider sx={{ mb: 2, mt: 2 }} />
          {filters[FilterFieldEnum.ABSENTEEISM_EMPLOYEES] && (
            <STagButtonLabelLeft text="Funcionário" width="100%">
              <EmployeeSelect
                addButton={false}
                multiple
                queryEmployee={{
                  companyId: riskFilterCompanyId || '',
                }}
                selectedEmployees={
                  (filterProps.filter?.[FilterFieldEnum.ABSENTEEISM_EMPLOYEES]
                    ?.data as any[]) || []
                }
                handleSelect={(_ids, list) => {
                  filterProps.addFilter(FilterFieldEnum.ABSENTEEISM_EMPLOYEES, {
                    data: list,
                    getId: (e) => String(e.id),
                    getName: (e) => e.name,
                  });
                }}
              />
            </STagButtonLabelLeft>
          )}
          {filters[FilterFieldEnum.ABSENTEEISM_MOTIVE_IDS] && (
            <Box mb={5}>
              <SText color="text.label" fontSize={14} mt={6} mb={3}>
                Motivo do afastamento
              </SText>
              <SFlex flexWrap={'wrap'}>
                {absenteeismMotivesList.map((motive) => {
                  const isChecked = !!filterProps.filter?.[
                    FilterFieldEnum.ABSENTEEISM_MOTIVE_IDS
                  ]?.data?.some((m: any) => m.id === motive.id);
                  return (
                    <SCheckBox
                      key={motive.id}
                      label={motive.desc}
                      checked={isChecked}
                      onChange={() => {
                        filterProps.addFilter(
                          FilterFieldEnum.ABSENTEEISM_MOTIVE_IDS,
                          {
                            data: motive,
                            getId: () => String(motive.id),
                            getName: () => motive.desc,
                          },
                          { removeIfEqual: true, addOnly: true },
                        );
                      }}
                    />
                  );
                })}
              </SFlex>
            </Box>
          )}
        </>
      )}

      {showRiskFactorsFilterBlock && (
        <>
          <Divider sx={{ mb: 2, mt: 2 }} />
          {filters[FilterFieldEnum.RISK_TYPES] && (
            <Box mb={5}>
              <SText color="text.label" fontSize={14} mt={6} mb={3}>
                Tipo de risco
              </SText>
              <SFlex flexWrap={'wrap'}>
                {(Object.keys(RiskEnum) as RiskEnum[]).map((riskKey) => {
                  const meta = RiskMap[riskKey];
                  const isChecked =
                    !!filterProps.filter?.[
                      FilterFieldEnum.RISK_TYPES
                    ]?.data?.includes(riskKey);
                  return (
                    <SCheckBox
                      key={riskKey}
                      label={meta?.name || riskKey}
                      checked={isChecked}
                      onChange={() => {
                        filterProps.addFilter(
                          FilterFieldEnum.RISK_TYPES,
                          {
                            data: riskKey,
                            getId: () => riskKey,
                            getName: () => meta?.name || riskKey,
                          },
                          { removeIfEqual: true, addOnly: true },
                        );
                      }}
                    />
                  );
                })}
              </SFlex>
            </Box>
          )}
          {filters[FilterFieldEnum.RISK_SEVERITIES] && (
            <Box mb={5}>
              <SText color="text.label" fontSize={14} mt={6} mb={3}>
                Severidade
              </SText>
              <SFlex flexWrap={'wrap'}>
                {[
                  SeverityEnum.LOW,
                  SeverityEnum.MEDIUM_LOW,
                  SeverityEnum.MEDIUM,
                  SeverityEnum.MEDIUM_HIGH,
                  SeverityEnum.HIGH,
                ].map((sev) => (
                  <SCheckBox
                    key={String(sev)}
                    label={String(sev)}
                    checked={
                      !!filterProps.filter?.[
                        FilterFieldEnum.RISK_SEVERITIES
                      ]?.data?.some((v) => Number(v) === sev)
                    }
                    onChange={() => {
                      filterProps.addFilter(
                        FilterFieldEnum.RISK_SEVERITIES,
                        {
                          data: sev,
                          getId: () => String(sev),
                          getName: () => String(sev),
                        },
                        { removeIfEqual: true, addOnly: true },
                      );
                    }}
                  />
                ))}
              </SFlex>
            </Box>
          )}
          {filters[FilterFieldEnum.RISK_SUB_TYPE_IDS] && (
            <Box mb={5}>
              <SText color="text.label" fontSize={14} mt={6} mb={3}>
                Subtipo
              </SText>
              {!riskFilterCompanyId && (
                <SText fontSize={12} color="text.secondary" mb={2}>
                  Selecione o contexto da empresa para carregar subtipos.
                </SText>
              )}
              {loadRiskSubTypesBrowse && !!riskFilterCompanyId && (
                <SText fontSize={12} color="text.secondary" mb={2}>
                  Carregando subtipos...
                </SText>
              )}
              <SFlex flexWrap={'wrap'}>
                {(riskSubTypesBrowse?.results || []).map((st) => {
                  const idStr = String(st.id);
                  const isChecked = !!filterProps.filter?.[
                    FilterFieldEnum.RISK_SUB_TYPE_IDS
                  ]?.filters?.some((f) => String(f.filterValue) === idStr);
                  return (
                    <SCheckBox
                      key={st.id}
                      label={st.name}
                      checked={isChecked}
                      onChange={() => {
                        filterProps.addFilter(
                          FilterFieldEnum.RISK_SUB_TYPE_IDS,
                          {
                            data: { id: st.id, name: st.name },
                            getId: (d) => String(d.id),
                            getName: (d) => d.name,
                          },
                          { removeIfEqual: true, addOnly: true },
                        );
                      }}
                    />
                  );
                })}
              </SFlex>
            </Box>
          )}
          {[
            FilterFieldEnum.RISK_MUST_IS_PGR,
            FilterFieldEnum.RISK_MUST_IS_PPP,
            FilterFieldEnum.RISK_MUST_IS_PCMSO,
            FilterFieldEnum.RISK_MUST_IS_ASO,
          ].some((f) => filters[f]) && (
            <Box mb={5}>
              <SText color="text.label" fontSize={14} mt={6} mb={3}>
                Presente no cadastro do risco
              </SText>
              <SText fontSize={12} color="text.secondary" mb={2}>
                Marque para listar apenas fatores com a opção ativa no cadastro.
              </SText>
              <SFlex flexWrap="wrap" direction="column" gap={1}>
                {[
                  {
                    field: FilterFieldEnum.RISK_MUST_IS_PGR,
                    label: 'PGR',
                  },
                  {
                    field: FilterFieldEnum.RISK_MUST_IS_PPP,
                    label: 'PPP',
                  },
                  {
                    field: FilterFieldEnum.RISK_MUST_IS_PCMSO,
                    label: 'PCMSO',
                  },
                  {
                    field: FilterFieldEnum.RISK_MUST_IS_ASO,
                    label: 'ASO',
                  },
                ].map(({ field, label }) => {
                  const active = !!filterProps.filter?.[field]?.filters?.length;
                  return (
                    <SCheckBox
                      key={field}
                      label={label}
                      checked={active}
                      onChange={() => {
                        if (active) {
                          filterProps.removeTagsFilter([
                            {
                              field,
                              filterValue: '1',
                              name: label,
                            },
                          ]);
                        } else {
                          filterProps.addFilter(field, {
                            data: { filterValue: '1' },
                            getId: (d) => d.filterValue,
                            getName: () => label,
                          });
                        }
                      }}
                    />
                  );
                })}
              </SFlex>
            </Box>
          )}
        </>
      )}

      {false && filters[FilterFieldEnum.DOWNLOAD_TYPE] && (
        <Box mt={10} overflow={'hidden'}>
          <RadioFormText
            setValue={setValue}
            type="radio"
            optionsFieldName={{ valueField: 'value', contentField: 'name' }}
            control={control}
            defaultValue={ReportDownloadtypeEnum.XML}
            options={reportDownloadtypeList}
            onChange={(e) => {
              if ((e.target as any).value)
                filterProps.addFilter(FilterFieldEnum.DOWNLOAD_TYPE, {
                  data: (e.target as any).value,
                  getId: (d) => d,
                  getName: (d) => d,
                });
            }}
            name="xml"
            columns={4}
            flex={1}
            display="flex"
            width={'135%'}
            flexDirection="column"
            {...((filterProps as any).filter[FilterFieldEnum.DOWNLOAD_TYPE]
              ?.filters?.length && { disabled: true })}
          />
        </Box>
      )}

      {filters[FilterFieldEnum.EXTERNAL_SYSTEM] && (
        <Box mb={5}>
          <SText color="text.label" fontSize={14} mt={6} mb={3}>
            Exportar para:
          </SText>
          <SFlex flexWrap={'wrap'}>
            {externalSystemEnumList.map((evaluation, index) => {
              const isDefault =
                !filterProps.filter?.[FilterFieldEnum.EXTERNAL_SYSTEM]?.data
                  ?.length && index == 0;

              const isSelected =
                !!filterProps.filter?.[
                  FilterFieldEnum.EXTERNAL_SYSTEM
                ]?.data?.includes(evaluation.value) || isDefault;

              return (
                <SCheckBox
                  key={evaluation.value}
                  label={evaluation.content}
                  checked={isSelected}
                  onChange={() => {
                    filterProps.addFilter(
                      FilterFieldEnum.EXTERNAL_SYSTEM,
                      {
                        data: evaluation.value,
                        getId: () => evaluation.value,
                        getName: () => evaluation.content,
                      },
                      { removeIfEqual: true },
                    );
                  }}
                />
              );
            })}
          </SFlex>
        </Box>
      )}
    </SFlex>
  );
};
