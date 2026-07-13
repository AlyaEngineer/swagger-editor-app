import { TableCell, TableHead, TableRow } from '@mui/material';
import { useTranslations } from 'next-intl';

const headerCellSx = {
  bgcolor: 'background.paper',
  whiteSpace: 'pre-line',
};

const columnTitles = [
  'methodColumn',
  'endpointColumn',
  'statusColumn',
  'durationColumn',
  'requestSizeColumn',
  'responseSizeColumn',
  'timestampColumn',
  'errorColumn',
] as const;

export function HistoryTableHeader() {
  const t = useTranslations('HistoryPage');

  return (
    <TableHead>
      <TableRow>
        {columnTitles.map((title) => (
          <TableCell align="center" key={title} sx={headerCellSx}>
            {t(title)}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
