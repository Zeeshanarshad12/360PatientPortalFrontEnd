import { useEffect, useRef } from 'react';
import {
  Box,
  ButtonBase,
  LinearProgress,
  Tooltip,
  Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';

/** Every step is the same width so long consent names don't stretch their column. */
const STEP_WIDTH = 116;
const DOT = 28;

/**
 * The wizard's step list: numbered dots joined by a line, each label at most two lines (the
 * full name is in the tooltip), scrolling sideways when the visit has many steps — the current
 * step is kept in view. Any step can be revisited. A thin bar on top shows overall progress.
 */
export function WizardStepper({
  labels,
  current,
  completed,
  onSelect
}: {
  labels: string[];
  current: number;
  completed: boolean[];
  onSelect: (i: number) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Centre the current step in the strip (only the strip scrolls, never the page).
    const strip = scroller.current;
    const el = strip?.querySelector<HTMLElement>(`[data-step="${current}"]`);
    if (strip && el)
      strip.scrollTo({
        left: el.offsetLeft - (strip.clientWidth - el.offsetWidth) / 2,
        behavior: 'smooth'
      });
  }, [current]);

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 2,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider'
      }}
    >
      <LinearProgress
        variant="determinate"
        value={((current + 1) / labels.length) * 100}
        sx={{ height: 3 }}
      />
      <Box
        ref={scroller}
        sx={{
          position: 'relative',
          overflowX: 'auto',
          px: { xs: 1, sm: 2 },
          pt: 2,
          pb: 1.5
        }}
      >
        <Box
          component="ol"
          sx={{
            display: 'flex',
            m: 0,
            p: 0,
            listStyle: 'none',
            width: 'max-content',
            minWidth: '100%'
          }}
        >
          {labels.map((label, i) => {
            const isCurrent = i === current;
            const isDone = completed[i] && !isCurrent;
            return (
              <Box
                component="li"
                key={`${label}-${i}`}
                data-step={i}
                sx={{
                  position: 'relative',
                  flex: `1 0 ${STEP_WIDTH}px`,
                  maxWidth: 180,
                  // The line to the next dot.
                  '&:not(:last-of-type)::after': {
                    content: '""',
                    position: 'absolute',
                    top: DOT / 2 - 1,
                    left: `calc(50% + ${DOT / 2 + 6}px)`,
                    right: `calc(-50% + ${DOT / 2 + 6}px)`,
                    height: 2,
                    borderRadius: 1,
                    bgcolor: (t) =>
                      completed[i] ? t.palette.primary.main : t.palette.divider
                  }
                }}
              >
                <Tooltip title={label} placement="bottom" enterDelay={400}>
                  <ButtonBase
                    onClick={() => onSelect(i)}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={`Step ${i + 1}: ${label}${
                      isDone ? ' (done)' : ''
                    }`}
                    sx={{
                      width: '100%',
                      flexDirection: 'column',
                      gap: 0.75,
                      px: 0.5,
                      borderRadius: 1
                    }}
                  >
                    <Box
                      sx={(t) => ({
                        width: DOT,
                        height: DOT,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 13,
                        fontWeight: 700,
                        transition: 'all .2s',
                        ...(isCurrent
                          ? {
                              bgcolor: 'primary.main',
                              color: 'primary.contrastText',
                              boxShadow: `0 0 0 4px ${alpha(
                                t.palette.primary.main,
                                0.18
                              )}`
                            }
                          : isDone
                          ? {
                              bgcolor: 'primary.main',
                              color: 'primary.contrastText'
                            }
                          : {
                              bgcolor: 'background.paper',
                              color: 'text.secondary',
                              border: `2px solid ${t.palette.divider}`
                            })
                      })}
                    >
                      {isDone ? <CheckIcon sx={{ fontSize: 16 }} /> : i + 1}
                    </Box>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: 12.5,
                        lineHeight: 1.3,
                        textAlign: 'center',
                        color: isCurrent ? 'text.primary' : 'text.secondary',
                        fontWeight: isCurrent ? 700 : 400,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word'
                      }}
                    >
                      {label}
                    </Typography>
                  </ButtonBase>
                </Tooltip>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
