let worksData = [];

async function fetchWorks() {
  const response = await fetch("http://localhost:5678/api/works");
  worksData = await response.json();
  afficherTravaux(worksData);
}

function afficherTravaux(works) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";

  works.forEach(work => {
    const figure = document.createElement("figure");
    figure.dataset.id = work.id;
    figure.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}">
      <figcaption>${work.title}</figcaption>
    `;
    gallery.appendChild(figure);
  });
}

async function fetchCategories() {
  const response = await fetch("http://localhost:5678/api/categories");
  const categories = await response.json();
  genererFiltres(categories);
}

function genererFiltres(categories) {
  const filtersContainer = document.querySelector(".filters");

  const boutonTous = document.createElement("button");
  boutonTous.textContent = "Tous";
  boutonTous.classList.add("active");
  boutonTous.addEventListener("click", () => {
    afficherTravaux(worksData);
    changerBoutonActif(boutonTous);
  });
  filtersContainer.appendChild(boutonTous);

  categories.forEach(category => {
    const button = document.createElement("button");
    button.textContent = category.name;
    button.addEventListener("click", () => {
      const worksFiltres = worksData.filter(work => work.categoryId === category.id);
      afficherTravaux(worksFiltres);
      changerBoutonActif(button);
    });
    filtersContainer.appendChild(button);
  });
}

function changerBoutonActif(boutonClique) {
  const boutons = document.querySelectorAll(".filters button");
  boutons.forEach(btn => btn.classList.remove("active"));
  boutonClique.classList.add("active");
}


function isLoggedIn() {
  return localStorage.getItem("token") !== null;
}

function displayEditMode() {
  const body = document.querySelector("body");
  const editBanner = document.createElement("div");
  editBanner.classList.add("edit-banner");
  editBanner.innerHTML = `<p><i class="fa-regular fa-pen-to-square" style="color: white;"></i> Mode édition</p>`;
  body.prepend(editBanner);

  const filters = document.querySelector(".filters");
  if (filters) filters.style.display = "none";

  const portfolioTitle = document.querySelector("#portfolio h2");
  const editButton = document.createElement("button");
  editButton.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> modifier`;
  portfolioTitle.appendChild(editButton);

  const loginLink = document.querySelector(".login-link");
  if (loginLink) {
    loginLink.textContent = "logout";
    loginLink.addEventListener("click", function () {
  localStorage.removeItem("token");
  showNotification("Vous avez été déconnecté.");

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
});
  }

  createModal();
  createConfirmModal();
  bindModalEvents(editButton);
  bindFormSubmit();
}

function showNotification(message, type = "success") {
  const existing = document.getElementById("notification");
  if (existing) existing.remove();

  const notif = document.createElement("div");
  notif.id = "notification";
  notif.textContent = message;
  notif.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background-color: ${type === "success" ? "#1D6154" : "#e74c3c"};
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    font-size: 0.95rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  document.body.appendChild(notif);

  setTimeout(() => notif.style.opacity = "1", 10);

  setTimeout(() => {
    notif.style.opacity = "0";
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}


function createConfirmModal() {
  if (document.getElementById("confirm-modal")) return;

  const confirmModal = document.createElement("div");
  confirmModal.id = "confirm-modal";
  confirmModal.style.cssText = `
    display: none;
    position: fixed;
    inset: 0;
    background-color: rgba(0,0,0,0.7);
    justify-content: center;
    align-items: center;
    z-index: 2000;
  `;

  confirmModal.innerHTML = `
    <div style="
      background: white;
      border-radius: 10px;
      padding: 40px;
      width: 400px;
      max-width: 90%;
      text-align: center;
    ">
      <h4>Êtes-vous sûr de vouloir supprimer cette image ?</h4>
      <p style="color: #666; margin: 15px 0 25px;">Cette action est irréversible.</p>
      <div style="display: flex; gap: 15px; justify-content: center;">
        <button id="confirm-cancel" style="
          padding: 10px 25px;
          border: 1px solid #ccc;
          background: white;
          border-radius: 50px;
          cursor: pointer;
          font-size: 0.95rem;
        ">Annuler</button>
        <button id="confirm-delete" style="
          padding: 10px 25px;
          border: none;
          background: #e74c3c;
          color: white;
          border-radius: 50px;
          cursor: pointer;
          font-size: 0.95rem;
        ">Je supprime</button>
      </div>
    </div>
  `;

  document.body.appendChild(confirmModal);
}

function openConfirmModal(onConfirm) {
  const confirmModal = document.getElementById("confirm-modal");
  confirmModal.style.display = "flex";

  const cancelBtn = document.getElementById("confirm-cancel");
  const deleteBtn = document.getElementById("confirm-delete");

  const newCancelBtn = cancelBtn.cloneNode(true);
  const newDeleteBtn = deleteBtn.cloneNode(true);
  cancelBtn.replaceWith(newCancelBtn);
  deleteBtn.replaceWith(newDeleteBtn);

  newCancelBtn.addEventListener("click", () => {
    confirmModal.style.display = "none";
  });

  newDeleteBtn.addEventListener("click", async () => {
    confirmModal.style.display = "none";
    await onConfirm();
  });
}

function createModal() {
  if (document.getElementById("modal")) return;

  const modal = document.createElement("div");
  modal.id = "modal";
  modal.classList.add("modal-overlay");

  modal.innerHTML = `
    <div class="modal-container">
      <button class="modal-close"><i class="fa-solid fa-xmark"></i></button>

      <div id="modal-gallery" class="modal-view">
        <h4><center>Galerie photo</center></h4>
        <div class="modal-photos"></div>
        <hr>
        <button id="btn-add-photo">Ajouter une photo</button>
      </div>

      <div id="modal-form" class="modal-view" style="display:none;">
        <button class="modal-back"><i class="fa-solid fa-arrow-left"></i></button>
        <h4><center>Ajout photo</center></h4>
        <form id="form-add-work">

          <div id="upload-zone">
            <i class="fa-regular fa-image"></i>
            <label for="input-image">+ Ajouter photo</label>
            <input type="file" id="input-image" accept="image/png, image/jpeg" hidden>
            <p>jpg, png : 4mo max</p>
          </div>

          <img id="preview-image" style="display:none;" alt="prévisualisation">

          <div class="form-field">
            <label for="input-title">Titre</label>
            <input type="text" id="input-title">
          </div>

          <div class="form-field">
            <label for="input-category">Catégorie</label>
            <select id="input-category">
              <option value=""></option>
            </select>
          </div>

          <p id="form-error" style="display:none; color:red; text-align:center;">
            Veuillez remplir tous les champs.
          </p>

          <hr>

          <button type="submit" id="btn-submit">Valider</button>

        </form>
      </div>

    </div>
  `;

  document.body.appendChild(modal);
}

function openModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "flex";
  fillModalGallery();
  showGalleryView();
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";
}

function showGalleryView() {
  document.getElementById("modal-gallery").style.display = "block";
  document.getElementById("modal-form").style.display = "none";
}

function showFormView() {
  document.getElementById("modal-gallery").style.display = "none";
  document.getElementById("modal-form").style.display = "block";
}

function bindModalEvents(editButton) {
  editButton.addEventListener("click", openModal);

  const closeBtn = document.querySelector(".modal-close");
  closeBtn.addEventListener("click", closeModal);

  const modal = document.getElementById("modal");
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });

  const btnAddPhoto = document.getElementById("btn-add-photo");
  btnAddPhoto.addEventListener("click", () => {
    showFormView();
    fillCategoriesSelect();
    bindImagePreview();
  });

  const backBtn = document.querySelector(".modal-back");
  backBtn.addEventListener("click", showGalleryView);
}


function fillModalGallery() {
  const container = document.querySelector(".modal-photos");
  container.innerHTML = "";

  worksData.forEach(work => {
    const figure = document.createElement("figure");
    figure.dataset.id = work.id;
    figure.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}">
      <button class="btn-delete" data-id="${work.id}">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;

    const deleteBtn = figure.querySelector(".btn-delete");
    deleteBtn.addEventListener("click", function () {
      openConfirmModal(async () => {
        const id = work.id;
        const success = await deleteWork(id);

        if (success) {
          figure.remove();
          const figureGallery = document.querySelector(`.gallery figure[data-id="${id}"]`);
          if (figureGallery) figureGallery.remove();
          worksData = worksData.filter(w => w.id !== id);
          showNotification("Image supprimée avec succès !");
        } else {
          showNotification("Erreur lors de la suppression.", "error");
        }
      });
    });

    container.appendChild(figure);
  });
}


async function deleteWork(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:5678/api/works/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response.status === 204;
}


async function fillCategoriesSelect() {
  const select = document.getElementById("input-category");
  if (select.children.length > 1) return;

  const response = await fetch("http://localhost:5678/api/categories");
  const categories = await response.json();

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    select.appendChild(option);
  });
}

let selectedFile = null;

function bindImagePreview() {
  const input = document.getElementById("input-image");
  const uploadZone = document.getElementById("upload-zone");
  const submitBtn = document.getElementById("btn-submit");

  submitBtn.disabled = true;
  submitBtn.classList.add("btn-disabled");
  submitBtn.classList.remove("btn-active");

  input.addEventListener("change", function () {
    const file = input.files[0];
    if (file) {
      selectedFile = file;

      const url = URL.createObjectURL(file);
      const preview = document.createElement("img");
      preview.src = url;
      preview.alt = "prévisualisation";
      preview.style.maxWidth = "100%";
      preview.style.maxHeight = "180px";
      preview.style.objectFit = "contain";
      preview.style.borderRadius = "0px";

      uploadZone.innerHTML = "";
      uploadZone.appendChild(preview);

      submitBtn.disabled = false;
      submitBtn.classList.remove("btn-disabled");
      submitBtn.classList.add("btn-active");
    }
  });
}

function bindFormSubmit() {
  const form = document.getElementById("form-add-work");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const titleInput = document.getElementById("input-title");
    const categoryInput = document.getElementById("input-category");
    const errorMsg = document.getElementById("form-error");

    if (!selectedFile || !titleInput.value || !categoryInput.value) {
      errorMsg.textContent = "Veuillez remplir tous les champs.";
      errorMsg.style.display = "block";
      return;
    }

    errorMsg.style.display = "none";

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("title", titleInput.value);
    formData.append("category", categoryInput.value);

    const response = await submitNewWork(formData);

    if (response.ok) {
      const newWork = await response.json();

      worksData.push(newWork);

      const gallery = document.querySelector(".gallery");
      const figure = document.createElement("figure");
      figure.dataset.id = newWork.id;
      figure.innerHTML = `
        <img src="${newWork.imageUrl}" alt="${newWork.title}">
        <figcaption>${newWork.title}</figcaption>
      `;
      gallery.appendChild(figure);

      resetForm();
      showGalleryView();
      fillModalGallery();
      showNotification("Image ajoutée avec succès !");

    } else {
      errorMsg.textContent = "Erreur lors de l'ajout, veuillez réessayer.";
      errorMsg.style.display = "block";
    }
  });
}

async function submitNewWork(formData) {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:5678/api/works", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });

  return response;
}

function resetForm() {
  selectedFile = null;

  const uploadZone = document.getElementById("upload-zone");
  uploadZone.innerHTML = `
    <i class="fa-regular fa-image"></i>
    <label for="input-image">+ Ajouter photo</label>
    <input type="file" id="input-image" accept="image/png, image/jpeg" hidden>
    <p>jpg, png : 4mo max</p>
  `;

  document.getElementById("input-title").value = "";
  document.getElementById("input-category").value = "";

  const submitBtn = document.getElementById("btn-submit");
  submitBtn.disabled = true;
  submitBtn.classList.remove("btn-active");
  submitBtn.classList.add("btn-disabled");

  bindImagePreview();
}


document.addEventListener("DOMContentLoaded", function () {
  fetchWorks();

  if (isLoggedIn()) {
    displayEditMode();
  } else {
    fetchCategories();
  }


const contactForm = document.querySelector("#contact form");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const message = document.getElementById("message");

    document.querySelectorAll(".contact-error").forEach(el => el.remove());

    let isValid = true;

    if (!name.value.trim()) {
      afficherErreurContact(name, "Veuillez entrer votre nom.");
      isValid = false;
    }

    if (!email.value.trim() || !email.value.includes("@")) {
      afficherErreurContact(email, "Veuillez entrer un email valide.");
      isValid = false;
    }

    if (!message.value.trim()) {
      afficherErreurContact(message, "Veuillez entrer un message.");
      isValid = false;
    }

    if (isValid) {
      showNotification("Message envoyé avec succès !");
      contactForm.reset();
    }
  });
}

function afficherErreurContact(input, message) {
  const error = document.createElement("p");
  error.textContent = message;
  error.classList.add("contact-error");
  error.style.color = "red";
  error.style.fontSize = "0.85rem";
  error.style.marginTop = "4px";
  input.insertAdjacentElement("afterend", error);
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("login") === "success") {
  showNotification("Connexion réussie !");
  window.history.replaceState({}, document.title, "index.html");
}

});