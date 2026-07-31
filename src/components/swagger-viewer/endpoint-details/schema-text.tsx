import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

export function SchemaText({ schema }: { schema: string }) {
  const t = useTranslations('swaggerViewer');

  return (
    <Typography color="text.secondary" variant="body2">
      {t('schemaLabel')}: {schema || t('schemaNotSpecified')}
    </Typography>
  );
}
