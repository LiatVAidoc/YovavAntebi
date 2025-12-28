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
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

function formatDicomDate(da) {
  if (!da || typeof da !== "string") return undefined;
  // DICOM DA is typically YYYYMMDD.
  if (!/^\d{8}$/.test(da)) return da;
  return `${da.slice(0, 4)}-${da.slice(4, 6)}-${da.slice(6, 8)}`;
}

function Row({ label, value }) {
  return (
    <TableRow>
      <TableCell sx={{ width: 220, fontWeight: 600 }}>{label}</TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ flex: 1 }}>
            {value || "—"}
          </Typography>
          {value ? (
            <Tooltip title="Copy">
              <IconButton
                size="small"
                onClick={() => {
                  try {
                    void navigator?.clipboard?.writeText(String(value));
                  } catch {
                    // ignore
                  }
                }}
                aria-label={`copy-${label}`}
              >
                <ContentCopyIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>
      </TableCell>
    </TableRow>
  );
}

export default function MetadataTable({ metadata }) {
  if (!metadata) return null;

  const studyDate = formatDicomDate(metadata.studyDate);

  return (
    <Card elevation={0} variant="outlined" sx={{ width: "min(760px, 98vw)", borderRadius: 3 }}>
      <CardHeader
        title="Study details"
        subheader={
          <Stack direction="row" spacing={1} alignItems="center" sx={{ pt: 0.5, flexWrap: "wrap" }}>
            {metadata.modality && <Chip size="small" label={`Modality: ${metadata.modality}`} />}
            {studyDate && (
              <Tooltip title="Study date is when the exam was performed">
                <Chip size="small" variant="outlined" label={`Study date: ${studyDate}`} />
              </Tooltip>
            )}
          </Stack>
        }
      />
      <CardContent>
        <Table size="small">
          <TableBody>
            <Row label="Patient ID" value={metadata.patientId} />
            <Row label="Study date" value={studyDate} />
            <Row label="Modality" value={metadata.modality} />
            <Row label="Facility" value={metadata.institutionName} />
            <Row label="Study description" value={metadata.studyDescription} />
          </TableBody>
        </Table>

        <Divider sx={{ my: 2 }} />

        <Accordion elevation={0} disableGutters sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Technical details (advanced)</Typography>
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


