document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('verify-form');
    const certificateInput = document.getElementById('certificate_id');
    const errorMessage = document.getElementById('certificate-error');
    const resultDiv = document.getElementById('result');

    certificateInput.addEventListener('input', () => {
        errorMessage.textContent = '';
        errorMessage.classList.remove('active');
        resultDiv.style.display = 'none';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const certificateId = certificateInput.value.trim();

        if (!certificateId) {
            errorMessage.textContent = 'Please enter a Certificate ID.';
            errorMessage.classList.add('active');
            return;
        }

        try {
            const response = await fetch('certificates.csv');
            if (!response.ok) {
                throw new Error('Failed to load certificates database.');
            }

            const text = await response.text();
            const certificates = parseCSV(text);

            const certificate = certificates.find(cert => cert.certificate_id === certificateId);

            resultDiv.style.display = 'block';
            if (certificate) {
                resultDiv.className = 'result success';
                resultDiv.innerHTML = `
                    <i class="fas fa-check-circle icon"></i>
                    <h3>Certificate Found</h3>
                    <p><strong>Certificate ID:</strong> ${certificate.certificate_id}</p>
                    <p><strong>Name:</strong> ${certificate.name}</p>
                    <p><strong>Course:</strong> ${certificate.course}</p>
                    <p><strong>Date Issued:</strong> ${certificate.date_issued}</p>
                `;
            } else {
                resultDiv.className = 'result error';
                resultDiv.innerHTML = `
                    <i class="fas fa-times-circle icon"></i>
                    <h3>Certificate Not Found</h3>
                `;
            }

            errorMessage.textContent = '';
            errorMessage.classList.remove('active');

        } catch (error) {
            errorMessage.textContent = 'Error: Unable to verify certificate. Please try again later.';
            errorMessage.classList.add('active');
            resultDiv.style.display = 'none';
            console.error('Error:', error);
        }
    });

    function parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(header => header.trim());
        const certificates = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(value => value.trim());
            const certificate = {};
            headers.forEach((header, index) => {
                certificate[header] = values[index];
            });
            certificates.push(certificate);
        }

        return certificates;
    }
});