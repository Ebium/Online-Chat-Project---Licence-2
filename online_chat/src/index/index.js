var socket = io();



//------------------- GESTION MUSIQUE -------------------------
function play() {
    if (confirm_boolean) {
        const confirm_music = window.confirm("Voulez-vous activer la musique en arrière plan ? \n Le son pourra être coupé ensuite si voulu.");
        if (confirm_music) document.getElementById("music_audio" + cpt_music + "").play();
        confirm_boolean = false;
    }

    mymusic = document.getElementById("music_audio" + cpt_music + "");
    mymusicbutton = document.getElementById("music_button");
    document.getElementById("music_audio" + cpt_music + "").volume = 0.05;

    if (mymusicbutton.innerText == "Mute") {
        mymusic.muted = true;
        mymusicbutton.innerText = "Unmute";
    }
    else {
        mymusic.muted = false;
        mymusicbutton.innerText = "Mute";
    }
}

function playnext() {
    if (!confirm_boolean) {
        document.getElementById("music_audio" + cpt_music + "").currentTime = 0;
        document.getElementById("music_audio" + cpt_music + "").muted = true;
        document.getElementById("music_audio" + cpt_music + "").pause();
        if (cpt_music < 6) {
            cpt_music++;
        }
        else if (cpt_music == 6) {
            cpt_music = 1;
        }
        document.getElementById("music_audio" + cpt_music + "").volume = 0.05;
        document.getElementById("music_audio" + cpt_music + "").muted = false;
        document.getElementById("music_audio" + cpt_music + "").play();
    }
}

//---------------------------------------------------------------





/*logo anim.*/
/*-----------------------------------------------------------------------------------------*/
const logos = document.getElementById("logos");
var t = 1;


logos.addEventListener('click', function () {
    if (t == 0) {
        logos.classList.remove("rot_anim_2");
        logos.classList.add("rot_anim_1");
        t = 1;
    }
    else {
        logos.classList.remove("rot_anim_1");
        logos.classList.add("rot_anim_2");
        t = 0;
    }
});



/*Messagerie*/
/*-----------------------------------------------------------------------------------------*/


const chatbox = document.querySelector("#tchatboxa");
const heurebox = document.querySelector("#tchathour");
const usersbox = document.querySelector("#userboxa");
const msgform = document.getElementById("msgtest");
let myUsername;


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

myUsername = pseudo_cookie();
if (myUsername == "") location.href = '../accueil/accueil.html';
else document.cookie = document.cookie = "cookie_pseudo=; path=/";


var couleur = 0;





/*----------send message + affichage pseudo--------*/

var input = document.getElementById('usermsg');



let allUsers = [];

socket.emit('register_me',(myUsername));

socket.on('user-connected', (users) => {
    let username;
    const usersbox = document.querySelector("#userboxa");
    for (id in users) {
        if (!allUsers.includes(id[1])) {
            allUsers.push(id[1]);
            username = document.createElement('p');
            username.classList.add("backLine");
            username.textContent = users[id][1];
            username.style.color = "white";
            usersbox.insertAdjacentElement("beforeEnd", username);


        }
    }
})


msgform.addEventListener('submit', function (event) {
    event.preventDefault();
    if (input.value) {
        socket.emit('chat message', {
            msg: input.value, pseudo: myUsername
        });
        input.value = '';
    }
});


socket.on('user-disconnected', (name) => {
    const usersbox = document.querySelector("#userboxa");
    let pseudo = usersbox.querySelectorAll('p');

    for (let i = 0; i < pseudo.length; i++) {
        if ((pseudo[i].textContent) == name) {
            pseudo[i].remove();
            break;
        }
    }

})


socket.on('chat message', function (msg) {
    var now = new Date();
    var heure = now.getHours();
    var minute = now.getMinutes();

    let message = msg["msg"];
    if (message != "") {
        let newhourline = document.createElement('p');
        newhourline.classList.add("backLine");
        if (heure >= 0 && heure <= 9) { newhourline.textContent = "0" + heure; }
        else {
            newhourline.textContent += heure;
        }
        if (minute >= 0 && minute <= 9) { newhourline.textContent += " : " + "0" + minute; }
        else {
            newhourline.textContent += " : " + minute;
        }


        let newMessageLine = document.createElement('p');
        newMessageLine.classList.add("backLine");
        newMessageLine.textContent = msg["pseudo"] + " : " + message;

        if (couleur) {
            newMessageLine.classList.add("grad_bg")
            couleur = 0;
        }
        else {
            newMessageLine.classList.remove("grad_bg")
            couleur = 1;
        }



        chatbox.insertAdjacentElement("beforeEnd", newMessageLine);
        heurebox.insertAdjacentElement("beforeEnd", newhourline);

        let divHeight = chatbox.getBoundingClientRect().height;
        let LineHeight = newhourline.getBoundingClientRect().height;
        let nbLignesTotal = parseInt(divHeight / LineHeight);
        let msgHeight = newMessageLine.getBoundingClientRect().height;
        let nbLignesMsg = parseInt((msgHeight / LineHeight));

        for (let i = 1; i < nbLignesMsg; i++) {
            newhourline.insertAdjacentElement("afterend", document.createElement("br"));
        }

        //messageContent.value = "";  ligne a suppr


        chatbox.chatboxTop = chatbox.chatboxHeight;
        chatbox.animate({ chatboxTop: chatbox.chatboxHeight });
        chatbox.scrollBy({
            top: newMessageLine.getBoundingClientRect().bottom,
            left: 0,
            behavior: "smooth"

        });

        heurebox.chatboxTop = heurebox.chatboxHeight;
        heurebox.animate({ chatboxTop: heurebox.chatboxHeight });
        heurebox.scrollBy({
            top: newhourline.getBoundingClientRect().bottom,
            left: 0,
            behavior: "smooth"

        });
    }

});
