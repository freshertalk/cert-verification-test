document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("verify-form");
  const resultDiv = document.getElementById("result");
  const toggleThemeButton = document.getElementById("toggle-theme");

  // Dark mode toggle
  toggleThemeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const certificateId = document
      .getElementById("certificate_id")
      .value.trim();

    if (!certificateId) {
      showResult("error", "Please enter a Certificate ID.");
      return;
    }

    try {
      const response = await fetch("certificates.csv");
      if (!response.ok) throw new Error("Failed to load certificate data.");
      const text = await response.text();
      const certificates = parseCSV(text);
      const certificate = certificates.find(
        (cert) => cert.certificate_id === certificateId
      );

      if (certificate) {
        showResult(
          "success",
          `
                    <strong>Certificate Found</strong><br>
                    Certificate ID: ${certificate.certificate_id}<br>
                    Name: ${certificate.name}<br>
                    Course: ${certificate.course}<br>
                    Date Issued: ${certificate.date_issued}
                `
        );
      } else {
        showResult("error", "Certificate Not Found");
      }
    } catch (error) {
      showResult(
        "error",
        `Error: ${error.message || "Please try again later."}`
      );
    }
  });

  // Show result with styling
  function showResult(type, message) {
    resultDiv.className = `result ${type}`;
    resultDiv.innerHTML = message;
    resultDiv.classList.remove("hidden");
  }

  // Parse CSV data
  function parseCSV(csvText) {
    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(",").map((header) => header.trim());
    return lines.slice(1).map((line) => {
      const values = line.split(",").map((value) => value.trim());
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});
    });
  }
});
