// API key for NASA
const API_KEY = 'KfjzN89t0eEy6p9qHduyZYvgccgiZjkLD8BhWa44';

// NASA API endpoint
const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';
const NASA_API_KEY = API_KEY;

// Store video dates for the current month
let videoDatesCache = new Set();

// Random space facts array
const spaceFacts = [
    "A day on Venus is longer than its year! ⭐",
    "Saturn would float if you had a bathtub big enough! 🛁",
    "Jupiter is so massive that all other planets could fit inside it! 🪐",
    "A neutron star is so dense that a teaspoon would weigh 6 billion tons! ⚡",
    "The Milky Way galaxy contains over 100 billion stars! ✨",
    "Light from the Sun takes 8 minutes to reach Earth! ☀️",
    "One day on Mercury equals 59 Earth days! ⏰",
    "The footprints on the Moon will last for millions of years! 👣",
    "Mars has the largest volcano in the solar system - Olympus Mons! 🌋",
    "Space is completely silent because there's no air to carry sound! 🔇"
];

// Find our HTML elements on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.querySelector('button');
const gallery = document.getElementById('gallery');

// Find modal elements for displaying larger images
const modal = document.getElementById('imageModal');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalImageContainer = document.getElementById('modalImageContainer');
const modalExplanation = document.getElementById('modalExplanation');
const modalClose = document.querySelector('.modal-close');

// Function to fetch video dates for a given month
async function fetchVideoDatesForMonth(year, month) {
    // Get first and last day of the month
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    // Format dates for API (YYYY-MM-DD)
    const startDate = firstDay.toISOString().split('T')[0];
    const endDate = lastDay.toISOString().split('T')[0];
    
    try {
        // Fetch APOD data for the entire month
        const response = await fetch(
            `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch NASA data');
        }
        
        const data = await response.json();
        
        // Find dates with videos and store them
        data.forEach(item => {
            if (item.media_type === 'video') {
                videoDatesCache.add(item.date);
            }
        });
        
        console.log(`Found ${videoDatesCache.size} video dates in ${year}-${month.toString().padStart(2, '0')}`);
        
    } catch (error) {
        console.error('Error fetching video dates:', error);
    }
}

// Function to fetch video dates for a specific date range
async function fetchVideoDatesForRange(startDate, endDate) {
    try {
        // Fetch APOD data for the date range
        const response = await fetch(
            `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch NASA data');
        }
        
        const data = await response.json();
        
        // Clear and populate video dates for this range
        videoDatesCache.clear();
        data.forEach(item => {
            if (item.media_type === 'video') {
                videoDatesCache.add(item.date);
            }
        });
        
        console.log(`Found ${videoDatesCache.size} video dates in selected range`);
        
    } catch (error) {
        console.error('Error fetching video dates for range:', error);
    }
}

// Function to show video indicator
function showVideoIndicator(startDate, endDate) {
    const videoInfo = document.getElementById('video-dates-info');
    const videoCount = document.getElementById('video-count');
    const videoList = document.getElementById('video-dates-list');
    
    if (!videoInfo || !videoCount || !videoList) return;
    
    const videoCount_num = videoDatesCache.size;
    videoCount.textContent = videoCount_num;
    
    if (videoCount_num > 0) {
        // Show specific video dates
        const videoDatesList = Array.from(videoDatesCache).sort();
        videoList.innerHTML = videoDatesList.map(date => 
            `<span class="video-date-star">⭐</span>${formatDateForDisplay(date)}`
        ).join(', ');
        
        videoInfo.classList.add('show');
    } else {
        videoList.innerHTML = 'No video content in this date range';
        videoInfo.classList.add('show');
    }
}

// Function to hide video indicator
function hideVideoIndicator() {
    const videoInfo = document.getElementById('video-dates-info');
    if (videoInfo) {
        videoInfo.classList.remove('show');
    }
}

// Helper function to format date for display
function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    });
}

// Function to setup date input event listeners for video indicators
function setupVideoIndicators() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    // Function to update video indicators for the selected date range
    async function updateVideoIndicators() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        if (!startDate || !endDate) {
            hideVideoIndicator();
            return;
        }
        
        // Fetch video dates for the selected range
        await fetchVideoDatesForRange(startDate, endDate);
        
        // Show video indicator with results
        showVideoIndicator(startDate, endDate);
    }
    
    // Function to handle date input changes
    async function handleDateChange(event) {
        // Update indicators for current date range
        await updateVideoIndicators();
    }
    
    // Add event listeners
    if (startDateInput) {
        startDateInput.addEventListener('change', handleDateChange);
    }
    
    if (endDateInput) {
        endDateInput.addEventListener('change', handleDateChange);
    }
}

// Function to check if a date has a video
function hasVideo(dateString) {
    return videoDatesCache.has(dateString);
}

// Function to connect to NASA API and fetch space images
async function fetchNASAImages(startDate, endDate) {
  try {
    // Show loading message while fetching data
    gallery.innerHTML = '<div class="loading">🚀 Loading space images...</div>';
    
    // Build the API URL with our parameters
    const apiUrl = `${NASA_API_URL}?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`;
    
    // Make the API request to NASA
    const response = await fetch(apiUrl);
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`NASA API Error: ${response.status}`);
    }
    
    // Convert the response to JSON format
    const spaceImages = await response.json();
    
    // Display the images in our gallery
    displayImages(spaceImages);
    
  } catch (error) {
    // If something goes wrong, show an error message
    console.error('Error fetching NASA images:', error);
    gallery.innerHTML = `
      <div class="error">
        <div class="error-icon">⚠️</div>
        <p>Oops! Couldn't load space images. Please try again.</p>
        <p class="error-details">${error.message}</p>
      </div>
    `;
  }
}

// Function to open the modal with image details
function openModal(image) {
  // Set the modal content with the selected image data
  modalTitle.textContent = image.title;
  modalDate.textContent = image.date;
  modalExplanation.textContent = image.explanation;
  
  // Clear previous image content
  modalImageContainer.innerHTML = '';
  
  // Add the image or video to the modal
  if (image.media_type === 'image') {
    const img = document.createElement('img');
    img.src = image.url;
    img.alt = image.title;
    modalImageContainer.appendChild(img);
  } else {
    // For videos, show enhanced video display with embedding capability
    const videoPlaceholder = document.createElement('div');
    videoPlaceholder.className = 'video-placeholder';
    
    // Check if it's a YouTube video for embedding
    const isYouTube = image.url.includes('youtube.com') || image.url.includes('youtu.be');
    
    if (isYouTube) {
      // For YouTube videos, automatically embed the video
      const videoId = extractYouTubeId(image.url);
      if (videoId) {
        videoPlaceholder.innerHTML = `
          <div class="video-content">
            <div class="embedded-video">
              <iframe 
                width="100%" 
                height="400" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
              </iframe>
            </div>
            <div class="video-actions">
              <a href="${image.url}" target="_blank" class="video-link-btn">🔗 Watch on YouTube</a>
            </div>
          </div>
        `;
      } else {
        // Fallback if video ID extraction fails
        videoPlaceholder.innerHTML = `
          <div class="video-content">
            <div class="video-icon-large">🎬</div>
            <h3>YouTube Video</h3>
            <div class="video-actions">
              <a href="${image.url}" target="_blank" class="video-link-btn">🔗 Watch on YouTube</a>
            </div>
          </div>
        `;
      }
    } else if (image.url.includes('vimeo.com')) {
      // Handle Vimeo videos
      const vimeoId = extractVimeoId(image.url);
      if (vimeoId) {
        videoPlaceholder.innerHTML = `
          <div class="video-content">
            <div class="embedded-video">
              <iframe 
                width="100%" 
                height="400" 
                src="https://player.vimeo.com/video/${vimeoId}" 
                frameborder="0" 
                allow="autoplay; fullscreen; picture-in-picture" 
                allowfullscreen>
              </iframe>
            </div>
            <div class="video-actions">
              <a href="${image.url}" target="_blank" class="video-link-btn">� Watch on Vimeo</a>
            </div>
          </div>
        `;
      }
    } else {
      // For other video types, try to embed directly or show link
      const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
      const hasVideoExtension = videoExtensions.some(ext => image.url.toLowerCase().includes(ext));
      
      if (hasVideoExtension) {
        // Try to embed HTML5 video
        videoPlaceholder.innerHTML = `
          <div class="video-content">
            <div class="embedded-video">
              <video width="100%" height="400" controls>
                <source src="${image.url}" type="video/mp4">
                <p>Your browser doesn't support HTML5 video. <a href="${image.url}" target="_blank">Download the video</a></p>
              </video>
            </div>
            <div class="video-actions">
              <a href="${image.url}" target="_blank" class="video-link-btn">🔗 Open Video Directly</a>
            </div>
          </div>
        `;
      } else {
        // Generic video link
        videoPlaceholder.innerHTML = `
          <div class="video-content">
            <div class="video-icon-large">🎬</div>
            <h3>Video Content</h3>
            <p>This APOD entry contains video content</p>
            <div class="video-actions">
              <a href="${image.url}" target="_blank" class="video-link-btn">🔗 View Video</a>
            </div>
          </div>
        `;
      }
    }
    modalImageContainer.appendChild(videoPlaceholder);
  }
  
  // Show the modal
  modal.style.display = 'block';
  
  // Prevent page scrolling when modal is open
  document.body.style.overflow = 'hidden';
}

// Function to close the modal
function closeModal() {
  modal.style.display = 'none';
  
  // Restore page scrolling
  document.body.style.overflow = 'auto';
}

// Helper function to extract YouTube video ID from URL
function extractYouTubeId(url) {
  // Handle various YouTube URL formats
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[7] && match[7].length === 11) {
    return match[7];
  }
  
  // Alternative regex for short URLs
  const shortRegExp = /youtu\.be\/([a-zA-Z0-9_-]{11})/;
  const shortMatch = url.match(shortRegExp);
  if (shortMatch && shortMatch[1]) {
    return shortMatch[1];
  }
  
  return null;
}

// Helper function to extract Vimeo video ID from URL
function extractVimeoId(url) {
  const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
  const match = url.match(regExp);
  return match ? match[3] : null;
}

// Function to display the NASA images in our gallery
function displayImages(images) {
  // Clear the gallery first
  gallery.innerHTML = '';
  
  // If no images were returned, show a message
  if (!images || images.length === 0) {
    gallery.innerHTML = `
      <div class="no-images">
        <div class="no-images-icon">🔍</div>
        <p>No space images found for this date range.</p>
      </div>
    `;
    return;
  }
  
  // Create HTML for each space image
  images.forEach(image => {
    // Create a container for each image
    const imageCard = document.createElement('div');
    imageCard.className = 'image-card';
    
    // For gallery, show either image or enhanced video placeholder
    if (image.media_type === 'image') {
      imageCard.innerHTML = `<img src="${image.url}" alt="${image.title}" loading="lazy" />`;
    } else {
      // For videos, show an enhanced video placeholder with thumbnail if possible
      const isYouTube = image.url.includes('youtube.com') || image.url.includes('youtu.be');
      
      if (isYouTube) {
        const videoId = extractYouTubeId(image.url);
        if (videoId) {
          // Use YouTube thumbnail as preview
          imageCard.innerHTML = `
            <div class="video-placeholder-simple youtube-preview">
              <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" alt="${image.title}" loading="lazy" />
              <div class="video-play-overlay">
                <div class="play-button">▶️</div>
              </div>
              <div class="video-label">YouTube Video</div>
            </div>
          `;
        } else {
          // Fallback for YouTube without ID
          imageCard.innerHTML = `
            <div class="video-placeholder-simple">
              <div class="video-icon">🎬</div>
              <div class="video-label">YouTube Video</div>
              <div class="video-hint">Click to watch</div>
            </div>
          `;
        }
      } else {
        // For other video types, show generic video placeholder
        imageCard.innerHTML = `
          <div class="video-placeholder-simple">
            <div class="video-icon">🎬</div>
            <div class="video-label">Video</div>
            <div class="video-hint">Click to view</div>
          </div>
        `;
      }
    }
    
    // Make the image card clickable to open modal
    imageCard.style.cursor = 'pointer';
    imageCard.addEventListener('click', () => {
      openModal(image);
    });
    
    // Add this image card to our gallery
    gallery.appendChild(imageCard);
  });
}

// Function to display random space fact
function displayRandomSpaceFact() {
    const factElement = document.getElementById('space-fact');
    if (factElement && spaceFacts.length > 0) {
        // Get a random fact from the array
        const randomIndex = Math.floor(Math.random() * spaceFacts.length);
        const randomFact = spaceFacts[randomIndex];
        
        // Display the fact
        factElement.textContent = randomFact;
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Setup the date inputs with restrictions and defaults
    setupDateInputs(startInput, endInput);
    
    // Display a random space fact when the page loads
    displayRandomSpaceFact();
    
    // Setup video indicators for calendar
    setupVideoIndicators();
    
    // Setup the Get Space Images button
    const getImagesButton = document.getElementById('get-images');
    if (getImagesButton) {
        getImagesButton.addEventListener('click', () => {
            // Get the selected dates from our inputs
            const startDate = startInput.value;
            const endDate = endInput.value;
            
            // Make sure both dates are selected
            if (!startDate || !endDate) {
                alert('Please select both start and end dates!');
                return;
            }
            
            // Make sure start date is not after end date
            if (new Date(startDate) > new Date(endDate)) {
                alert('Start date must be before or equal to end date!');
                return;
            }
            
            // Fetch and display the NASA images
            fetchNASAImages(startDate, endDate);
        });
    }
    
    // Setup the Random Fact button
    const randomFactButton = document.getElementById('random-fact');
    if (randomFactButton) {
        randomFactButton.addEventListener('click', displayRandomSpaceFact);
    }

    // Modal event listeners

    // Close modal when clicking the X button
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside the modal content
    if (modal) {
        modal.addEventListener('click', (event) => {
            // Only close if clicking the modal background, not the content
            if (event.target === modal) {
                closeModal();
            }
        });
    }

    // Close modal when pressing the Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal && modal.style.display === 'block') {
            closeModal();
        }
    });
});
