import { useState } from 'react';
import { Box, Button, Checkbox, Chip, FormControlLabel, TextField } from '@mui/material';

/** A responsive grid of checkboxes (1 / 2 / 3 columns), like the History page's condition lists. */
export function CheckboxGrid({ items, isChecked, onToggle }: { items: { key: string; label: string }[]; isChecked: (key: string) => boolean; onToggle: (key: string) => void }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, columnGap: 2, rowGap: 0.25 }}>
      {items.map((item) => (
        <FormControlLabel
          key={item.key}
          sx={{ m: 0, gap: 0.5 }}
          control={<Checkbox size="small" checked={isChecked(item.key)} onChange={() => onToggle(item.key)} />}
          label={item.label}
        />
      ))}
    </Box>
  );
}

/** Removable chips for entries that aren't catalog checkboxes (custom, or from the chart). */
export function EntryChips({ entries, labelOf = (e) => e, onRemove }: { entries: string[]; labelOf?: (entry: string) => string; onRemove: (entry: string) => void }) {
  if (!entries.length) return null;
  return (
    <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {entries.map((entry) => (
        <Chip key={entry} size="small" color="primary" variant="outlined" label={labelOf(entry)} onDelete={() => onRemove(entry)} />
      ))}
    </Box>
  );
}

/** "+ Custom Option" (the History page's dashed pill) → a text box to add something the list
 * doesn't have. */
export function CustomOption({ onAdd }: { onAdd: (text: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');

  function add() {
    if (text.trim()) onAdd(text.trim());
    setText('');
    setAdding(false);
  }

  return (
    <Box sx={{ mt: 1.5 }}>
      {adding ? (
        <Box sx={{ display: 'flex', gap: 1, maxWidth: 480 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            value={text}
            placeholder="Enter condition name"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') add();
              if (e.key === 'Escape') setAdding(false);
            }}
            sx={{ bgcolor: 'background.paper' }}
          />
          <Button variant="text" onClick={() => setAdding(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={add} disabled={!text.trim()}>
            Add
          </Button>
        </Box>
      ) : (
        <Button variant="outlined" onClick={() => setAdding(true)} sx={{ borderRadius: 999, borderStyle: 'dashed', '&:hover': { borderStyle: 'dashed' } }}>
          + Custom Option
        </Button>
      )}
    </Box>
  );
}
