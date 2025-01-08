(function () {

    const uploadContainer = document.getElementById('uploadContainer');
    const fileInput = document.getElementById('fileInput');
    const progressBar = document.getElementById('progressBar');
    const fileInfoBox = document.getElementById('fileInfoBox');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const deleteBtn = document.getElementById('deleteBtn');
    const uploadBtn = document.getElementById('uploadBtn');

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
            } else {
                progress += 10;
                progressBar.style.width = `${progress}%`;
            }
        }, 200);
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
    });

    const maxSizeOption = document.getElementById('maxSizeOption');
    const qualityOption = document.getElementById('qualityOption');
    const inputBox = document.getElementById('inputBox');
    const rangeBox = document.getElementById('rangeBox');
    const qualityRange = document.getElementById('qualityRange');
    const rangeValue = document.getElementById('rangeValue');

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


})();
