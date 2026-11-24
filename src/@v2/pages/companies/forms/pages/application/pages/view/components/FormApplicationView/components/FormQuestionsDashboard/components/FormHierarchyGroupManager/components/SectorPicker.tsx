import { HierarchyLabel } from './HierarchyLabel';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import {
  hierarchyLevelOrder,
  sectorContextParts,
  sectorPresentationLabel,
  SectorVisibility,
} from '../helpers/sector-picker.model';
import { useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  Tooltip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  hierarchyLevelLabels as levelLabel,
  HierarchyGroupOption,
} from '../helpers/formatHierarchyGroupOptionLabel';
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
export function SectorPicker({
  options: sourceOptions,
  selected,
  onChange,
  disabled = false,
  onVisibilityChange,
}: {
  options: HierarchyGroupOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  onVisibilityChange?: (visibility: SectorVisibility) => void;
}) {
  const [companies, setCompanies] = useState<string[]>([]),
    [establishments, setEstablishments] = useState<string[]>([]),
    [ancestors, setAncestors] = useState<Record<string, string[]>>({}),
    [search, setSearch] = useState(''),
    [order, setOrder] = useState('structure');
  const [visibility, setVisibility] = useState<SectorVisibility>({
    hideCompany: false,
    hideEstablishment: false,
  });
  const options = useMemo(
    () =>
      sourceOptions.map((o) => ({
        ...o,
        companyName:
          visibility.companyNameMode === 'fantasy'
            ? o.companyFantasy?.trim() || o.companyName
            : o.companyName,
      })),
    [sourceOptions, visibility.companyNameMode],
  );
  const toggleLevel = (level: 'hideCompany' | 'hideEstablishment') => {
    const next = { ...visibility, [level]: !visibility[level] };
    if (level === 'hideCompany') setCompanies([]);
    else setEstablishments([]);
    setVisibility(next);
    onVisibilityChange?.(next);
  };
  const visibilityButton = (
    level: 'hideCompany' | 'hideEstablishment',
    label: string,
  ) => (
    <Tooltip
      title={`${visibility[level] ? 'Exibir' : 'Ocultar'} ${label}: ${visibility[level] ? 'reativar' : 'desativar'} filtro e ${visibility[level] ? 'mostrar' : 'retirar dos'} caminhos`}
    >
      <span>
        <IconButton
          disabled={disabled}
          aria-label={`${visibility[level] ? 'Exibir' : 'Ocultar'} nível ${label}`}
          aria-pressed={visibility[level]}
          color={visibility[level] ? 'primary' : 'default'}
          onClick={() => toggleLevel(level)}
        >
          {visibility[level] ? (
            <VisibilityOffOutlinedIcon />
          ) : (
            <VisibilityOutlinedIcon />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
  const companyKey = (o: HierarchyGroupOption) =>
    o.companyId ?? o.companyName ?? 'unknown';
  const companyOptions = [
    ...new Map(
      options.map((o) => [
        companyKey(o),
        { id: companyKey(o), name: o.companyName || 'Empresa não informada' },
      ]),
    ).values(),
  ];
  const scoped = options.filter(
    (o) =>
      visibility.hideCompany ||
      !companies.length ||
      companies.includes(companyKey(o)),
  );
  const establishmentOptions = [
    ...new Set(
      scoped.map((o) => o.establishment).filter((x): x is string => !!x),
    ),
  ].sort();
  const levels = hierarchyLevelOrder(options);
  const visible = useMemo(
    () =>
      scoped
        .filter(
          (o) =>
            (visibility.hideEstablishment ||
              !establishments.length ||
              establishments.includes(o.establishment ?? '')) &&
            Object.entries(ancestors).every(
              ([type, ids]) =>
                !ids.length ||
                (o.hierarchyPath ?? []).some(
                  (n) => n.type === type && ids.includes(n.id),
                ),
            ) &&
            normalize(sectorPresentationLabel(o, visibility)).includes(
              normalize(search),
            ),
        )
        .sort((a, b) => {
          const key = (o: HierarchyGroupOption) =>
            order === 'sector'
              ? o.name
              : [...sectorContextParts(o, visibility), o.name].join(' / ');
          return (
            key(a).localeCompare(key(b), 'pt-BR', { sensitivity: 'base' }) ||
            a.id.localeCompare(b.id)
          );
        }),
    [options, companies, establishments, ancestors, search, order, visibility],
  );
  return (
    <Stack spacing={6} sx={{ minWidth: 0 }}>
      <Typography color="text.primary" fontWeight={700}>
        Localizar setores
      </Typography>
      <TextField
        select
        label="Exibir empresa por"
        value={visibility.companyNameMode ?? 'legal'}
        disabled={disabled || visibility.hideCompany}
        onChange={(e) => {
          const next = {
            ...visibility,
            companyNameMode: e.target.value as 'legal' | 'fantasy',
          };
          setVisibility(next);
          onVisibilityChange?.(next);
        }}
        helperText="Sem nome fantasia cadastrado, será exibida a razão social."
      >
        <MenuItem value="fantasy">Nome fantasia</MenuItem>
        <MenuItem value="legal">Razão social</MenuItem>
      </TextField>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'repeat(2, minmax(0, 1fr))',
          },
          gap: 6,
        }}
      >
        {companyOptions.length > 0 && (
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ minWidth: 0 }}
          >
            <Autocomplete
              sx={{ minWidth: 0, width: '100%' }}
              multiple
              disabled={
                disabled ||
                visibility.hideCompany ||
                companyOptions.length === 1
              }
              options={companyOptions}
              getOptionLabel={(o) => o.name}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              value={companyOptions.filter((o) => companies.includes(o.id))}
              onChange={(_, v) => {
                setCompanies(v.map((o) => o.id));
                setEstablishments([]);
                setAncestors({});
              }}
              renderInput={(p) => (
                <TextField
                  {...p}
                  label="Empresas"
                  placeholder={
                    visibility.hideCompany
                      ? 'Empresa oculta'
                      : companies.length
                        ? ''
                        : 'Todas as empresas'
                  }
                />
              )}
            />
            {visibilityButton('hideCompany', 'Empresa')}
          </Stack>
        )}
        {establishmentOptions.length > 0 && (
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ minWidth: 0 }}
          >
            <Autocomplete
              sx={{ minWidth: 0, width: '100%' }}
              multiple
              disabled={disabled || visibility.hideEstablishment}
              options={establishmentOptions}
              value={establishments}
              onChange={(_, v) => setEstablishments(v)}
              renderInput={(p) => (
                <TextField
                  {...p}
                  label="Estabelecimentos"
                  placeholder={
                    visibility.hideEstablishment
                      ? 'Estabelecimento oculto'
                      : establishments.length
                        ? ''
                        : 'Todos os estabelecimentos'
                  }
                />
              )}
            />
            {visibilityButton('hideEstablishment', 'Estabelecimento')}
          </Stack>
        )}
        {levels.map((type) => {
          const nodes = [
            ...new Map(
              scoped.flatMap((o) =>
                (o.hierarchyPath ?? [])
                  .filter((n) => n.type === type)
                  .map(
                    (n) =>
                      [
                        n.id,
                        {
                          ...n,
                          company: o.companyName,
                          establishment: o.establishment,
                        },
                      ] as const,
                  ),
              ),
            ).values(),
          ];
          return (
            <Autocomplete
              sx={{ minWidth: 0, width: '100%' }}
              key={type}
              multiple
              disabled={disabled}
              options={nodes}
              getOptionLabel={(n) =>
                [
                  `${levelLabel[n.type] ?? n.type}: ${n.name}`,
                  !visibility.hideCompany && companyOptions.length > 1
                    ? `Empresa: ${n.company}`
                    : !visibility.hideEstablishment
                      ? n.establishment
                        ? `Estabelecimento: ${n.establishment}`
                        : undefined
                      : undefined,
                ]
                  .filter(Boolean)
                  .join(' · ')
              }
              renderOption={(props, n) => {
                const context =
                  !visibility.hideCompany && companyOptions.length > 1
                    ? `Empresa: ${n.company}`
                    : !visibility.hideEstablishment && n.establishment
                      ? `Estabelecimento: ${n.establishment}`
                      : '';
                const { key, ...rest } = props;
                return (
                  <li key={key} {...rest}>
                    <HierarchyLabel
                      emphasizeLevel={levelLabel[n.type] ?? n.type}
                      text={[
                        `${levelLabel[n.type] ?? n.type}: ${n.name}`,
                        context,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    />
                  </li>
                );
              }}
              renderTags={(values, getTagProps) =>
                values.map((n, index) => {
                  const { key, ...rest } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      {...rest}
                      label={
                        <HierarchyLabel
                          emphasizeLevel={levelLabel[n.type] ?? n.type}
                          text={`${levelLabel[n.type] ?? n.type}: ${n.name}`}
                        />
                      }
                    />
                  );
                })
              }
              isOptionEqualToValue={(a, b) => a.id === b.id}
              value={nodes.filter((n) => ancestors[type]?.includes(n.id))}
              onChange={(_, v) =>
                setAncestors((old) => ({ ...old, [type]: v.map((n) => n.id) }))
              }
              renderInput={(p) => (
                <TextField
                  {...p}
                  label={levelLabel[type] ?? type}
                  placeholder={ancestors[type]?.length ? '' : 'Todos'}
                />
              )}
            />
          );
        })}
        <TextField
          select
          label="Organizar por"
          value={order}
          disabled={disabled}
          onChange={(e) => setOrder(e.target.value)}
        >
          <MenuItem value="structure">
            {visibility.hideCompany
              ? visibility.hideEstablishment
                ? 'Estrutura hierárquica'
                : 'Estabelecimento e estrutura hierárquica'
              : visibility.hideEstablishment
                ? 'Empresa e estrutura hierárquica'
                : 'Empresa e estrutura hierárquica'}
          </MenuItem>
          <MenuItem value="sector">Nome do setor</MenuItem>
        </TextField>
      </Box>
      <TextField
        label={
          visibility.hideCompany
            ? visibility.hideEstablishment
              ? 'Buscar setor ou nível hierárquico'
              : 'Buscar setor, estabelecimento ou nível hierárquico'
            : 'Buscar setor, empresa ou nível hierárquico'
        }
        value={search}
        disabled={disabled}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Typography variant="body2" color="text.secondary">
        {visible.length} setor(es) exibido(s) · {selected.length}{' '}
        selecionado(s). Os filtros não removem seleções.
      </Typography>
      <Box
        sx={{
          maxHeight: 360,
          overflowY: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        {!visible.length && (
          <Typography color="text.primary" sx={{ p: 8 }}>
            Nenhum setor corresponde aos filtros.
          </Typography>
        )}
        {visible.map((o, index) => {
          const path = sectorContextParts(o, visibility).join(' → ');
          const previous = visible[index - 1];
          const root = sectorContextParts(o, visibility).join(' → ');
          const rootKey = (option: HierarchyGroupOption) =>
            JSON.stringify([
              visibility.hideCompany ? null : companyKey(option),
              visibility.hideEstablishment ? null : option.establishment,
              ...(option.hierarchyPath ?? []).map((n) => n.id),
            ]);
          return (
            <Box key={o.id}>
              {order === 'structure' &&
                (!previous || rootKey(o) !== rootKey(previous)) && (
                  <Typography
                    color="text.primary"
                    sx={{ px: 6, py: 4, bgcolor: 'action.hover' }}
                    fontWeight={700}
                  >
                    <HierarchyLabel text={root || 'Setores'} />
                  </Typography>
                )}
              <FormControlLabel
                sx={{ m: 0, p: 4, width: '100%', alignItems: 'flex-start' }}
                disabled={disabled}
                control={
                  <Checkbox
                    checked={selected.includes(o.id)}
                    onChange={(_, checked) =>
                      onChange(
                        checked
                          ? [...selected, o.id]
                          : selected.filter((id) => id !== o.id),
                      )
                    }
                  />
                }
                label={
                  <Box>
                    <Typography color="text.primary" fontWeight={650}>
                      <HierarchyLabel text={`Setor: ${o.name}`} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <HierarchyLabel
                        text={path || 'Sem níveis superiores cadastrados'}
                      />
                    </Typography>
                    {o.participantCount != null && (
                      <Typography color="text.primary" variant="caption">
                        {o.participantCount} participante(s)
                        {o.respondentCount != null
                          ? ` · ${o.respondentCount} respondente(s)`
                          : ''}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
}
