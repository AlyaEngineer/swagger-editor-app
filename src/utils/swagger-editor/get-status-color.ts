import type { ChipProps } from '@mui/material/Chip';

export function getStatusColor(statusCode: string): ChipProps['color'] {
  if (statusCode.startsWith('2')) {
    return 'success';
  }

  if (statusCode.startsWith('3')) {
    return 'info';
  }

  if (statusCode.startsWith('4')) {
    return 'warning';
  }

  if (statusCode.startsWith('5')) {
    return 'error';
  }

  return 'default';
}
