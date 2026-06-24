import { FC, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { SInput } from '@v2/components/forms/fields/SInput/SInput';
import { useFetchBrowseBiologicalIndicators } from '@v2/services/medicine/biological-indicator/hooks/useFetchBrowseBiologicalIndicators';
import type {
  BiologicalIndicatorStatus,
  BiologicalIndicatorTable,
  BiologicalIndicatorType,
  BrowseBiologicalIndicatorsParams,
} from '@v2/services/medicine/biological-indicator/service/biological-indicator.types';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RoutesEnum } from 'core/enums/routes.enums';
import { RoleEnum } from 'project/enum/roles.enums';

const STATUS_LABELS: Record<BiologicalIndicatorStatus, string> = {
  DRAFT: 'Rascunho',
  ACTIVE: 'Ativo',
  DEPRECATED: 'Depreciado',
  REVOKED: 'Revogado',
};

const TABLE_LABELS: Record<BiologicalIndicatorTable, string> = {
  QUADRO_1: 'Quadro 1',
  QUADRO_2: 'Quadro 2',
};

const TYPE_LABELS: Record<BiologicalIndicatorType, string> = {
  IBE_EE: 'IBE EE',
  IBE_SC: 'IBE SC',
};

const triStateOptions = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Sim' },
  { value: 'false', label: 'Não' },
];

export const BiologicalIndicatorsListPage: FC = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [substanceName, setSubstanceName] = useState('');
  const [cas, setCas] = useState('');
  const [tableNumber, setTableNumber] = useState<BiologicalIndicatorTable | ''>('');
  const [indicatorType, setIndicatorType] = useState<BiologicalIndicatorType | ''>('');
  const [status, setStatus] = useState<BiologicalIndicatorStatus | ''>('');
  const [requiresNormativeReview, setRequiresNormativeReview] = useState('');
  const [isSubstanceGroup, setIsSubstanceGroup] = useState('');
  const [hasConfirmedRisk, setHasConfirmedRisk] = useState('');
  const [hasConfirmedExam, setHasConfirmedExam] = useState('');
  const [hasPendency, setHasPendency] = useState('');

  const browseParams = useMemo<BrowseBiologicalIndicatorsParams>(
    () => ({
      page,
      limit: 25,
      search: search || undefined,
      substanceName: substanceName || undefined,
      cas: cas || undefined,
      tableNumber: tableNumber || undefined,
      indicatorType: indicatorType || undefined,
      status: status || undefined,
      requiresNormativeReview:
        requiresNormativeReview === ''
          ? undefined
          : requiresNormativeReview === 'true',
      isSubstanceGroup:
        isSubstanceGroup === '' ? undefined : isSubstanceGroup === 'true',
      hasConfirmedRisk:
        hasConfirmedRisk === '' ? undefined : hasConfirmedRisk === 'true',
      hasConfirmedExam:
        hasConfirmedExam === '' ? undefined : hasConfirmedExam === 'true',
      hasPendency: hasPendency === '' ? undefined : hasPendency === 'true',
    }),
    [
      page,
      search,
      substanceName,
      cas,
      tableNumber,
      indicatorType,
      status,
      requiresNormativeReview,
      isSubstanceGroup,
      hasConfirmedRisk,
      hasConfirmedExam,
      hasPendency,
    ],
  );

  const { data, isLoading } = useFetchBrowseBiologicalIndicators(browseParams);

  const rows = data?.data ?? [];

  return (
    <SAuthShow roles={[RoleEnum.MASTER]}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Typography variant="h5">Indicadores Biológicos NR-07</Typography>
        <Typography variant="body2" color="text.secondary">
          Curadoria normativa dos indicadores do Anexo I. Revise vínculos com
          riscos químicos e exames complementares antes da ativação.
        </Typography>

        <Paper sx={{ p: 2 }}>
          <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(180px, 1fr))" gap={2}>
            <SInput label="Busca geral" value={search} onChange={(e) => setSearch(e.target.value)} />
            <SInput label="Substância" value={substanceName} onChange={(e) => setSubstanceName(e.target.value)} />
            <SInput label="CAS" value={cas} onChange={(e) => setCas(e.target.value)} />
            <FormControl size="small">
              <InputLabel>Quadro</InputLabel>
              <Select
                label="Quadro"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value as BiologicalIndicatorTable | '')}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="QUADRO_1">Quadro 1</MenuItem>
                <MenuItem value="QUADRO_2">Quadro 2</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={indicatorType}
                onChange={(e) => setIndicatorType(e.target.value as BiologicalIndicatorType | '')}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="IBE_EE">IBE EE</MenuItem>
                <MenuItem value="IBE_SC">IBE SC</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as BiologicalIndicatorStatus | '')}
              >
                <MenuItem value="">Todos</MenuItem>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {[
              ['Revisão normativa', requiresNormativeReview, setRequiresNormativeReview],
              ['Grupo normativo', isSubstanceGroup, setIsSubstanceGroup],
              ['Risco confirmado', hasConfirmedRisk, setHasConfirmedRisk],
              ['Exame confirmado', hasConfirmedExam, setHasConfirmedExam],
              ['Com pendência', hasPendency, setHasPendency],
            ].map(([label, value, setter]) => (
              <FormControl key={label as string} size="small">
                <InputLabel>{label as string}</InputLabel>
                <Select
                  label={label as string}
                  value={value as string}
                  onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                >
                  {triStateOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
          </Box>
        </Paper>

        <Paper sx={{ overflow: 'auto' }}>
          {isLoading && <Box p={2}>Carregando...</Box>}
          {!isLoading && rows.length === 0 && (
            <Alert severity="info" sx={{ m: 2 }}>
              Nenhum indicador encontrado com os filtros atuais.
            </Alert>
          )}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Substância</TableCell>
                <TableCell>CAS</TableCell>
                <TableCell>Indicador biológico</TableCell>
                <TableCell>Matriz</TableCell>
                <TableCell>Quadro</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Valor ref.</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Risco</TableCell>
                <TableCell>Exame</TableCell>
                <TableCell>Pendências</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const confirmedRisk = row.riskLinks.find((l) => l.isConfirmed);
                const confirmedExam = row.examLinks.find((l) => l.isConfirmed);
                return (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() =>
                      router.push(
                        `${RoutesEnum.DATABASE_BIOLOGICAL_INDICATORS}/${row.id}`,
                      )
                    }
                  >
                    <TableCell>{row.substanceName}</TableCell>
                    <TableCell>{row.casPrimary ?? row.casNumbers.join(', ')}</TableCell>
                    <TableCell>{row.biologicalIndicatorOriginal}</TableCell>
                    <TableCell>{row.biologicalMatrix}</TableCell>
                    <TableCell>{TABLE_LABELS[row.tableNumber]}</TableCell>
                    <TableCell>{TYPE_LABELS[row.indicatorType]}</TableCell>
                    <TableCell>
                      {row.referenceValue} {row.unit}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={STATUS_LABELS[row.status]}
                        color={row.status === 'ACTIVE' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {confirmedRisk
                        ? confirmedRisk.riskFactor?.name ?? confirmedRisk.riskNameSnapshot
                        : row.riskLinks[0]?.riskFactor?.name ?? '—'}
                    </TableCell>
                    <TableCell>
                      {confirmedExam
                        ? confirmedExam.exam?.name ?? confirmedExam.examNameSnapshot
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {row.pendencies.length ? (
                        <Chip size="small" color="warning" label={row.pendencies.length} />
                      ) : (
                        <Chip size="small" color="success" label="OK" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>

        {data && data.count > data.limit && (
          <Box display="flex" gap={1} alignItems="center">
            <Typography variant="body2">
              Página {data.page} — {data.count} indicadores
            </Typography>
            <TextField
              select
              size="small"
              label="Página"
              value={page}
              onChange={(e) => setPage(Number(e.target.value))}
              sx={{ width: 100 }}
            >
              {Array.from(
                { length: Math.ceil(data.count / data.limit) },
                (_, index) => index + 1,
              ).map((pageNumber) => (
                <MenuItem key={pageNumber} value={pageNumber}>
                  {pageNumber}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        )}
      </Box>
    </SAuthShow>
  );
};
