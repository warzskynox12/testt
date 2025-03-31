const startButton = document.getElementById('startButton');
const previewElem = document.getElementById('preview');
const canvasElem = document.getElementById('canvas');
const resultElem = document.getElementById('result');

// Function to start the camera with the specified deviceId
function startCamera(deviceId) {
  navigator.mediaDevices.getUserMedia({
    video: { deviceId: deviceId ? { exact: deviceId } : undefined }
  })
    .then(stream => {
      previewElem.srcObject = stream;
      previewElem.play();
      scanQRCode();
    })
    .catch(err => {
      console.error("Error accessing webcam: ", err);
    });
}

// Function to find and use the rear-facing camera
function useRearCamera() {
  navigator.mediaDevices.enumerateDevices()
    .then(devices => {
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const rearCamera = videoDevices.find(device => device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear'));

      if (rearCamera) {
        startCamera(rearCamera.deviceId);
      } else {
        console.warn("Rear camera not found. Using default camera.");
        startCamera(); // Use default camera if rear camera is not found
      }
    })
    .catch(err => {
      console.error("Error enumerating devices: ", err);
    });
}

// Call the function to use the rear camera
useRearCamera();

function scanQRCode() {
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