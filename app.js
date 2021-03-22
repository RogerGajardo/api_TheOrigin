'use strict'

//Cargar modulos de node para crear el server

const express = require('express');
const bodyParser = require('body-parser'); //convierte los datos de las peticiones a JSON automaticamente

//Ejecutar express (para trabajar con http)
const app = express();

// Cargar ficheros rutas
const product_routes = require('./routes/product');
const article_routes = require('./routes/article');

//Middlewares (algo que se ejecuta antes de cargar una ruta o url de la app)

app.use(bodyParser.urlencoded({extended:false})); //Esto es cargar el body parser para utilizarlo
app.use(bodyParser.json());//Aqui se utiliza, convierte cualquier peticion a json

//CORS Permite peticiones del front 
// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//A;adir prefijos a rutas
app.use('/api/products', product_routes);
app.use('/api/articles', article_routes);

//Ruta o metodo de prueba para el API REST
// app.get('/probando', (req, res) => {

//     return res.status(200).send({
//         web: 'The Origin',
//         autor: 'Roger Gajardo'
//     });

// });

//Exportar modulos (fichero actual)
module.exports = app;

