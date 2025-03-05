// DOM Elements (assumed to exist in index.html)
const certificateIdInput = document.getElementById("certificate-id");
const scanQrBtn = document.getElementById("scan-qr-btn");
const verificationResult = document.getElementById("verification-result");
const verifyAnotherBtn = document.getElementById("verify-another-btn");
const videoContainer = document.getElementById("video-container");
const closeCameraBtn = document.getElementById("close-camera-btn");

let isScanning = false;
let codeReader;

// Function to get query parameters from URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Check if certificate ID is in the URL and verify automatically
const certificateIdFromUrl = getQueryParam("id");
if (certificateIdFromUrl) {
  certificateIdInput.value = certificateIdFromUrl; // Optional: Show ID in input
  verifyCertificate(); // Trigger verification immediately
}

// QR Code Scanning Event
scanQrBtn.addEventListener("click", () => {
  if (isScanning) return;
  isScanning = true;
  verificationResult.innerHTML = "";

  // Initialize ZXing QR code reader
  codeReader = new ZXing.BrowserQRCodeReader();
  videoContainer.style.display = "block";

  codeReader.decodeFromVideoDevice(null, "video", (result, err) => {
    if (result) {
      const certificateId = result.text; // Extract ID from QR code
      // Redirect to URL with certificate ID
      window.location.href = `https://freshertalk.github.io/cert-verification-test/?id=${certificateId}`;
    }
    if (err && !(err instanceof ZXing.NotFoundException)) {
      console.error("QR Scan Error:", err);
      verificationResult.innerHTML =
        '<p style="color: red;">Error scanning QR code. Please try again.</p>';
      stopScanning();
      isScanning = false;
    }
  });
});

// Verification Function
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
      const records = rows.slice(1); // Skip header row

      const record = records.find((row) => row[0] === id);
      if (record) {
        verificationResult.innerHTML = `
                    <p><strong>Certificate ID:</strong> ${record[0]}</p>
                    <p><strong>Name:</strong> ${record[1]}</p>
                    <p><strong>Course:</strong> ${record[2]}</p>
                    <p><strong>Date Issued:</strong> ${record[3]}</p>
                `;
        verifyAnotherBtn.style.display = "block"; // Show reset button
      } else {
        verificationResult.innerHTML =
          '<p style="color: red; font-weight: bold;">Certificate not found.</p>';
        setTimeout(refreshApplication, 5000); // Refresh after 5 seconds
      }
    })
    .catch((error) => {
      console.error("Error reading CSV:", error);
      verificationResult.innerHTML =
        '<p style="color: red;">Error verifying certificate.</p>';
      setTimeout(refreshApplication, 5000);
    });
}

// Refresh Application to Initial State
function refreshApplication() {
  window.location.href =
    "https://freshertalk.github.io/cert-verification-test/";
}

// Stop QR Code Scanning
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

// Close Camera Button Event
closeCameraBtn.addEventListener("click", () => {
  stopScanning();
  isScanning = false;
});

// Verify Another Record Button Event
verifyAnotherBtn.addEventListener("click", refreshApplication);
