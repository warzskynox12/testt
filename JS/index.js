const startButton = document.getElementById('startButton');
const previewElem = document.getElementById('preview');
const canvasElem = document.getElementById('canvas');
const resultElem = document.getElementById('result');

// Vérifier si les éléments HTML existent
if (!startButton || !previewElem || !canvasElem || !resultElem) {
  console.error("Un ou plusieurs éléments HTML requis sont introuvables.");
  throw new Error("Initialisation interrompue : éléments HTML manquants.");
}

// Fonction pour arrêter le scanner
function stopScanner() {
  if (Quagga) {
    Quagga.stop();
    console.log("Scanner arrêté.");
  } else {
    console.warn("Quagga n'est pas initialisé.");
  }
}

// Fonction pour démarrer le scanner
function startScanner() {
  if (!Quagga) {
    console.error("Quagga n'est pas chargé.");
    return;
  }

  Quagga.init(
    {
      inputStream: {
        type: "LiveStream",
        target: previewElem, // L'élément vidéo où afficher le flux
        constraints: {
          facingMode: "environment", // Utiliser la caméra arrière
          focusMode: "continuous", // Mode de mise au point continue
        },
      },
      decoder: {
        // Ajouter tous les types de code-barres
        readers: [
          "code_128_reader",
          "ean_reader",
          "ean_8_reader",
          "code_39_reader",
          "code_39_vin_reader",
          "codabar_reader",
          "upc_reader",
          "upc_e_reader",
          "i2of5_reader",
          "2of5_reader",
        ],
      },
      locator: {
        patchSize: "medium", // Taille des patchs pour la détection
        halfSample: true, // Réduire la résolution pour améliorer les performances
      },
      locate: true, // Activer la localisation des codes-barres
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
  Quagga.onProcessed((result) => {
    if (result && Quagga.canvas && Quagga.canvas.dom && Quagga.canvas.dom.image) {
      const canvas = Quagga.canvas.dom.image;
      const ctx = canvas.getContext("2d", { willReadFrequently: true }); // Activer willReadFrequently
      if (ctx) {
        console.log("Canvas traité avec willReadFrequently activé.");
      } else {
        console.warn("Impossible d'obtenir le contexte du canvas.");
      }
    }
  });

  Quagga.onDetected((data) => {
    if (data && data.codeResult && data.codeResult.code) {
      console.log("Code-barres détecté :", data.codeResult.code);
      alert(`Code-barres détecté : ${data.codeResult.code}`);
      resultElem.innerHTML = `Code-barres détecté : ${data.codeResult.code}`;
      stopScanner(); // Arrêter le scanner après avoir détecté un code-barres
    } else {
      console.warn("Résultat de détection invalide.");
    }
  });
}

// Démarrer le scanner lorsque le bouton est cliqué
startButton.addEventListener("click", () => {
  startScanner();
});