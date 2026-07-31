'use client';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';

import type { SwaggerEndpoint } from '@/utils/swagger-editor/get-swagger-endpoints';

import { EndpointBody } from './endpoint-body';
import { EndpointSummaryRow } from './endpoint-summary-row';

export function EndpointPanel({ endpoint }: { endpoint: SwaggerEndpoint }) {
  return (
    <Accordion disableGutters elevation={0} square>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <EndpointSummaryRow endpoint={endpoint} />
      </AccordionSummary>

      <AccordionDetails>
        <EndpointBody endpoint={endpoint} />
      </AccordionDetails>
    </Accordion>
  );
}
