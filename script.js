// KINGSHOTS PHOTOGRAPHY — website interactions
 
// 1. Mobile navigation
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
 
if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label",
      isOpen ? "Close navigation" : "Open navigation");
  });
 
  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    });
  });
}
 
// 2. Filter the gallery by category
const filterButtons = document.querySelectorAll(".filter-btn");
const galleryItems = document.querySelectorAll(".gallery-item");
 
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedCategory = button.dataset.filter;
 
    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
 
    galleryItems.forEach((item) => {
      const matches = selectedCategory === "all" ||
        item.dataset.category === selectedCategory;
      item.classList.toggle("is-hidden", !matches);
    });
  });
});
 
// 3. Display the current year
const yearElement = document.getElementById("year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}
 
// 4. The booking form submits securely to FormSubmit using the HTML form action.
// Do not prevent the form submit event: doing so would stop the email service from receiving it.
