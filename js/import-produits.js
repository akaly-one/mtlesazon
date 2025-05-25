const supabase = supabase.createClient(
  'https://pegawlulgltcxmvfirfq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZ2F3bHVsZ2x0Y3htdmZpcmZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMjE3ODgsImV4cCI6MjA2MzY5Nzc4OH0.qAh5nrKXV-D4EHPZNQLJoWZ81X8HDbiMmJ5Tx3dTklA'
);

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