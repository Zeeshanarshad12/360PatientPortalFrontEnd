import { useState } from 'react';
import { Box, Card, CardContent, MenuItem, TextField, Typography } from '@mui/material';
import type { FormField, IntakeSearch } from './types';
import { SearchDropdown } from './SearchDropdown';
import { useDebouncedSearch } from './useDebouncedSearch';

/** A searchable field (the insurance provider): the patient must pick a result — typing after
 * picking clears the pick, since only a listed payer can go on the chart. */
function PayerField({ value, onChange, search }: { value: string; onChange: (value: string) => void; search: IntakeSearch }) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const { results, loading, error, tooShort } = useDebouncedSearch(open ? query : '', search);
  const picked = value.length > 0 && value === query;
  const unpicked = query.trim().length > 0 && !picked && !open;

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        fullWidth
        size="small"
        value={query}
        placeholder="Start typing to search…"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange('');
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        error={unpicked}
        helperText={unpicked ? 'Pick your provider from the list.' : undefined}
        inputProps={{ 'aria-autocomplete': 'list' }}
      />
      {open && !picked && query.trim().length > 0 && (
        <SearchDropdown
          results={results}
          loading={loading}
          error={error}
          tooShort={tooShort}
          emptyText="No matches — try a different spelling"
          onPick={(r) => {
            setQuery(r);
            onChange(r);
            setOpen(false);
          }}
        />
      )}
    </Box>
  );
}

/** Demographics / Insurance: the practice's fields, two per row on wider screens. */
export function FormStep({
  fields,
  values,
  onChange,
  searchPayers
}: {
  fields: FormField[];
  values: string[];
  onChange: (index: number, value: string) => void;
  searchPayers?: IntakeSearch;
}) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, columnGap: 3, rowGap: 2.5 }}>
          {fields.map((field, i) => {
            const value = values[i] ?? '';
            return (
              <Box key={field.key}>
                <Typography component="label" variant="body2" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                  {field.label}
                </Typography>
                {field.type === 'select' && field.options.length ? (
                  <TextField select fullWidth size="small" value={value} onChange={(e) => onChange(i, e.target.value)} SelectProps={{ displayEmpty: true }}>
                    <MenuItem value="">
                      <em>Choose…</em>
                    </MenuItem>
                    {field.options.map((o) => (
                      <MenuItem key={o} value={o}>
                        {o}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : field.type === 'payer' && searchPayers ? (
                  <PayerField value={value} onChange={(v) => onChange(i, v)} search={searchPayers} />
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    value={value}
                    onChange={(e) => onChange(i, e.target.value)}
                    type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                    placeholder={field.type === 'date' ? 'MM/DD/YYYY' : undefined}
                    inputProps={{ inputMode: field.type === 'phone' ? 'tel' : field.type === 'date' ? 'numeric' : undefined }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
