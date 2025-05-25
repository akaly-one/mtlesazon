// === INIT SUPABASE ===
const SUPABASE_URL = "https://pegawlulgltcxmvfirfq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZ2F3bHVsZ2x0Y3htdmZpcmZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMjE3ODgsImV4cCI6MjA2MzY5Nzc4OH0.qAh5nrKXV-D4EHPZNQLJoWZ81X8HDbiMmJ5Tx3dTklA";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

        const imageSrc = prod.image || "assets/img/emp-poulet.jpeg";
        carte.innerHTML = `
          <img src="${imageSrc}" alt="${prod.nom}">
          <div class="product-info">
            <h3>${prod.nom}</h3>
            <p>${prod.description || ""}</p>
            <p>${prod.prix.toFixed(2)}€</p>
          </div>
          <div class="product-actions">
            <div class="qty-controls">
              <button class="moins-btn" data-id="${prod.id}">−</button>
              <span id="qte-${prod.id}">0</span>
              <button class="plus-btn" data-id="${prod.id}" data-nom="${prod.nom}" data-prix="${prod.prix}">+</button>
            </div>
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
afficherPanier();

document.addEventListener("click", function(e) {
  if (e.target.classList.contains("plus-btn")) {
    const id = e.target.getAttribute("data-id");
    const nom = e.target.getAttribute("data-nom");
    const prix = parseFloat(e.target.getAttribute("data-prix"));
    ajouterAuPanier(id, nom, prix);
  }
  if (e.target.classList.contains("moins-btn")) {
    const id = e.target.getAttribute("data-id");
    retirerDuPanier(id);
  }
});

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
  afficherPanier();
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
  afficherPanier();
}

// === MISE À JOUR DU COMPTEUR PANIER ===
function majCompteurPanier() {
  const panier = JSON.parse(localStorage.getItem("panier")) || [];
  const total = panier.reduce((acc, p) => acc + p.quantite, 0);
  const countEls = document.querySelectorAll("#cart-count, #cart-count-mobile");
  countEls.forEach(el => el.textContent = total);
}

// === ENVOI COMMANDE À SUPABASE ===
async function saveCommandeToSupabase(nom, email, telephone, panier) {
  const { data, error } = await supabase
    .from("commandes")
    .insert([{
      nom,
      email,
      telephone,
      panier: JSON.stringify(panier),
      statut: "en attente",
      timestamp: new Date().toISOString()
    }]);

  if (error) {
    console.error("Erreur enregistrement commande:", error);
  } else {
    console.log("Commande enregistrée :", data);
  }
}

function afficherPanier() {
  const panier = JSON.parse(localStorage.getItem("panier")) || [];
  const list = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");

  if (!list || !totalEl) return;

  list.innerHTML = "";
  let total = 0;

  panier.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.nom} x${item.quantite}`;
    list.appendChild(li);
    total += item.quantite * item.prix;
  });

  totalEl.textContent = `Total : ${total.toFixed(2)}€`;
}

function activerPanierMobile() {
  const panierToggle = document.querySelector(".cart-icon");
  const resumeCommande = document.querySelector(".cart-summary");

  if (!panierToggle || !resumeCommande) return;

  // Cacher par défaut en mobile
  function verifierAffichage() {
    if (window.innerWidth <= 768) {
      resumeCommande.style.display = "none";
    } else {
      resumeCommande.style.display = "block";
    }
  }

  verifierAffichage(); // au chargement
  window.addEventListener("resize", verifierAffichage);

  panierToggle.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      resumeCommande.style.display = resumeCommande.style.display === "none" ? "block" : "none";
    }
  });
}

activerPanierMobile();