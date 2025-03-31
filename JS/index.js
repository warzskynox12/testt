const codeReader = new ZXing.BrowserQRCodeReader();
const startButton = document.getElementById('startButton');
const previewElem = document.getElementById('preview');
const resultElem = document.getElementById('result');

navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
})
.then(function (stream) {
    previewElem.srcObject = stream;
    previewElem.play();
});

startButton.addEventListener('click', () => {
  codeReader.decodeFromVideoDevice(undefined, 'preview', (result) => {
      if (result) {
          console.log(result.text);
          resultElem.textContent = result.text;
      } else {
          console.warn("No QR code detected.");
      }
  });
});

codeReader.getVideoInputDevices().then((videoInputDevices) => {
    if (videoInputDevices.length > 0) {
        const rearVideoDevice = videoInputDevices.find(device => device.label.toLowerCase().includes('back'));
        if (rearVideoDevice) {
            codeReader.decodeFromVideoDevice(rearVideoDevice.deviceId, 'preview', (result) => {
                console.log(result.text);
                redirectToPage(result.text);
            }).catch((err) => {
                console.error(err);
            });
        } else {
            console.warn('Aucune caméra arrière disponible.');
        }
    } else {
        console.error('Aucun périphérique de capture vidéo détecté.');
    }
});
