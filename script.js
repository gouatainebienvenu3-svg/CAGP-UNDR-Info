const MOT_DE_PASSE_ADMIN = "undr2026"; // changez ce mot de passe
let estAdmin = sessionStorage.getItem("adminUNDR") === "true";

const articlesParDefaut = [
    {
        id: 1,
        titre: "Session parlementaire ouverte",
        date: "20 juillet 2026",
        resume: "Le Groupe Parlementaire UNDR a participé à l'ouverture de la nouvelle session.",
        categorie: "Actualités",
        image: "",
        video: ""
    },
    {
        id: 2,
        titre: "Visite de terrain dans la région Nord",
        date: "15 juillet 2026",
        resume: "Une délégation du groupe s'est rendue sur le terrain pour rencontrer les populations.",
        categorie: "Activités",
        image: "",
        video: ""
    },
    {
        id: 3,
        titre: "Déclaration officielle du groupe",
        date: "10 juillet 2026",
        resume: "Le groupe a publié une déclaration concernant les récents débats budgétaires.",
        categorie: "Communiqués",
        image: "",
        video: ""
    }
];

let articles = JSON.parse(localStorage.getItem("articlesUNDR")) || articlesParDefaut;
let categorieActuelle = "Toutes";

const conteneur = document.getElementById("liste-articles");
const boutonsFiltre = document.querySelectorAll(".filtre-btn");
const menuToggle = document.getElementById("menu-toggle");
const filtresList = document.getElementById("filtres-list");
const boutonAdmin = document.getElementById("mode-admin");
const formulaireAjout = document.getElementById("formulaire-ajout");

function metAJourAffichageAdmin() {
    if (estAdmin) {
        formulaireAjout.style.display = "block";
        boutonAdmin.textContent = "🔓 Quitter mode admin";
    } else {
        formulaireAjout.style.display = "none";
        boutonAdmin.textContent = "🔒 Mode admin";
    }
}
document.getElementById("partager-app").addEventListener("click", function() {
    const lien = window.location.href;

    if (navigator.share) {
        navigator.share({
            title: "UNDR Info",
            text: "Découvrez UNDR Info, l'application d'actualités du Groupe Parlementaire UNDR.",
            url: lien
        }).catch(function(err) {
            console.log("Partage annulé ou échoué :", err);
        });
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(lien).then(function() {
            alert("Lien copié : " + lien);
        }).catch(function(err) {
            prompt("Copiez ce lien manuellement :", lien);
        });
    } else {
        prompt("Copiez ce lien manuellement :", lien);
    }
});

boutonAdmin.addEventListener("click", function() {
    if (estAdmin) {
        estAdmin = false;
        sessionStorage.removeItem("adminUNDR");
    } else {
        const saisie = prompt("Mot de passe administrateur :");
        if (saisie === MOT_DE_PASSE_ADMIN) {
            estAdmin = true;
            sessionStorage.setItem("adminUNDR", "true");
        } else if (saisie !== null) {
            alert("Mot de passe incorrect.");
        }
    }
    metAJourAffichageAdmin();
    afficherArticles();
});

metAJourAffichageAdmin();

menuToggle.addEventListener("click", function() {
    filtresList.classList.toggle("ouvert");
});
document.getElementById("toggle-direct").addEventListener("click", function() {
    const zone = document.getElementById("zone-direct");
    if (zone.style.display === "none") {
        zone.style.display = "block";
        this.textContent = "✖ Fermer le Direct";
    } else {
        zone.style.display = "none";
        this.textContent = "🔴 Suivre le Direct";
    }
});

function afficherArticles() {
    conteneur.innerHTML = "";
    let liste = articles.filter(a => categorieActuelle === "Toutes" || a.categorie === categorieActuelle);

    liste.forEach((art, i) => {
        const div = document.createElement("div");
        div.className = i === 0 ? "article une" : "article";
        div.dataset.id = art.id;

        const imageSrc = art.image && art.image !== ""
            ? art.image
            : `https://picsum.photos/seed/${encodeURIComponent(art.titre)}/400/200`;

        div.innerHTML = `
            <img src="${imageSrc}" class="article-img" alt="${art.titre}">
            <span class="badge">${art.categorie}</span>
            <h2>${art.titre}</h2>
            ${estAdmin ? `<button class="btn-supprimer" data-id="${art.id}">Supprimer</button>` : ""}
        `;
        conteneur.appendChild(div);
    });
}

function ouvrirArticle(id) {
    const art = articles.find(a => a.id === id);
    if (!art) return;

    const imageSrc = art.image && art.image !== ""
        ? art.image
        : `https://picsum.photos/seed/${encodeURIComponent(art.titre)}/400/200`;

    document.getElementById("detail-img").src = imageSrc;
    document.getElementById("detail-badge").textContent = art.categorie;
    document.getElementById("detail-titre").textContent = art.titre;
    document.getElementById("detail-date").textContent = art.date;
    document.getElementById("detail-resume").textContent = art.resume;
    document.getElementById("vue-detail").style.display = "block";
    incrementerVue(id);
    afficherVue(id);
    afficherLireAussi(art);
    function afficherLireAussi(articleActuel) {
    const zone = document.getElementById("lire-aussi");

    let suggestions = articles.filter(a =>
        a.id !== articleActuel.id && a.categorie === articleActuel.categorie
    );

    if (suggestions.length < 3) {
        const autres = articles.filter(a =>
            a.id !== articleActuel.id && a.categorie !== articleActuel.categorie
        );
        suggestions = suggestions.concat(autres);
    }

    suggestions = suggestions.slice(0, 3);

    if (suggestions.length === 0) {
        zone.innerHTML = "";
        return;
    }

    let html = "<h3>Lire aussi</h3><div class='lire-aussi-grille'>";
    suggestions.forEach(function(art) {
        const imageSrc = art.image && art.image !== ""
            ? art.image
            : `https://picsum.photos/seed/${encodeURIComponent(art.titre)}/400/200`;

        html += `
            <div class="lire-aussi-carte" data-id="${art.id}">
                <img src="${imageSrc}" alt="${art.titre}">
                <p>${art.titre}</p>
            </div>
        `;
    });
    html += "</div>";

    zone.innerHTML = html;

    zone.querySelectorAll(".lire-aussi-carte").forEach(function(carte) {
        carte.addEventListener("click", function() {
            ouvrirArticle(Number(carte.dataset.id));
        });
    });
}

    function incrementerVue(id) {
    if (!window.db) return;
    const ref = window.db.collection("vues").doc(String(id));
    ref.get().then(function(doc) {
        if (doc.exists) {
            ref.update({ compte: firebase.firestore.FieldValue.increment(1) });
        } else {
            ref.set({ compte: 1 });
        }
    });
}

function afficherVue(id) {
    if (!window.db) return;
    window.db.collection("vues").doc(String(id)).onSnapshot(function(doc) {
        const compte = doc.exists ? doc.data().compte : 0;
        const elem = document.getElementById("detail-vues");
        if (elem) elem.textContent = compte + (compte > 1 ? " vues" : " vue");
    });
}

    const zoneVideo = document.getElementById("detail-video-zone");
    zoneVideo.innerHTML = "";
    if (art.video && art.video !== "") {
        if (art.video.includes("youtube.com") || art.video.includes("youtu.be")) {
            const idVideo = art.video.split("v=")[1] ? art.video.split("v=")[1].split("&")[0] : art.video.split("/").pop();
            zoneVideo.innerHTML = `<iframe class="article-video" src="https://www.youtube.com/embed/${idVideo}" frameborder="0" allowfullscreen></iframe>`;
        } else if (art.video.includes("facebook.com")) {
            const lienEncode = encodeURIComponent(art.video);
            if (art.video.includes("/videos/") || art.video.includes("/watch")) {
                zoneVideo.innerHTML = `<iframe class="article-video" src="https://www.facebook.com/plugins/video.php?href=${lienEncode}&show_text=false" frameborder="0" allowfullscreen></iframe>`;
            } else {
                zoneVideo.innerHTML = `<iframe class="article-video-facebook" src="https://www.facebook.com/plugins/post.php?href=${lienEncode}&show_text=true" frameborder="0"></iframe>`;
            }
        } else {
            zoneVideo.innerHTML = `<video class="article-video" src="${art.video}" controls></video>`;
        }
    }

    conteneur.style.display = "none";
    filtresList.style.display = "none";
    menuToggle.style.display = "none";
    document.getElementById("vue-detail").style.display = "block";
}

document.getElementById("retour-liste").addEventListener("click", function() {
    document.getElementById("vue-detail").style.display = "none";
    conteneur.style.display = "grid";
    filtresList.style.display = "flex";
    menuToggle.style.display = window.innerWidth <= 600 ? "block" : "none";
});

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
const champImage = document.getElementById("nouvelle-image");
const champVideo = document.getElementById("nouvelle-video");
let toucheDebutX = 0;
let toucheDebutY = 0;

conteneur.addEventListener("touchstart", function(e) {
    toucheDebutX = e.changedTouches[0].screenX;
    toucheDebutY = e.changedTouches[0].screenY;
});

conteneur.addEventListener("touchend", function(e) {
    const toucheFinX = e.changedTouches[0].screenX;
    const toucheFinY = e.changedTouches[0].screenY;
    const diffX = toucheFinX - toucheDebutX;
    const diffY = toucheFinY - toucheDebutY;

    if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY)) {
        const boutons = Array.from(boutonsFiltre);
        const indexActuel = boutons.findIndex(b => b.classList.contains("actif"));

        let nouvelIndex;
        if (diffX < 0) {
            nouvelIndex = Math.min(indexActuel + 1, boutons.length - 1);
        } else {
            nouvelIndex = Math.max(indexActuel - 1, 0);
        }

        if (nouvelIndex !== indexActuel) {
            boutons[nouvelIndex].click();
        }
    }
});

boutonPublier.addEventListener("click", function() {
    if (champTitre.value === "" || champResume.value === "") {
        alert("Merci de remplir le titre et le résumé.");
        return;
    }

    function publier(imageData) {
        const nouvelArticle = {
            id: Date.now(),
            titre: champTitre.value,
            date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
            resume: champResume.value,
            categorie: champCategorie.value,
            image: imageData || "",
            video: champVideo.value.trim()
        };

        articles.unshift(nouvelArticle);
        localStorage.setItem("articlesUNDR", JSON.stringify(articles));

        champTitre.value = "";
        champResume.value = "";
        champVideo.value = "";
        champImage.value = "";

        afficherArticles();
    }

    if (champImage.files && champImage.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            publier(e.target.result);
        };
        reader.readAsDataURL(champImage.files[0]);
    } else {
        publier(null);
    }
});

conteneur.addEventListener("click", function(e) {
    if (e.target.classList.contains("btn-supprimer")) {
        const id = Number(e.target.dataset.id);
        articles = articles.filter(a => a.id !== id);
        localStorage.setItem("articlesUNDR", JSON.stringify(articles));
        afficherArticles();
        return;
    }

    const carte = e.target.closest(".article");
    if (carte) {
        ouvrirArticle(Number(carte.dataset.id));
    }
});

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
}