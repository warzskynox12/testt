var barcode = function() {

	var localMediaStream = null;
	var bars = [];
	var handler = null;

	var dimensions = {
		height: 0,
		width: 0,
		start: 0,
		end: 0
	}

	var elements = {
		video: null,
		canvas: null,
		ctx: null,	
		canvasg: null,
		ctxg: null	
	}

	var upc = {
		'0': [3, 2, 1, 1],
		'1': [2, 2, 2, 1],
		'2': [2, 1, 2, 2],
		'3': [1, 4, 1, 1],
		'4': [1, 1, 3, 2],
		'5': [1, 2, 3, 1],
		'6': [1, 1, 1, 4],
		'7': [1, 3, 1, 2],
		'8': [1, 2, 1, 3],
		'9': [3, 1, 1, 2]
	};

	var itf = {
		'0': [1, 1, 2, 2, 1],
		'1': [2, 1, 1, 1, 2],
		'2': [1, 2, 1, 1, 2],
		'3': [2, 2, 1, 1, 1],
		'4': [1, 1, 2, 1, 2],
		'5': [2, 1, 2, 1, 1],
		'6': [1, 2, 2, 1, 1],
		'7': [1, 1, 1, 2, 2],
		'8': [2, 1, 1, 2, 1],
		'9': [1, 2, 1, 2, 1]
	};

	var check = {
		'oooooo': '0',
		'ooeoee': '1',
		'ooeeoe': '2',
		'ooeeeo': '3',
		'oeooee': '4',
		'oeeooe': '5',
		'oeeeoo': '6',
		'oeoeoe': '7',
		'oeoeeo': '8',
		'oeeoeo': '9'
	}

	var config = {
		strokeColor: '#f00',
		start: 0.1,
		end: 0.9,
		threshold: 160,
		quality: 0.45,
		delay: 100,
		video: '',
		canvas: '',
		canvasg: ''
	}

	function init() {
		window.URL = window.URL || window.webkitURL;
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

		elements.video = document.querySelector(config.video);
		elements.canvas = document.querySelector(config.canvas);
		elements.ctx = elements.canvas.getContext('2d', { willReadFrequently: true }); // Added willReadFrequently
		elements.canvasg = document.querySelector(config.canvasg);
		elements.ctxg = elements.canvasg.getContext('2d', { willReadFrequently: true }); // Added willReadFrequently

		if (navigator.getUserMedia) {
			navigator.getUserMedia({ audio: false, video: true }, function (stream) {
				elements.video.srcObject = stream;
			}, function (error) {
				console.log(error);
			});
		}

		elements.video.addEventListener('canplay', function (e) {
			dimensions.height = elements.video.videoHeight;
			dimensions.width = elements.video.videoWidth;

			dimensions.start = dimensions.width * config.start;
			dimensions.end = dimensions.width * config.end;

			elements.canvas.width = dimensions.width;
			elements.canvas.height = dimensions.height;
			elements.canvasg.width = dimensions.width;
			elements.canvasg.height = dimensions.height;

			drawGraphics();
			setInterval(function () { snapshot() }, config.delay);
		}, false);
	}

	function snapshot() {
		elements.ctx.drawImage(elements.video, 0, 0, dimensions.width, dimensions.height);
		processImage();		
	}

	function processImage() {
		bars = [];

		var pixels = [];
		var binary = [];
		var pixelBars = [];

		// Convert to grayscale
		var imgd = elements.ctx.getImageData(dimensions.start, dimensions.height * 0.5, dimensions.end - dimensions.start, 1);
		var rgbpixels = imgd.data;

		for (var i = 0, ii = rgbpixels.length; i < ii; i = i + 4) {
			pixels.push(Math.round(rgbpixels[i] * 0.2126 + rgbpixels[i + 1] * 0.7152 + rgbpixels[i + 2] * 0.0722));
		}

		// Normalize and convert to binary
		var min = Math.min.apply(null, pixels);
		var max = Math.max.apply(null, pixels);

		for (var i = 0, ii = pixels.length; i < ii; i++) {
			if (Math.round((pixels[i] - min) / (max - min) * 255) > config.threshold) {
				binary.push(1);
			} else {
				binary.push(0);
			}
		}

		// Detect ITF start pattern (1010)
		var startPattern = [1, 0, 1, 0];
		var startIndex = binary.join('').indexOf(startPattern.join(''));

		if (startIndex === -1) {
			console.warn("No ITF start pattern found.");
			return;
		}

		// Extract the barcode data between the start and stop patterns
		var stopPattern = [1, 1, 0, 1];
		var stopIndex = binary.join('').indexOf(stopPattern.join(''), startIndex + startPattern.length);

		if (stopIndex === -1) {
			console.warn("No ITF stop pattern found.");
			return;
		}

		var barcodeData = binary.slice(startIndex + startPattern.length, stopIndex);

		// Decode the ITF barcode
		var result = [];
		for (var i = 0; i < barcodeData.length; i += 10) {
			var digitPair = barcodeData.slice(i, i + 10);
			var digit1 = decodeITFDigit(digitPair.slice(0, 5));
			var digit2 = decodeITFDigit(digitPair.slice(5, 10));
			if (digit1 === null || digit2 === null) {
				console.warn("Invalid ITF digit pair.");
				return;
			}
			result.push(digit1, digit2);
		}

		console.log("ITF Barcode: " + result.join(''));
		if (handler != null) {
			handler(result.join(''));
		}
	}

	function decodeITFDigit(pattern) {
		for (var key in itf) {
			if (JSON.stringify(itf[key]) === JSON.stringify(pattern)) {
				return key;
			}
		}
		return null;
	}

	function setHandler(h) {
		handler = h;
	}

	function normalize(input, total) {
		var sum = 0;
		var result = [];
		for (var i = 0, ii = input.length; i < ii; i++) {
			sum = sum + input[i];
		}
		for (var i = 0, ii = input.length; i < ii; i++) {
			result.push(input[i] / sum * total);
		}
		return result;
	}

	function isOdd(num) { 
		return num % 2;
	}

	function maxDistance(a, b) {
		var distance = 0;
		for (var i = 0, ii = a.length; i < ii; i++) {
			if (Math.abs(a[i] - b[i]) > distance) {
				distance = Math.abs(a[i] - b[i]);
			}
		}
		return distance;
	}

	function parity(digit) {
		return isOdd(Math.round(digit[1] + digit[3]));
	}
	
	function drawGraphics() {
		elements.ctxg.strokeStyle = config.strokeColor;
		elements.ctxg.lineWidth = 3;
		elements.ctxg.beginPath();
		elements.ctxg.moveTo(dimensions.start, dimensions.height * 0.5);
		elements.ctxg.lineTo(dimensions.end, dimensions.height * 0.5);
		elements.ctxg.stroke();
	}

	return {
		init: init,
		setHandler: setHandler,
		config: config
	};

	// debugging utilities

	function drawBars(binary) {
		for (var i = 0, ii = binary.length; i < ii; i++) {
			if (binary[i] == 1) {
				elements.ctxg.strokeStyle = '#fff';
			} else {
				elements.ctxg.strokeStyle = '#000';
			}
			elements.ctxg.lineWidth = 3;
			elements.ctxg.beginPath();
			elements.ctxg.moveTo(start + i, height * 0.5);
			elements.ctxg.lineTo(start + i + 1, height * 0.5);
			elements.ctxg.stroke();
		}
	}

}();
