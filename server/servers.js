//Where the servers io / express are created
const express = require('express')
const app = express()
app.use(express.static(__dirname+'/../public'));
const expressServer =  app.listen(7000);
const socketio = require('socket.io');
const io = socketio(expressServer);

module.exports = {
    app,
    io
}