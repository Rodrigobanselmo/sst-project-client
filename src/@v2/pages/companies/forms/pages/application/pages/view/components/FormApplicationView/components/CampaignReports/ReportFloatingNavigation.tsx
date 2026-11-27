import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import TocOutlinedIcon from '@mui/icons-material/TocOutlined';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

type NavigationItem = { id: string; title: string; children: NavigationItem[] };

export function ReportFloatingNavigation({
  documentType,
  headings,
  report,
}: {
  documentType: string;
  headings: string[];
  report: RefObject<HTMLElement | null>;
}) {
  const desktopHover = () =>
    window.matchMedia('(hover: hover) and (min-width: 1200px)').matches;
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, height: 480 });
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  useEffect(() => () => cancelClose(), []);
  const activateSection = (index: number, row: HTMLElement) => {
    const panel = row.closest('nav');
    if (!panel) return;
    const rowTop = row.getBoundingClientRect().top;
    // Match the first child row to its parent, allowing for the panel padding.
    setSubmenuPosition({
      top: rowTop - panel.getBoundingClientRect().top - 13,
      height: Math.max(80, window.innerHeight - rowTop - 20),
    });
    setActiveSection(items[index].children.length ? index : null);
  };
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  useEffect(() => {
    if (!open || !report.current) return;
    setActiveSection(null);
    setExpandedItems([]);
    setItems(
      headings.map((heading, index) => {
        const id = `campaign-report-${documentType}-${index}`;
        const section = report.current!.querySelector<HTMLElement>(`#${id}`);
        const children: NavigationItem[] = [];
        const parents = new Map<string, NavigationItem>();
        section
          ?.querySelectorAll<HTMLElement>('[data-report-nav-heading]')
          .forEach((element, childIndex) => {
            const title = element.dataset.reportNavHeading!;
            const numbering = title.match(/^(\d+(?:\.\d+)+)/)?.[1];
            if (!numbering) return;
            element.id ||= `${id}-sub-${childIndex}`;
            const item: NavigationItem = {
              id: element.id,
              title,
              children: [],
            };
            const parent = parents.get(
              numbering.slice(0, numbering.lastIndexOf('.')),
            );
            (parent?.children ?? children).push(item);
            parents.set(numbering, item);
          });
        return { id, title: `${index + 1}. ${heading}`, children };
      }),
    );
  }, [open, documentType, headings, report]);
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  useEffect(() => setOpen(false), [documentType]);
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    window.document.addEventListener('pointerdown', closeOutside);
    return () =>
      window.document.removeEventListener('pointerdown', closeOutside);
  }, [open]);
  const navigate = (id?: string) => {
    const article = report.current;
    const target =
      id === undefined ? article : window.document.getElementById(id);
    if (!target) return;
    // Reveal every containing disclosure before scrolling to a nested theme.
    let ancestor: HTMLElement | null = target;
    while (ancestor && ancestor !== article) {
      if (ancestor.tagName === 'DETAILS') ancestor.setAttribute('open', '');
      ancestor = ancestor.parentElement;
    }
    target.querySelector(':scope > details')?.setAttribute('open', '');
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'start',
    });
    setOpen(false);
  };
  const renderChildren = (
    children: NavigationItem[],
    depth = 0,
  ): React.ReactNode => (
    <Stack gap={2} sx={{ pl: depth ? 6 : 0 }}>
      {children.map((item) => (
        <Box
          key={item.id}
          onMouseEnter={() => {
            if (desktopHover() && item.children.length)
              setExpandedItems((ids) =>
                ids.includes(item.id) ? ids : [...ids, item.id],
              );
          }}
        >
          <Stack direction="row" alignItems="center">
            <Button
              onClick={() => navigate(item.id)}
              sx={{
                flex: 1,
                justifyContent: 'flex-start',
                textAlign: 'left',
                textTransform: 'none',
                color: 'text.primary',
                lineHeight: 1.4,
                py: 4,
              }}
            >
              {item.title}
            </Button>
            {!!item.children.length && (
              <IconButton
                size="small"
                aria-label={`Ver subitens de ${item.title}`}
                aria-expanded={expandedItems.includes(item.id)}
                onClick={() =>
                  setExpandedItems((ids) =>
                    ids.includes(item.id) ? ids : [...ids, item.id],
                  )
                }
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
          {item.children.length > 0 &&
            expandedItems.includes(item.id) &&
            renderChildren(item.children, depth + 1)}
        </Box>
      ))}
    </Stack>
  );
  return (
    <Box
      ref={wrapper}
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={() => {
        if (desktopHover()) closeTimer.current = setTimeout(() => setOpen(false), 200);
      }}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          trigger.current?.focus();
          setOpen(false);
        }
      }}
      sx={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: (theme) => theme.zIndex.appBar + 1,
        maxWidth: 'calc(100vw - 32px)',
        '@media print': { display: 'none' },
      }}
    >
      {open && (
        <Box sx={{ pb: '8px' }}>
          <Paper
            id={panelId}
            component="nav"
            aria-label="Navegação do relatório"
            elevation={8}
            sx={{
              width: '360px',
              position: 'relative',
              maxWidth: 'calc(100vw - 32px)',
              maxHeight: 'min(65vh, 480px)',
              overflowY: { xs: 'auto', lg: 'visible' },
              p: 8,
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              color: 'text.primary',
            }}
          >
            <Stack direction="column" gap={6} alignItems="flex-start">
              <Box
                sx={{
                  width: '100%',
                  minWidth: 0,
                  maxHeight: { lg: 'min(60vh, 440px)' },
                  overflowY: 'auto',
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 4 }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                  >
                    Sumário do relatório
                  </Typography>
                  <IconButton
                    size="small"
                    aria-label="Fechar sumário"
                    onClick={() => {
                      trigger.current?.focus();
                      setOpen(false);
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Stack gap={2}>
                  <Button
                    startIcon={<VerticalAlignTopIcon />}
                    onClick={() => navigate()}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                  >
                    Início do relatório
                  </Button>
                  {items.map((item, index) => (
                    <Stack
                      key={item.id}
                      direction="row"
                      alignItems="center"
                      onMouseEnter={(event) =>
                        desktopHover() && activateSection(index, event.currentTarget)
                      }
                      onFocus={(event) =>
                        desktopHover() && activateSection(index, event.currentTarget)
                      }
                    >
                      <Button
                        onClick={() => navigate(item.id)}
                        sx={{
                          flex: 1,
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          textTransform: 'none',
                          color: 'text.primary',
                          lineHeight: 1.4,
                          py: 4,
                        }}
                      >
                        {item.title}
                      </Button>
                      {!!item.children.length && (
                        <IconButton
                          size="small"
                          aria-label={`Ver subitens de ${item.title}`}
                          aria-expanded={activeSection === index}
                          onClick={(event) => activateSection(index, event.currentTarget.parentElement!)}
                        >
                          <ChevronRightIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  ))}
                </Stack>
              </Box>
              {activeSection !== null &&
                items[activeSection]?.children.length > 0 && (
                  <Box
                    component="nav"
                    aria-label={`Subitens de ${items[activeSection].title}`}
                    sx={{
                      width: { xs: '100%', lg: '340px' },
                      position: { xs: 'static', lg: 'absolute' },
                      left: { lg: '100%' },
                      top: { lg: `${submenuPosition.top}px` },
                      maxHeight: { xs: 'min(65vh, 480px)', lg: `${submenuPosition.height}px` },
                      overflowY: 'auto',
                      minWidth: 0,
                      border: '1px solid',
                      borderColor: 'divider',
                      p: 6,
                      borderRadius: '16px',
                      backgroundColor: 'background.paper',
                      boxShadow: 8,
                    }}
                  >
                    {renderChildren(items[activeSection].children)}
                  </Box>
                )}
            </Stack>
          </Paper>
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          ref={trigger}
          variant="outlined"
          startIcon={<TocOutlinedIcon />}
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          onClick={() => setOpen(true)}
          sx={{
            borderRadius: '999px',
            px: 8,
            py: 3,
            minHeight: '40px',
            textTransform: 'none',
            backgroundColor: 'background.paper',
            color: 'text.secondary',
            borderColor: 'divider',
            boxShadow: 2,
            '&:hover': {
              backgroundColor: 'action.hover',
              color: 'text.primary',
            },
          }}
        >
          Sumário
        </Button>
      </Box>
    </Box>
  );
}
