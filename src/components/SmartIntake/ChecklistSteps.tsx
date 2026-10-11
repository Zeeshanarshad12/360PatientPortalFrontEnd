import { useState } from 'react';
import { Badge, Box, Card, CardContent, Chip, Typography } from '@mui/material';
import type { SocialGroup } from './types';
import { CheckboxGrid, CustomOption, EntryChips } from './CheckboxGrid';
import { panelSx, useIntakePalette } from './theme';

const toggleIn = (values: string[], key: string) => (values.includes(key) ? values.filter((v) => v !== key) : [...values, key]);

/** The History page's light condition panel. */
function SoftPanel({ children }: { children: React.ReactNode }) {
  const p = useIntakePalette();
  return <Box sx={{ ...panelSx, bgcolor: p.accentSoft }}>{children}</Box>;
}

/** Medical / Surgical history: the practice's condition list, plus custom entries. */
export function ChecklistStep({ catalog, values, onChange }: { catalog: string[]; values: string[]; onChange: (values: string[]) => void }) {
  const custom = values.filter((v) => !catalog.includes(v));
  return (
    <SoftPanel>
      <CheckboxGrid items={catalog.map((c) => ({ key: c, label: c }))} isChecked={(k) => values.includes(k)} onToggle={(k) => onChange(toggleIn(values, k))} />
      <EntryChips entries={custom} onRemove={(e) => onChange(values.filter((v) => v !== e))} />
      <CustomOption onAdd={(text) => !values.includes(text) && onChange([...values, text])} />
    </SoftPanel>
  );
}

const cellKey = (relative: string, condition: string) => `${relative} — ${condition}`;

/** Family history: pick a relative, then check conditions for them. Values are
 * "Relative — Condition". */
export function FamilyHistoryStep({
  relatives,
  conditions,
  values,
  onChange
}: {
  relatives: string[];
  conditions: string[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [active, setActive] = useState(relatives[0] ?? '');
  const prefix = `${active} — `;
  const custom = values.filter((v) => v.startsWith(prefix) && !conditions.some((c) => v === cellKey(active, c)));

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Choose a relative, then check any conditions that run in their history.
      </Typography>
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {relatives.map((r) => {
          const count = values.filter((v) => v.startsWith(`${r} — `)).length;
          return (
            <Badge key={r} badgeContent={count} color="primary" invisible={count === 0}>
              <Chip label={r} color="primary" variant={r === active ? 'filled' : 'outlined'} onClick={() => setActive(r)} />
            </Badge>
          );
        })}
      </Box>
      <SoftPanel>
        <CheckboxGrid
          items={conditions.map((c) => ({ key: cellKey(active, c), label: c }))}
          isChecked={(k) => values.includes(k)}
          onToggle={(k) => onChange(toggleIn(values, k))}
        />
        <EntryChips entries={custom} labelOf={(e) => e.slice(prefix.length)} onRemove={(e) => onChange(values.filter((v) => v !== e))} />
        <CustomOption
          onAdd={(text) => {
            const key = cellKey(active, text);
            if (!values.includes(key)) onChange([...values, key]);
          }}
        />
      </SoftPanel>
    </Box>
  );
}

/** Social history: one panel per group; values are "Group: Option". */
export function SocialHistoryStep({ groups, values, onChange }: { groups: SocialGroup[]; values: string[]; onChange: (values: string[]) => void }) {
  const known = new Set(groups.flatMap((g) => g.options.map((o) => `${g.name}: ${o}`)));
  const other = values.filter((v) => !known.has(v));
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {groups.map((group) => (
        <SoftPanel key={group.name}>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {group.name}
          </Typography>
          <CheckboxGrid
            items={group.options.map((o) => ({ key: `${group.name}: ${o}`, label: o }))}
            isChecked={(k) => values.includes(k)}
            onToggle={(k) => onChange(toggleIn(values, k))}
          />
        </SoftPanel>
      ))}
      {other.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              From your last visit
            </Typography>
            <EntryChips entries={other} onRemove={(e) => onChange(values.filter((v) => v !== e))} />
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
