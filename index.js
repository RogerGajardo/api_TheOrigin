'use strict'

const mongoose = require('mongoose');
const app = require('./app');
const port = 3900;



// conexion mongo
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api_rest_origin', {useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('La conexion a la base de datos se ha realizado correctamente.');

            // Crear Server y escuchar peticiones HTTP con Express
            app.listen(port, () => {
                console.log('Server corriendo en http://localhost:' + port);
            });
            
});