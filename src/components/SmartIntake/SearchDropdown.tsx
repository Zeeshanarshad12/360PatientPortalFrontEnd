import { List, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';

/** The results list under a search box (drugs, insurance providers). */
export function SearchDropdown({
  results,
  loading,
  error,
  tooShort,
  emptyText,
  onPick
}: {
  results: string[];
  loading: boolean;
  error: string | null;
  tooShort: boolean;
  emptyText: string;
  onPick: (value: string) => void;
}) {
  const note = (text: string) => (
    <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1 }}>
      {text}
    </Typography>
  );
  return (
    <Paper elevation={6} sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, mt: 0.5, maxHeight: 240, overflowY: 'auto' }}>
      {tooShort && note('Type at least 2 characters')}
      {loading && note('Searching…')}
      {error && note(error)}
      {!tooShort && !loading && !error && results.length === 0 && note(emptyText)}
      {results.length > 0 && (
        <List dense disablePadding>
          {results.map((r) => (
            <ListItemButton key={r} divider onMouseDown={(e) => e.preventDefault()} onClick={() => onPick(r)}>
              <ListItemText primary={r} />
            </ListItemButton>
          ))}
        </List>
      )}
    </Paper>
  );
}
