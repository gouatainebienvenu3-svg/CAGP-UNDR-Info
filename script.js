const articlesParDefaut = [
    {
        id: 1,
        titre: "Session parlementaire ouverte",
        date: "20 juillet 2026",
        resume: "Le Groupe Parlementaire UNDR a participé à l'ouverture de la nouvelle session.",
        categorie: "Actualités"
    },
    {
        id: 2,
        titre: "Visite de terrain dans la région Nord",
        date: "15 juillet 2026",
        resume: "Une délégation du groupe s'est rendue sur le terrain pour rencontrer les populations.",
        categorie: "Activités"
    },
    {
        id: 3,
        titre: "Déclaration officielle du groupe",
        date: "10 juillet 2026",
        resume: "Le groupe a publié une déclaration concernant les récents débats budgétaires.",
        categorie: "Communiqués"
    }
];
let articles = JSON.parse(localStorage.getItem("articlesUNDR")) || articlesParDefaut;
let categorieActuelle = "Toutes";
const conteneur = document.getElementById("liste-articles");
const boutonsFiltre = document.querySelectorAll(".filtre-btn");
const menuToggle = document.getElementById("menu-toggle");
const filtresList = document.getElementById("filtres-list");

menuToggle.addEventListener("click", function() {
    filtresList.classList.toggle("ouvert");
});

function afficherArticles() {
    conteneur.innerHTML = "";
    let liste = articles.filter(a => categorieActuelle === "Toutes" || a.categorie === categorieActuelle);

    liste.forEach((art, i) => {
        const div = document.createElement("div");
        div.className = i === 0 ? "article une" : "article";
        div.innerHTML = `
            <img src="https://picsum.photos/seed/${encodeURIComponent(art.titre)}/400/200" class="article-img" alt="${art.titre}">
            <span class="badge">${art.categorie}</span>
            <h2>${art.titre}</h2>
            <p class="date">${art.date}</p>
            <p>${art.resume}</p>
            <button class="btn-supprimer" data-id="${art.id}">Supprimer</button>
        `;
        conteneur.appendChild(div);
    });
}

boutonsFiltre.forEach(function(bouton) {
    bouton.addEventListener("click", function() {
        boutonsFiltre.forEach(function(b) {
            b.classList.remove("actif");
        });
        bouton.classList.add("actif");
        categorieActuelle = bouton.dataset.categorie;
        afficherArticles();
    });
});

afficherArticles();
const champTitre = document.getElementById("nouveau-titre");
const champCategorie = document.getElementById("nouvelle-categorie");
const champResume = document.getElementById("nouveau-resume");
const boutonPublier = document.getElementById("bouton-publier");

boutonPublier.addEventListener("click", function() {
    if (champTitre.value === "" || champResume.value === "") {
        alert("Merci de remplir le titre et le résumé.");
        return;
    }

    const nouvelArticle = {
    id: Date.now(),
        titre: champTitre.value,
        date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
        resume: champResume.value,
        categorie: champCategorie.value
    };

    articles.unshift(nouvelArticle);
    localStorage.setItem("articlesUNDR", JSON.stringify(articles));

    champTitre.value = "";
    champResume.value = "";

    afficherArticles();
    
}); conteneur.addEventListener("click", function(e) {
    if (e.target.classList.contains("btn-supprimer")) {
        const id = Number(e.target.dataset.id);
        articles = articles.filter(a => a.id !== id);
        localStorage.setItem("articlesUNDR", JSON.stringify(articles));
        afficherArticles();
    }
}); if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
}