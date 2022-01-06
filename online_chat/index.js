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
    database: `heroku_f664f164cab04d3`
});






let connected_users = {};


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/accueil/accueil.html');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/index/index.html');
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

function create_token() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}



//lorsque qu'on est connecté
io.on('connection', (socket) => {



    socket.on('chat message', (msg) => {
        console.log('message: ' + emoji.emojify(msg["msg"]));
        //console.log(connected_users);
    });



    socket.on('connection-user-no-pseudo', (pseudo) => {
        var valid = true;
        var myrandomtoken = create_token();
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
                connected_users[socket.id] = ['empty', pseudo, myrandomtoken];
            }
            else socket.emit("connection_no_pseudo_invalid");
        }
        first();
    })



    socket.on('connection-user', (pseudo, mdp, mode) => {
        var valid = true;
        var myrandomtoken = create_token();
        var new_pseudo = pseudo;

        for (ids in connected_users) {
            if ((connected_users[ids][1] == pseudo)) {
                valid = false;
                break;
            }
        }
        function first() {
            con.query("SELECT mdp,pseudo FROM utilisateurs WHERE " + mode + " = '" + pseudo + "'", function (err, result) {

                if (mode == "email") new_pseudo = result[0].pseudo;
                if (pseudo != result[0].pseudo || mdp != result[0].mdp) {
                    valid = false;
                }
                second();
            });
        }
        function second() {
            if (valid) {
                socket.emit("connection_valid");
                connected_users[socket.id] = ['empty', new_pseudo, myrandomtoken];
                //console.log(connected_users);
            }
            else socket.emit("connection_invalid");

        }
        first();

    })



    socket.on('inscription-user', (pseudo, mdp, email) => {
        var valid = true;
        var myrandomtoken = create_token();

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
                connected_users[socket.id] = ['empty', pseudo, myrandomtoken];
            }
        }
        if (valid) first();
        else socket.emit('inscription_invalid_online');
    })



    socket.on('register_me', (pseudo) => {
        for (ids in connected_users) {
            if (connected_users[ids][1] == pseudo) {
                connected_users[ids][0] = socket.id;
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
                delete connected_users[mytoken];
            }
        }
        //console.log(connected_users);
    })




});



io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' });


io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        msg["msg"] = emoji.emojify(msg["msg"]);
        io.emit('chat message', (msg));
    });
});