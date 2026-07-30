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

/* ---------- TRADUCTIONS ---------- */
const traductions = {
    fr: {
        soustitre: "Actualités et activités du Groupe Parlementaire UNDR",
        form_titre: "Ajouter un article",
        btn_publier: "Publier",
        btn_retour: "← Retour",
        chat_titre: "Chat en direct",
        btn_envoyer: "Envoyer",
        btn_partager: "📤 Partager l'application",
        btn_admin_ouvrir: "🔒 Mode admin",
        btn_admin_fermer: "🔓 Quitter mode admin",
        btn_direct_ouvrir: "🔴 Suivre le Direct",
        btn_direct_fermer: "✖ Fermer le Direct",
        lire_aussi: "Lire aussi"
    },
    en: {
        soustitre: "News and activities of the UNDR Parliamentary Group",
        form_titre: "Add an article",
        btn_publier: "Publish",
        btn_retour: "← Back",
        chat_titre: "Live Chat",
        btn_envoyer: "Send",
        btn_partager: "📤 Share the app",
        btn_admin_ouvrir: "🔒 Admin mode",
        btn_admin_fermer: "🔓 Exit admin mode",
        btn_direct_ouvrir: "🔴 Watch Live",
        btn_direct_fermer: "✖ Close Live",
        lire_aussi: "Read also"
    },
    ar: {
        soustitre: "أخبار وأنشطة المجموعة البرلمانية UNDR",
        form_titre: "إضافة مقال",
        btn_publier: "نشر",
        btn_retour: "→ رجوع",
        chat_titre: "دردشة مباشرة",
        btn_envoyer: "إرسال",
        btn_partager: "📤 مشاركة التطبيق",
        btn_admin_ouvrir: "🔒 وضع المسؤول",
        btn_admin_fermer: "🔓 الخروج من وضع المسؤول",
        btn_direct_ouvrir: "🔴 متابعة البث المباشر",
        btn_direct_fermer: "✖ إغلاق البث المباشر",
        lire_aussi: "اقرأ أيضاً"
    }
};

let langueActuelle = localStorage.getItem("langueUNDR") || "fr";

/* ---------- ADMIN ---------- */
function metAJourAffichageAdmin() {
    if (estAdmin) {
        formulaireAjout.style.display = "block";
        boutonAdmin.textContent = traductions[langueActuelle].btn_admin_fermer;
    } else {
        formulaireAjout.style.display = "none";
        boutonAdmin.textContent = traductions[langueActuelle].btn_admin_ouvrir;
    }
}

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

/* ---------- MENU FILTRES (hamburger désactivé, gardé pour compatibilité) ---------- */
menuToggle.addEventListener("click", function() {
    filtresList.classList.toggle("ouvert");
});

/* ---------- AFFICHAGE DES ARTICLES ---------- */
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

/* ---------- VUES (Firebase) ---------- */
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

/* ---------- LIRE AUSSI ---------- */
function afficherLireAussi(articleActuel) {
    const zone = document.getElementById("lire-aussi");
    if (!zone) return;

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

    let html = `<h3>${traductions[langueActuelle].lire_aussi}</h3><div class='lire-aussi-grille'>`;
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

/* ---------- OUVRIR UN ARTICLE ---------- */
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

    incrementerVue(id);
    afficherVue(id);
    afficherLireAussi(art);
}

document.getElementById("retour-liste").addEventListener("click", function() {
    document.getElementById("vue-detail").style.display = "none";
    conteneur.style.display = "grid";
    filtresList.style.display = "flex";
    menuToggle.style.display = "none";
});

/* ---------- FILTRES ---------- */
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

/* ---------- SWIPE HORIZONTAL SUR LES ARTICLES ---------- */
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

/* ---------- FORMULAIRE D'AJOUT D'ARTICLE ---------- */
const champTitre = document.getElementById("nouveau-titre");
const champCategorie = document.getElementById("nouvelle-categorie");
const champResume = document.getElementById("nouveau-resume");
const boutonPublier = document.getElementById("bouton-publier");
const champImage = document.getElementById("nouvelle-image");
const champVideo = document.getElementById("nouvelle-video");

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

/* ---------- CLIC SUR UNE CARTE / SUPPRIMER ---------- */
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

/* ---------- BOUTON DIRECT FACEBOOK ---------- */
const boutonDirectEl = document.getElementById("toggle-direct");
if (boutonDirectEl) {
    boutonDirectEl.addEventListener("click", function() {
        const zone = document.getElementById("zone-direct");
        if (zone.style.display === "none") {
            zone.style.display = "block";
            this.textContent = traductions[langueActuelle].btn_direct_fermer;
        } else {
            zone.style.display = "none";
            this.textContent = traductions[langueActuelle].btn_direct_ouvrir;
        }
    });
}

/* ---------- PARTAGER L'APPLICATION ---------- */
const boutonPartagerEl = document.getElementById("partager-app");
if (boutonPartagerEl) {
    boutonPartagerEl.addEventListener("click", function() {
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
            }).catch(function() {
                prompt("Copiez ce lien manuellement :", lien);
            });
        } else {
            prompt("Copiez ce lien manuellement :", lien);
        }
    });
}

/* ---------- LANGUE ---------- */
function appliquerLangue(lang) {
    langueActuelle = lang;
    localStorage.setItem("langueUNDR", lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach(function(el) {
        const cle = el.getAttribute("data-i18n");
        if (traductions[lang][cle]) {
            el.textContent = traductions[lang][cle];
        }
    });

    metAJourAffichageAdmin();
}

document.querySelectorAll(".lang-btn").forEach(function(bouton) {
    bouton.addEventListener("click", function() {
        appliquerLangue(bouton.dataset.lang);
    });
});

/* ---------- MODE SOMBRE ---------- */
const toggleSombre = document.getElementById("toggle-sombre");
if (toggleSombre) {
    if (localStorage.getItem("modeSombreUNDR") === "true") {
        document.body.classList.add("mode-sombre");
        toggleSombre.checked = true;
    }
    toggleSombre.addEventListener("change", function() {
        document.body.classList.toggle("mode-sombre", toggleSombre.checked);
        localStorage.setItem("modeSombreUNDR", toggleSombre.checked);
    });
}

/* ---------- TAILLE DU TEXTE ---------- */
function appliquerTailleTexte(niveau) {
    const tailles = { petit: "14px", normal: "16px", grand: "19px" };
    document.body.style.fontSize = tailles[niveau] || "16px";
    localStorage.setItem("tailleTexteUNDR", niveau);
}
document.querySelectorAll(".taille-btn").forEach(function(bouton) {
    bouton.addEventListener("click", function() {
        appliquerTailleTexte(bouton.dataset.taille);
    });
});
appliquerTailleTexte(localStorage.getItem("tailleTexteUNDR") || "normal");

/* ---------- PANNEAU PARAMÈTRES ---------- */
const boutonOuvrirParametres = document.getElementById("ouvrir-parametres");
const boutonFermerParametres = document.getElementById("fermer-parametres");
if (boutonOuvrirParametres) {
    boutonOuvrirParametres.addEventListener("click", function() {
        document.getElementById("panneau-parametres").style.display = "flex";
    });
}
if (boutonFermerParametres) {
    boutonFermerParametres.addEventListener("click", function() {
        document.getElementById("panneau-parametres").style.display = "none";
    });
}

/* ---------- INITIALISATION LANGUE (à la toute fin, après tout le reste) ---------- */
appliquerLangue(langueActuelle);

/* ---------- SERVICE WORKER ---------- */
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
}