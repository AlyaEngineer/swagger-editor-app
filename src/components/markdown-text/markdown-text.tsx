import Box from '@mui/material/Box';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const MarkdownText = ({ children }: { children: string }) => (
  <Box
    sx={{
      '& .contains-task-list': { listStyle: 'none', pl: 0 },
      '& > :last-child': { mb: 0 },

      '& a': { color: 'primary.main' },

      '& code': {
        bgcolor: 'action.hover',
        borderRadius: 1,
        fontSize: '0.85em',
        px: 0.5,
        py: 0.25,
      },

      '& h1, & h2, & h3, & h4': {
        fontSize: '1rem',
        fontWeight: 600,
        m: 0,
        mt: 2,
      },

      '& img': { height: 'auto', maxWidth: '100%' },

      '& p': { m: 0, mb: 1 },

      '& pre': {
        bgcolor: 'action.hover',
        borderRadius: 1,
        overflowX: 'auto',
        p: 1.5,
      },

      '& table': { borderCollapse: 'collapse', minWidth: 'max-content', my: 1.5 },
      '& td, & th': { border: 1, borderColor: 'divider', px: 1, py: 0.5 },

      '& ul, & ol': { m: 0, mb: 1, pl: 2.5 },

      color: 'text.secondary',

      overflowWrap: 'anywhere',

      typography: 'body2',
    }}
  >
    <Markdown
      components={{
        a: (props) => <a {...props} rel="noopener noreferrer" target="_blank" />,
        table: (props) => (
          <Box sx={{ my: 1.5, overflowX: 'auto' }}>
            <table {...props} />
          </Box>
        ),
      }}
      remarkPlugins={[remarkGfm]}
    >
      {children}
    </Markdown>
  </Box>
);
