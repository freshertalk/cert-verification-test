// Toggle Dark Mode
const toggleDarkModeBtn = document.getElementById("toggle-dark-mode");
toggleDarkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// Verification Functionality
const verifyBtn = document.getElementById("verify-btn");
const certificateIdInput = document.getElementById("certificate-id");
const verificationResult = document.getElementById("verification-result");
const verifyAnotherBtn = document.getElementById("verify-another-btn");
const scanQrBtn = document.getElementById("scan-qr-btn");
const videoContainer = document.getElementById("video-container");
const closeCameraBtn = document.getElementById("close-camera");
let codeReader;
let isScanning = false; // Track scanning state to prevent multiple alerts

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
      const headers = rows[0];
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
        verificationResult.innerHTML = "<p>Certificate not found.</p>";
      }
    })
    .catch((error) => {
      console.error("Error reading CSV:", error);
      verificationResult.innerHTML = "<p>Error verifying certificate.</p>";
    });
}

verifyBtn.addEventListener("click", verifyCertificate);

scanQrBtn.addEventListener("click", () => {
  if (isScanning) return; // Prevent multiple scanning attempts
  isScanning = true;

  codeReader = new ZXing.BrowserQRCodeReader();
  videoContainer.style.display = "block";

  codeReader.decodeFromVideoDevice(null, "video", (result, err) => {
    if (result) {
      let certificateId = result.text;
      // Handle case where QR code contains a URL
      if (certificateId.startsWith("http")) {
        const url = new URL(certificateId);
        certificateId = url.searchParams.get("id");
      }

      // Validate certificate ID (basic format check)
      if (!certificateId || !certificateId.match(/^FT-WS-\d+$/)) {
        verificationResult.innerHTML = "<p>Please scan a valid QR.</p>";
        stopScanning();
        isScanning = false;
        return;
      }

      certificateIdInput.value = certificateId;
      stopScanning();
      isScanning = false;
      verifyCertificate();
    }
    if (err && !(err instanceof ZXing.NotFoundException)) {
      console.error("QR Scan Error:", err);
      verificationResult.innerHTML = "<p>Error scanning QR code.</p>";
      stopScanning();
      isScanning = false;
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

verifyAnotherBtn.addEventListener("click", () => {
  verificationResult.innerHTML = "";
  certificateIdInput.value = "";
  verifyAnotherBtn.style.display = "none";
});

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
