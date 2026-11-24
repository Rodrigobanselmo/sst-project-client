import { useEffect, useRef, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Paper,
  Portal,
  TextField,
  Typography,
} from '@mui/material';
type Question = {
  id: string;
  textWithoutHtml: string;
  options: Array<{ id: string; text: string }>;
};
export function CombinedIdentificationFilters({
  questions,
  value,
  onChange,
  grouping,
}: {
  grouping?: {
    questionId: string | null;
    groups: Array<{ id: string; name: string; participantIds: Set<string> }>;
    selectedIds: string[];
    onQuestionChange: (id: string | null) => void;
    onGroupsChange: (ids: string[]) => void;
    onClear: () => void;
  };
  questions: Question[];
  value: Record<string, string[]>;
  onChange: (v: Record<string, string[]>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 80 });
  const drag = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const clamp = (x: number, y: number) => ({
    x: Math.max(
      8,
      Math.min(
        x,
        window.innerWidth - Math.min(440, window.innerWidth - 16) - 8,
      ),
    ),
    y: Math.max(8, Math.min(y, window.innerHeight - 80)),
  });
  useEffect(() => {
    const resize = () => setPosition((old) => clamp(old.x, old.y));
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  if (!questions.length) return null;
  const count = grouping
    ? grouping.selectedIds.length
    : Object.values(value).filter((v) => v.length).length;
  const title = grouping
    ? 'Agrupar por perguntas de identificação (combinar)'
    : 'Filtrar por perguntas de identificação (combinar)';
  const clear = () => (grouping ? grouping.onClear() : onChange({}));
  return (
    <Box>
      <Button
        variant="outlined"
        sx={{
          minHeight: 40,
          color: 'text.secondary',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          '&:hover': { borderColor: 'text.secondary', bgcolor: 'action.hover' },
        }}
        onClick={() => {
          setPosition((old) => clamp(old.x, old.y));
          setOpen(true);
        }}
      >
        {title}
        {count ? ` (${count})` : ''}
      </Button>
      {count > 0 && !grouping && (
        <Button onClick={() => onChange({})}>
          Limpar filtros de identificação
        </Button>
      )}
      {open && (
        <Portal>
          <Paper
            role="region"
            aria-label={title}
            elevation={12}
            sx={{
              position: 'fixed',
              left: position.x,
              top: position.y,
              width: 'min(440px, calc(100vw - 16px))',
              maxHeight: `calc(100dvh - ${position.y + 8}px)`,
              display: 'flex',
              flexDirection: 'column',
              zIndex: (theme) => theme.zIndex.modal,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider',
                px: 6,
                py: 4,
              }}
            >
              <Box
                role="button"
                tabIndex={0}
                aria-label="Mover painel de filtros; use as setas do teclado"
                sx={{
                  flex: 1,
                  cursor: 'move',
                  touchAction: 'none',
                  userSelect: 'none',
                  color: 'text.primary',
                  fontWeight: 600,
                }}
                onPointerDown={(event) => {
                  drag.current = {
                    x: event.clientX,
                    y: event.clientY,
                    left: position.x,
                    top: position.y,
                  };
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => {
                  if (drag.current)
                    setPosition(
                      clamp(
                        drag.current.left + event.clientX - drag.current.x,
                        drag.current.top + event.clientY - drag.current.y,
                      ),
                    );
                }}
                onPointerUp={() => {
                  drag.current = null;
                }}
                onPointerCancel={() => {
                  drag.current = null;
                }}
                onKeyDown={(event) => {
                  const directions: Record<string, [number, number]> = {
                    ArrowLeft: [-20, 0],
                    ArrowRight: [20, 0],
                    ArrowUp: [0, -20],
                    ArrowDown: [0, 20],
                  };
                  const move = directions[event.key];
                  if (move) {
                    event.preventDefault();
                    setPosition((old) =>
                      clamp(old.x + move[0], old.y + move[1]),
                    );
                  }
                }}
              >
                {title} · arraste para mover
              </Box>
              <Button size="small" onClick={() => setOpen(false)}>
                Fechar
              </Button>
            </Box>
            <Box sx={{ p: 8, overflowY: 'auto', minHeight: 0 }}>
              {grouping ? (
                <>
                  <Typography color="text.secondary" sx={{ mb: 8 }}>
                    Escolha uma pergunta para separar os resultados e marque os
                    grupos que deseja visualizar. Alterações atualizam
                    imediatamente os gráficos e o recorte de exportação.
                  </Typography>
                  <Autocomplete
                    options={questions}
                    value={
                      questions.find((q) => q.id === grouping.questionId) ??
                      null
                    }
                    getOptionLabel={(q) => q.textWithoutHtml}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    onChange={(_, q) =>
                      grouping.onQuestionChange(q?.id ?? null)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Pergunta de identificação"
                      />
                    )}
                    sx={{ mb: 8 }}
                  />
                  {grouping.questionId && (
                    <Autocomplete
                      multiple
                      disableCloseOnSelect
                      options={grouping.groups}
                      value={grouping.groups.filter((g) =>
                        grouping.selectedIds.includes(g.id),
                      )}
                      getOptionLabel={(g) =>
                        `${g.name} (${g.participantIds.size} respondentes)`
                      }
                      isOptionEqualToValue={(a, b) => a.id === b.id}
                      onChange={(_, groups) =>
                        grouping.onGroupsChange(groups.map((g) => g.id))
                      }
                      renderOption={(props, group, { selected }) => (
                        <li {...props} key={group.id}>
                          <Checkbox checked={selected} />
                          {group.name} ({group.participantIds.size}{' '}
                          respondentes)
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Grupos exibidos"
                          placeholder="Pesquisar grupos"
                        />
                      )}
                    />
                  )}
                </>
              ) : (
                <>
                  <Typography color="text.secondary" sx={{ mb: 8 }}>
                    Marque uma ou mais opções em cada campo. As opções do mesmo
                    campo são somadas; campos diferentes são combinados. Os
                    filtros também respeitam a estrutura organizacional
                    selecionada e atualizam os gráficos do recorte.
                  </Typography>
                  {questions.map((q) => (
                    <Autocomplete
                      key={q.id}
                      multiple
                      disableCloseOnSelect
                      options={q.options}
                      value={q.options.filter((o) =>
                        (value[q.id] ?? []).includes(o.id),
                      )}
                      isOptionEqualToValue={(a, b) => a.id === b.id}
                      getOptionLabel={(o) => o.text}
                      onChange={(_, options) =>
                        onChange({
                          ...value,
                          [q.id]: options.map((o) => o.id),
                        })
                      }
                      renderOption={(props, option, { selected }) => (
                        <li {...props} key={option.id}>
                          <Checkbox checked={selected} />
                          {option.text}
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={q.textWithoutHtml}
                          placeholder="Todas as opções"
                        />
                      )}
                      sx={{ mb: 8 }}
                    />
                  ))}
                </>
              )}
            </Box>
            <Box
              sx={{
                p: 6,
                display: 'flex',
                gap: 4,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Button onClick={clear}>
                {grouping ? 'Remover agrupamento' : 'Limpar filtros'}
              </Button>
              <Typography color="text.secondary" variant="caption">
                Alterações aplicadas imediatamente.
              </Typography>
            </Box>
          </Paper>
        </Portal>
      )}
    </Box>
  );
}
