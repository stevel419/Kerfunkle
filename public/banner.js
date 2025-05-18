window.addEventListener('resize', adjustBanner); // Run on window resize
document.addEventListener('DOMContentLoaded', adjustBanner); // Run when page loads
function adjustBanner() {
    const bannerContainer = document.querySelector('.banner-container');
    const bannerContent = document.querySelector('.banner-content');
    const phrase = 'KERFUNKLE - WHERE THE FUN BEGINS!';
    const containerWidth = bannerContainer.offsetWidth; // Get the width of the container
    // Clear the current content in the banner
    bannerContent.innerHTML = '';
    // Calculate how many times the phrase can fit within the container width
    const numberOfPhrases = Math.ceil(containerWidth / 250) * 3;
    // Add the phrases dynamically
    for (let i = 0; i < numberOfPhrases; i++) {
        const phraseDiv = document.createElement('div');
        phraseDiv.textContent = phrase;
        bannerContent.appendChild(phraseDiv);
    }
}