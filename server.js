const io = require('socket.io').listen(8888).sockets();


io.on('connection', socket => {
    console.log('connection is a go');
    socket.on('callWaiter', () => {
        socket.emit('WaiterCall'); // emit an event to the socket

    }); // listen to the event
});