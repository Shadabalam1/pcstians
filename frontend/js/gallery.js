const galleryGrid = document.getElementById('galleryGrid');
const searchInput = document.getElementById('searchInput');
const yearFilter = document.getElementById('yearFilter');
const searchBtn = document.getElementById('searchBtn');
const noResults = document.getElementById('noResults');

const isAdmin = !!localStorage.getItem('adminToken');

async function loadMemories() {
    const search = searchInput.value;
    const year = yearFilter.value;

    let queryString = '?';
    if (search) queryString += `search=${encodeURIComponent(search)}&`;
    if (year !== 'all') queryString += `year=${year}`;

    try {
        const response = await fetch(`http://localhost:5000/api/memories${queryString}`);
        const data = await response.json();

        galleryGrid.innerHTML = ''; 

        if (data.success && data.count > 0) {
            noResults.style.display = 'none';
            data.data.forEach(memory => {
                const card = document.createElement('div');
                card.className = 'memory-card';
                
                const hashtagsHtml = memory.hashtags.map(tag => `<span class="hashtag">${tag}</span>`).join('');

                let deleteBtnHtml = '';
                if (isAdmin) {
                    deleteBtnHtml = `<button class="delete-btn" data-id="${memory._id}">🗑️ Delete</button>`;
                }

                // ✅ Image ya Video ke liye alag content
                let mediaContent = '';
                
                if (memory.type === 'video') {
                    // Video Card
                    mediaContent = `
                        <div class="video-thumbnail" onclick="window.open('https://www.youtube.com/watch?v=${memory.videoId}', '_blank')">
                            <img src="${memory.thumbnailUrl}" alt="${memory.caption}" loading="lazy">
                            <div class="play-button">▶️</div>
                            <div class="video-badge">🎥 Video</div>
                        </div>
                    `;
                } else {
                    // Image Card
                    mediaContent = `<img src="${memory.imageUrl}" alt="${memory.caption}" loading="lazy">`;
                }

                card.innerHTML = `
                    ${mediaContent}
                    <div class="card-content">
                        <p class="caption">${memory.caption}</p>
                        <div class="hashtags">${hashtagsHtml}</div>
                        <p class="year-badge">${memory.year}</p>
                        ${deleteBtnHtml}
                    </div>
                `;
                galleryGrid.appendChild(card);
            });
        } else {
            noResults.style.display = 'block';
        }
    } catch (error) {
        console.error('Error fetching memories:', error);
        galleryGrid.innerHTML = '<p style="text-align:center; color:red; grid-column: 1/-1;">Failed to load memories. Is backend running?</p>';
    }
}

// Delete Button Logic
galleryGrid.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const memoryId = e.target.getAttribute('data-id');
        const token = localStorage.getItem('adminToken');

        const isConfirmed = confirm('Kya aap sach mein is memory ko delete karna chahte hain?');
        
        if (isConfirmed) {
            try {
                const response = await fetch(`http://localhost:5000/api/memories/${memoryId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (data.success) {
                    e.target.closest('.memory-card').remove();
                    alert('Memory deleted successfully!');
                } else {
                    alert(data.message || 'Failed to delete');
                }
            } catch (error) {
                console.error(error);
                alert('Server error while deleting.');
            }
        }
    }
});

// Event Listeners
searchBtn.addEventListener('click', loadMemories);
yearFilter.addEventListener('change', loadMemories);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loadMemories();
});

window.addEventListener('DOMContentLoaded', loadMemories);