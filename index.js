const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = process.env.PORT || 3000;
var emoji = require('node-emoji');
var path = require('path');

app.use(express.static(path.join(__dirname, 'src')));


const mysql = require('mysql');



const con = mysql.createPool({

    host: "eu-cdbr-west-02.cleardb.net",
    user: "b6c855de08ba54",
    password: "5e32ffd5",
    database: `heroku_f664f164cab04d3`,
    multipleStatements: true
});

var sql = "DELETE FROM testonline ";
con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("testonline rafraichi");
});

/* Raffraichi la table ban chaque minute : toutes les 60 000 ms pour enlever les personnes banni qui ont dépasser leurs de temps de bannissements*/
setInterval(() => {
    var sql = "DELETE FROM ban WHERE temps < NOW() + INTERVAL 1 HOUR";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table ban rafraichi");
    });
}, 60000);





let connected_users = {};


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/accueil/accueil.html');
});


server.listen(PORT, () => {
    setTimeout(() => { console.log('Server is loading ...'); }, 1000)
    setTimeout(() => { console.log('Server is operationnal !'); }, 2000)
});

io.on('connection', (socket) => {
    console.log('a user joined the server');
    socket.on('disconnect', () => {
        console.log('user left the server');
    });
});



//lorsque qu'on est connecté
io.on('connection', (socket) => {



    socket.on('chat message', (msg) => {
        console.log('message: ' + emoji.emojify(msg["msg"]));
    });



    socket.on('connection-user-no-pseudo', (pseudo) => {
        var valid = true;
        for (ids in connected_users) {
            if ((connected_users[ids][1] == pseudo)) {
                valid = false;
                break;
            }
        }
        function first() {
            con.query("SELECT pseudo FROM utilisateurs WHERE pseudo = '" + pseudo + "'", function (err, result) {
                if (result.length > 0) {
                    valid = false;
                }
                second();
            });
        }
        function second() {
            if (valid) {
                socket.emit('connection_no_pseudo_valid');
                connected_users[socket.id] = ['empty', pseudo];
            }
            else socket.emit("connection_no_pseudo_invalid");
        }
        first();
    })



    socket.on('connection-user', (pseudo, mdp) => {
        var valid = true;

        for (ids in connected_users) {
            if ((connected_users[ids][1] == pseudo)) {
                valid = false;
                break;
            }
        }
        function first() {
            con.query("SELECT mdp,pseudo FROM utilisateurs WHERE pseudo = '" + pseudo + "'", function (err, result) {

                if (pseudo != result[0].pseudo || mdp != result[0].mdp) {
                    valid = false;
                }
                second();
            });
        }
        function second() {
            if (valid) {
                socket.emit("connection_valid");
                connected_users[socket.id] = ['empty', pseudo];
            }
            else socket.emit("connection_invalid");

        }
        first();

    })



    socket.on('inscription-user', (pseudo, mdp, email) => {
        var valid = true;

        for (ids in connected_users) {
            if ((connected_users[ids][1] == pseudo)) {
                valid = false;
                break;
            }
        }
        function first() {
            con.query("SELECT pseudo FROM utilisateurs WHERE pseudo = '" + pseudo + "'", function (err, result) {
                if (!email.includes("@")) {
                    valid = false;
                    socket.emit('inscription_invalid_email');
                }
                if (mdp.length <= 5) {
                    valid = false;
                    socket.emit('inscription_invalid_mdp');
                }
                else if (result.length > 0) {
                    valid = false;
                    socket.emit('inscription_invalid_used');
                }
                second();
            });
        }
        function second() {
            if (valid) {
                var sql = "INSERT INTO utilisateurs (pseudo, mdp, email) VALUES ('" + pseudo + "', '" + mdp + "','" + email + "')";
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("user enregistré dans la bdd");
                });
                socket.emit('inscription_valid');
                connected_users[socket.id] = ['empty', pseudo];
            }
        }
        if (valid) first();
        else socket.emit('inscription_invalid_online');
    })



    socket.on('register_me', (pseudo) => {
        for (ids in connected_users) {
            if (connected_users[ids][1] == pseudo) {
                connected_users[ids][0] = socket.id;

                /* Met l'utilisateur dans la table testonline qui permet de référencer les personnes en ligne */
                var sql = "INSERT INTO testonline (id, pseudo) VALUES ('" + socket.id + "', '" + pseudo + "')";
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("1 utilisateur en ligne de test online");
                });
            }
        }
        io.emit('user-connected', connected_users);
        //console.log(connected_users);
    });



    socket.on('disconnect', () => {
        var mytoken = "";
        for (ids in connected_users) {
            if (connected_users[ids][0] == socket.id) {
                mytoken = ids;
                break;
            }
        }
        if (mytoken in connected_users) {
            if (connected_users[mytoken][0] != 'empty') {
                io.emit('user-disconnected', connected_users[mytoken][1]);

                var sql = "DELETE FROM testonline WHERE id = '" + socket.id + "'";
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("1 utilisateur deconnecte de testonline");
                })

                delete connected_users[mytoken];
            }
        }
        //console.log(connected_users);
    })


    /* Deconnecte celui qui envoie le signal */
    socket.on('forceDisconnect', function () {
        socket.disconnect();
    });

    /* Envoie un signal à "nom" qui permet de le bannir, si c'est un utilisateur, il sera mis dans la table ban sinon il créera un cookie ban, puis il se fait deconnecter du serveur */
    socket.on("ban", (duree, nom) => {

        var sql = "SELECT id FROM testonline WHERE pseudo = '" + nom + "';SELECT * FROM utilisateurs where pseudo = '" + nom + "'";
        con.query(sql, function (err, results) {
            if (err) throw err;

            if (results[0][0]) {
                if (results[1][0]) {
                    let temps = "";
                    if (duree)
                        temps = "+" + duree;
                    var sql = "insert into ban (userID,temps) Values('" + results[1][0].id + "',NOW()+ interval + 60" + temps + " minute);"
                    con.query(sql, function (err) {
                        if (err) throw err;
                    })
                }
                else {
                    if (duree) {

                        io.to(results[0][0].id).emit("cookie", duree);
                    }
                    else {
                        io.to(results[0][0].id).emit("cookie", 0);
                    }
                }


                io.to(results[0][0].id).emit("deco", "ban");
                console.log("Utilisateur banni");
            }
            
        })
    })

    /* Verifie si l'utilisateur est dans la table ban */
    socket.on("ban?", (pseudo) => {
        con.query("SELECT id FROM utilisateurs WHERE pseudo ='" + pseudo + "'", function (err, result) {
            con.query("SELECT userID FROM ban WHERE userID = '" + result[0].id + "'", function (err, res) {
                socket.emit("ban?", res[0]);
            });

        });
    })

    /* Envoie un signal à "nom" qui permet de le deconnecter */
    socket.on("kick", (nom) => {
        var sql = "SELECT id FROM testonline WHERE pseudo = '" + nom + "'";
        con.query(sql, function (err, result) {
            if (err) throw err;
            if (result[0])
                io.to(result[0].id).emit("deco", "kick");
            console.log("Utilisateur expulse");
        })
    })

    socket.on("admin?", (username) => {
        con.query("Select admin from utilisateurs where pseudo = '" + username + "'", function (err, result) {
            if (err) throw err;
            if (result[0]) {
                if (result[0].admin == 1) {
                    socket.emit("admin", true);
                }
            }
        })
    })

    socket.on("mettreadmin", (username) => {
        con.query("Select admin from utilisateurs where pseudo = '" + username + "'", function (err, result) {
            if (err) throw err;
            if (result[0]) {
                con.query("UPDATE utilisateurs SET admin = 1 WHERE pseudo = '" + username + "'", function (err, result) {
                    if (err) throw err;
                })
            }
        })
    })

    socket.on("enlever", (username) => {
        con.query("Select admin from utilisateurs where pseudo = '" + username + "'", function (err, result) {
            if (err) throw err;
            if (result[0]) {
                con.query("UPDATE utilisateurs SET admin = 0 WHERE pseudo = '" + username + "'", function (err, result) {
                    if (err) throw err;
                })
            }
        })
    })

});



io.on('connection', (socket) => {


    socket.on('chat message', (msg) => {
        msg["msg"] = emoji.emojify(msg["msg"]);

        if (msg["msg"][0] == "/") {
            if (msg["msg"].slice(0, 3) == "/w ")
                whisper(msg);
            
        }
        else
            io.emit('chat message', (msg));

    });
    
      function whisper(msg) {

        let pm_user = "";
        let i = 3;
        while (msg["msg"][i] != " ") {
            i++;
        }
        pm_user = msg["msg"].slice(3, i);
        msg["msg"] = msg["msg"].slice(i);

        var sql = "SELECT id FROM testonline WHERE pseudo = '" + pm_user + "'";
        con.query(sql, function (err, result) {
            if (err) throw err;
            if (result[0]) {
                io.to(socket.id).emit('private message', (msg));
                io.to(result[0].id).emit('private message', (msg));
            }

        })

    }
    
});