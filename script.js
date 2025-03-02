document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('verify-form');
    const certificateInput = document.getElementById('certificate_id');
    const errorMessage = document.getElementById('certificate-error');
    const resultDiv = document.getElementById('result');
    const buttonText = document.getElementById('button-text');
    const loadingSpinner = document.getElementById('loading-spinner');
    const qrScanButton = document.getElementById('scan-qr');
    const themeToggle = document.getElementById('toggle-theme');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // Real-time Input Validation
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

        if (!/^FT-WS-\d{6}$/.test(certificateId)) {
            errorMessage.textContent = 'Invalid format. Use FT-WS-XXXXXX (six digits).';
            errorMessage.classList.add('active');
            return;
        }

        buttonText.textContent = 'Verifying...';
        loadingSpinner.classList.remove('hidden');

        try {
            const response = await fetch('certificates.csv'); // Replace with your API endpoint
            if (!response.ok) throw new Error('Failed to load certificates.');
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
                    <button class="copy-button" onclick="copyToClipboard('${certificate.certificate_id}')">Copy ID</button>
                `;
            } else {
                resultDiv.className = 'result error';
                resultDiv.innerHTML = `
                    <i class="fas fa-times-circle icon"></i>
                    <h3>Certificate Not Found</h3>
                    <p>Check the ID and try again.</p>
                `;
            }
        } catch (error) {
            errorMessage.textContent = 'Error verifying certificate. Try again later.';
            errorMessage.classList.add('active');
            resultDiv.style.display = 'none';
            console.error(error);
        } finally {
            buttonText.textContent = 'Verify Certificate';
            loadingSpinner.classList.add('hidden');
        }
    });

    // QR Code Scanning
    qrScanButton.addEventListener('click', () => {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                video.srcObject = stream;
                video.play();
                requestAnimationFrame(tick);
            })
            .catch(err => {
                console.error('Camera access denied:', err);
                alert('Unable to access camera. Please allow camera permissions and try again.');
            });

        function tick() {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    const certificateId = code.data;
                    certificateInput.value = certificateId;
                    form.dispatchEvent(new Event('submit'));
                    video.srcObject.getTracks().forEach(track => track.stop());
                } else {
                    requestAnimationFrame(tick);
                }
            } else {
                requestAnimationFrame(tick);
            }
        }
    });

    // Copy to Clipboard
    window.copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
    };

    function parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const certificates = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const cert = {};
            headers.forEach((header, idx) => cert[header] = values[idx]);
            certificates.push(cert);
        }
        return certificates;
    }
});