var socket = io();

function pseudo_cookie() {
    let testcookie = document.cookie;
    var chaine = "";
    var i = 0;
    while (testcookie[i] != "=") i++;
    i++;
    while (testcookie[i]) {
        chaine += testcookie[i];
        i++;
    }
    return chaine;
}



const log_pseudo = document.getElementById("idconnexion");
const log_mdp = document.getElementById("mdp");
const myform = document.getElementById("main_form");


myform.addEventListener("click", function () {

    let log_pseudo2 = String(log_pseudo.value);
    let log_mdp2 = String(log_mdp.value);
    let connection_mode = "pseudo";

    if (log_pseudo2.includes("@")) {
        connection_mode = "email";
        socket.emit('connection-user', log_pseudo2, log_mdp2, connection_mode);


        socket.on('connection_invalid', () => {
            alert("Identifiants incorrects !");
        })

        socket.on('connection_valid', () => {
            document.cookie = "cookie_pseudo=" + log_pseudo2 + "; path=/";
            location.href = "../index/index.html";
        })

    }

    else if ((log_pseudo2.length >= 3) && (log_pseudo2.length <= 15) && (!log_pseudo2.includes(" "))) {
        connection_mode = "pseudo";

        socket.emit('connection-user', log_pseudo2, log_mdp2, connection_mode);


        socket.on('connection_invalid', () => {
            alert("Identifiants incorrects !\nCe pseudo est peut-être déjà connecté\nsinon\nVotre mot de passe/pseudo/email est incorrect");
        })

        socket.on('connection_valid', () => {
            document.cookie = "cookie_pseudo=" + log_pseudo2 + "; path=/";
            location.href = "../index/index.html";
        })
    }
    else alert("Pseudo incorrect ! Veuillez-choisir un pseudo entre 3 et 15 lettres !\nSans caractères spéciaux !");
});


log_pseudo.addEventListener("keyup", entrer);
log_mdp.addEventListener("keyup", entrer);

function entrer(event) {

    if ((event.keyCode === 13)) {

        let log_pseudo2 = String(log_pseudo.value);
        let log_mdp2 = String(log_mdp.value);
        let connection_mode = "pseudo";

        event.preventDefault();
        if (log_pseudo2.includes("@")) {
            connection_mode = "email";
            socket.emit('connection-user', log_pseudo2, log_mdp2, connection_mode);
            socket.on('connection_invalid', () => {
                alert("Identifiants incorrects !");
            })
            socket.on('connection_valid', () => {
                document.cookie = "cookie_pseudo=" + log_pseudo2 + "; path=/";
                location.href = "../index/index.html";
            })
        }

        else if ((log_pseudo2.length >= 3) && (log_pseudo2.length <= 15) && (!log_pseudo2.includes(" "))) {
            connection_mode = "pseudo";
            socket.emit('connection-user', log_pseudo2, log_mdp2, connection_mode);
            socket.on('connection_invalid', () => {
                alert("Identifiants incorrects !");
            })

            socket.on('connection_valid', () => {
                document.cookie = "cookie_pseudo=" + log_pseudo2 + "; path=/";
                location.href = "../index/index.html";
            })
        }
        else alert("Pseudo incorrect ! Veuillez-choisir un pseudo entre 3 et 15 lettres !\nSans caractères spéciaux !");
    }
}