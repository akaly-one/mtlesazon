let statsActuelles = [];

function afficherGraphiqueStats(data) {
  statsActuelles = data;
  const ctx = document.getElementById("graph-stats").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map(d => d.nom),
      datasets: [{
        label: "Produits les plus vendus",
        data: data.map(d => d.total),
        backgroundColor: "#0a84ff"
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#fff" },
          grid: { color: "#444" }
        },
        x: {
          ticks: { color: "#fff" },
          grid: { color: "#444" }
        }
      },
      plugins: {
        legend: {
          labels: { color: "#fff" }
        }
      }
    }
  });
}

function exporterCSV(data) {
  if (!data.length) return;
  const lignes = ["Produit,Quantité"];
  data.forEach(d => {
    lignes.push(`"${d.nom}",${d.total}`);
  });
  const blob = new Blob([lignes.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "stats-produits.csv";
  a.click();
  URL.revokeObjectURL(url);
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof isDemo === "undefined") return;

  // Ajout de l'écouteur sur le selecteur de période
  document.getElementById("periode-stats")?.addEventListener("change", e => {
    if (!isDemo) chargerStatsDepuisBase(e.target.value);
  });

  document.getElementById("export-csv")?.addEventListener("click", () => {
    exporterCSV(statsActuelles || []);
  });

  if (isDemo) {
    afficherGraphiqueStats([
      { nom: "Empanada Poulet", total: 28 },
      { nom: "Empanada Bœuf", total: 16 },
      { nom: "Jus de mangue", total: 9 },
      { nom: "Salade latine", total: 6 }
    ]);
  } else {
    chargerStatsDepuisBase();
  }
});

function chargerStatsDepuisBase(periode = "jour") {
  supabase.from("commandes").select("produits, heure_commande").then(({ data: commandes, error }) => {
    if (error || !commandes) return;
    const maintenant = new Date();
    const filtré = commandes.filter(cmd => {
      const dateCmd = new Date(cmd.heure_commande);
      if (periode === "jour") return dateCmd.toDateString() === maintenant.toDateString();
      if (periode === "semaine") {
        const d1 = new Date(maintenant);
        d1.setDate(maintenant.getDate() - 7);
        return dateCmd >= d1;
      }
      if (periode === "mois") {
        return dateCmd.getMonth() === maintenant.getMonth() && dateCmd.getFullYear() === maintenant.getFullYear();
      }
      if (periode === "annee") {
        return dateCmd.getFullYear() === maintenant.getFullYear();
      }
      return true;
    });

    const compteur = {};
    filtré.forEach(cmd => {
      (cmd.produits || []).forEach(p => {
        if (!compteur[p.nom]) compteur[p.nom] = 0;
        compteur[p.nom] += p.quantite;
      });
    });
    const stats = Object.entries(compteur).map(([nom, total]) => ({ nom, total }));
    afficherGraphiqueStats(stats);
  });
}