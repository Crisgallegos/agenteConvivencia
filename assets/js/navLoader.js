// Este script carga el nav.html en el elemento con id "navbar"
document.addEventListener('DOMContentLoaded', function() {
  var navbarDiv = document.getElementById('navbar');
  if (navbarDiv) {
    fetch('nav.html')
      .then(res => res.text())
      .then(html => { navbarDiv.innerHTML = html; });
  }
});
