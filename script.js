const uploadSection = document.getElementById('uploadSection');
const resultSection = document.getElementById('resultSection');
const imageInput = document.getElementById('imageInput');
const transformOption = document.getElementById('transformOption');
const convertBtn = document.getElementById('convertBtn');
const goBackBtn = document.getElementById('goBack');
const originalCanvas = document.getElementById('originalCanvas');
const transformedCanvas = document.getElementById('transformedCanvas');

let currentImage = null;

function convertToGrayscale(imageData) {
    const pixels = imageData.data;
    
    for (let i = 0; i < pixels.length; i += 4) {
        const red = pixels[i];
        const green = pixels[i + 1];
        const blue = pixels[i + 2];
        
        // Calculate weighted grayscale value
        const gray = 0.3 * red + 0.59 * green + 0.11 * blue;
        
        // Set RGB channels to the same gray value
        pixels[i] = gray;     // Red
        pixels[i + 1] = gray; // Green
        pixels[i + 2] = gray; // Blue
        // pixels[i + 3] is Alpha (unchanged)
    }
    
    return imageData;
}

function applyBlur(imageData, width, height) {
    const pixels = imageData.data;
    const output = new Uint8ClampedArray(pixels);
    
    // Larger kernel size for stronger blur
    const kernelSize = 5;
    const offset = Math.floor(kernelSize / 2);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0;
            let count = 0;
            
            // Sample neighboring pixels
            for (let ky = -offset; ky <= offset; ky++) {
                for (let kx = -offset; kx <= offset; kx++) {
                    const ny = y + ky;
                    const nx = x + kx;
                    
                    // Check bounds
                    if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                        const i = (ny * width + nx) * 4;
                        r += pixels[i];
                        g += pixels[i + 1];
                        b += pixels[i + 2];
                        count++;
                    }
                }
            }
            
            // Calculate average color values
            const i = (y * width + x) * 4;
            output[i] = r / count;     // Red
            output[i + 1] = g / count; // Green
            output[i + 2] = b / count; // Blue
            output[i + 3] = pixels[i + 3]; // Keep original alpha
        }
    }
    
    imageData.data.set(output);
    return imageData;
}

function processImage(img) {
    originalCanvas.width = img.width;
    originalCanvas.height = img.height;
    transformedCanvas.width = img.width;
    transformedCanvas.height = img.height;
    
    originalCanvas.getContext('2d').drawImage(img, 0, 0);
    transformedCanvas.getContext('2d').drawImage(img, 0, 0);
    
    const ctx = transformedCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    
    if (transformOption.value === 'grayscale') {
        convertToGrayscale(imageData);
    } else {
        applyBlur(imageData, img.width, img.height);
    }
    
    ctx.putImageData(imageData, 0, 0);
}

function createImagePreview(file) {
    const preview = document.createElement('img');
    preview.style.maxWidth = '200px';
    preview.style.marginTop = '10px';
    
    const existingPreview = imageInput.parentElement.querySelector('img');
    if (existingPreview) {
        existingPreview.remove();
    }
    
    preview.src = URL.createObjectURL(file);
    imageInput.parentElement.appendChild(preview);
}

// Event Handlers
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        currentImage = file;
        createImagePreview(file);
        convertBtn.disabled = false;
    }
});

convertBtn.addEventListener('click', () => {
    if (currentImage) {
        const img = new Image();
        img.onload = () => {
            processImage(img);
            uploadSection.style.display = 'none';
            resultSection.style.display = 'block';
        };
        img.src = URL.createObjectURL(currentImage);
    }
});

goBackBtn.addEventListener('click', () => {
    uploadSection.style.display = 'flex';
    resultSection.style.display = 'none';

    if (currentImage) {
        createImagePreview(currentImage);
    }
});

convertBtn.disabled = true;