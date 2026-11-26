import {
  useEffect,
  useRef,
  useState,
  type RefObject,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Slider,
  Stack,
  SvgIcon,
  ToggleButton,
  Tooltip,
  Typography,
} from '@mui/material';
import BrushOutlinedIcon from '@mui/icons-material/BrushOutlined';
import MouseOutlinedIcon from '@mui/icons-material/MouseOutlined';
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import HighlightOutlinedIcon from '@mui/icons-material/HighlightOutlined';
import UndoIcon from '@mui/icons-material/Undo';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';

function EraserOutlinedIcon() {
  return (
    <SvgIcon fontSize="small" viewBox="0 0 24 24">
      <path
        d="M14 3 3 14a2 2 0 0 0 0 2.8L7.2 21H13L23 11 15 3a.7.7 0 0 0-1 0ZM8 9l8 8M7 21h15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
}

type Point = { x: number; y: number };
type Ink = { points: Point[]; color: string; width: number; marker: boolean };
type Tool = 'pointer' | 'pen' | 'marker' | 'eraser';
const COLORS = [
  ['Amarelo', '#facc15'],
  ['Vermelho', '#ef4444'],
  ['Azul', '#38bdf8'],
  ['Verde', '#22c55e'],
  ['Branco', '#ffffff'],
  ['Preto', '#111827'],
];
const path = (points: Point[]) =>
  points
    .map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ') + (points.length === 1 ? ' l0.1,0' : '');
function near(point: Point, stroke: Ink) {
  const radius = Math.max(10, stroke.width / 2 + 6);
  return stroke.points.some((b, i, points) => {
    const a = points[Math.max(0, i - 1)];
    const dx = b.x - a.x,
      dy = b.y - a.y;
    const t = Math.max(
      0,
      Math.min(
        1,
        ((point.x - a.x) * dx + (point.y - a.y) * dy) /
          (dx * dx + dy * dy || 1),
      ),
    );
    return Math.hypot(point.x - a.x - t * dx, point.y - a.y - t * dy) <= radius;
  });
}

// Mounted only while fullscreen. SVG coordinates follow the scrollable document,
// avoiding a page-sized bitmap and preventing marks drifting during scrolling.
export function ReportPresentationInk({
  surface,
  report,
}: {
  surface: RefObject<HTMLDivElement | null>;
  report: RefObject<HTMLElement | null>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [tool, setTool] = useState<Tool>('pointer');
  const [color, setColor] = useState('#facc15');
  const [size, setSize] = useState(4);
  const [height, setHeight] = useState(0);
  const [strokes, setStrokes] = useState<Ink[]>([]);
  const [draft, setDraft] = useState<Ink | null>(null);
  const [history, setHistory] = useState<Ink[][]>([]);
  const strokesRef = useRef(strokes);
  const drawing = useRef<{ pointerId: number; ink: Ink; before: Ink[] } | null>(
    null,
  );
  const replace = (next: Ink[]) => {
    strokesRef.current = next;
    setStrokes(next);
  };
  useEffect(() => {
    const root = surface.current,
      article = report.current;
    if (!root || !article) return;
    let previous = '';
    const measure = () => {
      const rect = article.getBoundingClientRect();
      const dimensions = `${rect.width}:${rect.height}`;
      if (previous && previous !== dimensions) {
        strokesRef.current = [];
        setStrokes([]);
        setHistory([]);
        setDraft(null);
        drawing.current = null;
      }
      previous = dimensions;
      setHeight(
        Math.ceil(
          Math.max(
            root.clientHeight,
            rect.bottom -
              root.getBoundingClientRect().top +
              root.scrollTop +
              48,
          ),
        ),
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(article);
    observer.observe(root);
    measure();
    return () => observer.disconnect();
  }, [surface, report]);
  const remember = (before: Ink[]) =>
    setHistory((old) => [...old.slice(-19), before]);
  const point = (event: ReactPointerEvent<SVGSVGElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const erase = (p: Point) => {
    const next = strokesRef.current.filter((stroke) => !near(p, stroke));
    if (next.length !== strokesRef.current.length) replace(next);
  };
  const finish = (
    event: ReactPointerEvent<SVGSVGElement>,
    canceled = false,
  ) => {
    const active = drawing.current;
    if (!active || active.pointerId !== event.pointerId) return;
    if (tool === 'eraser') {
      if (active.before !== strokesRef.current) remember(active.before);
    } else if (!canceled) {
      remember(active.before);
      replace([...strokesRef.current.slice(-299), active.ink]);
    }
    drawing.current = null;
    setDraft(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const undo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    replace(previous);
    setHistory((old) => old.slice(0, -1));
  };
  return (
    <>
      <Box
        component="svg"
        aria-hidden="true"
        data-presentation-ink
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height,
          zIndex: 2,
          pointerEvents: tool === 'pointer' ? 'none' : 'auto',
          touchAction: tool === 'pointer' ? 'auto' : 'none',
          cursor: tool === 'eraser' ? 'cell' : 'crosshair',
          '@media print': { display: 'none' },
        }}
        onPointerDown={(event: ReactPointerEvent<SVGSVGElement>) => {
          if (event.button !== 0 || tool === 'pointer') return;
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          const ink: Ink = {
            points: [point(event)],
            color,
            width: tool === 'marker' ? size * 5 : size,
            marker: tool === 'marker',
          };
          drawing.current = {
            pointerId: event.pointerId,
            ink,
            before: strokesRef.current,
          };
          if (tool === 'eraser') erase(ink.points[0]);
          else setDraft({ ...ink });
        }}
        onPointerMove={(event: ReactPointerEvent<SVGSVGElement>) => {
          const active = drawing.current;
          if (!active || active.pointerId !== event.pointerId) return;
          event.preventDefault();
          const p = point(event);
          if (tool === 'eraser') {
            erase(p);
            return;
          }
          if (active.ink.points.length >= 2000) return;
          const last = active.ink.points.at(-1)!;
          if (Math.hypot(p.x - last.x, p.y - last.y) < 1) return;
          active.ink.points.push(p);
          setDraft({ ...active.ink });
        }}
        onPointerUp={(event: ReactPointerEvent<SVGSVGElement>) => finish(event)}
        onPointerCancel={(event: ReactPointerEvent<SVGSVGElement>) =>
          finish(event, true)
        }
      >
        {[...strokes, ...(draft ? [draft] : [])].map((stroke, index) => (
          <path
            key={index}
            d={path(stroke.points)}
            fill="none"
            stroke={stroke.color}
            strokeWidth={stroke.width}
            strokeOpacity={stroke.marker ? 0.3 : 1}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </Box>
      <Box
        sx={{
          position: 'fixed',
          right: { xs: '12px', md: '24px' },
          bottom: '20px',
          zIndex: (theme) => theme.zIndex.appBar + 2,
          maxWidth: 'calc(100vw - 24px)',
          '@media print': { display: 'none' },
        }}
      >
        {expanded && (
          <Paper
            component="aside"
            aria-label="Ferramentas de anotação"
            elevation={8}
            sx={{
              mb: 4,
              p: 8,
              width: '300px',
              maxWidth: 'calc(100vw - 24px)',
              maxHeight: '65vh',
              overflowY: 'auto',
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 6 }}
            >
              <Typography variant="body2" fontWeight={600} color="text.primary">
                Anotações da apresentação
              </Typography>
              <IconButton
                size="small"
                aria-label="Recolher ferramentas"
                onClick={() => setExpanded(false)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Box
              role="group"
              aria-label="Ferramenta de anotação"
              sx={{ display: 'flex', mb: 6 }}
            >
              {(
                [
                  [
                    'pointer',
                    'Navegar',
                    'Navegar e clicar no relatório',
                    <MouseOutlinedIcon fontSize="small" />,
                  ],
                  [
                    'pen',
                    'Caneta',
                    'Caneta livre',
                    <BorderColorOutlinedIcon fontSize="small" />,
                  ],
                  [
                    'marker',
                    'Marca-texto',
                    'Marca-texto',
                    <HighlightOutlinedIcon fontSize="small" />,
                  ],
                  [
                    'eraser',
                    'Borracha',
                    'Borracha: clique ou arraste sobre uma marca para apagá-la',
                    <EraserOutlinedIcon />,
                  ],
                ] as const
              ).map(([value, label, help, icon]) => (
                <Tooltip
                  key={value}
                  title={help}
                  arrow
                  placement="top"
                  slotProps={{ popper: { disablePortal: true } }}
                >
                  <ToggleButton
                    value={value}
                    aria-label={label}
                    selected={tool === value}
                    onClick={() => setTool(value)}
                    size="small"
                  >
                    {icon}
                  </ToggleButton>
                </Tooltip>
              ))}
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Cor
            </Typography>
            <Stack direction="row" gap={4} sx={{ my: 4 }}>
              {COLORS.map(([name, value]) => (
                <IconButton
                  key={value}
                  aria-label={`Cor ${name.toLowerCase()}`}
                  aria-pressed={color === value}
                  onClick={() => setColor(value)}
                  sx={{
                    width: '32px',
                    height: '32px',
                    border: '2px solid',
                    borderColor: color === value ? 'primary.main' : 'divider',
                    p: '4px',
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: value,
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                    }}
                  />
                </IconButton>
              ))}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Espessura
            </Typography>
            <Slider
              value={size}
              min={1}
              max={12}
              step={1}
              aria-label="Espessura da anotação"
              valueLabelDisplay="auto"
              onChange={(_, value) => setSize(value as number)}
            />
            <Stack direction="row" gap={4} sx={{ mb: 4 }}>
              <Button
                size="small"
                startIcon={<UndoIcon />}
                disabled={!history.length}
                onClick={undo}
              >
                Desfazer
              </Button>
              <Button
                size="small"
                startIcon={<DeleteOutlineIcon />}
                disabled={!strokes.length}
                onClick={() => {
                  remember(strokesRef.current);
                  replace([]);
                }}
              >
                Limpar
              </Button>
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Use Navegar para clicar no relatório. As marcas são temporárias:
              não entram no PDF e são limpas ao sair da tela cheia ou mudar o
              layout.
            </Typography>
          </Paper>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<BrushOutlinedIcon />}
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
            sx={{
              borderRadius: '999px',
              backgroundColor: 'background.paper',
              color: tool === 'pointer' ? 'text.secondary' : 'primary.main',
              borderColor: 'divider',
              textTransform: 'none',
            }}
          >
            Anotar{tool !== 'pointer' ? ' · ativo' : ''}
          </Button>
        </Box>
      </Box>
    </>
  );
}
