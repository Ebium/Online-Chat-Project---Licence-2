const messageForm = document.getElementById('sendMessage');
const chatWindow = document.getElementById('chatWindow');
const messageInput = document.getElementById('messageText');

const name = prompt("Nickname:");
addMessage(`${name} Welcome!`);
socket.emit('new-user', name);

socket.on('chat-message', data => {
    addMessage(`${data.name} : ${data.message}`);
});

socket.on('user-connected', name => {
    addMessage(`${name} you have joined`);
});

socket.on('user-disconnected', name => {
    addMessage(`${name} user disconnected form the server`);
});

messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    addMessage(`Ty : ${message}`);
    socket.emit('send-chat-message', message);
    messageInput.value = '';
});

function addMessage(message) {
    const chatMessage = document.createElement('div');
    const addUserName = document.createElement('h3');
    chatMessage.classList.add("message");
    chatMessage.innerText = message;
    chatWindow.append(chatMessage);
}