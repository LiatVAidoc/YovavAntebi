import fs from 'fs';
import path from 'path';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import dicomParser from "dicom-parser";
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let s3Client;

// Setup AWS credentials from secrets.json
try {
  const secrets = JSON.parse(fs.readFileSync(path.join(__dirname, 'secrets.json')));
  s3Client = new S3Client({
    region: secrets.REGION || 'us-east-2',
    credentials: {
      accessKeyId: secrets.AWS_ACCESS_KEY_ID,
      secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY,
      sessionToken: secrets.AWS_SESSION_TOKEN
    }
  });
} catch (error) {
  console.error('Error loading secrets.json:', error.message);
  // Fall back to the default credential/provider chain (env vars, shared config, IAM role, etc.)
  s3Client = new S3Client({
    region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-2"
  });
}

function parseS3Path(s3Path) {
  if (typeof s3Path !== "string") {
    throw new Error("Invalid S3 path");
  }

  const trimmed = s3Path.trim();
  const idx = trimmed.indexOf("/");
  if (idx <= 0 || idx === trimmed.length - 1) {
    throw new Error("Invalid S3 path format. Expected bucket-name/path/to/file.dcm");
  }

  const bucket = trimmed.slice(0, idx);
  const key = trimmed.slice(idx + 1);
  return { bucket, key };
}

async function bodyToBuffer(body) {
  if (!body) return Buffer.alloc(0);

  // AWS SDK v3 in Node often provides helpers.
  if (typeof body.transformToByteArray === "function") {
    const bytes = await body.transformToByteArray();
    return Buffer.from(bytes);
  }

  // Node.js stream
  if (typeof body.pipe === "function") {
    const chunks = [];
    for await (const chunk of body) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  // Uint8Array fallback
  if (body instanceof Uint8Array) return Buffer.from(body);

  throw new Error("Unsupported S3 body type");
}

/**
 * Downloads a DICOM file from S3 and extracts its metadata
 * @param {string} s3Path - Path to the DICOM file in S3 (bucket-name/path/to/file.dcm)
 * @returns {Object} - Object containing the DICOM metadata
 */
async function downloadDicomFile(s3Path) {
  const { bucket, key } = parseS3Path(s3Path);

  const resp = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key
    })
  );

  const buffer = await bodyToBuffer(resp.Body);
  return parseDicomFile(buffer);
}

/**
 * Parses DICOM file and extracts metadata
 * @param {Buffer} buffer - Buffer containing DICOM file data
 * @returns {Object} - Object containing DICOM metadata
 */
function parseDicomFile(buffer) {
  const byteArray = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const dataSet = dicomParser.parseDicom(byteArray);

  const get = (tag) => {
    try {
      const v = dataSet.string(tag);
      return v || undefined;
    } catch {
      return undefined;
    }
  };

  const patientId = get("x00100020"); // PatientID (0010,0020)
  const studyDate = get("x00080020"); // StudyDate (0008,0020)
  const modality = get("x00080060"); // Modality (0008,0060)
  const institutionName = get("x00080080"); // InstitutionName (0008,0080)
  const studyDescription = get("x00081030"); // StudyDescription (0008,1030)

  return {
    patientId,
    studyDate,
    modality,
    institutionName,
    studyDescription,
    raw: {
      x00100020: patientId,
      x00080020: studyDate,
      x00080060: modality,
      x00080080: institutionName,
      x00081030: studyDescription
    }
  };
}

export {
  downloadDicomFile,
  parseDicomFile
};