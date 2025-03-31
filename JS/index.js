const previewElem = document.getElementById('preview');
const canvasElem = document.getElementById('canvas');
const resultElem = document.getElementById('result');

navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'environment',
  },
})
  .then((stream) => {
    previewElem.srcObject = stream;
    previewElem.play();
    scanQRCode();
  })
  .catch((err) => {
    console.error("Error accessing webcam: ", err);
  });

function scanQRCode() {
  // Ensure the video element has valid dimensions
  if (previewElem.videoWidth === 0 || previewElem.videoHeight === 0) {
    requestAnimationFrame(scanQRCode); // Retry until the video is ready
    return;
  }

  const context = canvasElem.getContext('2d');
  const videoWidth = previewElem.videoWidth;
  const videoHeight = previewElem.videoHeight;

  canvasElem.width = videoWidth;
  canvasElem.height = videoHeight;

  context.drawImage(previewElem, 0, 0, videoWidth, videoHeight);

  const imageData = context.getImageData(0, 0, videoWidth, videoHeight);

  // Use jsQR library to decode the QR code
  const code = jsQR(imageData.data, videoWidth, videoHeight);

  if (code) {
    resultElem.textContent = `QR Code Data: ${code.data}`;
    resultElem.style.color = 'green';
    stopScanning();
  } else {
    requestAnimationFrame(scanQRCode);
  }
}