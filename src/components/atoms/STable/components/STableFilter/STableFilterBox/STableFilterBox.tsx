/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FC, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { getStates } from '@brazilian-utils/brazilian-utils';
import { Box, Divider, Typography } from '@mui/material';
import AutocompleteSelect from 'components/atoms/SAutocompleteSelect';
import SCheckBox from 'components/atoms/SCheckBox';
import { SDatePicker } from 'components/atoms/SDatePicker/SDatePicker';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import { STagButton, STagButtonLabelLeft } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { RadioFormText } from 'components/molecules/form/radio-text';
import { EsocialCitiesSelect } from 'components/organisms/inputSelect/EsocialCitiesSelect/EsocialCitiesSelect';
import dayjs from 'dayjs';
import { examAvaliationTypeList } from 'project/enum/employee-exam-history-avaliation.enum';
import { employeeExamEvaluationTypeList } from 'project/enum/employee-exam-history-evaluation.enum';
import { asoExamTypeList } from 'project/enum/employee-exam-history-type.enum';

import { statusOptionsConstant } from 'core/constants/maps/status-options.constant';
import { dateToString } from 'core/utils/date/date-format';

import { SPopperArrow } from '../../../../../molecules/SPopperArrow';
import { FilterFieldEnum, filterFieldMap } from '../constants/filter.map';
import {
  ReportDownloadtypeEnum,
  reportDownloadtypeList,
} from './constants/report-type.constants';
import { IFilterBoxProps } from './types';

export const STableFilterBox: FC<{ children?: any } & IFilterBoxProps> = ({
  filterProps,
  closePopper,
  ...props
}) => {
  const statusConfig = Array.isArray(filterProps.filters)
    ? { statusOptions: [], statusSchema: undefined }
    : filterProps.filters;

  const filters = useMemo(() => {
    const filters = Array.isArray(filterProps.filters)
      ? filterProps.filters
      : filterProps.filters.fields;

    return filters.reduce((acc, curr) => {
      acc[curr] = true;
      return acc;
    }, {} as Record<FilterFieldEnum, boolean>);
  }, [filterProps.filters]);

  const ufs = useMemo(() => {
    return getStates().map((state) => state.code);
  }, []);

  const { control } = useForm();

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
      ].find((field) => filters[field]) && (
        <>
          <SFlex direction="row" gap={10} mb={5}>
            {[
              FilterFieldEnum.START_DATE,
              FilterFieldEnum.END_DATE,
              FilterFieldEnum.LTE_EXPIRED_EXAM,
            ].map((field) => {
              if (!filters[field]) return null;

              return (
                <Box key={field}>
                  <SDatePicker
                    inputProps={{
                      labelPosition: 'top',
                      superSmall: true,
                    }}
                    {...(field == FilterFieldEnum.LTE_EXPIRED_EXAM && {
                      filterDate: (date) =>
                        dayjs().isBefore(dayjs(date).add(1, 'day')),
                    })}
                    placeholderText="__/__/__"
                    selected={(filterProps as any).filter?.[field]?.data?.[0]}
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

      <SFlex gap={3} direction={'column'}>
        {filters[FilterFieldEnum.COMPANIES] && (
          <STagButtonLabelLeft text="Empresas">
            <STagButton
              width="60px"
              text={'Filtrar'}
              onClick={() => {
                filterProps.onFilterCompanies();
                closePopper?.();
              }}
            />
          </STagButtonLabelLeft>
        )}
        {filters[FilterFieldEnum.COMPANIES_GROUP] && (
          <STagButtonLabelLeft text="Grupos Empresariais">
            <STagButton
              width="60px"
              text={'Filtrar'}
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
          FilterFieldEnum.COMPANIES,
          FilterFieldEnum.COMPANIES_GROUP,
          FilterFieldEnum.CLINICS,
        ].find((i) => filters[i]) && <Divider sx={{ mb: 2, mt: 2 }} />}
      </SFlex>

      {filters[FilterFieldEnum.DOWNLOAD_TYPE] && (
        <Box mt={10} overflow={'hidden'}>
          <RadioFormText
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
    </SFlex>
  );
};
