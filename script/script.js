document.addEventListener("DOMContentLoaded", function () {
  const carousel = document.querySelector('#cardsCarousel');
  const background = document.querySelector('#carouselBackground');

  function updateBackground() {
    const activeItem = carousel.querySelector('.carousel-item.active');
    const bgImage = activeItem.getAttribute('data-bg');
    background.style.backgroundImage = `url('${bgImage}')`;
  }

  // Atualiza o fundo ao iniciar
  updateBackground();

  // Escuta evento de mudança de slide do Bootstrap
  carousel.addEventListener('slid.bs.carousel', updateBackground);
});
