const firebaseConfig = {
    apiKey: "AIzaSyBHHQ42Fk_T7dqUny9jbfenie0M8136Ewg",
    authDomain: "cagp-undr.firebaseapp.com",
    projectId: "cagp-undr",
    storageBucket: "cagp-undr.firebasestorage.app",
    messagingSenderId: "1040772130693",
    appId: "1:1040772130693:web:cdcb4d315f2525988006ec"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const chatMessages = document.getElementById("chat-messages");
const chatPseudo = document.getElementById("chat-pseudo");
const chatMessageInput = document.getElementById("chat-message");
const chatEnvoyer = document.getElementById("chat-envoyer");

db.collection("messages")
    .orderBy("date", "asc")
    .limit(50)
    .onSnapshot(function(snapshot) {
        chatMessages.innerHTML = "";
        snapshot.forEach(function(doc) {
            const msg = doc.data();
            const div = document.createElement("div");
            div.className = "chat-msg";
            div.innerHTML = `<strong>${msg.pseudo} :</strong> ${msg.texte}`;
            chatMessages.appendChild(div);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

chatEnvoyer.addEventListener("click", function() {
    const pseudo = chatPseudo.value.trim() || "Anonyme";
    const texte = chatMessageInput.value.trim();
    if (texte === "") return;

    db.collection("messages").add({
        pseudo: pseudo,
        texte: texte,
        date: firebase.firestore.FieldValue.serverTimestamp()
    });

    chatMessageInput.value = "";
});