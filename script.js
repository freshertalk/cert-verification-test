document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("verify-form");
  const certificateInput = document.getElementById("certificate_id");
  const errorMessage = document.getElementById("error-message");
  const resultDiv = document.getElementById("result");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const certificateId = certificateInput.value.trim();

    // Clear previous messages
    errorMessage.classList.add("hidden");
    resultDiv.classList.add("hidden");
    resultDiv.innerHTML = "";

    // Input validation
    if (!certificateId) {
      errorMessage.textContent = "Please enter a Certificate ID.";
      errorMessage.classList.remove("hidden");
      return;
    }

    const idPattern = /^FT-WS-\d{6}$/;
    if (!idPattern.test(certificateId)) {
      errorMessage.textContent =
        "Invalid Certificate ID format. Use FT-WS-XXXXXX (six digits).";
      errorMessage.classList.remove("hidden");
      return;
    }

    try {
      // Fetch certificates.csv
      const response = await fetch("certificates.csv");
      if (!response.ok) {
        throw new Error(
          `Failed to load certificate data. Status: ${response.status}`
        );
      }
      const text = await response.text();

      // Parse CSV data
      const certificates = await parseCSV(text);
      if (!certificates || certificates.length === 0) {
        throw new Error("No certificates found in the data.");
      }

      // Find matching certificate
      const certificate = certificates.find(
        (cert) => cert.certificate_id === certificateId
      );
      if (certificate) {
        resultDiv.className = "result success";
        resultDiv.innerHTML = `
                    <strong>Certificate Found</strong><br>
                    Certificate ID: ${certificate.certificate_id}<br>
                    Name: ${certificate.name}<br>
                    Course: ${certificate.course}<br>
                    Date Issued: ${certificate.date_issued}
                `;
        resultDiv.classList.remove("hidden");
      } else {
        errorMessage.textContent =
          "Certificate Not Found. Please check the ID and try again.";
        errorMessage.classList.remove("hidden");
      }
    } catch (error) {
      errorMessage.textContent = `Error: ${
        error.message || "Unable to verify certificate."
      }`;
      errorMessage.classList.remove("hidden");
    }
  });

  // Parse CSV using PapaParse
  function parseCSV(csvText) {
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (result.errors.length > 0) {
            reject(
              new Error("CSV parsing failed: " + result.errors[0].message)
            );
          } else {
            resolve(result.data);
          }
        },
        error: (err) => reject(err),
      });
    });
  }
});
