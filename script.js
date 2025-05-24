// === SLOGANS DYNAMIQUES (accueil) ===
const slogans = [
  "Métele sazón, sabrosura y tentación",
  "Métele sazón, con fuego y corazón",
  "Métele sazón, y prueba la tentación",
  "Métele sazón, que aquí se come cabrón"
];
const sloganEl = document.getElementById("slogan");
if (sloganEl) {
  const r = Math.floor(Math.random() * slogans.length);
  sloganEl.textContent = slogans[r];
}

// === MENU BURGER MOBILE ===
function toggleMenu() {
  const menu = document.getElementById("mobileMenu");
  if (menu) {
    menu.classList.toggle("open");
  }
}

// === CHARGEMENT DES PRODUITS (menu.html) ===
async function chargerProduits() {
  const container = document.getElementById("product-list");
  if (!container) return;

  try {
    const res = await fetch("data/produits.json");
    const produits = await res.json();

    const categories = {};
    produits.forEach(p => {
      if (!categories[p.categorie]) categories[p.categorie] = [];
      categories[p.categorie].push(p);
    });

    for (const cat in categories) {
      const section = document.createElement("section");
      const titre = document.createElement("h2");
      titre.textContent = cat;
      section.appendChild(titre);

      const grille = document.createElement("div");
      grille.className = "product-grid";

      categories[cat].forEach(prod => {
        const carte = document.createElement("div");
        carte.className = "product-card";

        carte.innerHTML = `
          <img src="assets/img/${prod.image}" alt="${prod.nom}">
          <h3>${prod.nom}</h3>
          <p>${prod.prix.toFixed(2)}€</p>
          <div class="qty-buttons">
            <button onclick="retirerDuPanier('${prod.id}')">-</button>
            <span id="qte-${prod.id}">0</span>
            <button onclick="ajouterAuPanier('${prod.id}', '${prod.nom}', ${prod.prix})">+</button>
          </div>
        `;
        grille.appendChild(carte);
      });

      section.appendChild(grille);
      container.appendChild(section);
    }

  } catch (e) {
    console.error("Erreur chargement produits:", e);
    container.textContent = "Erreur de chargement du menu.";
  }
}
chargerProduits();

// === FORMULAIRE CHECKOUT > CONFIRMATION (checkout.html) ===
function afficherConfirmation() {
  const form = document.getElementById("form-checkout");
  const confirmation = document.getElementById("confirmation");
  if (form && confirmation) {
    form.style.display = "none";
    confirmation.style.display = "block";
  }
  return false;
}