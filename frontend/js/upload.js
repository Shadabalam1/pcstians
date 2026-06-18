const token = localStorage.getItem('adminToken');
if (!token) {
    window.location.href = 'login.html';
}

// DOM Elements
const uploadForm = document.getElementById('uploadForm');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('imagePreview');
const statusMsg = document.getElementById('statusMsg');
const logoutBtn = document.getElementById('logoutBtn');
const uploadBtn = document.getElementById('uploadBtn');

// Video Form Elements
const videoForm = document.getElementById('videoForm');
const videoStatusMsg = document.getElementById('videoStatusMsg');
const videoUploadBtn = document.getElementById('videoUploadBtn');

// Tab Switching
const tabBtns = document.querySelectorAll('.tab-btn');
const imageUploadSection = document.getElementById('imageUploadSection');
const videoUploadSection = document.getElementById('videoUploadSection');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all tabs
        tabBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked tab
        btn.classList.add('active');
        
        // Show/hide sections
        const tab = btn.getAttribute('data-tab');
        if (tab === 'image') {
            imageUploadSection.style.display = 'block';
            videoUploadSection.style.display = 'none';
        } else {
            imageUploadSection.style.display = 'none';
            videoUploadSection.style.display = 'block';
        }
    });
});

// Image Preview Logic
imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Image Upload Logic
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    uploadBtn.innerText = 'Uploading...';
    uploadBtn.disabled = true;
    statusMsg.innerText = '';
    statusMsg.className = 'status-msg'; 

    const formData = new FormData();
    formData.append('image', imageInput.files[0]);
    formData.append('caption', document.getElementById('caption').value);
    formData.append('hashtags', document.getElementById('hashtags').value);
    formData.append('year', document.getElementById('year').value);

    try {
        const response = await fetch('https://pcstians.onrender.com/api/memories/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            statusMsg.innerText = 'Memory uploaded successfully! 🎉';
            statusMsg.classList.add('success');
            uploadForm.reset();
            imagePreview.style.display = 'none';
        } else {
            statusMsg.innerText = data.message || 'Upload failed.';
            statusMsg.classList.add('error');
        }
    } catch (error) {
        console.error(error);
        statusMsg.innerText = 'Server error. Please make sure backend is running.';
        statusMsg.classList.add('error');
    } finally {
        uploadBtn.innerText = 'Upload Photo';
        uploadBtn.disabled = false;
    }
});

// Video Upload Logic
videoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    videoUploadBtn.innerText = 'Adding Video...';
    videoUploadBtn.disabled = true;
    videoStatusMsg.innerText = '';
    videoStatusMsg.className = 'status-msg'; 

    const videoData = {
        videoUrl: document.getElementById('videoUrl').value,
        caption: document.getElementById('videoCaption').value,
        hashtags: document.getElementById('videoHashtags').value,
        year: document.getElementById('videoYear').value
    };

    try {
        const response = await fetch('https://pcstians.onrender.com/api/memories/add-video', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(videoData)
        });

        const data = await response.json();

        if (data.success) {
            videoStatusMsg.innerText = 'Video memory added successfully! 🎥';
            videoStatusMsg.classList.add('success');
            videoForm.reset();
        } else {
            videoStatusMsg.innerText = data.message || 'Failed to add video.';
            videoStatusMsg.classList.add('error');
        }
    } catch (error) {
        console.error(error);
        videoStatusMsg.innerText = 'Server error. Please make sure backend is running.';
        videoStatusMsg.classList.add('error');
    } finally {
        videoUploadBtn.innerText = 'Add Video Memory';
        videoUploadBtn.disabled = false;
    }
});

// Logout Logic
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
});
