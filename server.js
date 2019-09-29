const io = require('socket.io').listen(8888);
const mongo = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;


mongo.connect('mongodb://127.0.0.1/doppio', (err, db) => {
    if (err) {
        throw err
    }
    console.log('connected db');
    console.log('Server running on 8888');

    let prod = db.collection('products');
    let users = db.collection('users');
    let tables = db.collection('tables');
    let orders = db.collection('orders');

    io.on('connection', socket => {
        console.log('connection is a go');

        socket.on('getProds', (data) => {
            console.log('data:', data)
            prod.find({}).limit(100).sort({ _id: 1 }).toArray((err, res) => {
                if (err) {
                    throw err
                }
                io.to(socket.id).emit('prods', res);
            });
        });

        socket.on('getTables', (data) => {
            console.log('data:', data)
            tables.find({}).limit(100).sort({ _id: 1 }).toArray((err, res) => {
                if (err) {
                    throw err
                }
                io.to(socket.id).emit('tables', res);
            });
        });

        // getting orders
        socket.on('getForTab', (data) => {
            console.log('data:', data);
            orders.find({ table: data, status: 'active' }).toArray((err, res) => {
                if (err) {
                    throw err
                }
                console.log('res:', res);
                io.to(socket.id).emit('orderForTab', res);
            });
        });

        // getting orders made per customer
        socket.on('forPay', (data) => {
            console.log('socket id :', socket.id);

            console.log('data:', data);
            orders.find({ table: data, status: 'active' }).toArray((err, res) => {
                if (err) {
                    throw err
                }
                console.log('res:', res);
                io.to(socket.id).emit('bill', res);
            });
        });


        // calling waiter
        socket.on('callWaiter', (data) => {
            socket.broadcast.emit('WaiterCall', data);
        });

        socket.on('order', (data) => {
            const val = data.orders;
            const num = Number(data.table)
            val.forEach(e => {
                delete e['index'];
                delete e['img'];
                delete e['description'];
                delete e['_id'];
                delete e['id'];
            });
            try {
                orders.insertOne(data, () => {
                    console.log('order placed for tabel:=> ', num);
                    tables.update({ num: num }, { $set: { active: 'true' } });
                });

            } catch (error) {
                console.log('something happened');
            }
        });

        socket.on('updateOrder', (data) => {
            const val = data.orders;
            console.log('val:', data.table)

            val.forEach(e => {
                delete e['index'];
                delete e['img'];
                delete e['description'];
                delete e['_id'];
                delete e['id'];
                orders.update({ table: data.table, status: 'active' }, { $push: { orders: e } });
            });

        });

        socket.on('clearOrder', (data) => {
            try {
                const num = Number(data)
                console.log('clear order, ', num);
                orders.updateMany({ table: num }, { $set: { status: 'done' } });
                tables.update({ num: num }, { $set: { active: 'false' } });
            } catch (error) {
                console.error('something update');
            }
        });

        socket.on('product', (data) => {
            console.log('data:', data);
            const products = data.products;
            const id = data.products._id;
            console.log('id:', id);
            const type = data.type;
            const title = products.title,
                cat = products.cat,
                description = products.description,
                img = products.img,
                price = products.price;

            try {
                if (type === 'update') {
                    prod.updateOne({ _id: new ObjectID(id) }, { title, cat, description, img, price });
                    console.log('updating');
                } else if (type === 'insert') {
                    prod.insertOne({ title, cat, description, img, price }, () => {});
                } else if (type === 'delete') {
                    prod.deleteOne({ _id: new ObjectID(id) })
                        .then(result => console.log(`Deleted ${result.deletedCount} item.`))
                        .catch(err => console.error(`Delete failed with error: ${err}`))
                }
            } catch (error) {
                console.error('something update ', error);
            }
        });

    }); // end socket
});


// socket.emit('message', "this is a test"); //sending to sender-client only
// socket.broadcast.emit('message', "this is a test"); //sending to all clients except sender
// socket.broadcast.to('game').emit('message', 'nice game'); //sending to all clients in 'game' room(channel) except sender
// socket.to('game').emit('message', 'enjoy the game'); //sending to sender client, only if they are in 'game' room(channel)
// socket.broadcast.to(socketid).emit('message', 'for your eyes only'); //sending to individual socketid
// io.emit('message', "this is a test"); //sending to all clients, include sender
// io.in('game').emit('message', 'cool game'); //sending to all clients in 'game' room(channel), include sender
// io.of('myNamespace').emit('message', 'gg'); //sending to all clients in namespace 'myNamespace', include sender
// socket.emit(); //send to all connected clients
// socket.broadcast.emit(); //send to all connected clients except the one that sent the message
// socket.on(); //event listener, can be called on client to execute on server
// io.sockets.socket(); //for emiting to specific clients
// io.sockets.emit(); //send to all connected clients (same as socket.emit)
// io.sockets.on() ; //initial connection from a client.