(function () {
    const uploadContainer = document.getElementById('uploadContainer');
    const fileInput = document.getElementById('fileInput');
    const progressBar = document.getElementById('progressBar');
    const fileInfoBox = document.getElementById('fileInfoBox');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const deleteBtn = document.getElementById('deleteBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const maxSizeOption = document.getElementById('maxSizeOption');
    const qualityOption = document.getElementById('qualityOption');
    const inputBox = document.getElementById('inputBox');
    const rangeBox = document.getElementById('rangeBox');
    const maxSizeInput = document.getElementById('maxSizeInput');
    const qualityRange = document.getElementById('qualityRange');
    const rangeValue = document.getElementById('rangeValue');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const originalSize = document.getElementById('originalSize');
    const currentSize = document.getElementById('currentSize');
    const resizeBtn = document.getElementById('resizeBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    let uploadedImage = null;

    // Event Listeners
    uploadContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadContainer.classList.add('dragover');
    });

    uploadContainer.addEventListener('dragleave', () => {
        uploadContainer.classList.remove('dragover');
    });

    uploadContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadContainer.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            uploadImage(file);
        }
    });

    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            uploadImage(file);
        }
    });

    deleteBtn.addEventListener('click', () => {
        resetUI();
    });

    maxSizeOption.addEventListener('change', () => toggleInputVisibility());
    qualityOption.addEventListener('change', () => toggleInputVisibility());

    qualityRange.addEventListener('input', () => {
        rangeValue.textContent = `Quality: ${qualityRange.value}%`;
    });

    resizeBtn.addEventListener('click', async () => {
        if (!uploadedImage) return;

        let result;

        const qualityValue = qualityRange.value / 100;
        const maxSizeKB = maxSizeInput.value ? parseInt(maxSizeInput.value, 10) : null;

        if (maxSizeOption.checked && maxSizeKB) {
            result = await resizeAndCompressImage(uploadedImage, { maxSizeKB, quality: 1 });
        } else if (qualityOption.checked) {
            result = await resizeAndCompressImage(uploadedImage, { maxSizeKB: null, quality: qualityValue });
        } else {
            alert('Please select an option to resize/compress the image.');
            return;
        }

        displayResult(result);
    });

    function uploadImage(file) {
        fileInfoBox.style.display = 'block';
        fileName.textContent = file.name;
        fileSize.textContent = `Size: ${formatFileSize(file.size)}`;

        let progress = 0;
        const interval = setInterval(() => {
            if (progress >= 100) {
                clearInterval(interval);
                deleteBtn.style.display = 'block';
                previewImage(file);
            } else {
                progress += 10;
                progressBar.style.width = `${progress}%`;
            }
        }, 200);
    }

    function previewImage(file) {
        uploadedImage = file;
        originalSize.textContent = formatFileSize(file.size);
        currentSize.textContent = formatFileSize(file.size);

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreviewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    function formatFileSize(size) {
        return size >= 1048576 ? `${(size / 1048576).toFixed(2)} MB` : `${(size / 1024).toFixed(2)} KB`;
    }

    function resetUI() {
        fileInfoBox.style.display = 'none';
        progressBar.style.width = '0';
        fileName.textContent = '';
        fileSize.textContent = '';
        fileInput.value = '';

        uploadedImage = null;
        originalSize.textContent = '';
        currentSize.textContent = '';

        imagePreview.src = '';
        imagePreviewContainer.style.display = 'none';
        downloadBtn.style.display = 'none';

        inputBox.style.display = 'block';
        rangeBox.style.display = 'none';
        qualityRange.value = 40;
        rangeValue.textContent = 'Quality: 40%';
        maxSizeInput.value = '';
    }

    function toggleInputVisibility() {
        if (maxSizeOption.checked) {
            inputBox.style.display = 'block';
            rangeBox.style.display = 'none';
        } else if (qualityOption.checked) {
            inputBox.style.display = 'none';
            rangeBox.style.display = 'block';
        }
    }

    function displayResult(result) {
        imagePreview.src = URL.createObjectURL(result);
        currentSize.textContent = formatFileSize(result.size);

        downloadBtn.style.display = 'flex';
        downloadBtn.href = URL.createObjectURL(result);
        downloadBtn.download = 'resized-image.jpg';
    }

    async function resizeAndCompressImage(file, options) {
        const { maxSizeKB, quality = 1 } = options;

        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.src = e.target.result;
            };

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                let currentQuality = quality;
                let width = img.width;
                let height = img.height;

                const compressImage = () => {
                    canvas.width = width;
                    canvas.height = height;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, width, height);

                    return new Promise((resolve) => {
                        canvas.toBlob(
                            (blob) => resolve(blob),
                            'image/jpeg',
                            currentQuality
                        );
                    });
                };

                const adjustImage = async () => {
                    let blob = await compressImage();

                    if (maxSizeKB) {
                        while (blob.size > maxSizeKB * 1024) {
                            if (currentQuality > 0.1) {
                                currentQuality -= 0.1;
                            } else if (width > 200 && height > 200) {
                                width = Math.floor(width * 0.9);
                                height = Math.floor(height * 0.9);
                            } else {
                                alert('Unable to resize image further. Minimum size reached.');
                                return resolve(blob);
                            }

                            blob = await compressImage();
                        }
                    }

                    resolve(blob);
                };

                adjustImage();
            };

            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    }
})();
