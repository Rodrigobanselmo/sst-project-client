import { Box } from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { useFetchBrowseCoordinator } from '@v2/services/security/action-plan/user/browse-coordinators/hooks/useFetchBrowseCoordinators';
import { useState } from 'react';

export const FormCoordinatorSelect = ({ companyId }: { companyId: string }) => {
  const [search, setSearch] = useState('');
  const { coordinators, isLoading } = useFetchBrowseCoordinator({
    companyId,
    filters: {
      search: search,
    },
    pagination: {
      page: 1,
      limit: 10,
    },
  });

  return (
    <SSearchSelectForm
      boxProps={{ flex: 1 }}
      name="coordinator"
      loading={!coordinators?.results || isLoading}
      getOptionValue={(option) => option.id}
      label="Coordenador"
      getOptionLabel={(option) => `${option.name} - ${option.email}`}
      renderItem={({ option }) => (
        <Box px={8}>
          <SText fontSize={14} mb={-1}>
            {option.name}
          </SText>
          <SText fontSize={11}>{option.email}</SText>
        </Box>
      )}
      onSearch={(value) => setSearch(value)}
      onInputChange={(value) => console.log(value)}
      placeholder="Selecionar Coordenador"
      options={coordinators?.results || []}
    />
  );
};
