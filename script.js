// Toggle Dark Mode functionality (assuming it exists)
const toggleDarkModeBtn = document.getElementById("toggle-dark-mode");
toggleDarkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// Verification functionality
const verifyBtn = document.getElementById("verify-btn");
const certificateIdInput = document.getElementById("certificate-id");
const verificationResult = document.getElementById("verification-result");
const verifyAnotherBtn = document.getElementById("verify-another-btn");
const scanQrBtn = document.getElementById("scan-qr-btn");
const videoContainer = document.getElementById("video-container");
let codeReader;

function verifyCertificate() {
  const id = certificateIdInput.value.trim();
  if (!id) {
    alert("Please enter or scan a certificate ID.");
    return;
  }

  // Fetch and parse the CSV file
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

// Event listener for Verify button
verifyBtn.addEventListener("click", verifyCertificate);

// QR Scanning functionality
scanQrBtn.addEventListener("click", () => {
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
      certificateIdInput.value = certificateId;
      videoContainer.style.display = "none";
      codeReader.reset();
      verifyCertificate();
    }
    if (err && !(err instanceof ZXing.NotFoundException)) {
      console.error("QR Scan Error:", err);
      verificationResult.innerHTML = "<p>Error scanning QR code.</p>";
    }
  });
});

// Verify Another Record functionality
verifyAnotherBtn.addEventListener("click", () => {
  verificationResult.innerHTML = "";
  certificateIdInput.value = "";
  verifyAnotherBtn.style.display = "none";
});
