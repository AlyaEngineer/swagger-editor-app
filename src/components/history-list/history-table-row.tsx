import { Chip, TableCell, TableRow, Tooltip, Typography } from '@mui/material';

import type { RequestHistoryEntry } from '@/utils/history/get-request-history';

const ERROR_PREVIEW_LENGTH = 40;

const chipSx = {
  '& .MuiChip-label': {
    alignItems: 'center',
    display: 'flex',
    lineHeight: 1,
  },
};

type HistoryTableRowProps = {
  entry: RequestHistoryEntry;
};

import type { ChipProps } from '@mui/material/Chip';

// TODO: убрать, когда feature/4-swagger-viewer смержится - использовать getMethodColor из @/utils/swagger-editor/get-method-color
const METHOD_COLOR = {
  DELETE: 'error',
  GET: 'success',
  HEAD: 'default',
  OPTIONS: 'default',
  PATCH: 'warning',
  POST: 'primary',
  PUT: 'info',
  TRACE: 'default',
} as const satisfies Record<string, ChipProps['color']>;

export function getMethodColor(method: string): ChipProps['color'] {
  return METHOD_COLOR[method as keyof typeof METHOD_COLOR] ?? 'default';
}

export function HistoryTableRow({ entry }: HistoryTableRowProps) {
  return (
    <TableRow hover>
      <TableCell sx={{ verticalAlign: 'middle' }}>
        <Chip color={getMethodColor(entry.method)} label={entry.method} size="small" sx={chipSx} />
      </TableCell>

      <TableCell sx={{ fontFamily: 'monospace', verticalAlign: 'middle' }}>
        {entry.endpoint}
      </TableCell>

      <TableCell sx={{ verticalAlign: 'middle' }}>
        <Chip
          color={entry.statusCode >= 400 ? 'error' : 'success'}
          label={entry.statusCode}
          size="small"
          sx={chipSx}
          variant="outlined"
        />
      </TableCell>

      <TableCell align="right" sx={{ verticalAlign: 'middle' }}>
        {entry.durationMs}ms
      </TableCell>

      <TableCell align="right" sx={{ verticalAlign: 'middle' }}>
        {entry.requestSize}B
      </TableCell>

      <TableCell align="right" sx={{ verticalAlign: 'middle' }}>
        {entry.responseSize}B
      </TableCell>

      <TableCell align="right" sx={{ verticalAlign: 'middle' }}>
        {new Date(entry.createdAt).toLocaleString()}
      </TableCell>

      <TableCell sx={{ verticalAlign: 'middle' }}>
        {entry.errorDetails ? (
          <Tooltip title={entry.errorDetails}>
            <Typography
              color="error"
              sx={{ cursor: 'default', textAlign: 'center' }}
              variant="body2"
            >
              {entry.errorDetails.length > ERROR_PREVIEW_LENGTH
                ? `${entry.errorDetails.slice(0, ERROR_PREVIEW_LENGTH)}…`
                : entry.errorDetails}
            </Typography>
          </Tooltip>
        ) : (
          <Typography color="text.secondary" sx={{ justifySelf: 'center' }} variant="body2">
            —
          </Typography>
        )}
      </TableCell>
    </TableRow>
  );
}
