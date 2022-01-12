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




const log_input = document.getElementById("idconnexion");
const myform = document.getElementById("main_form");



myform.addEventListener("click", function () {

    let log_pseudo = String(log_input.value);

    if ((log_pseudo.length >= 3) && (log_pseudo.length <= 15) && (!log_pseudo.includes(" ")) && (!log_pseudo.includes("@"))) {
        

        var bancookie = getCookie("ban");
        if (bancookie)
            alert("Vous etes banni");
        else {
            socket.emit('connection-user-no-pseudo', (log_pseudo));
            socket.on('connection_no_pseudo_invalid', () => {
                alert("Pseudo déjà utilisé");
            })
            socket.on('connection_no_pseudo_valid', () => {
                    document.cookie = "cookie_pseudo=" + log_pseudo + "; path=/";
                    location.href = "../index/index.html";
            })
        }
    }
    else alert("Pseudo incorrect ! Veuillez-choisir un pseudo entre 3 et 15 lettres !\nSans caractères spéciaux !");
})

/* Get cookie pour savoir si l'utilisateur est ban */
function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    }
    else {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
            end = dc.length;
        }
    }
    return decodeURI(dc.substring(begin + prefix.length, end));
}


log_input.addEventListener("keyup", function (event) {


    if ((event.keyCode === 13)) {
        let log_pseudo = String(log_input.value);

        event.preventDefault();
        if ((log_pseudo.length >= 3) && (log_pseudo.length <= 15) && (!log_pseudo.includes(" ")) && (!log_pseudo.includes("@"))) {
            
            var bancookie = getCookie("ban");
            if (bancookie)
                alert("Vous etes banni");
            else {
                socket.emit('connection-user-no-pseudo', (log_pseudo));
                socket.on('connection_no_pseudo_invalid', () => {
                    alert("Pseudo déjà utilisé");
                })
                socket.on('connection_no_pseudo_valid', () => {
                    document.cookie = "cookie_pseudo=" + log_pseudo + "; path=/";
                    location.href = "../index/index.html";
                })
            }

        }
        else alert("Pseudo incorrect ! Veuillez-choisir un pseudo entre 3 et 15 lettres !\nSans caractères spéciaux !");
    }

});


