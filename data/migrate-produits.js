const supabase = createClient("https://xxxx.supabase.co", "public-anon-key");

async function importerProduitsDepuisJSON() {
  const res = await fetch("data/produits.json");
  const produits = await res.json();

  const mapCatToId = {};

  // Étape 1 : détecter les catégories uniques
  const categories = [...new Set(produits.map(p => p.categorie))];

  // Étape 2 : insérer ou récupérer l’id Supabase de chaque catégorie
  for (const cat of categories) {
    const { data: exist } = await supabase.from("categories").select("*").eq("nom", cat).single();
    if (exist) {
      mapCatToId[cat] = exist.id;
    } else {
      const { data: insert } = await supabase.from("categories").insert({ nom: cat }).select().single();
      mapCatToId[cat] = insert.id;
    }
  }

  // Étape 3 : migrer les produits
  for (const p of produits) {
    await supabase.from("produits").insert({
      nom: p.nom,
      prix: p.prix,
      image_url: p.image,
      actif: true,
      categorie_id: mapCatToId[p.categorie],
      description: "", // si tu veux ajouter plus tard
    });
  }

  alert("Migration terminée !");
}

importerProduitsDepuisJSON();