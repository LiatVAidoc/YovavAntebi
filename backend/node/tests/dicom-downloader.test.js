import { jest } from "@jest/globals";

const mockS3Send = jest.fn();
const mockGetObjectCommand = jest.fn();
const mockParseDicom = jest.fn();

// ESM: use unstable_mockModule + dynamic import so mocks apply before loading the module under test.
jest.unstable_mockModule("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: mockS3Send
  })),
  GetObjectCommand: mockGetObjectCommand
}));

jest.unstable_mockModule("dicom-parser", () => ({
  default: {
    parseDicom: mockParseDicom
  }
}));

let downloadDicomFile;
let parseDicomFile;

describe('DICOM Downloader', () => {
  beforeAll(async () => {
    // Silence secrets.json missing log during tests
    jest.spyOn(console, "error").mockImplementation(() => {});

    const mod = await import("../dicom-downloader.js");
    downloadDicomFile = mod.downloadDicomFile;
    parseDicomFile = mod.parseDicomFile;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockS3Send.mockResolvedValue({
      Body: {
        transformToByteArray: async () => Buffer.from('mock-dicom-data')
      }
    });
    
    mockParseDicom.mockReturnValue({
      string: jest.fn().mockImplementation((tag) => {
        const tags = {
          'x00100020': 'TEST-PATIENT-ID',
          'x00080020': '20230101',
          'x00080060': 'CT',
          'x00080080': 'TEST-INSTITUTION',
          'x00081030': 'TEST-STUDY'
        };
        return tags[tag] || '';
      })
    });
  });

  test('parseDicomFile extracts required tags', () => {
    const result = parseDicomFile(Buffer.from("test"));
    expect(result).toEqual({
      patientId: 'TEST-PATIENT-ID',
      studyDate: '20230101',
      modality: 'CT',
      institutionName: 'TEST-INSTITUTION',
      studyDescription: 'TEST-STUDY',
      raw: {
        x00100020: 'TEST-PATIENT-ID',
        x00080020: '20230101',
        x00080060: 'CT',
        x00080080: 'TEST-INSTITUTION',
        x00081030: 'TEST-STUDY'
      }
    });
  });

  test('downloadDicomFile downloads from S3 and returns metadata', async () => {
    const result = await downloadDicomFile("test-bucket/test-path.dcm");

    expect(mockGetObjectCommand).toHaveBeenCalledWith({
      Bucket: 'test-bucket',
      Key: 'test-path.dcm'
    });
    expect(mockS3Send).toHaveBeenCalledTimes(1);

    expect(result.patientId).toBe('TEST-PATIENT-ID');
    expect(result.studyDate).toBe('20230101');
    expect(result.modality).toBe('CT');
    expect(result.institutionName).toBe('TEST-INSTITUTION');
    expect(result.studyDescription).toBe('TEST-STUDY');
  });
}); 