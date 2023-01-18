import { FC, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { getStates } from '@brazilian-utils/brazilian-utils';
import { Box, Typography } from '@mui/material';
import AutocompleteSelect from 'components/atoms/SAutocompleteSelect';
import SCheckBox from 'components/atoms/SCheckBox';
import { SDatePicker } from 'components/atoms/SDatePicker/SDatePicker';
import SFlex from 'components/atoms/SFlex';
import { STagButton, STagButtonLabelLeft } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { RadioFormText } from 'components/molecules/form/radio-text';
import { EsocialCitiesSelect } from 'components/organisms/inputSelect/EsocialCitiesSelect/EsocialCitiesSelect';
import { employeeExamEvaluationTypeList } from 'project/enum/employee-exam-history-evaluation.enum';

import { dateToString } from 'core/utils/date/date-format';

import { SPopperArrow } from '../../../../../molecules/SPopperArrow';
import { examsTypeList, FilterFieldEnum } from '../constants/filter.map';
import {
  ReportDownloadtypeEnum,
  reportDownloadtypeList,
} from './constants/report-type.constants';
import { IFilterBoxProps } from './types';

export const STableFilterBox: FC<IFilterBoxProps> = ({
  filterProps,
  closePopper,
  ...props
}) => {
  const filters = useMemo(() => {
    return filterProps.filters.reduce((acc, curr) => {
      acc[curr] = true;
      return acc;
    }, {} as Record<FilterFieldEnum, boolean>);
  }, [filterProps.filters]);

  const ufs = useMemo(() => {
    return getStates().map((state) => state.code);
  }, []);

  const { control } = useForm();

  return (
    <SFlex gap={4} direction={'column'} mt={4} {...props}>
      {(filters[FilterFieldEnum.START_DATE] ||
        filters[FilterFieldEnum.END_DATE]) && (
        <SFlex direction="row" gap={10} mb={10}>
          {filters[FilterFieldEnum.START_DATE] && (
            <Box>
              <SDatePicker
                inputProps={{
                  labelPosition: 'top',
                  superSmall: true,
                }}
                placeholderText="__/__/__"
                selected={
                  filterProps.filter?.[FilterFieldEnum.START_DATE]?.data?.[0]
                }
                label={'Data de início'}
                onChange={(date) => {
                  if (date)
                    filterProps.addFilter(FilterFieldEnum.START_DATE, {
                      data: date,
                      getId: () => date.toISOString(),
                      getName: () => dateToString(date),
                    });
                }}
              />
            </Box>
          )}
          {filters[FilterFieldEnum.END_DATE] && (
            <Box>
              <SDatePicker
                inputProps={{
                  labelPosition: 'top',
                  superSmall: true,
                }}
                placeholderText="__/__/__"
                selected={
                  filterProps.filter?.[FilterFieldEnum.END_DATE]?.data?.[0]
                }
                label={'Data fim'}
                onChange={(date) => {
                  if (date)
                    filterProps.addFilter(FilterFieldEnum.END_DATE, {
                      data: date,
                      getId: () => date.toISOString(),
                      getName: () => dateToString(date),
                    });
                }}
              />
            </Box>
          )}
        </SFlex>
      )}

      {examsTypeList.find((field) => filters[field]) && (
        <Box mb={5}>
          <SText color="text.label" fontSize={14} mt={6} mb={3}>
            Filtar por tipo de exames:
          </SText>
          <SFlex flexWrap={'wrap'}>
            {filters[FilterFieldEnum.IS_ADMISSION] && (
              <SCheckBox
                label="Admissional"
                checked={
                  typeof filterProps.filter?.[FilterFieldEnum.IS_ADMISSION]
                    ?.data?.[0] != 'boolean'
                }
                onChange={() => {
                  filterProps.addFilter(
                    FilterFieldEnum.IS_ADMISSION,
                    {
                      data: false,
                      getId: () => 'Admissional',
                      getName: () => 'Admissional',
                    },
                    { removeIfEqual: true },
                  );
                }}
              />
            )}
            {filters[FilterFieldEnum.IS_PERIODIC] && (
              <SCheckBox
                label="Periódico"
                checked={
                  typeof filterProps.filter?.[FilterFieldEnum.IS_PERIODIC]
                    ?.data?.[0] != 'boolean'
                }
                onChange={() => {
                  filterProps.addFilter(
                    FilterFieldEnum.IS_PERIODIC,
                    {
                      data: false,
                      getId: () => 'Periódico',
                      getName: () => 'Periódico',
                    },
                    { removeIfEqual: true },
                  );
                }}
              />
            )}
            {filters[FilterFieldEnum.IS_CHANGE] && (
              <SCheckBox
                label="Mudança"
                checked={
                  typeof filterProps.filter?.[FilterFieldEnum.IS_CHANGE]
                    ?.data?.[0] != 'boolean'
                }
                onChange={() => {
                  filterProps.addFilter(
                    FilterFieldEnum.IS_CHANGE,
                    {
                      data: false,
                      getId: () => 'Mudança',
                      getName: () => 'Mudança',
                    },
                    { removeIfEqual: true },
                  );
                }}
              />
            )}
            {filters[FilterFieldEnum.IS_RETURN] && (
              <SCheckBox
                label="Retorno"
                checked={
                  typeof filterProps.filter?.[FilterFieldEnum.IS_RETURN]
                    ?.data?.[0] != 'boolean'
                }
                onChange={() => {
                  filterProps.addFilter(
                    FilterFieldEnum.IS_RETURN,
                    {
                      data: false,
                      getId: () => 'Retorno',
                      getName: () => 'Retorno',
                    },
                    { removeIfEqual: true },
                  );
                }}
              />
            )}
            {filters[FilterFieldEnum.IS_DISMISSAL] && (
              <SCheckBox
                label="Demissional"
                checked={
                  typeof filterProps.filter?.[FilterFieldEnum.IS_DISMISSAL]
                    ?.data?.[0] != 'boolean'
                }
                onChange={() => {
                  filterProps.addFilter(
                    FilterFieldEnum.IS_DISMISSAL,
                    {
                      data: false,
                      getId: () => 'Demissional',
                      getName: () => 'Demissional',
                    },
                    { removeIfEqual: true },
                  );
                }}
              />
            )}
          </SFlex>
        </Box>
      )}

      {filters[FilterFieldEnum.EVALUATION_TYPE] && (
        <Box mb={5}>
          <SText color="text.label" fontSize={14} mt={6} mb={3}>
            Filtar por tipo de exames:
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
            // inputValue={filterProps.filter[FilterEnum.UF].}
            onChange={(e, v: typeof ufs[0]) => {
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
      </SFlex>

      {filters[FilterFieldEnum.DOWLOAD_TYPE] && (
        <Box
          mt={10}
          // flex={1}
          // display="flex"
          // width={'100%'}
          // flexDirection="column"
        >
          <RadioFormText
            type="radio"
            optionsFieldName={{ valueField: 'value', contentField: 'name' }}
            control={control}
            defaultValue={ReportDownloadtypeEnum.XML}
            options={reportDownloadtypeList}
            onChange={(e) => {
              if ((e.target as any).value)
                filterProps.addFilter(FilterFieldEnum.DOWLOAD_TYPE, {
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
            {...((filterProps as any).filter[FilterFieldEnum.DOWLOAD_TYPE]
              ?.filters?.length && { disabled: true })}
          />
        </Box>
      )}
    </SFlex>
  );
};
