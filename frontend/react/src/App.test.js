const { render, screen, waitFor } = require("@testing-library/react");
const userEvent = require("@testing-library/user-event").default;

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn()
  }
}));

const axios = require("axios").default;
const App = require("./App").default;

test("validates S3 path format", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /get metadata/i }));
  expect(screen.getByText(/S3 path is required/i)).toBeInTheDocument();

  await user.type(screen.getByLabelText(/S3 path/i), "not-a-valid-path");
  await user.click(screen.getByRole("button", { name: /get metadata/i }));
  expect(screen.getByText("Use format: bucket-name/path/to/file.dcm")).toBeInTheDocument();
});

test("calls backend and renders metadata table", async () => {
  axios.post.mockResolvedValueOnce({
    data: {
      patientId: "P123",
      studyDate: "20250101",
      modality: "CT",
      institutionName: "Hosp",
      studyDescription: "Desc"
    }
  });

  const user = userEvent.setup();
  render(<App />);

  await user.type(screen.getByLabelText(/S3 path/i), "my-bucket/path/to/file.dcm");
  await user.click(screen.getByRole("button", { name: /get metadata/i }));

  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith("/api/dicom-metadata", { s3Path: "my-bucket/path/to/file.dcm" });
  });

  expect(await screen.findByText("PatientID")).toBeInTheDocument();
  expect(screen.getByText("P123")).toBeInTheDocument();
  expect(screen.getByText("20250101")).toBeInTheDocument();
  expect(screen.getByText("CT")).toBeInTheDocument();
});
