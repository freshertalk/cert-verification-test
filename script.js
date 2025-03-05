// DOM Elements
const toggleDarkModeBtn = document.getElementById('toggle-dark-mode');
const verifyBtn = document.getElementById('verify-btn');
const certificateIdInput = document.getElementById('certificate-id');
const verificationResult = document.getElementById('verification-result');
const verifyAnotherBtn = document.getElementById('verify-another-btn');
const scanQrBtn = document.getElementById('scan-qr-btn');
const videoContainer = document.getElementById('video-container');
const closeCameraBtn = document.getElementById('close-camera');
let codeReader = null;
let isScanning = false;

// Toggle Dark Mode
toggleDarkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// Get Query Parameter from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Refresh Application (Reset UI and URL)
function refreshApplication() {
    certificateIdInput.value = '';
    verificationResult.innerHTML = '';
    verifyAnotherBtn.style.display = 'none';
    window.history.pushState({}, document.title, window.location.pathname);
}

// Verify Certificate
function verifyCertificate(id) {
    if (!id) {
        verificationResult.innerHTML = '<p style="color: red;">Please enter or scan a certificate ID.</p>';
        setTimeout(refreshApplication, 5000);
        return;
    }

    fetch('certificates.csv')
        .then(response => {
            if (!response.ok) throw new Error('CSV file not found');
            return response.text();
        })
        .then(data => {
            const rows = data.trim().split('\n').map(row => row.split(','));
            const records = rows.slice(1); // Skip header
            const record = records.find(row => row[0] === id);
            if (record) {
                verificationResult.innerHTML = `
                    <p><strong>Certificate ID:</strong> ${record[0]}</p>
                    <p><strong>Name:</strong> ${record[1]}</p>
                    <p><strong>Course:</strong> ${record[2]}</p>
                    <p><strong>Date Issued:</strong> ${record[3]}</p>
                `;
                verifyAnotherBtn.style.display = 'block';
            } else {
                verificationResult.innerHTML = '<p style="color: red; font-weight: bold;">Certificate ID not found.</p>';
                setTimeout(refreshApplication, 5000);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            verificationResult.innerHTML = '<p style="color: red;">Error verifying certificate. Please try again.</p>';
            setTimeout(refreshApplication, 5000);
        });
}

// Stop Scanning
function stopScanning() {
    if (codeReader) {
        codeReader.reset();
        codeReader = null;
    }
    const video = document.getElementById('video');
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    videoContainer.style.display = 'none';
    isScanning = false;
}

// QR Code Scanning
scanQrBtn.addEventListener('click', async () => {
    if (isScanning) return;
    isScanning = true;
    verificationResult.innerHTML = '';

    try {
        // Check camera permissions
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        videoContainer.style.display = 'block';
        const video = document.getElementById('video');
        video.srcObject = stream;

        // Initialize ZXing reader
        codeReader = new ZXing.BrowserQRCodeReader();
        const result = await codeReader.decodeFromVideoDevice(null, 'video', (result, err) => {
            if (result) {
                let qrContent = result.text;
                let certificateId = qrContent;

                // Extract ID from URL if present
                if (qrContent.startsWith('http')) {
                    try {
                        const url = new URL(qrContent);
                        certificateId = url.searchParams.get('id') || qrContent;
                    } catch (e) {
                        certificateId = qrContent;
                    }
                }

                if (!certificateId.match(/^FT-/)) {
                    verificationResult.innerHTML = '<p style="color: red;">Invalid certificate ID format.</p>';
                    stopScanning();
                    setTimeout(refreshApplication, 5000);
                    return;
                }

                certificateIdInput.value = certificateId;
                stopScanning();
                verifyCertificate(certificateId);
            }
            if (err && !(err instanceof ZXing.NotFoundException)) {
                console.error('QR Scan Error:', err);
                verificationResult.innerHTML = '<p style="color: red;">Error scanning QR code. Please try again.</p>';
                stopScanning();
                setTimeout(refreshApplication, 5000);
            }
        });
    } catch (error) {
        console.error('Camera Error:', error);
        verificationResult.innerHTML = '<p style="color: red;">Camera access denied. Please allow camera permissions.</p>';
        stopScanning();
        setTimeout(refreshApplication, 5000);
    }
});

// Close Camera
closeCameraBtn.addEventListener('click', () => {
    stopScanning();
});

// Verify Another Record
verifyAnotherBtn.addEventListener('click', refreshApplication);

// Verify Certificate Button
verifyBtn.addEventListener('click', () => {
    const id = certificateIdInput.value.trim();
    verifyCertificate(id);
});

// Automatic Verification from URL
const certificateIdFromUrl = getQueryParam('id');
if (certificateIdFromUrl) {
    certificateIdInput.value = certificateIdFromUrl;
    verifyCertificate(certificateIdFromUrl);
}

// Floating Animations
function createParticles() {
    const particleContainer = document.querySelector('.background-animations');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.width = `${Math.random() * 10 + 5}px`;
        particle.style.height = particle.style.width;
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = `${Math.random() * 100}vh`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        particleContainer.appendChild(particle);
    }
}
createParticles();