import './App.css';
import {
  Alert,
  AppBar,
  Box,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Link,
  Stack,
  Toolbar,
  Typography
} from "@mui/material";
import { ThemeProvider, createTheme, alpha } from "@mui/material/styles";
import { useState } from "react";
import axios from "axios";
import S3PathForm, { validateS3Path } from "./components/S3PathForm";
import MetadataTable from "./components/MetadataTable";

function App() {
  const [s3Path, setS3Path] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [fieldError, setFieldError] = useState(null);

  const theme = createTheme({
    palette: {
      mode: "light",
      primary: { main: "#0b74de" },
      secondary: { main: "#0f172a" }
    },
    shape: { borderRadius: 12 }
  });

  async function onSubmit() {
    const err = validateS3Path(s3Path);
    setFieldError(err);
    setError(null);
    setMetadata(null);
    if (err) return;

    try {
      setLoading(true);
      const res = await axios.post("/api/dicom-metadata", { s3Path });
      setMetadata(res.data);
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        "Request failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          borderBottom: `1px solid ${alpha(theme.palette.common.black, 0.08)}`
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <img className="appLogo" src="/aidoc-logo-full-color.png" alt="Aidoc" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
              DICOM Metadata Viewer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Paste an S3 path, fetch the DICOM, and view key tags.
            </Typography>
          </Box>
          <Chip label="React + MUI" size="small" variant="outlined" />
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          py: { xs: 4, sm: 6 },
          background: `radial-gradient(1200px circle at 10% -10%, ${alpha(
            theme.palette.primary.main,
            0.18
          )} 0%, transparent 35%), radial-gradient(900px circle at 90% 0%, ${alpha(
            theme.palette.secondary.main,
            0.12
          )} 0%, transparent 40%), linear-gradient(180deg, ${alpha(
            theme.palette.primary.main,
            0.04
          )} 0%, transparent 30%)`
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={2.5} alignItems="center">
            <Typography variant="h4" sx={{ fontWeight: 800, textAlign: "center" }}>
              Extract DICOM metadata from S3
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", maxWidth: 720 }}>
              Backend downloads the file from S3 and parses tags like PatientID, StudyDate, Modality, InstitutionName,
              and StudyDescription.
            </Typography>

            <S3PathForm
              s3Path={s3Path}
              onChange={(v) => {
                setS3Path(v);
                if (fieldError) setFieldError(validateS3Path(v));
              }}
              onSubmit={onSubmit}
              disabled={loading}
              loading={loading}
              errorText={fieldError}
            />

            {loading && <CircularProgress aria-label="loading" />}
            {error && (
              <Alert severity="error" sx={{ width: "min(760px, 98vw)" }}>
                {error}
              </Alert>
            )}

            <MetadataTable metadata={metadata} />

            <Typography variant="caption" color="text.secondary" sx={{ pt: 2 }}>
              Tip: use the README example S3 paths. Credentials are loaded from <code>backend/node/secrets.json</code>.
            </Typography>
            <Link href="https://www.aidoc.com" target="_blank" rel="noopener noreferrer" underline="hover" variant="caption">
              Always on AI
            </Link>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
