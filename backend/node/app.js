import express from 'express';
import cors from 'cors';
import  {downloadDicomFile } from './dicom-downloader.js';
import { metricsHandler, metricsMiddleware, pinoHttpMiddleware, requestIdMiddleware } from "./observability.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware);
app.use(pinoHttpMiddleware());
app.use(metricsMiddleware);

app.get('/health', (req, res) => {
  res.json({ message: 'The server is running' });
});

app.get("/metrics", metricsHandler);

app.post('/api/dicom-metadata', async (req, res) => {
  try {
    const { s3Path } = req.body ?? {};
    if (typeof s3Path !== "string" || !s3Path.trim()) {
      return res.status(400).json({ error: "Invalid request body. Expected { s3Path: string }", requestId: req.requestId });
    }

    const metadata = await downloadDicomFile(s3Path);
    return res.status(200).json(metadata);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    // Basic S3 not-found mapping (SDK often provides name or $metadata)
    const anyErr = /** @type {any} */ (err);
    const httpStatus = anyErr?.$metadata?.httpStatusCode;
    if (anyErr?.name === "NoSuchKey" || httpStatus === 404) {
      return res.status(404).json({ error: "S3 object not found", requestId: req.requestId });
    }

    if (message.toLowerCase().includes("invalid s3 path")) {
      return res.status(400).json({ error: message, requestId: req.requestId });
    }

    return res.status(500).json({ error: message, requestId: req.requestId });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 