// panier.js – logique panier simplifiée

// Initialiser panier
let panier = JSON.parse(localStorage.getItem("panier")) || [];

// Met à jour le compteur dans le header
function updateCartCount() {
  const total = panier.reduce((sum, item) => sum + item.qte, 0);
  document.querySelectorAll("#cart-count, #cart-count-mobile").forEach(span => {
    if (span) span.textContent = total;
  });
}

function updateQtyDisplay() {
  panier.forEach(item => {
    const span = document.getElementById(`qte-${item.id}`);
    if (span) span.textContent = item.qte;
  });
}

// Ajouter un produit au panier (appelé par bouton +)
function ajouterAuPanier(id, nom, prix) {
  const item = panier.find(p => p.id === id);
  if (item) {
    item.qte++;
  } else {
    panier.push({ id, nom, prix, qte: 1 });
  }
  localStorage.setItem("panier", JSON.stringify(panier));
  updateCartCount();
  updateQtyDisplay();
}

// Fonction pour soustraire un article (bouton -)
function retirerDuPanier(id) {
  const item = panier.find(p => p.id === id);
  if (item) {
    item.qte--;
    if (item.qte <= 0) panier = panier.filter(p => p.id !== id);
    localStorage.setItem("panier", JSON.stringify(panier));
    updateCartCount();
    updateQtyDisplay();
  }
}

// Appel au démarrage
updateCartCount();

// Affiche dynamiquement les articles du panier dans une section dédiée
function afficherPanier() {
  const container = document.getElementById("panier-resume");
  if (!container) return;
  container.innerHTML = "";

  if (panier.length === 0) {
    container.innerHTML = "<p>Votre panier est vide.</p>";
    return;
  }

  panier.forEach(item => {
    const ligne = document.createElement("div");
    ligne.className = "ligne-panier";
    ligne.innerHTML = `
      <span>${item.nom} x${item.qte}</span>
      <span>${(item.prix * item.qte).toFixed(2)} €</span>
    `;
    container.appendChild(ligne);
  });

  const total = panier.reduce((s, i) => s + i.prix * i.qte, 0);
  const totalDiv = document.createElement("div");
  totalDiv.className = "total-panier";
  totalDiv.innerHTML = `<strong>Total : ${total.toFixed(2)} €</strong>`;
  container.appendChild(totalDiv);
}
