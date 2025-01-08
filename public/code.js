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
    const qualityRange = document.getElementById('qualityRange');
    const rangeValue = document.getElementById('rangeValue');

    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const originalSize = document.getElementById('originalSize');
    const currentSize = document.getElementById('currentSize');
    const resizeBtn = document.getElementById('resizeBtn');

    let uploadedImage = null;

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
        if (size >= 1048576) {
            return `${(size / 1048576).toFixed(2)} MB`;
        } else {
            return `${(size / 1024).toFixed(2)} KB`;
        }
    }

    deleteBtn.addEventListener('click', () => {
        fileInfoBox.style.display = 'none';
        progressBar.style.width = '0';
        fileName.textContent = '';
        fileSize.textContent = '';
        fileInput.value = '';

        uploadedImage = '';
        originalSize.textContent = '';
        currentSize.textContent = '';
        imagePreview.src = '';
        imagePreviewContainer.style.display = 'none';
    });



    document.addEventListener('DOMContentLoaded', () => {
        inputBox.style.display = 'block';
        rangeBox.style.display = 'none';
    });

    maxSizeOption.addEventListener('change', () => {
        inputBox.style.display = 'block';
        rangeBox.style.display = 'none';
    });

    qualityOption.addEventListener('change', () => {
        rangeBox.style.display = 'block';
        inputBox.style.display = 'none';
    });

    qualityRange.addEventListener('input', () => {
        rangeValue.textContent = `Quality: ${qualityRange.value}%`;
    });

    function formatFileSize(size) {
        if (size >= 1048576) {
            return `${(size / 1048576).toFixed(2)} MB`;
        } else {
            return `${(size / 1024).toFixed(2)} KB`;
        }
    }

    resizeBtn.addEventListener('click', () => {
        const selectedOption = document.querySelector('input[name="resizeOption"]:checked').value;

        if (uploadedImage) {
            const canvas = document.createElement('canvas');
            const img = new Image();
            img.onload = () => {
                const ctx = canvas.getContext('2d');
                let width = img.width;
                let height = img.height;

                if (selectedOption === 'maxSize') {
                    const maxSizeKB = document.getElementById('maxSizeInput').value;
                    const targetSizeBytes = maxSizeKB * 1024;
                    const scale = Math.sqrt(targetSizeBytes / uploadedImage.size);
                    width *= scale;
                    height *= scale;
                } else if (selectedOption === 'quality') {
                    const quality = document.getElementById('qualityRange').value / 100;
                    width *= quality;
                    height *= quality;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    currentSize.textContent = formatFileSize(blob.size);
                    const resizedImageURL = URL.createObjectURL(blob);
                    imagePreview.src = resizedImageURL;
                }, 'image/jpeg');
            };

            img.src = URL.createObjectURL(uploadedImage);
        }
    });


})();
