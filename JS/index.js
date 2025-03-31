const codeReader = new ZXing.BrowserMultiFormatReader(); // MultiFormatReader supports ITF barcodes
const startButton = document.getElementById('startButton');
const previewElem = document.getElementById('preview');
const resultElem = document.getElementById('result');

// Access the camera
navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
})
.then(function (stream) {
    previewElem.srcObject = stream;
    previewElem.play();
})
.catch(function (err) {
    console.error("Error accessing webcam: ", err);
});

// Start barcode detection
startButton.addEventListener('click', () => {
    codeReader.decodeFromVideoDevice(undefined, 'preview', (result) => {
        if (result) {
            console.log(result.text);
            resultElem.textContent = `Code détecté : ${result.text}`;
            // Ask the user if they want to redirect
            const confirmation = confirm("Voulez-vous rediriger vers la page suivante ?");
            if (confirmation) {
                // Reload the page for now
                window.location.reload();
            }
        } else {
            console.warn("Aucun code détecté.");
        }
    });
});

// Handle available video input devices
codeReader.getVideoInputDevices().then((videoInputDevices) => {
    if (videoInputDevices.length > 0) {
        const rearVideoDevice = videoInputDevices.find(device =>
            device.label.toLowerCase().includes('back')
        );
        if (rearVideoDevice) {
            codeReader.decodeFromVideoDevice(rearVideoDevice.deviceId, 'preview', (result) => {
                if (result) {
                    console.log(result.text);
                    resultElem.textContent = `Code détecté : ${result.text}`;
                } else {
                    console.warn("Aucun code détecté.");
                }
            });
        } else {
            console.warn('Aucune caméra arrière disponible.');
        }
    } else {
        console.error('Aucun périphérique de capture vidéo détecté.');
    }
});