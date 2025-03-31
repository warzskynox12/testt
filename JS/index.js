const startButton = document.getElementById('startButton');
const previewElem = document.getElementById('preview');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

// Fonction pour arrêter le flux vidéo
function stopVideoStream(videoElement) {
  if (videoElement.srcObject) {
    const tracks = videoElement.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    videoElement.srcObject = null;
  }
}

// Fonction pour scanner le QR code
function scanQRCode() {
  if (previewElem.readyState === previewElem.HAVE_ENOUGH_DATA) {
    console.log("La vidéo est prête pour le traitement.");

    // Ajuster la taille du canvas à celle de la vidéo
    canvas.width = previewElem.videoWidth;
    canvas.height = previewElem.videoHeight;

    // Dessiner l'image de la vidéo sur le canvas
    ctx.drawImage(previewElem, 0, 0, canvas.width, canvas.height);

    // Extraire les données de l'image
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log("Données de l'image extraites :", imageData);

    // Scanner l'image avec jsQR
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
    if (qrCode) {
      console.log("QR Code détecté :", qrCode.data);
      alert(`QR Code détecté : ${qrCode.data}`);
      document.getElementById("result").innerHTML = qrCode.data;
      return; // Arrêter le scan après avoir détecté un QR code
    } else {
      console.log("Aucun QR Code détecté dans cette image.");
    }
  } else {
    console.log("La vidéo n'est pas encore prête.");
  }

  // Continuer à scanner
  requestAnimationFrame(scanQRCode);
}

// Démarrer la caméra et le scan
startButton.addEventListener('click', () => {
  // Arrêter tout flux vidéo existant
  stopVideoStream(previewElem);

  navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: "environment", // Utiliser la caméra arrière
        focusMode: "continuous" // Activer l'autofocus continu
      }
    })
    .then((stream) => {
      console.log("Flux vidéo obtenu :", stream);
      previewElem.srcObject = stream;
      previewElem.play();

      // Lancer le scan en continu
      requestAnimationFrame(scanQRCode);
    })
    .catch((err) => console.error("Erreur lors de l'accès à la caméra :", err));
});