import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { useFetchBrowseCharacterizationAiProfiles } from '@v2/services/security/characterization/characterization-ai-profile/hooks/useFetchBrowseCharacterizationAiProfiles';
import { useMutateCharacterizationAiProfile } from '@v2/services/security/characterization/characterization-ai-profile/hooks/useMutateCharacterizationAiProfile';
import type { CharacterizationAiProfileDto } from '@v2/services/security/characterization/characterization-ai-profile/service/characterization-ai-profile.types';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { CompanyFlowStickySubheader } from 'components/organisms/main/CompanyFlow/CompanyFlowStickySubheader';
import { CharacterizationSummarySection } from 'components/organisms/main/CompanyFlow/CharacterizationSummarySection';
import { STabs } from 'components/molecules/STabs';
import {
  COMPANY_SST_PATHNAME,
  COMPANY_SST_STAGE,
  getAssistenteGseHref,
  getCharacterizationAiProfilesHref,
  getCharacterizationAiProfilesNavStep,
  getCharacterizationSubareaNavItems,
  getChemicalProductsHref,
} from 'core/constants/characterization-navigation.constants';
import { characterizationMap } from 'core/constants/maps/characterization.map';
import { useAccess } from 'core/hooks/useAccess';
import { PermissionEnum } from 'project/enum/permission.enum';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';

import { CharacterizationAiProfileAssistedDialog } from './CharacterizationAiProfileAssistedDialog';
import { CharacterizationAiProfileFormDialog } from './CharacterizationAiProfileFormDialog';
import { CharacterizationAiProfileTypeDefaultsDialog } from './CharacterizationAiProfileTypeDefaultsDialog';

function readErrorMessage(err: unknown): string {
  const message = (err as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;
  if (Array.isArray(message)) return message.join(' ');
  if (typeof message === 'string') return message;
  return 'Ocorreu um erro inesperado.';
}

function formatTypes(types: CharacterizationAiProfileDto['recommendedCharacterizationTypes']) {
  if (!types?.length) return '—';
  return types.map((t) => characterizationMap[t]?.name ?? t).join(', ');
}

export function CharacterizationAiProfilesPageContent({
  companyId,
}: {
  companyId: string;
}) {
  const router = useRouter();
  const { isAuthSuccess } = useAuthShow();
  const { isMaster } = useAccess();

  const canManage =
    isMaster ||
    isAuthSuccess({ permissions: [PermissionEnum.CHARACTERIZATION_AI_PROFILE] });

  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<
    'all' | 'true' | 'false'
  >('all');

  const { data, isLoading, isError, error, refetch, isFetching } =
    useFetchBrowseCharacterizationAiProfiles(
      {
        companyId,
        search: search || undefined,
        isActive: isActiveFilter,
        page: 1,
        limit: 100,
      },
      canManage,
    );

  const { duplicate, setStatus, setDefault } = useMutateCharacterizationAiProfile();

  const [formOpen, setFormOpen] = useState(false);
  const [assistedOpen, setAssistedOpen] = useState(false);
  const [typeDefaultsOpen, setTypeDefaultsOpen] = useState(false);
  const [editingProfile, setEditingProfile] =
    useState<CharacterizationAiProfileDto | null>(null);

  const navItems = getCharacterizationSubareaNavItems();
  const aiProfilesNavStep = getCharacterizationAiProfilesNavStep();
  const profiles = data?.data ?? [];
  const activeProfiles = useMemo(
    () => profiles.filter((p) => p.isActive),
    [profiles],
  );

  const handleEdit = (profile: CharacterizationAiProfileDto) => {
    setEditingProfile(profile);
    setFormOpen(true);
  };

  const handleDuplicate = async (profile: CharacterizationAiProfileDto) => {
    const name = window.prompt(
      'Nome do especialista duplicado:',
      `${profile.name} (cópia)`,
    );
    if (name === null) return;
    try {
      await duplicate.mutateAsync({
        companyId,
        profileId: profile.id,
        name: name.trim() || undefined,
      });
    } catch (err) {
      window.alert(readErrorMessage(err));
    }
  };

  const handleToggleStatus = async (profile: CharacterizationAiProfileDto) => {
    try {
      await setStatus.mutateAsync({
        companyId,
        profileId: profile.id,
        isActive: !profile.isActive,
      });
    } catch (err) {
      window.alert(readErrorMessage(err));
    }
  };

  const handleSetDefault = async (profile: CharacterizationAiProfileDto) => {
    try {
      await setDefault.mutateAsync({
        companyId,
        profileId: profile.isCompanyDefault ? null : profile.id,
      });
    } catch (err) {
      window.alert(readErrorMessage(err));
    }
  };

  const handleNavChange = (_: unknown, step: number) => {
    const item = navItems[step];
    if (!item) return;
    const tabWorkspaceId = router.query.tabWorkspaceId as string | undefined;

    if (item.kind === 'external' && item.id === 'characterization-ai-profiles') {
      return;
    }
    if (item.kind === 'external' && item.id === 'chemical-products') {
      void router.push(getChemicalProductsHref({ companyId, tabWorkspaceId }));
      return;
    }
    if (item.kind === 'external' && item.id === 'assistente-gse') {
      void router.push(getAssistenteGseHref({ companyId, tabWorkspaceId }));
      return;
    }
    if (item.kind === 'tab') {
      void router.push({
        pathname: COMPANY_SST_PATHNAME,
        query: {
          companyId,
          stage: COMPANY_SST_STAGE,
          active: String(item.tab),
          ...(tabWorkspaceId ? { tabWorkspaceId } : {}),
        },
      });
    }
  };

  if (!canManage) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="warning">
          Você não tem permissão para gerenciar especialistas de IA da
          Caracterização. Solicite a permissão &quot;Gerenciar especialistas de
          IA da Caracterização&quot; ou acesso master.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <CharacterizationSummarySection />
      <CompanyFlowStickySubheader>
        <STabs
          shadow
          value={aiProfilesNavStep >= 0 ? aiProfilesNavStep : 0}
          options={navItems.map((item) => ({ label: item.label }))}
          onChange={handleNavChange}
        />
      </CompanyFlowStickySubheader>

      <SFlex
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        gap={2}
        mt={2}
      >
        <Box>
          <SText fontSize={18} fontWeight={700}>
            Especialistas de IA
          </SText>
          <SText fontSize={13} color="text.secondary">
            Especialistas contextuais homologados para o Assistente IA da
            Caracterização.
          </SText>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="outlined"
            onClick={() => setTypeDefaultsOpen(true)}
            disabled={!activeProfiles.length}
          >
            Defaults por tipo
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setEditingProfile(null);
              setAssistedOpen(true);
            }}
          >
            Criar com assistência
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setEditingProfile(null);
              setFormOpen(true);
            }}
          >
            Novo especialista
          </Button>
        </Stack>
      </SFlex>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField
          label="Buscar"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 220 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="active-filter-label">Status</InputLabel>
          <Select
            labelId="active-filter-label"
            label="Status"
            value={isActiveFilter}
            onChange={(e) =>
              setIsActiveFilter(e.target.value as 'all' | 'true' | 'false')
            }
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="true">Ativos</MenuItem>
            <MenuItem value="false">Inativos</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {isLoading || isFetching ? (
        <SFlex gap={1} direction="column">
          <SSkeleton height={48} />
          <SSkeleton height={48} />
          <SSkeleton height={48} />
        </SFlex>
      ) : null}

      {isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Tentar novamente
            </Button>
          }
        >
          {readErrorMessage(error)}
        </Alert>
      ) : null}

      {!isLoading && !isError && profiles.length === 0 ? (
        <Alert severity="info">
          Nenhum especialista encontrado. Crie um especialista manualmente ou use
          a assistência para gerar um rascunho.
        </Alert>
      ) : null}

      {!isLoading && !isError && profiles.length > 0 ? (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Especialista</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Versão</TableCell>
                <TableCell>Tipos recomendados</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <SText fontSize={14} fontWeight={600}>
                        {profile.name}
                      </SText>
                      {profile.isCompanyDefault ? (
                        <Chip label="Padrão empresa" size="small" color="primary" />
                      ) : null}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <SText fontSize={13}>
                      {profile.category || '—'}
                    </SText>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={profile.isActive ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={profile.isActive ? 'success' : 'default'}
                      variant={profile.isActive ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>v{profile.version}</TableCell>
                  <TableCell>
                    <Tooltip title={formatTypes(profile.recommendedCharacterizationTypes)}>
                      <SText fontSize={13} lineNumber={2}>
                        {formatTypes(profile.recommendedCharacterizationTypes)}
                      </SText>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Button size="small" onClick={() => handleEdit(profile)}>
                        Editar
                      </Button>
                      <Button
                        size="small"
                        onClick={() => void handleDuplicate(profile)}
                        disabled={duplicate.isPending}
                      >
                        Duplicar
                      </Button>
                      <Button
                        size="small"
                        onClick={() => void handleToggleStatus(profile)}
                        disabled={setStatus.isPending}
                      >
                        {profile.isActive ? 'Inativar' : 'Ativar'}
                      </Button>
                      <Button
                        size="small"
                        onClick={() => void handleSetDefault(profile)}
                        disabled={setDefault.isPending || !profile.isActive}
                      >
                        {profile.isCompanyDefault
                          ? 'Remover padrão'
                          : 'Definir padrão'}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ) : null}

      <CharacterizationAiProfileFormDialog
        open={formOpen}
        companyId={companyId}
        profile={editingProfile}
        onClose={() => {
          setFormOpen(false);
          setEditingProfile(null);
        }}
      />

      <CharacterizationAiProfileAssistedDialog
        open={assistedOpen}
        companyId={companyId}
        activeProfiles={activeProfiles}
        onClose={() => setAssistedOpen(false)}
      />

      <CharacterizationAiProfileTypeDefaultsDialog
        open={typeDefaultsOpen}
        companyId={companyId}
        profiles={profiles}
        onClose={() => setTypeDefaultsOpen(false)}
      />
    </Box>
  );
}
