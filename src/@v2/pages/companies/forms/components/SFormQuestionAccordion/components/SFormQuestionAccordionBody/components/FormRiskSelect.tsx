import { Box } from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { useInfinityFetchBrowseRisks } from '@v2/services/forms/risk/browse-risks/hooks/useFetchBrowseRisks';
import { useState, useMemo } from 'react';

export const FormRiskSelect = ({
  name,
  companyId,
}: {
  name: string;
  companyId: string;
}) => {
  const [search, setSearch] = useState('');
  const {
    risks: risksData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinityFetchBrowseRisks({
    companyId: companyId,
    filters: {
      search: search,
    },
    pagination: {
      page: 1,
      limit: 10,
    },
  });

  // Flatten all pages of risks into a single array
  const risks = useMemo(() => {
    if (!risksData?.pages) return [];
    return risksData.pages.flatMap((page) => page.results || []);
  }, [risksData]);

  return (
    <SSearchSelectForm
      boxProps={{ flex: 1 }}
      name={name}
      onScrollEnd={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      loading={isLoading || isFetchingNextPage}
      getOptionValue={(option: any) => option.id}
      label="Risco"
      getOptionLabel={(option: any) => option.name}
      renderItem={({ option }: { option: any }) => (
        <Box px={8}>
          <SText fontSize={14} mb={-1}>
            {option.name}
          </SText>
          <SText fontSize={11}>PSIC - Severidade: {option.severity}</SText>
        </Box>
      )}
      onSearch={(value) => setSearch(value)}
      onInputChange={(value) => console.log(value)}
      placeholder="Selecionar Risco"
      options={risks || []}
    />
  );
};
