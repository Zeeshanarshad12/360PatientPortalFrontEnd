import { useState } from 'react';
import { Box, Card, CardContent, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import type { IntakeSearch } from './types';
import { SearchDropdown } from './SearchDropdown';
import { useDebouncedSearch } from './useDebouncedSearch';

/** Values are "Drug — how you take it"; the drug part is fixed once picked (so a drug from
 * the EMR's database stays that drug), only the directions are editable. */
const SEPARATOR = ' — ';

function split(value: string): { drug: string; sig: string } {
  const at = value.indexOf(SEPARATOR);
  return at > 0 ? { drug: value.slice(0, at), sig: value.slice(at + SEPARATOR.length) } : { drug: value, sig: '' };
}

const join = (drug: string, sig: string) => (sig.trim() ? `${drug}${SEPARATOR}${sig}` : drug);

export function MedicationStep({ values, onChange, search }: { values: string[]; onChange: (values: string[]) => void; search: IntakeSearch }) {
  const [query, setQuery] = useState('');
  const { results, loading, error, tooShort } = useDebouncedSearch(query, search);
  const drugs = values.map((v) => split(v).drug.toLowerCase());

  function add(label: string) {
    if (!drugs.includes(split(label).drug.toLowerCase())) onChange([...values, label]);
    setQuery('');
  }

  return (
    <Card>
      <CardContent>
        <Typography component="label" variant="body2" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
          Search the medication database
        </Typography>
        <Box sx={{ position: 'relative' }}>
          <TextField
            fullWidth
            size="small"
            value={query}
            placeholder="Start typing a medication name…"
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
          {query.trim().length > 0 && (
            <SearchDropdown results={results} loading={loading} error={error} tooShort={tooShort} emptyText="No matches — try the name on the bottle" onPick={add} />
          )}
        </Box>

        <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
          Current medications
        </Typography>
        {values.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ border: 1, borderStyle: 'dashed', borderColor: 'divider', borderRadius: 1, p: 2, textAlign: 'center' }}>
            No medications added yet — search above to add one.
          </Typography>
        ) : (
          <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
            {values.map((v, i) => {
              const { drug, sig } = split(v);
              return (
                <Box
                  key={drug}
                  sx={{
                    display: 'flex',
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1,
                    borderBottom: 1,
                    borderColor: 'divider',
                    '&:last-of-type': { borderBottom: 0 }
                  }}
                >
                  <Typography variant="body1" sx={{ flex: 1 }}>
                    {drug}
                  </Typography>
                  <TextField
                    size="small"
                    value={sig}
                    placeholder="How you take it, e.g. 1 tablet daily"
                    onChange={(e) => onChange(values.map((x, idx) => (idx === i ? join(drug, e.target.value.replace(SEPARATOR, ' - ')) : x)))}
                    inputProps={{ maxLength: 250, 'aria-label': `How you take ${drug}` }}
                    sx={{ width: { xs: '100%', sm: 280 } }}
                  />
                  <IconButton size="small" aria-label={`Remove ${drug}`} onClick={() => onChange(values.filter((_, idx) => idx !== i))}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
