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
          <img src="${prod.image}" alt="${prod.nom}" class="product-image">
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

// === AJOUT DANS LE PANIER ===
function ajouterAuPanier(id, nom, prix) {
  let qteEl = document.getElementById("qte-" + id);
  let qte = parseInt(qteEl.textContent);
  qte++;
  qteEl.textContent = qte;

  // Mettre à jour le panier dans localStorage
  let panier = JSON.parse(localStorage.getItem("panier")) || [];
  const index = panier.findIndex(p => p.id === id);
  if (index !== -1) {
    panier[index].quantite += 1;
  } else {
    panier.push({ id, nom, prix, quantite: 1 });
  }
  localStorage.setItem("panier", JSON.stringify(panier));

  // Mettre à jour le compteur
  majCompteurPanier();
}

// === RETRAIT DU PANIER ===
function retirerDuPanier(id) {
  let qteEl = document.getElementById("qte-" + id);
  let qte = parseInt(qteEl.textContent);
  if (qte > 0) qte--;

  qteEl.textContent = qte;

  let panier = JSON.parse(localStorage.getItem("panier")) || [];
  const index = panier.findIndex(p => p.id === id);
  if (index !== -1) {
    panier[index].quantite -= 1;
    if (panier[index].quantite <= 0) {
      panier.splice(index, 1);
    }
    localStorage.setItem("panier", JSON.stringify(panier));
  }

  majCompteurPanier();
}

// === MISE À JOUR DU COMPTEUR PANIER ===
function majCompteurPanier() {
  const panier = JSON.parse(localStorage.getItem("panier")) || [];
  const total = panier.reduce((acc, p) => acc + p.quantite, 0);
  const countEls = document.querySelectorAll("#cart-count, #cart-count-mobile");
  countEls.forEach(el => el.textContent = total);
}