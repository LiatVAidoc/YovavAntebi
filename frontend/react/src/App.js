import './App.css';
import { Alert, Box, CircularProgress, Container, CssBaseline, Stack, Typography } from "@mui/material";
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
    <>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", py: 6 }}>
        <Container>
          <Stack spacing={3} alignItems="center">
            <img src="/aidoc-logo-full-color.png" width="192" alt="logo" />
            <Typography variant="h6" color="text.secondary">
              Fetch a DICOM from S3 and display selected metadata.
            </Typography>

            <S3PathForm
              s3Path={s3Path}
              onChange={(v) => {
                setS3Path(v);
                if (fieldError) setFieldError(validateS3Path(v));
              }}
              onSubmit={onSubmit}
              disabled={loading}
              errorText={fieldError}
            />

            {loading && <CircularProgress aria-label="loading" />}
            {error && (
              <Alert severity="error" sx={{ width: "min(720px, 95vw)" }}>
                {error}
              </Alert>
            )}

            <MetadataTable metadata={metadata} />
          </Stack>
        </Container>
      </Box>
    </>
  );
}

export default App;
