async function importerProduitsDepuisJSON() {
    const res = await fetch("data/produits.json");
    const produits = await res.json();
    const mapCatToId = {};
  
    for (const p of produits) {
      const cat = p.categorie;
  
      // Cherche ou crée la catégorie
      if (!mapCatToId[cat]) {
        const { data: catExist } = await supabase.from("categories").select("*").eq("nom", cat).single();
        if (catExist) {
          mapCatToId[cat] = catExist.id;
        } else {
          const { data: newCat } = await supabase.from("categories").insert({ nom: cat }).select().single();
          mapCatToId[cat] = newCat.id;
        }
      }
  
      // Insère le produit dans Supabase
      await supabase.from("produits").insert({
        nom: p.nom,
        prix: p.prix,
        image_url: p.image,
        description: p.description || "",
        actif: p.actif !== false,
        categorie_id: mapCatToId[cat]
      });
    }
  
    alert("✅ Produits importés dans Supabase.");
  }