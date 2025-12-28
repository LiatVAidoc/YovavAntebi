import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function Row({ label, value }) {
  return (
    <TableRow>
      <TableCell sx={{ width: 220, fontWeight: 600 }}>{label}</TableCell>
      <TableCell>
        <Typography variant="body2">{value || "—"}</Typography>
      </TableCell>
    </TableRow>
  );
}

export default function MetadataTable({ metadata }) {
  if (!metadata) return null;

  return (
    <Card elevation={0} variant="outlined" sx={{ width: "min(760px, 98vw)", borderRadius: 3 }}>
      <CardHeader
        title="Metadata"
        subheader={
          <Stack direction="row" spacing={1} alignItems="center" sx={{ pt: 0.5, flexWrap: "wrap" }}>
            {metadata.modality && <Chip size="small" label={`Modality: ${metadata.modality}`} />}
            {metadata.studyDate && <Chip size="small" variant="outlined" label={`StudyDate: ${metadata.studyDate}`} />}
          </Stack>
        }
      />
      <CardContent>
        <Table size="small">
          <TableBody>
            <Row label="PatientID" value={metadata.patientId} />
            <Row label="StudyDate" value={metadata.studyDate} />
            <Row label="Modality" value={metadata.modality} />
            <Row label="InstitutionName" value={metadata.institutionName} />
            <Row label="StudyDescription" value={metadata.studyDescription} />
          </TableBody>
        </Table>

        <Divider sx={{ my: 2 }} />

        <Accordion elevation={0} disableGutters sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Raw extracted tags</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 1.5,
                bgcolor: "grey.50",
                borderRadius: 2,
                overflow: "auto",
                fontSize: 12
              }}
            >
              {JSON.stringify(metadata.raw ?? {}, null, 2)}
            </Box>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
}


