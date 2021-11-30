const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let users = {};



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/new.html');
});


io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    })
        ;
});


server.listen(3000, () => {
    console.log('listening on *:3000');
});


io.on('connection', (socket) => {

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
    });

    socket.on('new-user', (name) => {
        users[socket.id] = name;
        io.emit('user-connected', users);
    })

    socket.on('disconnect', () => {
        io.emit('user-disconnected', users[socket.id]);
        delete users[socket.id];
    })
    
});



io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' });


io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', (msg));
    });
});

