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

// Get Query Parameter from URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Refresh Application (Reset UI and URL)
function refreshApplication() {
  certificateIdInput.value = "";
  verificationResult.innerHTML = "";
  verifyAnotherBtn.style.display = "none";
  window.history.pushState({}, document.title, window.location.pathname);
}

// Verify Certificate
function verifyCertificate(id) {
  if (!id) {
    verificationResult.innerHTML =
      '<p style="color: red;">Please enter or scan a certificate ID.</p>';
    setTimeout(refreshApplication, 5000);
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
        verifyAnotherBtn.style.display = "block";
      } else {
        verificationResult.innerHTML =
          '<p style="color: red; font-weight: bold;">The certificate ID you entered was not found in our records.</p>';
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

// QR Code Scanning
scanQrBtn.addEventListener("click", () => {
  if (isScanning) return;
  isScanning = true;
  verificationResult.innerHTML = "";

  codeReader = new ZXing.BrowserQRCodeReader();
  videoContainer.style.display = "block";

  codeReader.decodeFromVideoDevice(null, "video", (result, err) => {
    if (result) {
      let qrContent = result.text;
      let certificateId = qrContent;

      // Extract certificate ID if QR content is a URL
      if (qrContent.startsWith("http")) {
        try {
          const url = new URL(qrContent);
          certificateId = url.searchParams.get("id") || qrContent;
        } catch (e) {
          certificateId = qrContent;
        }
      }

      // Validate certificate ID format (must start with FT-)
      if (!certificateId || !certificateId.match(/^FT-/)) {
        verificationResult.innerHTML =
          '<p style="color: red;">Invalid certificate ID format. Please scan a valid QR code.</p>';
        stopScanning();
        isScanning = false;
        setTimeout(refreshApplication, 5000);
        return;
      }

      certificateIdInput.value = certificateId;
      stopScanning();
      isScanning = false;
      verifyCertificate(certificateId);
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

// Verify Certificate Button Event
verifyBtn.addEventListener("click", () => {
  const id = certificateIdInput.value.trim();
  verifyCertificate(id);
});

// Automatic Verification on Page Load if URL Parameter Exists
const certificateIdFromUrl = getQueryParam("id");
if (certificateIdFromUrl) {
  certificateIdInput.value = certificateIdFromUrl;
  verifyCertificate(certificateIdFromUrl);
}

// Floating Animations
function createParticles() {
  const particleContainer = document.querySelector(".background-animations");
  const particleCount = 20;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");
    particle.style.width = `${Math.random() * 10 + 5}px`;
    particle.style.height = particle.style.width;
    particle.style.left = `${Math.random() * 100}vw`;
    particle.style.top = `${Math.random() * 100}vh`;
    particle.style.animationDelay = `${Math.random() * 10}s`;
    particleContainer.appendChild(particle);
  }
}
createParticles();
