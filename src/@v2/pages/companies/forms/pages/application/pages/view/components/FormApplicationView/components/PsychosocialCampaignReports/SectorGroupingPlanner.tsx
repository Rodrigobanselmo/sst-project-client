import { ConsolidateSectorGroup } from './ConsolidateSectorGroup';
import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';

type Sector = {
  id: string;
  name: string;
  establishment: string;
  responded: number;
  anonymityMinimum: number;
};
type DraftGroup = { id: number; name: string; sectorIds: string[] };

function GroupRespondentCount({
  sectors,
  ids,
}: {
  sectors: Sector[];
  ids: string[];
}) {
  const members = sectors.filter((sector) => ids.includes(sector.id));
  const total = members.reduce((sum, sector) => sum + sector.responded, 0);
  const minimum = Math.max(
    1,
    ...(members.length ? members : sectors).map(
      (sector) => sector.anonymityMinimum,
    ),
  );
  const missing = Math.max(0, minimum - total);
  return (
    <Box
      aria-live="polite"
      sx={{ mb: 5, p: 4, borderRadius: '8px', bgcolor: 'action.hover' }}
    >
      <Typography color="text.primary" fontWeight={700}>
        {total} {total === 1 ? 'respondente' : 'respondentes'} · mínimo{' '}
        {minimum}
      </Typography>
      <Typography
        variant="caption"
        color="text.primary"
        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
      >
        <Box
          component="span"
          aria-hidden
          sx={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            bgcolor: missing ? 'warning.main' : 'success.main',
          }}
        />
        {missing
          ? `Faltam ${missing} ${missing === 1 ? 'respondente' : 'respondentes'} para atingir o mínimo`
          : 'Mínimo de respondentes atingido'}
      </Typography>
    </Box>
  );
}

export function SectorGroupingPlanner({
  sectors,
  consolidated,
  companyId,
  applicationId,
  existingGroupMemberIds,
}: {
  sectors: Sector[];
  consolidated: boolean;
  companyId: string;
  applicationId: string;
  existingGroupMemberIds: string[];
}) {
  const theme = useTheme();
  const dragPreview = useRef<HTMLCanvasElement | null>(null);
  const clearDragPreview = () => {
    dragPreview.current?.remove();
    dragPreview.current = null;
  };
  useEffect(() => () => clearDragPreview(), []);
  const sequence = useRef(3);
  const dragging = useRef<string | null>(null);
  const [groups, setGroups] = useState<DraftGroup[]>(
    [0, 1, 2].map((id) => ({ id, name: '', sectorIds: [] })),
  );
  const memberKey = [...existingGroupMemberIds].sort().join('|');
  useEffect(() => {
    const consolidated = new Set(existingGroupMemberIds);
    setGroups((current) =>
      current.map((group) => {
        const sectorIds = group.sectorIds.filter((id) => !consolidated.has(id));
        return {
          ...group,
          sectorIds,
          name:
            group.sectorIds.length > 0 && sectorIds.length === 0
              ? ''
              : group.name,
        };
      }),
    );
  }, [memberKey]);
  const [selected, setSelected] = useState<string | null>(null);
  const [over, setOver] = useState<number | 'pool' | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const assigned = new Set(groups.flatMap((group) => group.sectorIds));
  const move = (sectorId: string, groupId: number | null) => {
    if (!sectors.some((sector) => sector.id === sectorId)) return;
    setGroups((current) =>
      current.map((group) => ({
        ...group,
        sectorIds: [
          ...group.sectorIds.filter((id) => id !== sectorId),
          ...(group.id === groupId ? [sectorId] : []),
        ],
      })),
    );
    setSelected(null);
    setOver(null);
    dragging.current = null;
    setAnnouncement(
      `${sectors.find((sector) => sector.id === sectorId)?.name} ${groupId === null ? 'devolvido aos setores disponíveis' : 'adicionado ao grupo'}.`,
    );
  };
  const pill = (sector: Sector) => (
    <Chip
      key={sector.id}
      draggable
      label={`${sector.name}${consolidated && sector.establishment ? ` · ${sector.establishment}` : ''}`}
      title={`${sector.responded} respondente(s). Arraste ou selecione e escolha um destino.`}
      aria-pressed={selected === sector.id}
      onClick={() => setSelected(selected === sector.id ? null : sector.id)}
      onDragStart={(event) => {
        dragging.current = sector.id;
        event.dataTransfer.setData('text/plain', sector.id);
        event.dataTransfer.effectAllowed = 'move';
        // Rasterize only the label: Chromium can include surrounding composited
        // report layers when it captures the native Chip drag image.
        clearDragPreview();
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;
        const label = `${sector.name}${consolidated && sector.establishment ? ` · ${sector.establishment}` : ''}`;
        const labelElement =
          event.currentTarget.querySelector('.MuiChip-label') ??
          event.currentTarget;
        const font =
          window.getComputedStyle(labelElement).font || '14px sans-serif';
        context.font = font;
        const lines: string[] = [];
        let line = '';
        for (const word of label.split(/\s+/)) {
          const next = line ? `${line} ${word}` : word;
          if (line && context.measureText(next).width > 288) {
            lines.push(line);
            line = word;
          } else line = next;
        }
        if (line) lines.push(line);
        const width = Math.ceil(
          Math.min(
            320,
            Math.max(
              80,
              ...lines.map((text) => context.measureText(text).width + 28),
            ),
          ),
        );
        const height = Math.max(34, lines.length * 20 + 14);
        const scale = window.devicePixelRatio || 1;
        canvas.width = Math.ceil(width * scale);
        canvas.height = Math.ceil(height * scale);
        canvas.style.cssText = `position:fixed;left:0;top:0;width:${width}px;height:${height}px;pointer-events:none;z-index:-1;`;
        context.scale(scale, scale);
        context.beginPath();
        context.roundRect(
          1,
          1,
          width - 2,
          height - 2,
          Math.min(17, height / 2),
        );
        context.fillStyle = theme.palette.background.paper;
        context.fill();
        context.strokeStyle = theme.palette.primary.main;
        context.lineWidth = 1;
        context.stroke();
        context.font = font;
        context.fillStyle = theme.palette.text.primary;
        context.textBaseline = 'middle';
        lines.forEach((text, index) =>
          context.fillText(text, 14, 17 + index * 20, width - 28),
        );
        document.body.appendChild(canvas);
        dragPreview.current = canvas;
        event.dataTransfer.setDragImage(
          canvas,
          Math.min(width / 2, 40),
          Math.min(height / 2, 17),
        );
        // Keep it mounted until the browser has captured the drag image.
        window.setTimeout(clearDragPreview, 0);
      }}
      onDragEnd={() => {
        clearDragPreview();
        dragging.current = null;
        setOver(null);
      }}
      onDelete={
        assigned.has(sector.id) ? () => move(sector.id, null) : undefined
      }
      sx={{
        maxWidth: '100%',
        height: 'auto',
        minHeight: '32px',
        color: 'text.primary',
        cursor: 'grab',
        border: '1px solid',
        borderColor: selected === sector.id ? 'primary.main' : 'divider',
        bgcolor: selected === sector.id ? 'action.selected' : 'action.hover',
        '& .MuiChip-label': { whiteSpace: 'normal', py: 2 },
        '& .MuiChip-deleteIcon': { color: 'text.secondary' },
      }}
    />
  );
  const acceptDrop = (event: React.DragEvent, destination: number | null) => {
    event.preventDefault();
    const id = dragging.current;
    if (id) move(id, destination);
  };
  return (
    <Box
      data-report-controls
      sx={{
        my: 10,
        p: 8,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '16px',
        color: 'text.primary',
      }}
    >
      <Typography component="h4" fontWeight={700} color="text.primary">
        Planejar agrupamentos
      </Typography>
      <Typography color="text.secondary" sx={{ my: 4 }}>
        Arraste os setores para um retângulo e dê um nome ao grupo. Você também
        pode selecionar uma pílula e clicar em “Adicionar setor selecionado”.
        Este rascunho organiza sua proposta; não cadastra grupos nem altera os
        diagnósticos. Ele permanece enquanto este relatório estiver aberto neste
        recorte.
      </Typography>
      <Box
        onDragOver={(event) => {
          if (dragging.current) {
            event.preventDefault();
            setOver('pool');
          }
        }}
        onDragLeave={() => setOver(null)}
        onDrop={(event) => acceptDrop(event, null)}
        sx={{
          p: 6,
          mb: 6,
          border: '1px dashed',
          borderColor: over === 'pool' ? 'primary.main' : 'divider',
          borderRadius: '12px',
        }}
      >
        <Typography fontWeight={700} color="text.primary" sx={{ mb: 4 }}>
          Setores disponíveis ·{' '}
          {sectors.filter((sector) => !assigned.has(sector.id)).length}
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={3}>
          {sectors.filter((sector) => !assigned.has(sector.id)).map(pill)}
        </Stack>
        {selected && assigned.has(selected) && (
          <Button onClick={() => move(selected, null)}>
            Devolver setor selecionado
          </Button>
        )}
        {sectors.every((sector) => assigned.has(sector.id)) && (
          <Typography color="text.secondary">
            Todos os setores foram distribuídos. Arraste uma pílula para cá para
            devolvê-la.
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: 6,
        }}
      >
        {groups.map((group, index) => (
          <Box
            key={group.id}
            onDragOver={(event) => {
              if (dragging.current) {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                setOver(group.id);
              }
            }}
            onDragLeave={() => setOver(null)}
            onDrop={(event) => acceptDrop(event, group.id)}
            sx={{
              minHeight: '160px',
              minWidth: 0,
              p: 6,
              border: '2px dashed',
              borderColor: over === group.id ? 'primary.main' : 'divider',
              bgcolor: over === group.id ? 'action.hover' : 'background.paper',
              borderRadius: '12px',
            }}
          >
            {group.sectorIds.length > 0 ? (
              <TextField
                fullWidth
                size="small"
                label={`Nome do grupo ${index + 1}`}
                placeholder="Ex.: Marketing"
                value={group.name}
                onChange={(event) =>
                  setGroups((current) =>
                    current.map((item) =>
                      item.id === group.id
                        ? { ...item, name: event.target.value }
                        : item,
                    ),
                  )
                }
                sx={{ mb: 4 }}
              />
            ) : (
              <Typography fontWeight={700} color="text.primary" sx={{ mb: 4 }}>
                Grupo {index + 1}
              </Typography>
            )}
            <GroupRespondentCount sectors={sectors} ids={group.sectorIds} />
            <Stack direction="row" flexWrap="wrap" gap={3}>
              {group.sectorIds
                .map((id) => sectors.find((sector) => sector.id === id))
                .filter((sector): sector is Sector => !!sector)
                .map(pill)}
            </Stack>
            {!group.sectorIds.length && (
              <Typography color="text.secondary">
                Arraste para este retângulo os setores que gostaria de agrupar.
              </Typography>
            )}
            {selected && (
              <Button
                size="small"
                onClick={() => move(selected, group.id)}
                sx={{ mt: 4 }}
              >
                Adicionar setor selecionado
              </Button>
            )}
            {!!group.sectorIds.length && (
              <Box sx={{ mt: 4 }}>
                <ConsolidateSectorGroup
                  companyId={companyId}
                  applicationId={applicationId}
                  onConsolidated={() => {
                    setGroups((current) =>
                      current.map((item) =>
                        item.id === group.id
                          ? { ...item, sectorIds: [], name: '' }
                          : item,
                      ),
                    );
                    setSelected(null);
                  }}
                  draft={{
                    name: group.name,
                    hierarchyIds: group.sectorIds,
                  }}
                />
                <Typography
                  variant="caption"
                  component="p"
                  color="text.secondary"
                >
                  Informe um nome e inclua pelo menos dois setores para revisar
                  no assistente.
                </Typography>
              </Box>
            )}
            {!!group.sectorIds.length && (
              <Button
                size="small"
                color="inherit"
                onClick={() => {
                  setGroups((current) =>
                    current.map((item) =>
                      item.id === group.id
                        ? { ...item, sectorIds: [], name: '' }
                        : item,
                    ),
                  );
                  setSelected(null);
                }}
                sx={{ mt: 4 }}
              >
                Esvaziar grupo
              </Button>
            )}
          </Box>
        ))}
      </Box>
      <Button
        onClick={() => {
          const id = sequence.current++;
          setGroups((current) => [...current, { id, name: '', sectorIds: [] }]);
        }}
        sx={{ mt: 6 }}
      >
        Adicionar espaço de grupo
      </Button>
      <Typography variant="caption" component="p" color="text.secondary">
        O total de planejamento soma os respondentes dos setores selecionados; a
        base final é conferida ao consolidar. Valide a compatibilidade das
        atividades e exposições antes do cadastro. A elegibilidade do
        agrupamento será verificada pelo sistema após sua criação.
      </Typography>
      <Box
        role="status"
        aria-live="polite"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clipPath: 'inset(50%)',
        }}
      >
        {announcement}
      </Box>
    </Box>
  );
}
