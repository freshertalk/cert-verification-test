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

// Verify Certificate
verifyBtn.addEventListener("click", () => {
  const id = certificateIdInput.value.trim();
  if (!id) {
    verificationResult.innerHTML =
      '<p style="color: #e67e22;">Please enter a certificate ID.</p>';
    return;
  }

  fetch("certificates.csv")
    .then((response) => response.text())
    .then((data) => {
      const rows = data.split("\n").map((row) => row.split(","));
      const headers = rows[0];
      const records = rows.slice(1);

      const record = records.find((row) => row[0] === id);
      if (record) {
        verificationResult.innerHTML = `
                    <p><strong>${headers[0]}:</strong> ${record[0]}</p>
                    <p><strong>${headers[1]}:</strong> ${record[1]}</p>
                    <p><strong>${headers[2]}:</strong> ${record[2]}</p>
                    <p><strong>${headers[3]}:</strong> ${record[3]}</p>
                `;
        verifyAnotherBtn.style.display = "block";
      } else {
        verificationResult.innerHTML =
          '<p style="color: #e67e22;">Certificate not found.</p>';
      }
    })
    .catch((error) => {
      console.error("Error reading CSV:", error);
      verificationResult.innerHTML =
        '<p style="color: #e67e22;">Error verifying certificate.</p>';
    });
});

// QR Code Scanning
scanQrBtn.addEventListener("click", () => {
  if (isScanning) return;
  isScanning = true;
  videoContainer.style.display = "block";

  if (codeReader) {
    codeReader.reset();
    codeReader = null;
  }

  codeReader = new ZXing.BrowserQRCodeReader();
  codeReader.decodeFromVideoDevice(null, "video", (result, err) => {
    if (result) {
      let certificateId = result.text;
      if (certificateId.startsWith("http")) {
        const url = new URL(certificateId);
        certificateId = url.searchParams.get("id");
      }
      if (!certificateId || !certificateId.match(/^FT-/)) {
        verificationResult.innerHTML =
          '<p style="color: #e67e22;">Invalid QR code. Please scan a valid certificate ID (starting with FT-).</p>';
        stopScanning();
        isScanning = false;
        setTimeout(refreshApplication, 5000);
        return;
      }
      certificateIdInput.value = certificateId;
      stopScanning();
      isScanning = false;
      verifyBtn.click();
    }
    if (err && !(err instanceof ZXing.NotFoundException)) {
      console.error("QR Scan Error:", err);
      verificationResult.innerHTML =
        '<p style="color: #e67e22;">Error scanning QR code. Please try again.</p>';
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
    video.srcObject = null;
    videoContainer.style.display = "none";
    codeReader = null;
  }
}

closeCameraBtn.addEventListener("click", () => {
  stopScanning();
  isScanning = false;
});

verifyAnotherBtn.addEventListener("click", () => {
  certificateIdInput.value = "";
  verificationResult.innerHTML = "";
  verifyAnotherBtn.style.display = "none";
});

function refreshApplication() {
  certificateIdInput.value = "";
  verificationResult.innerHTML = "";
  verifyAnotherBtn.style.display = "none";
}
