


const supabase = supabase.createClient(
  "https://pegawlulgltcxmvfirfq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZ2F3bHVsZ2x0Y3htdmZpcmZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMjE3ODgsImV4cCI6MjA2MzY5Nzc4OH0.qAh5nrKXV-D4EHPZNQLJoWZ81X8HDbiMmJ5Tx3dTklA"
);

document.addEventListener("DOMContentLoaded", async () => {
  const { data: produits, error } = await supabase
    .from("produits")
    .select("id, nom, prix, image_url, actif, description, categories (nom)")
    .eq("actif", true);

  if (error) {
    console.error("Erreur chargement produits Supabase :", error);
    return;
  }

  const grouped = {};

  produits.forEach(p => {
    const cat = p.categories?.nom || "Autres";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });

  const container = document.getElementById("product-list");
  container.classList.add("menu-produits"); // Classe spéciale pour style.css
  container.innerHTML = "";

  for (const cat in grouped) {
    const section = document.createElement("section");
    section.className = "categorie-section";
    section.innerHTML = `<h2 class="categorie-titre">${cat}</h2>`;
    
    grouped[cat].forEach(prod => {
      const item = document.createElement("div");
      item.className = "produit-item";
      item.innerHTML = `
        <div class="produit-info">
          <div class="produit-nom">${prod.nom}</div>
          <div class="produit-description">${prod.description || ""}</div>
          <div class="produit-prix">${prod.prix.toFixed(2)}€</div>
        </div>
        <div class="produit-image">
          <img src="${prod.image_url}" alt="${prod.nom}">
        </div>
        <div class="produit-actions">
          <button class="moins" onclick="modifierQuantite('${prod.id}', -1)">−</button>
          <span id="quantite-${prod.id}" class="quantite">0</span>
          <button class="plus" onclick="modifierQuantite('${prod.id}', 1)">+</button>
        </div>
      `;
      section.appendChild(item);
    });

    container.appendChild(section);
  }
});

function modifierQuantite(id, delta) {
  const qteSpan = document.getElementById(`quantite-${id}`);
  let qte = parseInt(qteSpan.textContent);
  qte = Math.max(0, qte + delta);
  qteSpan.textContent = qte;
}