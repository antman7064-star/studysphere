const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const saveButton = document.querySelector('.save-button');

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  navLinks.classList.toggle('is-open', !isOpen);
});

saveButton?.addEventListener('click', () => {
  const isSaved = saveButton.classList.toggle('is-saved');
  saveButton.textContent = isSaved ? '♥' : '♡';
  saveButton.setAttribute('aria-label', isSaved ? 'Remove raised garden beds from saved listings' : 'Save raised garden beds');
});
