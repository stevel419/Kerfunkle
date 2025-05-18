// Carousel Functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const navigationButtons = document.querySelectorAll('.carousel-nav-btn');
const slideContents = document.querySelectorAll('.carousel-slide-content');
const totalSlides = slides.length;

function updateCarousel() {
    // Update the active slide
    const slideWidth = slides[0].offsetWidth;
    document.querySelector('.carousel-slides').style.transform = `translateX(-${currentSlide * slideWidth}px)`;
    // Update navigation buttons
    navigationButtons.forEach((button, index) => {
    button.classList.toggle('active', index === currentSlide);
    });
    // Update slide content visibility
    slideContents.forEach((content, index) => {
    content.classList.toggle('active', index === currentSlide);
    });
}
// Add event listener to navigation buttons
navigationButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
    currentSlide = index;
    updateCarousel();
    });
});
// Auto-slide functionality
setInterval(() => {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
}, 5000);

updateCarousel();