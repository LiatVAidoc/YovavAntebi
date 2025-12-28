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
  Snackbar,
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
  const [toast, setToast] = useState(null);

  const EXAMPLES = [
    {
      label: "Sample study 1",
      value:
        "aidoc-dev-us-102-storage/production/scans/3041983076-1.2.826.0.1.3680043.9.6883.1.24209659964804056971019414433891120/anon-1.2.826.0.1.3680043.9.6883.1.11587754842360809093846306686786710.dcm"
    },
    {
      label: "Sample study 2",
      value:
        "aidoc-dev-us-102-storage/production/scans/4238504654-1.2.826.0.1.3680043.9.6883.1.32493157154612462868188386784309713/anon-1.2.826.0.1.3680043.9.6883.1.78029029927695039519419036767955471.dcm"
    },
    {
      label: "Sample study 3",
      value:
        "aidoc-dev-us-133-storage/production/scans/790532356-1.2.826.0.1.3680043.9.6883.1.23786564474194664558627539950275524/anon-1.2.826.0.1.3680043.9.6883.1.17588622695739916769169352722766541.dcm"
    }
  ];

  const RECENTS_KEY = "aidoc_recent_s3_paths_v1";
  const recentPaths = (() => {
    try {
      const raw = window.localStorage.getItem(RECENTS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  })();

  function addRecent(path) {
    try {
      const trimmed = String(path || "").trim();
      if (!trimmed) return;
      const next = [trimmed, ...recentPaths.filter((p) => p !== trimmed)].slice(0, 8);
      window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

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
      addRecent(s3Path);
      setToast("Study details loaded");
    } catch (e) {
      const detail = e?.response?.data?.error || e?.message;
      const userMessage = "We couldn’t open this study. Please check the location and your access.";
      setError(detail ? `${userMessage} (${detail})` : userMessage);
    } finally {
      setLoading(false);
    }
  }

  function onReset() {
    setS3Path("");
    setFieldError(null);
    setError(null);
    setMetadata(null);
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
              DICOM Study Metadata
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Open a study file and review key details at a glance.
            </Typography>
          </Box>
          <Chip label="Study viewer" size="small" variant="outlined" />
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
              Study details
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", maxWidth: 720 }}>
              Quickly review Patient ID, Study date, Modality, Facility, and Study description.
            </Typography>

            <S3PathForm
              s3Path={s3Path}
              onChange={(v) => {
                setS3Path(v);
                if (fieldError) setFieldError(validateS3Path(v));
              }}
              onSubmit={onSubmit}
              onReset={onReset}
              disabled={loading}
              loading={loading}
              errorText={fieldError}
              examples={EXAMPLES}
              recentPaths={recentPaths}
            />

            {loading && <CircularProgress aria-label="loading" />}
            {error && (
              <Alert severity="error" sx={{ width: "min(760px, 98vw)" }}>
                {error}
              </Alert>
            )}

            <MetadataTable metadata={metadata} />

            <Typography variant="caption" color="text.secondary" sx={{ pt: 2, textAlign: "center" }}>
              Tip: use a sample study above, or paste a location you were provided.
            </Typography>
            <Link href="https://www.aidoc.com" target="_blank" rel="noopener noreferrer" underline="hover" variant="caption">
              Always on AI
            </Link>
          </Stack>
        </Container>
      </Box>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={1800}
        onClose={() => setToast(null)}
        message={toast || ""}
      />
    </ThemeProvider>
  );
}

export default App;
