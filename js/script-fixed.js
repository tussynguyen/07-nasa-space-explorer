// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Find the button and gallery elements
const getImagesButton = document.querySelector('button');
const gallery = document.getElementById('gallery');

// Find modal elements for displaying larger images
const modal = document.getElementById('imageModal');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalImageContainer = document.getElementById('modalImageContainer');
const modalExplanation = document.getElementById('modalExplanation');
const modalClose = document.querySelector('.modal-close');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// NASA API configuration
// Using your personal NASA API key for better rate limits and reliability
const NASA_API_KEY = 'KfjzN89t0eEy6p9qHduyZYvgccgiZjkLD8BhWa44';
const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';

// Array of fun space facts for "Did You Know?" section
const spaceFacts = [
  "A day on Venus is longer than its year! Venus takes 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun.",
  "Jupiter's Great Red Spot is a storm that has been raging for over 300 years and is larger than Earth!",
  "One teaspoon of neutron star material would weigh about 6 billion tons on Earth.",
  "There are more possible games of chess than there are atoms in the observable universe.",
  "The Sun converts 4 million tons of matter into energy every second through nuclear fusion.",
  "Saturn's moon Titan has lakes and rivers of liquid methane and ethane instead of water.",
  "The footprints left by astronauts on the Moon will remain there for millions of years due to the lack of atmosphere.",
  "A full NASA space suit costs about $12 million, with $70,000 of that just for the helmet!",
  "The International Space Station orbits Earth at approximately 17,500 mph (28,000 km/h).",
  "Mars has the largest volcano in the solar system - Olympus Mons is about 13.6 miles (22 km) high!",
  "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
  "There could be more than 40 billion Earth-like planets in the Milky Way galaxy alone.",
  "The coldest place in the universe that we know of is the Boomerang Nebula at -458°F (-272°C).",
  "Astronauts can grow up to 2 inches taller in space due to the lack of gravity compressing their spine.",
  "The largest known star, UY Scuti, is so big that if it replaced our Sun, its surface would extend beyond Jupiter's orbit!"
];

// Function to display a random space fact
function displayRandomSpaceFact() {
  // Get a random index from the space facts array
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  
  // Get the random fact
  const randomFact = spaceFacts[randomIndex];
  
  // Display the fact in the space fact element
  const spaceFactElement = document.getElementById('spaceFact');
  if (spaceFactElement) {
    spaceFactElement.textContent = randomFact;
  }
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
    // For videos, show a better placeholder with clear access options
    const videoPlaceholder = document.createElement('div');
    videoPlaceholder.className = 'video-placeholder';
    
    // Check if it's a YouTube video for potential embedding
    const isYouTube = image.url.includes('youtube.com') || image.url.includes('youtu.be');
    
    if (isYouTube) {
      // For YouTube videos, provide both embed and direct link options
      const videoId = extractYouTubeId(image.url);
      videoPlaceholder.innerHTML = `
        <div class="video-content">
          <div class="video-icon-large">🎬</div>
          <h3>Video Content</h3>
          <p>This APOD entry is a video from YouTube</p>
          <div class="video-actions">
            <a href="${image.url}" target="_blank" class="video-link-btn">🔗 Watch on YouTube</a>
            ${videoId ? `<button onclick="embedVideo('${videoId}')" class="embed-btn">📺 Embed Video</button>` : ''}
          </div>
          <div id="video-embed-${videoId}" class="video-embed-container" style="display: none;"></div>
        </div>
      `;
    } else {
      // For other video types, provide direct link
      videoPlaceholder.innerHTML = `
        <div class="video-content">
          <div class="video-icon-large">🎬</div>
          <h3>Video Content</h3>
          <p>This APOD entry is a video</p>
          <div class="video-actions">
            <a href="${image.url}" target="_blank" class="video-link-btn">🔗 View Video</a>
          </div>
        </div>
      `;
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
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Function to embed YouTube video in modal
function embedVideo(videoId) {
  const embedContainer = document.getElementById(`video-embed-${videoId}`);
  if (embedContainer) {
    embedContainer.style.display = 'block';
    embedContainer.innerHTML = `
      <iframe 
        width="100%" 
        height="400" 
        src="https://www.youtube.com/embed/${videoId}" 
        frameborder="0" 
        allowfullscreen>
      </iframe>
    `;
    
    // Hide the embed button after embedding
    const embedBtn = embedContainer.parentElement.querySelector('.embed-btn');
    if (embedBtn) {
      embedBtn.style.display = 'none';
    }
  }
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
    
    // For gallery, show only the image or video placeholder
    if (image.media_type === 'image') {
      imageCard.innerHTML = `<img src="${image.url}" alt="${image.title}" loading="lazy" />`;
    } else {
      // For videos, show a clear video placeholder with better styling
      imageCard.innerHTML = `
        <div class="video-placeholder-simple">
          <div class="video-icon">📺</div>
          <div class="video-label">Video</div>
          <div class="video-hint">Click to view</div>
        </div>
      `;
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

// Add event listener to the "Get Space Images" button
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

// Modal event listeners

// Close modal when clicking the X button
modalClose.addEventListener('click', closeModal);

// Close modal when clicking outside the modal content
modal.addEventListener('click', (event) => {
  // Only close if clicking the modal background, not the content
  if (event.target === modal) {
    closeModal();
  }
});

// Close modal when pressing the Escape key
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.style.display === 'block') {
    closeModal();
  }
});

// Initialize the app when the page loads
// Display a random space fact when the page loads
displayRandomSpaceFact();
