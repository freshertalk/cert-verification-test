// Check for ID in URL on page load
const urlParams = new URLSearchParams(window.location.search);
const idFromUrl = urlParams.get('id');
if (idFromUrl) {
    document.getElementById('certificate-id').value = idFromUrl;
    verifyCertificate();
}

// Verify certificate function
function verifyCertificate() {
    const id = document.getElementById('certificate-id').value.trim();
    if (!id) {
        alert('Please enter a certificate ID.');
        return;
    }

    fetch('certificates.csv')
        .then(response => {
            if (!response.ok) throw new Error('Certificates file not found.');
            return response.text();
        })
        .then(data => {
            const rows = data.split('\n').map(row => row.split(','));
            const headers = rows[0];
            const records = rows.slice(1);

            const record = records.find(row => row[0] === id);
            if (record) {
                displayResult(record);
            } else {
                document.getElementById('verification-result').innerHTML = '<p>Certificate not found.</p>';
            }
            document.getElementById('verify-another-btn').style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching certificates:', error);
            document.getElementById('verification-result').innerHTML = '<p>Error verifying certificate.</p>';
        });
}

// Display verification result
function displayResult(record) {
    const resultDiv = document.getElementById('verification-result');
    resultDiv.innerHTML = `
        <p><strong>Certificate ID:</strong> ${record[0]}</p>
        <p><strong>Name:</strong> ${record[1]}</p>
        <p><strong>Course:</strong> ${record[2]}</p>
        <p><strong>Date Issued:</strong> ${record[3]}</p>
    `;
}

// Event listener for verify button
document.getElementById('verify-btn').addEventListener('click', verifyCertificate);

// Event listener for QR code scanning
document.getElementById('scan-qr-btn').addEventListener('click', () => {
    document.getElementById('video-container').style.display = 'block';
    const codeReader = new ZXing.BrowserQRCodeReader();
    codeReader.decodeFromVideoDevice(null, 'video', (result, err) => {
        if (result) {
            let id = result.text;
            // Extract ID if QR code contains a URL
            if (id.startsWith('http')) {
                const url = new URL(id);
                id = url.searchParams.get('id');
            }
            document.getElementById('certificate-id').value = id;
            document.getElementById('video-container').style.display = 'none';
            codeReader.reset(); // Stop scanning
            verifyCertificate();
        }
        if (err && !(err instanceof ZXing.NotFoundException)) {
            console.error(err);
            document.getElementById('verification-result').innerHTML = '<p>Error scanning QR code.</p>';
            document.getElementById('video-container').style.display = 'none';
            codeReader.reset();
        }
    });
});

// Close camera button
document.getElementById('close-camera').addEventListener('click', () => {
    document.getElementById('video-container').style.display = 'none';
    const video = document.getElementById('video');
    const stream = video.srcObject;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});

// Verify another record button
document.getElementById('verify-another-btn').addEventListener('click', () => {
    document.getElementById('certificate-id').value = '';
    document.getElementById('verification-result').innerHTML = '';
    document.getElementById('verify-another-btn').style.display = 'none';
});

// Toggle dark mode
document.getElementById('toggle-dark-mode').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});