const io = require('socket.io').listen(8888);
const mongo = require('mongodb').MongoClient;

mongo.connect('mongodb://127.0.0.1/doppio', (err, db) => {
    if (err) {
        throw err
    }
    console.log('connected db');

    let prod = db.collection('products');
    let users = db.collection('users');
    let tables = db.collection('tables');

    io.on('connection', socket => {
        console.log('connection is a go');

        socket.on('getProds', (data) => {
            prod.find({}).limit(100).sort({ _id: 1 }).toArray((err, res) => {
                if (err) {
                    throw err
                }
                socket.broadcast.emit('prods', res);
            });
        });

        socket.on('callWaiter', (data) => {
            console.log('something', data);
            socket.broadcast.emit('WaiterCall', data); // emit an event to the socket

        }); // listen to the event

        socket.on('order', (data) => {
            prod.insert({ name: name, message: message }, () => {
                socket.broadcast.emit('output', [data]);
                // send status object
                sendStatus({
                    message: "Message sent",
                    clear: true
                });
            });
        });

    }); // end socket


});