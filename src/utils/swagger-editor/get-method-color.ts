import type { ChipProps } from '@mui/material/Chip';

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
