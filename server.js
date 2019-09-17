const io = require('socket.io').listen(8888);
const mongo = require('mongodb').MongoClient;



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
                socket.emit('prods', res);
            });
        });
        socket.on('getTables', (data) => {
            console.log('data:', data)
            tables.find({}).limit(50).sort({ _id: 1 }).toArray((err, res) => {
                if (err) {
                    throw err
                }
                socket.emit('tables', res);
            });
        });

        socket.on('callWaiter', (data) => {
            console.log('something', data);
            socket.emit('WaiterCall', data); // emit an event to the socket
        });

        socket.on('order', (data) => {
            // console.log('data before:', data);

            const val = data.orders;
            val.forEach(e => {
                for (let p in e) {
                    delete e['index'];
                    delete e['img'];
                    delete e['description'];
                    delete e['_id'];
                    delete e['id'];
                }
            });
            // console.log('this is the data: =>', data)
            try {
                orders.insertOne(data, () => {
                    // socket.emit('order placed');
                    console.log('order placed');
                });
            } catch (error) {
                console.log('something happened')
            }
        });

    }); // end socket
});