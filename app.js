const path = require('path');
const express = require('express');
const OS = require('os');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const app = express();
const cors = require('cors');

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(cors());

// Conectar a MongoDB solo si no estamos en modo de prueba o NODE_ENV no está definido
if (process.env.NODE_ENV && process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URI, {
        user: process.env.MONGO_USERNAME,
        pass: process.env.MONGO_PASSWORD,
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, function(err) {
        if (err) {
            console.log("error!! " + err.message);
        } else {
            console.log("MongoDB Connection Successful");
        }
    });
} else {
    console.log('Skipping MongoDB connection in test mode or undefined NODE_ENV');
}

// Definir esquema y modelo de MongoDB (solo para modo no-test)
let planetModel;
if (process.env.NODE_ENV && process.env.NODE_ENV !== 'test') {
    var Schema = mongoose.Schema;
    var dataSchema = new Schema({
        name: String,
        id: Number,
        description: String,
        image: String,
        velocity: String,
        distance: String
    });
    planetModel = mongoose.model('planets', dataSchema);
} else {
    // Datos estáticos para pruebas
    planetModel = {
        findOne: function(query, callback) {
            const planets = [
                { id: 1, name: 'Mercury' },
                { id: 2, name: 'Venus' },
                { id: 3, name: 'Earth' },
                { id: 4, name: 'Mars' },
                { id: 5, name: 'Jupiter' },
                { id: 6, name: 'Saturn' },
                { id: 7, name: 'Uranus' },
                { id: 8, name: 'Neptune' }
            ];
            const planet = planets.find(p => p.id === query.id) || null;
            callback(null, planet); // Simula la callback de Mongoose sin error
        }
    };
}

// Endpoint para obtener información de planetas
app.post('/planet', function(req, res) {
    planetModel.findOne({
        id: req.body.id
    }, function(err, planetData) {
        if (err || !planetData) {
            res.status(404).send("Error in Planet Data or Planet not found");
        } else {
            res.send(planetData);
        }
    });
});

app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, '/', 'index.html'));
});

app.get('/os', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "os": OS.hostname(),
        "env": process.env.NODE_ENV
    });
});

app.get('/live', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "status": "live"
    });
});

app.get('/ready', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "status": "ready"
    });
});

app.listen(3000, () => {
    console.log("Server successfully running on port - " + 3000);
});

module.exports = app;