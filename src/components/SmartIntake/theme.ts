import { alpha, useTheme } from '@mui/material/styles';

/**
 * The Smart Intake wizard's colours, taken from the portal's active MUI theme (PureLight /
 * GreyGoose / PurpleFlow — whichever the patient picked) so the form looks like the rest of
 * the portal. The light "soft" panel matches the History page's condition cards.
 */
export function useIntakePalette() {
  const t = useTheme();
  return {
    bg: t.palette.background.default,
    surface: t.palette.background.paper,
    ink: t.palette.text.primary,
    inkSoft: t.palette.text.secondary,
    inkFaint: alpha(t.palette.text.secondary, 0.75),
    accent: t.palette.primary.main,
    accentInk: t.palette.primary.dark,
    accentSoft: alpha(t.palette.primary.main, 0.08),
    border: t.palette.divider
  };
}

export type IntakePalette = ReturnType<typeof useIntakePalette>;

/** Section heading + card spacing shared by every step. */
export const panelSx = { borderRadius: '8px', p: { xs: 1.5, sm: 2 } };
