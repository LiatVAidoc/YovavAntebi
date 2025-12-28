import { Button, Card, CardContent, CardHeader, Stack, TextField } from "@mui/material";

export function validateS3Path(value) {
  if (typeof value !== "string") return "S3 path is required";
  const trimmed = value.trim();
  const idx = trimmed.indexOf("/");
  if (!trimmed) return "S3 path is required";
  if (idx <= 0 || idx === trimmed.length - 1) return "Use format: bucket-name/path/to/file.dcm";
  return null;
}

export default function S3PathForm({ s3Path, onChange, onSubmit, disabled, errorText }) {
  return (
    <Card variant="outlined" sx={{ width: "min(720px, 95vw)" }}>
      <CardHeader title="DICOM Metadata Viewer" subheader="Enter an S3 path (bucket/key) to fetch and parse a DICOM file." />
      <CardContent>
        <Stack spacing={2}>
          <TextField
            label="S3 path"
            placeholder="bucket-name/path/to/file.dcm"
            value={s3Path}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            error={Boolean(errorText)}
            helperText={errorText || "Example: aidoc-dev-us-102-storage/production/scans/.../file.dcm"}
            fullWidth
          />
          <Stack direction="row" justifyContent="flex-end">
            <Button variant="contained" onClick={onSubmit} disabled={disabled}>
              Get metadata
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}


