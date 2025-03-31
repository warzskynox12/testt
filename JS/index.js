const startButton = document.getElementById('startButton');
const previewElem = document.getElementById('preview');
const resultElem = document.getElementById('result');

// Fonction pour arrêter le scanner
function stopScanner() {
  Quagga.stop();
  console.log("Scanner arrêté.");
}

// Fonction pour démarrer le scanner
function startScanner() {
  Quagga.init(
    {
      inputStream: {
        type: "LiveStream",
        target: previewElem, // L'élément vidéo où afficher le flux
        constraints: {
          facingMode: "environment", // Utiliser la caméra arrière
        },
      },
      decoder: {
        readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_39_vin_reader", "codabar_reader", "upc_reader", "upc_e_reader", "i2of5_reader"],
      },
    },
    (err) => {
      if (err) {
        console.error("Erreur lors de l'initialisation de Quagga :", err);
        return;
      }
      console.log("QuaggaJS initialisé.");
      Quagga.start();
    }
  );

  // Écouter les résultats du scanner
  Quagga.onDetected((data) => {
    console.log("Code-barres détecté :", data.codeResult.code);
    alert(`Code-barres détecté : ${data.codeResult.code}`);
    resultElem.innerHTML = `Code-barres détecté : ${data.codeResult.code}`;
    stopScanner(); // Arrêter le scanner après avoir détecté un code-barres
  });
}

// Démarrer le scanner lorsque le bouton est cliqué
startButton.addEventListener("click", () => {
  startScanner();
});