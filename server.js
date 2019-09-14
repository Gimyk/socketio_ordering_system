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
            console.log('data:', data)
            prod.find({}).limit(100).sort({ _id: 1 }).toArray((err, res) => {
                if (err) {
                    throw err
                }
                socket.emit('prods', res);
            });
        });

        socket.on('callWaiter', (data) => {
            console.log('something', data);
            socket.emit('WaiterCall', data); // emit an event to the socket
        });

        socket.on('order', (data) => {
            tables.updateOne({ name: name, message: message }, () => {
                socket.emit('order placed');
            });
        });

    }); // end socket


});