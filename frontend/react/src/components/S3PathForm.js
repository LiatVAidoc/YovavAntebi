import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";

export function validateS3Path(value) {
  if (typeof value !== "string") return "Study file location is required";
  const trimmed = value.trim();
  const idx = trimmed.indexOf("/");
  if (!trimmed) return "Study file location is required";
  if (idx <= 0 || idx === trimmed.length - 1) return "Please paste the full study file location (it ends with .dcm)";
  return null;
}

export default function S3PathForm({
  s3Path,
  onChange,
  onSubmit,
  onReset,
  disabled,
  loading,
  errorText,
  examples = [],
  recentPaths = []
}) {
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
        title="Open a study file"
        subheader={
          <Typography variant="body2" color="text.secondary">
            Paste the study file location you were provided.
          </Typography>
        }
      />
      <CardContent>
        <Stack spacing={2}>
          {examples.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Sample studies (click to fill):
              </Typography>
              <Stack direction="row" spacing={1} sx={{ pt: 0.75, flexWrap: "wrap" }}>
                {examples.map((ex) => (
                  <Chip
                    key={ex.label}
                    label={ex.label}
                    variant="outlined"
                    size="small"
                    onClick={() => onChange(ex.value)}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          <Autocomplete
            freeSolo
            options={recentPaths}
            value={s3Path}
            onInputChange={(_e, v) => onChange(v)}
            disabled={disabled}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Study file location"
                placeholder="example/location/to/study-file.dcm"
                error={Boolean(errorText)}
                helperText={
                  errorText ||
                  "Tip: choose a sample study above, or pick a recent location."
                }
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
            )}
          />

          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={onSubmit}
              disabled={disabled}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
            >
              Open study
            </Button>
            <Button variant="text" onClick={onReset} disabled={disabled || !s3Path} sx={{ ml: 1 }}>
              Clear
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}


