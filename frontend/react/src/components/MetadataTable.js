import { Card, CardContent, CardHeader, Table, TableBody, TableCell, TableRow } from "@mui/material";

function Row({ label, value }) {
  return (
    <TableRow>
      <TableCell sx={{ width: 220, fontWeight: 600 }}>{label}</TableCell>
      <TableCell>{value || "—"}</TableCell>
    </TableRow>
  );
}

export default function MetadataTable({ metadata }) {
  if (!metadata) return null;

  return (
    <Card variant="outlined" sx={{ width: "min(720px, 95vw)" }}>
      <CardHeader title="Metadata" />
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
      </CardContent>
    </Card>
  );
}


