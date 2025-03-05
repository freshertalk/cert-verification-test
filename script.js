// DOM Elements
const toggleDarkModeBtn = document.getElementById("toggle-dark-mode");
const verifyBtn = document.getElementById("verify-btn");
const certificateIdInput = document.getElementById("certificate-id");
const verificationResult = document.getElementById("verification-result");
const verifyAnotherBtn = document.getElementById("verify-another-btn");
const scanQrBtn = document.getElementById("scan-qr-btn");
const videoContainer = document.getElementById("video-container");
const closeCameraBtn = document.getElementById("close-camera");
let codeReader;
let isScanning = false;

// Toggle Dark Mode
toggleDarkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// Refresh Application
function refreshApplication() {
  certificateIdInput.value = "";
  verificationResult.innerHTML = "";
  verifyAnotherBtn.style.display = "none";
}

// Verify Certificate
function verifyCertificate() {
  const id = certificateIdInput.value.trim();
  if (!id) {
    alert("Please enter or scan a certificate ID.");
    return;
  }

  fetch("certificates.csv")
    .then((response) => response.text())
    .then((data) => {
      const rows = data.split("\n").map((row) => row.split(","));
      const records = rows.slice(1);

      const record = records.find((row) => row[0] === id);
      if (record) {
        verificationResult.innerHTML = `
                    <p><strong>Certificate ID:</strong> ${record[0]}</p>
                    <p><strong>Name:</strong> ${record[1]}</p>
                    <p><strong>Course:</strong> ${record[2]}</p>
                    <p><strong>Date Issued:</strong> ${record[3]}</p>
                `;
        verifyAnotherBtn.style.display = "block";
      } else {
        verificationResult.innerHTML =
          '<p style="color: red; font-weight: bold;">Certificate not found.</p>';
        setTimeout(refreshApplication, 5000);
      }
    })
    .catch((error) => {
      console.error("Error reading CSV:", error);
      verificationResult.innerHTML =
        '<p style="color: red;">Error verifying certificate.</p>';
      setTimeout(refreshApplication, 5000);
    });
}

verifyBtn.addEventListener("click", verifyCertificate);

// QR Code Scanning
scanQrBtn.addEventListener("click", () => {
  if (isScanning) return;
  isScanning = true;
  verificationResult.innerHTML = "";

  codeReader = new ZXing.BrowserQRCodeReader();
  videoContainer.style.display = "block";

  codeReader.decodeFromVideoDevice(null, "video", (result, err) => {
    if (result) {
      let certificateId = result.text;
      if (certificateId.startsWith("http")) {
        const url = new URL(certificateId);
        certificateId = url.searchParams.get("id");
      }

      if (!certificateId || !certificateId.match(/^FT-WS-\d+$/)) {
        verificationResult.innerHTML =
          '<p style="color: red;">Please scan a valid QR code.</p>';
        stopScanning();
        isScanning = false;
        setTimeout(refreshApplication, 5000);
        return;
      }

      certificateIdInput.value = certificateId;
      stopScanning();
      isScanning = false;
      verifyCertificate();
    }
    if (err && !(err instanceof ZXing.NotFoundException)) {
      console.error("QR Scan Error:", err);
      verificationResult.innerHTML =
        '<p style="color: red;">Error scanning QR code.</p>';
      stopScanning();
      isScanning = false;
      setTimeout(refreshApplication, 5000);
    }
  });
});

function stopScanning() {
  if (codeReader) {
    codeReader.reset();
    const video = document.getElementById("video");
    const stream = video.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    videoContainer.style.display = "none";
  }
}

closeCameraBtn.addEventListener("click", () => {
  stopScanning();
  isScanning = false;
});

verifyAnotherBtn.addEventListener("click", refreshApplication);
