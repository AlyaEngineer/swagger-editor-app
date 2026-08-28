'use client';

import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';

import type { SwaggerMediaType } from '@/utils/swagger-editor/get-swagger-endpoints';

type MediaTypeSelectProps = {
  mediaTypes: SwaggerMediaType[];
  onChange: (contentType: string) => void;
  value: string;
};

export function MediaTypeSelect({ mediaTypes, onChange, value }: MediaTypeSelectProps) {
  const t = useTranslations('swaggerViewer');

  if (mediaTypes.length === 0 || !mediaTypes[0]?.contentType) {
    return null;
  }

  if (mediaTypes.length === 1) {
    return <Chip label={mediaTypes[0].contentType} size="small" variant="outlined" />;
  }

  return (
    <TextField
      label={t('mediaTypeLabel')}
      onChange={(event) => onChange(event.target.value)}
      select
      size="small"
      slotProps={{
        select: {
          MenuProps: { disableScrollLock: true },
          sx: {
            '& .MuiSelect-select': {
              overflowWrap: 'anywhere',
              whiteSpace: 'normal',
            },
          },
        },
      }}
      sx={{
        '& .MuiInputBase-root': { height: '100%' },
        '& .MuiSelect-select': { py: 0.5 },
        alignSelf: 'stretch',
        flexGrow: 1,
        minWidth: 170,
      }}
      value={value}
    >
      {mediaTypes.map((mediaType) => (
        <MenuItem key={mediaType.contentType} value={mediaType.contentType}>
          {mediaType.contentType}
        </MenuItem>
      ))}
    </TextField>
  );
}
