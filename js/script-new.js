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
    // For videos, show a placeholder with link
    const videoPlaceholder = document.createElement('div');
    videoPlaceholder.className = 'video-placeholder';
    videoPlaceholder.innerHTML = 'Video Content<br><a href="' + image.url + '" target="_blank">View Video on NASA Website</a>';
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
    
    // Build the HTML content for this image
    const imageContent = image.media_type === 'image' 
      ? `<img src="${image.url}" alt="${image.title}" loading="lazy" />`
      : '<div class="video-placeholder">📹 Video: <a href="' + image.url + '" target="_blank">View on NASA</a></div>';
    
    imageCard.innerHTML = `
      <div class="image-header">
        <h3>${image.title}</h3>
        <span class="date">${image.date}</span>
      </div>
      <div class="image-content">
        ${imageContent}
      </div>
      <div class="image-description">
        <p>${image.explanation}</p>
      </div>
    `;
    
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
