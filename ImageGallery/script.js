// Unsplash API integration for AI-powered search
const UNSPLASH_ACCESS_KEY = 'PBwzlXyw8BPtbACENG6whAxQWipvdws1W8q78v0NivI'; // <-- User's real key
const UNSPLASH_URL = 'https://api.unsplash.com/search/photos';

// Sample image data using Unsplash URLs for instant preview (for fallback/local)
const images = [
  { src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', category: 'nature', caption: 'Beautiful Lake' },
  { src: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80', category: 'nature', caption: 'Mountain View' },
  { src: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=600&q=80', category: 'animals', caption: 'Cute Puppy' },
  { src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80', category: 'animals', caption: 'Wild Fox' },
  { src: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=600&q=80', category: 'architecture', caption: 'Modern Building' },
  { src: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=600&q=80', category: 'architecture', caption: 'Classic Bridge' },
  // Additional images
  // { src: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80', category: 'nature', caption: 'Forest Path' },
  // { src: 'https://images.unsplash.com/photo-1465378550170-3edc8cfc0f0c?auto=format&fit=crop&w=600&q=80', category: 'nature', caption: 'Sunset Over Hills' },
  { src: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80', category: 'animals', caption: 'Majestic Lion' },
  { src: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80', category: 'animals', caption: 'Colorful Parrot' },
  { src: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?auto=format&fit=crop&w=600&q=80', category: 'architecture', caption: 'City Skyline' },
  { src: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80', category: 'architecture', caption: 'Historic Castle' },
  { src: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80', category: 'nature', caption: 'Misty Forest' },
  { src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', category: 'nature', caption: 'River in the Woods' },
  { src: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=600&q=80', category: 'animals', caption: 'Playful Kitten' },
  { src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80', category: 'animals', caption: 'Grazing Deer' },
  { src: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=600&q=80', category: 'architecture', caption: 'Modern Skyscraper' },
  { src: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=600&q=80', category: 'architecture', caption: 'Old Town Street' }
];

let currentIndex = 0;
let currentFilter = 'all';
let searchQuery = '';
let unsplashResults = [];
let currentPage = 1;
const imagesPerPage = 12;

const gallery = document.querySelector('.gallery');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.querySelector('.lightbox-content');
const lightboxCaption = document.querySelector('.caption');
const lightboxClose = document.querySelector('.close');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');
const filterBtns = document.querySelectorAll('.filters button');
const searchInput = document.getElementById('searchInput');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');

// Sidebar toggle functionality
const sidebarToggle = document.getElementById('sidebarToggle');
const body = document.body;
if (sidebarToggle) {
  sidebarToggle.addEventListener('click', () => {
    body.classList.toggle('sidebar-hidden');
  });
}

// Dark/Light mode toggle
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('i');
    if (document.body.classList.contains('dark-mode')) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }
  });
}

function getFilteredImages() {
  let filteredImages = [];
  if (searchQuery.trim() !== '' && unsplashResults.length > 0) {
    filteredImages = unsplashResults;
  } else {
    filteredImages = images.filter(img => currentFilter === 'all' || img.category === currentFilter);
    if (searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      filteredImages = filteredImages.filter(img =>
        img.caption.toLowerCase().includes(q) ||
        img.category.toLowerCase().includes(q)
      );
    }
  }
  return filteredImages;
}

function renderGallery() {
  gallery.innerHTML = '';
  const filteredImages = getFilteredImages();
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  const startIdx = (currentPage - 1) * imagesPerPage;
  const endIdx = startIdx + imagesPerPage;
  const imagesToShow = filteredImages.slice(startIdx, endIdx);

  imagesToShow.forEach((img, idx) => {
    const imageElem = document.createElement('img');
    imageElem.src = img.src;
    imageElem.alt = img.caption || img.alt_description || '';
    imageElem.dataset.index = startIdx + idx;
    imageElem.classList.add('gallery-img');
    imageElem.addEventListener('click', () => openLightbox(startIdx + idx, filteredImages));
    gallery.appendChild(imageElem);
  });

  // Update button states
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

async function fetchUnsplashImages(query) {
  if (!query.trim()) {
    unsplashResults = [];
    currentPage = 1;
    renderGallery();
    return;
  }
  try {
    const url = `${UNSPLASH_URL}?query=${encodeURIComponent(query)}&per_page=30&client_id=${UNSPLASH_ACCESS_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    unsplashResults = (data.results || []).map(img => ({
      src: img.urls.regular,
      caption: img.alt_description || img.description || 'Unsplash Image',
      category: 'unsplash',
    }));
    currentPage = 1;
    renderGallery();
  } catch (err) {
    unsplashResults = [];
    currentPage = 1;
    renderGallery();
  }
}

function openLightbox(idx, filteredImages) {
  lightbox.classList.add('active');
  updateLightbox(idx, filteredImages);
}

function updateLightbox(idx, filteredImages) {
  const img = filteredImages[idx];
  lightboxImg.src = img.src;
  lightboxCaption.textContent = img.caption || img.alt_description || '';
  currentIndex = idx;
  // Store filteredImages for navigation
  lightbox.dataset.filtered = JSON.stringify(filteredImages.map(i => (i.src)));
}

function closeLightbox() {
  lightbox.classList.remove('active');
}

function navigateLightbox(direction) {
  const filteredImages = getFilteredImages();
  let idx = currentIndex;
  if (direction === 'next') {
    idx = (idx + 1) % filteredImages.length;
  } else {
    idx = (idx - 1 + filteredImages.length) % filteredImages.length;
  }
  openLightbox(idx, filteredImages);
}

prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderGallery();
  }
});
nextBtn.addEventListener('click', () => {
  const filteredImages = getFilteredImages();
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage) || 1;
  if (currentPage < totalPages) {
    currentPage++;
    renderGallery();
  }
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => navigateLightbox('prev'));
lightboxNext.addEventListener('click', () => navigateLightbox('next'));
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'ArrowLeft') navigateLightbox('prev');
  if (e.key === 'ArrowRight') navigateLightbox('next');
  if (e.key === 'Escape') closeLightbox();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    unsplashResults = [];
    currentPage = 1;
    renderGallery();
  });
});

// Sidebar category clicks
const sidebarCategories = document.querySelectorAll('.sidebar-categories a');
sidebarCategories.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const filter = link.dataset.filter;
    
    // Update main filter buttons
    filterBtns.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.filter === filter) {
        btn.classList.add('active');
      }
    });
    
    // Update sidebar active state
    sidebarCategories.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    currentFilter = filter;
    unsplashResults = [];
    currentPage = 1;
    renderGallery();
  });
});

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  currentPage = 1;
  if (searchQuery.trim() !== '') {
    fetchUnsplashImages(searchQuery);
  } else {
    unsplashResults = [];
    renderGallery();
  }
});

// File upload functionality
uploadBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  if (files.length > 0) {
    handleFileUpload(files);
  }
});

function handleFileUpload(files) {
  const uploadedImages = [];
  
  files.forEach((file, index) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const imageData = {
          src: e.target.result,
          caption: file.name || `Uploaded Image ${index + 1}`,
          category: 'uploaded',
          isLocal: true
        };
        uploadedImages.push(imageData);
        
        // If this is the last file, add to images array and render
        if (uploadedImages.length === files.length) {
          // Add uploaded images to the beginning of the images array
          images.unshift(...uploadedImages);
          currentPage = 1;
          renderGallery();
          
          // Show success message
          showNotification(`Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}!`);
        }
      };
      reader.readAsDataURL(file);
    }
  });
}

function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: linear-gradient(135deg, #00c3ff 0%, #43e97b 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    font-weight: 500;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

document.addEventListener('DOMContentLoaded', renderGallery); 