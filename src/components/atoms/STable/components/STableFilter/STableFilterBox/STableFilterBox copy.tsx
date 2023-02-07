import { FC, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { getStates } from '@brazilian-utils/brazilian-utils';
import { Box, Typography } from '@mui/material';
import AutocompleteSelect from 'components/atoms/SAutocompleteSelect';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { RadioFormText } from 'components/molecules/form/radio-text';
import { EsocialCitiesSelect } from 'components/organisms/inputSelect/EsocialCitiesSelect/EsocialCitiesSelect';

import { SPopperArrow } from '../../../../../molecules/SPopperArrow';
import { FilterFieldEnum } from '../constants/filter.map';
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
      {filters[FilterFieldEnum.UF] && (
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
      {filters[FilterFieldEnum.COMPANIES] && (
        <Box
          {...{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          }}
        >
          <Typography mr={4} fontSize={14} color={'grey.600'}>
            {'Empresas:'}
          </Typography>
          <STagButton
            width="100%"
            text={'Empresas'}
            onClick={() => {
              filterProps.onFilterCompanies();
              closePopper?.();
            }}
          />
        </Box>
      )}
      {filters[FilterFieldEnum.COMPANIES_GROUP] && (
        <STagButton
          width="100%"
          text={'Grupos Empresariais'}
          onClick={() => {
            filterProps.onFilterCompanies({ isGroup: true });
            closePopper?.();
          }}
        />
      )}

      {filters[FilterFieldEnum.DOWNLOAD_TYPE] && (
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
