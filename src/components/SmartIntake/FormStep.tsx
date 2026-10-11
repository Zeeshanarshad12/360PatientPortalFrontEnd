import { useEffect, useRef, useState } from 'react';
import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  TextField,
  Typography
} from '@mui/material';
import type { FormField, IntakeSearch } from './types';
import { intakeApi } from './api';
import {
  fieldKind,
  formatValue,
  formatZip,
  type FieldKind
} from './fieldRules';
import { SearchDropdown } from './SearchDropdown';
import { useDebouncedSearch } from './useDebouncedSearch';

/** A searchable field (the insurance provider): the patient must pick a result — typing after
 * picking clears the pick, since only a listed payer can go on the chart. */
function PayerField({
  value,
  onChange,
  search
}: {
  value: string;
  onChange: (value: string) => void;
  search: IntakeSearch;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const { results, loading, error, tooShort } = useDebouncedSearch(
    open ? query : '',
    search
  );
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

/** Placeholder / keyboard / max length per masked kind (the EHR's mask formats). Other fields
 * use their label as the placeholder, as the EHR's forms do. */
const INPUT: Partial<
  Record<
    FieldKind,
    {
      placeholder: string;
      inputMode: 'tel' | 'numeric' | 'email';
      maxLength: number;
    }
  >
> = {
  phone: { placeholder: '(123) 456-7890', inputMode: 'tel', maxLength: 14 },
  zip: { placeholder: 'ZIP', inputMode: 'numeric', maxLength: 10 },
  date: { placeholder: 'MM/DD/YYYY', inputMode: 'numeric', maxLength: 10 },
  email: { placeholder: 'Email', inputMode: 'email', maxLength: 256 }
};

/** The EHR's lookup debounce (Reusablezipfield's DEBOUNCE_TIME). */
const ZIP_DEBOUNCE_MS = 800;

type Changes = Record<number, string>;

function FieldLabel({ field }: { field: FormField }) {
  return (
    <Typography
      component="label"
      htmlFor={field.key}
      variant="body2"
      color="text.secondary"
      sx={{ display: 'block', mb: 0.75 }}
    >
      {field.label}
    </Typography>
  );
}

/**
 * ZIP → City → State on one row, as in DQ_EHR_Frontend's Reusablezipfield: typing a ZIP looks it
 * up; City becomes a pick from that ZIP's cities and State is filled in (read-only). Changing
 * the ZIP clears the city and state it filled.
 */
function ZipCityState({
  fields,
  values,
  zip,
  city,
  state,
  errorFor,
  onChange,
  touch
}: {
  fields: FormField[];
  values: string[];
  zip: number;
  city: number;
  state: number;
  errorFor: (i: number) => string | undefined;
  onChange: (changes: Changes) => void;
  touch: (i: number) => void;
}) {
  const zipValue = values[zip] ?? '';
  const cityValue = city >= 0 ? values[city] ?? '' : '';
  const stateValue = state >= 0 ? values[state] ?? '' : '';
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const lookedUp = useRef('');

  async function lookup(zip5: string, keepChart: boolean) {
    lookedUp.current = zip5;
    setLoading(true);
    setNotFound(false);
    setFailed(false);
    try {
      const rows = await intakeApi.searchZip(zip5);
      if (lookedUp.current !== zip5) return; // the ZIP changed while this was in flight
      const found = [...new Set(rows.map((r) => r.city))];
      if (!found.length) {
        setCities([]);
        setNotFound(true);
        if (!keepChart)
          onChange({
            ...(city >= 0 && { [city]: '' }),
            ...(state >= 0 && { [state]: '' })
          });
        return;
      }
      if (keepChart) {
        // Opening the form: keep what the chart has, just make the city pickable.
        setCities(
          cityValue &&
            !found.some((c) => c.toLowerCase() === cityValue.toLowerCase())
            ? [cityValue, ...found]
            : found
        );
        return;
      }
      setCities(found);
      const changes: Changes = {};
      if (city >= 0)
        changes[city] =
          found.find((c) => c.toLowerCase() === cityValue.toLowerCase()) ??
          found[0];
      if (state >= 0) changes[state] = rows[0].state;
      onChange(changes);
    } catch {
      // The lookup itself is down: let the patient type the city and state instead.
      if (lookedUp.current === zip5) setFailed(true);
    } finally {
      if (lookedUp.current === zip5) setLoading(false);
    }
  }

  // The chart's ZIP: load its cities so the City pick works without retyping the ZIP.
  useEffect(() => {
    const zip5 = zipValue.replace(/\D/g, '').slice(0, 5);
    if (zip5.length === 5) lookup(zip5, true);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeZip(raw: string) {
    const next = formatZip(raw);
    const zip5 = next.replace(/\D/g, '').slice(0, 5);
    const changes: Changes = { [zip]: next };
    if (zip5 !== lookedUp.current) {
      // A different ZIP: what it filled in no longer applies.
      clearTimeout(timer.current);
      lookedUp.current = '';
      setCities([]);
      setNotFound(false);
      setFailed(false);
      setLoading(false);
      if (city >= 0) changes[city] = '';
      if (state >= 0) changes[state] = '';
      if (zip5.length === 5)
        timer.current = setTimeout(() => lookup(zip5, false), ZIP_DEBOUNCE_MS);
    }
    onChange(changes);
  }

  const spinner = loading ? (
    <CircularProgress size="1rem" sx={{ mr: 1 }} />
  ) : null;
  const zipError =
    errorFor(zip) ??
    (notFound ? 'No city found for this ZIP code.' : undefined);

  return (
    <Box
      sx={{
        gridColumn: '1 / -1',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
        columnGap: 3,
        rowGap: 2.5
      }}
    >
      <Box>
        <FieldLabel field={fields[zip]} />
        <TextField
          id={fields[zip].key}
          fullWidth
          size="small"
          value={zipValue}
          placeholder={fields[zip].label}
          onChange={(e) => changeZip(e.target.value)}
          onBlur={() => touch(zip)}
          error={!!zipError}
          helperText={zipError}
          InputProps={{ startAdornment: spinner }}
          inputProps={{
            inputMode: 'numeric',
            maxLength: 10,
            autoComplete: 'off'
          }}
        />
      </Box>
      {city >= 0 && (
        <Box>
          <FieldLabel field={fields[city]} />
          {failed ? (
            <TextField
              id={fields[city].key}
              fullWidth
              size="small"
              value={cityValue}
              placeholder={fields[city].label}
              onChange={(e) => onChange({ [city]: e.target.value })}
              onBlur={() => touch(city)}
              error={!!errorFor(city)}
              helperText={errorFor(city)}
            />
          ) : (
            <Autocomplete
              id={fields[city].key}
              size="small"
              options={cities}
              value={cityValue || null}
              onChange={(_, v) => {
                onChange({ [city]: v ?? '' });
                touch(city);
              }}
              disableClearable={!!cityValue}
              disabled={!cities.length}
              isOptionEqualToValue={(o, v) =>
                o.toLowerCase() === v.toLowerCase()
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={fields[city].label}
                  error={!!errorFor(city)}
                  helperText={
                    errorFor(city) ??
                    (cities.length > 1
                      ? `${cities.length} cities available for this ZIP code`
                      : undefined)
                  }
                  onBlur={() => touch(city)}
                />
              )}
            />
          )}
        </Box>
      )}
      {state >= 0 && (
        <Box>
          <FieldLabel field={fields[state]} />
          <TextField
            id={fields[state].key}
            fullWidth
            size="small"
            value={stateValue}
            placeholder={fields[state].label}
            error={!!errorFor(state)}
            helperText={errorFor(state)}
            onChange={(e) =>
              onChange({ [state]: e.target.value.toUpperCase().slice(0, 2) })
            }
            onBlur={() => touch(state)}
            InputProps={{ readOnly: !failed, startAdornment: spinner }}
            sx={
              failed
                ? undefined
                : { '& .MuiInputBase-root': { bgcolor: 'action.hover' } }
            }
          />
        </Box>
      )}
    </Box>
  );
}

/** Demographics / Insurance: the practice's fields, two per row on wider screens, with ZIP / City /
 * State together on their own row. Phone, ZIP and date fields are masked as they're typed; a
 * field's error shows once it's been left, or for every field after a save attempt
 * (`showAllErrors`). */
export function FormStep({
  fields,
  values,
  errors,
  showAllErrors,
  onChange,
  searchPayers
}: {
  fields: FormField[];
  values: string[];
  errors: string[];
  showAllErrors: boolean;
  /** One or more fields at once (a ZIP lookup sets city and state together). */
  onChange: (changes: Changes) => void;
  searchPayers?: IntakeSearch;
}) {
  const [touched, setTouched] = useState<Record<number, boolean>>({});
  const touch = (i: number) =>
    setTouched((t) => (t[i] ? t : { ...t, [i]: true }));
  const errorFor = (i: number) =>
    (showAllErrors || touched[i]) && errors[i] ? errors[i] : undefined;
  const set = (i: number, value: string) => onChange({ [i]: value });

  const zip = fields.findIndex((f) => fieldKind(f) === 'zip');
  const city = zip >= 0 ? fields.findIndex((f) => fieldKind(f) === 'city') : -1;
  const state =
    zip >= 0 ? fields.findIndex((f) => fieldKind(f) === 'state') : -1;
  const addressRow = [zip, city, state].filter((i) => i >= 0);
  const addressAt = addressRow.length ? Math.min(...addressRow) : -1;

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            // The full-width ZIP / City / State row would leave a half row empty beside Street
            // address; dense packing pulls the next field (Preferred pharmacy) up into it.
            gridAutoFlow: 'row dense',
            columnGap: 3,
            rowGap: 2.5
          }}
        >
          {fields.map((field, i) => {
            if (i === addressAt)
              return (
                <ZipCityState
                  key="zip-city-state"
                  fields={fields}
                  values={values}
                  zip={zip}
                  city={city}
                  state={state}
                  errorFor={errorFor}
                  onChange={onChange}
                  touch={touch}
                />
              );
            if (addressRow.includes(i)) return null;

            const value = values[i] ?? '';
            const kind = fieldKind(field);
            const error = errorFor(i);
            const input = INPUT[kind];
            return (
              <Box key={field.key}>
                <FieldLabel field={field} />
                {kind === 'select' && field.options.length ? (
                  <TextField
                    select
                    id={field.key}
                    fullWidth
                    size="small"
                    value={value}
                    onChange={(e) => {
                      set(i, e.target.value);
                      touch(i);
                    }}
                    SelectProps={{ displayEmpty: true }}
                    error={!!error}
                    helperText={error}
                  >
                    <MenuItem value="">
                      <em>Choose…</em>
                    </MenuItem>
                    {field.options.map((o) => (
                      <MenuItem key={o} value={o}>
                        {o}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : kind === 'payer' && searchPayers ? (
                  <Box onBlur={() => touch(i)}>
                    <PayerField
                      value={value}
                      onChange={(v) => set(i, v)}
                      search={searchPayers}
                    />
                    {error && !value && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ display: 'block', mt: 0.5, mx: 1.75 }}
                      >
                        {error}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <TextField
                    id={field.key}
                    fullWidth
                    size="small"
                    value={value}
                    onChange={(e) => set(i, formatValue(kind, e.target.value))}
                    onBlur={() => {
                      if (value !== value.trim()) set(i, value.trim());
                      touch(i);
                    }}
                    type={
                      kind === 'email'
                        ? 'email'
                        : kind === 'phone'
                        ? 'tel'
                        : 'text'
                    }
                    placeholder={input?.placeholder ?? field.label}
                    error={!!error}
                    helperText={error}
                    inputProps={{
                      inputMode: input?.inputMode,
                      maxLength: input?.maxLength ?? 256,
                      autoComplete: 'off'
                    }}
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
