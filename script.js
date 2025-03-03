document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("verify-form");
  const certificateInput = document.getElementById("certificate_id");
  const errorMessage = document.getElementById("error-message");
  const resultDiv = document.getElementById("result");
  const toggleThemeButton = document.getElementById("toggle-theme");

  // Load saved theme from local storage
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }

  // Handle dark mode toggle
  toggleThemeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark-mode") ? "dark" : "light"
    );
  });

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const certificateId = certificateInput.value.trim();

    // Clear previous messages
    errorMessage.classList.add("hidden");
    resultDiv.classList.add("hidden");
    resultDiv.innerHTML = "";

    // Basic input validation
    if (!certificateId) {
      errorMessage.textContent = "Please enter a Certificate ID";
      errorMessage.classList.remove("hidden");
      return;
    }

    try {
      // Fetch and parse the CSV file
      const response = await fetch("certificates.csv");
      if (!response.ok) throw new Error("Failed to fetch certificates");
      const text = await response.text();
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      if (parsed.errors.length > 0) throw new Error("Error parsing CSV");

      // Find the certificate
      const certificates = parsed.data;
      const certificate = certificates.find(
        (cert) => cert.certificate_id === certificateId
      );

      if (certificate) {
        // Display certificate details with Copy ID button
        resultDiv.innerHTML = `
                    <i class="fas fa-check-circle icon"></i>
                    <h3>Certificate Found</h3>
                    <p><strong>Certificate ID:</strong> ${certificate.certificate_id}</p>
                    <p><strong>Name:</strong> ${certificate.name}</p>
                    <p><strong>Course:</strong> ${certificate.course}</p>
                    <p><strong>Date Issued:</strong> ${certificate.date_issued}</p>
                    <button class="copy-button" onclick="copyToClipboard('${certificate.certificate_id}')">Copy ID</button>
                `;
        resultDiv.classList.remove("hidden");
      } else {
        errorMessage.textContent =
          "The certificate ID you entered was not found in our records.";
        errorMessage.classList.remove("hidden");
      }
    } catch (error) {
      errorMessage.textContent = `Error: ${error.message}`;
      errorMessage.classList.remove("hidden");
    }
  });

  // Function to copy certificate ID to clipboard
  window.copyToClipboard = function (text) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Certificate ID copied to clipboard");
      })
      .catch(() => {
        alert("Failed to copy");
      });
  };
});
