import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

export function ContentTypes({ contentTypes }: { contentTypes: string[] }) {
  if (contentTypes.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
      {contentTypes.map((contentType) => (
        <Chip key={contentType} label={contentType} size="small" variant="outlined" />
      ))}
    </Stack>
  );
}
