let isDemo = localStorage.getItem("modeDemo") !== "false";

document.addEventListener("DOMContentLoaded", () => {
  if (isDemo) {
    fetch("data/produits.json")
      .then(res => res.json())
      .then(data => afficherProduits(data));
  } else {
    supabase.from("produits").select("*").then(({ data: produits, error }) => {
      if (error || !produits) {
        console.error("Erreur chargement produits Supabase :", error);
        return;
      }
      afficherProduits(produits);
    });
  }

  const boutonAjout = document.getElementById("ajouter-produit");
  const popup = document.getElementById("popup-produit");
  const form = document.getElementById("form-produit");
  const fermerPopup = document.getElementById("fermer-popup");

  boutonAjout?.addEventListener("click", () => {
    document.getElementById("titre-popup-produit").textContent = "➕ Nouveau produit";
    popup.style.display = "block";
    form.reset();
    document.getElementById("popup-dispo").checked = true;
  });

  fermerPopup?.addEventListener("click", () => {
    popup.style.display = "none";
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nom = document.getElementById("popup-nom").value.trim();
    const prix = parseFloat(document.getElementById("popup-prix").value);
    const image = document.getElementById("popup-image").value.trim();
    const categorie = document.getElementById("popup-categorie").value.trim();
    const dispo = document.getElementById("popup-dispo").checked;

    if (!nom || !categorie || isNaN(prix)) {
      alert("Champs requis manquants.");
      return;
    }

    let categorie_id = null;
    const { data: existCat } = await supabase.from("categories").select("*").eq("nom", categorie).single();
    if (existCat) {
      categorie_id = existCat.id;
    } else {
      const { data: newCat } = await supabase.from("categories").insert({ nom: categorie }).select().single();
      categorie_id = newCat.id;
    }

    const { data: produit, error } = await supabase
      .from("produits")
      .insert({
        nom,
        prix,
        image_url: image,
        actif: dispo,
        categorie_id
      })
      .select()
      .single();

    if (produit) {
      afficherProduits([produit, ...document.querySelectorAll(".produit-item")].map(el => {
        return {
          nom: el.querySelector("strong")?.textContent || "",
          prix: prix,
          image_url: image,
          actif: dispo,
          categorie: categorie,
          id: produit.id
        };
      }));
      popup.style.display = "none";
    } else {
      alert("Erreur lors de l’ajout du produit.");
      console.error(error);
    }
  });
});

function afficherProduits(produits) {
  const conteneur = document.getElementById("liste-produits");
  conteneur.innerHTML = "";

  produits.forEach(prod => {
    const div = document.createElement("div");
    div.className = "produit-item";
    div.style = "border:1px solid #444;padding:10px;margin-bottom:10px;border-radius:8px;color:white;background:#333;";

    div.innerHTML = `
      <strong>${prod.nom}</strong><br/>
      <em>${prod.categorie || prod.categorie_id || "?"}</em> — ${prod.prix.toFixed(2)} €<br/>
      <label>Disponible : 
        <input type="checkbox" data-id="${prod.id}" class="switch-dispo" ${prod.actif ? "checked" : ""}>
      </label><br/>
      <img src="${prod.image || prod.image_url}" alt="${prod.nom}" style="max-height:60px; margin-top:6px; border-radius:4px;" />
    `;

    conteneur.appendChild(div);
  });

  // Activation du switch dispo
  document.querySelectorAll(".switch-dispo").forEach(input => {
    input.addEventListener("change", async (e) => {
      const id = e.target.dataset.id;
      const dispo = e.target.checked;
      await supabase.from("produits").update({ actif: dispo }).eq("id", id);
    });
  });
}