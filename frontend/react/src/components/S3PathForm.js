import { Button, Card, CardContent, CardHeader, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";

export function validateS3Path(value) {
  if (typeof value !== "string") return "S3 path is required";
  const trimmed = value.trim();
  const idx = trimmed.indexOf("/");
  if (!trimmed) return "S3 path is required";
  if (idx <= 0 || idx === trimmed.length - 1) return "Use format: bucket-name/path/to/file.dcm";
  return null;
}

export default function S3PathForm({ s3Path, onChange, onSubmit, disabled, loading, errorText }) {
  return (
    <Card
      elevation={0}
      variant="outlined"
      sx={{
        width: "min(760px, 98vw)",
        borderRadius: 3,
        backdropFilter: "blur(8px)"
      }}
    >
      <CardHeader
        title="Lookup by S3 path"
        subheader={
          <Typography variant="body2" color="text.secondary">
            Format: <code>bucket-name/path/to/file.dcm</code>
          </Typography>
        }
      />
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={onSubmit}
              disabled={disabled}
              startIcon={loading ? <span style={{ display: "inline-flex" }}><span className="spinnerDot" /></span> : null}
            >
              Get metadata
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}


