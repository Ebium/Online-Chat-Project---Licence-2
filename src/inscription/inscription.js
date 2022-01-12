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




const log_pseudo = document.getElementById("pseudo");
const log_mdp = document.getElementById("mdp");
const log_email = document.getElementById("email");
const myform = document.getElementById("main_form");


myform.addEventListener("click", function () {

  let log_pseudo2 = String(log_pseudo.value);
  let log_mdp2 = String(log_mdp.value);
  let log_email2 = String(log_email.value);



  if ((log_pseudo2.length >= 3) && (log_pseudo2.length <= 15) && (!log_pseudo2.includes(" ")) && (!log_pseudo2.includes("@"))) {

    socket.emit('inscription-user', log_pseudo2, log_mdp2, log_email2);

    socket.on('inscription_invalid_online', () => {
      alert("Pseudo déjà connecté sur le serveur !");
    })

    socket.on('inscription_invalid_email', () => {
      alert("Email invalide ! \nDoit contenir au moins '@'");
    })

    socket.on('inscription_invalid_mdp', () => {
      alert("Mot de passe invalide ! \nDoit contenir au moins 6 lettres");
    })

    socket.on('inscription_invalid_used', () => {
      alert("Pseudo déjà utilisé !");
    })

    socket.on('inscription_valid', () => {
      document.cookie = "cookie_pseudo=" + log_pseudo2 + "; path=/";
      location.href = "../index/index.html";
    })
  }
  else alert("Pseudo incorrect ! Veuillez-choisir un pseudo entre 3 et 15 lettres !\nSans caractères spéciaux !");
});


log_pseudo.addEventListener("keyup", entrer);
log_mdp.addEventListener("keyup", entrer);
log_email.addEventListener("keyup", entrer);


function entrer(event) {

  if ((event.keyCode === 13)) {

    let log_pseudo2 = String(log_pseudo.value);
    let log_mdp2 = String(log_mdp.value);
    let log_email2 = String(log_email.value);


    event.preventDefault();
    if ((log_pseudo2.length >= 3) && (log_pseudo2.length <= 15) && (!log_pseudo2.includes(" ")) && (!log_pseudo2.includes("@"))) {

      socket.emit('inscription-user', log_pseudo2, log_mdp2, log_email2);

      socket.on('inscription_invalid_online', () => {
        alert("Pseudo déjà connecté sur le serveur !");
      })

      socket.on('inscription_invalid_email', () => {
        alert("Email invalide ! \nDoit contenir au moins '@'");
      })

      socket.on('inscription_invalid_mdp', () => {
        alert("Mot de passe invalide ! \nDoit contenir au moins 6 lettres");
      })

      socket.on('inscription_invalid_used', () => {
        alert("Pseudo déjà utilisé !");
      })

      socket.on('inscription_valid', () => {
        document.cookie = "cookie_pseudo=" + log_pseudo2 + "; path=/";
        location.href = "../index/index.html";
      })
    }
    else alert("Pseudo incorrect ! Veuillez-choisir un pseudo entre 3 et 15 lettres !\nSans caractères spéciaux !");
  }
}
