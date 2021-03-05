'use-strict'

const validator = require('validator');
const Product = require('../models/product');
const fs = require('fs');
const path = require('path');
const { exists } = require('../models/product');

const controller = {

    datosProducto: (req, res) => {
        return res.status(200).send({
            status: 'success',
            web: 'The Origin',
            autor: 'Roger Gajardo'
        });
    },
    test: (req, res) => {
        return res.status(200).send({
            status: 'success',
            message: 'Soy la Accion test de mi controller de productos'
        });
    },

    save: (req, res) => {

        //Recargar parametros por post

        const params = req.body;
        
        //Validar datos (validator)

        try {

            var validate_name = !validator.isEmpty(params.name);
            var validate_description = !validator.isEmpty(params.description);
            var validate_precio = !validator.isEmpty(params.precio);
            
        } catch (err) {
            return res.status(404).send({
                status: 'error',
                message: 'Faltan datos'
            });
        }
        
        if (validate_name && validate_description && validate_precio) {

            //Crear el objeto a guardar
            const product = new Product();

            //Asignar valores
            product.name = params.name;
            product.description = params.description;
            product.image = null;
            product.precio = params.precio;

            //Guardar el producto

            product.save((err, productStored) => {

                if (err || !productStored) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'El producto no se a guardado'
                    });
                }

                //Devolver una respuesta
                return res.status(200).send({
                    status: 'success',
                    product: productStored
                });
            });

            
        }else{
            return res.status(500).send({
                status: 'error',
                message: 'Los datos no son validos'
            });
        }
    },

    getProducts: (req, res) => {


        const query = Product.find( {} );

        const last = req.params.last;
        if (last || last != undefined) {
            
            query.limit(5);

        }

        //Find para obtener los obbjetos de la db
        //sort('-_id') hace que se pordene de forma desc, sin '-' asc
        query.sort('-_id').exec(( err, products ) =>{

            if ( err ) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los productos'
                });
            }if ( !products ) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay productos para mostrar'
                });
            }else{
                return res.status(200).send({
                    status: 'success',
                    products
                });
            }
        });
    }, 

    getProduct: (req, res) => {


        //Recoger id de url

        const productID = req.params.id;

        //Validar datos

        if ( !productID || productID == null) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe el producto'
            });
        }

        //Buscar producto

        Product.findById( productID, ( err, product ) => {

            if ( !product || err ) {
                return res.status(500).send({
                    status: 'error',
                    message: 'No existe el articulo'
                });
            }

            //Devolverlo en JSON        
            return res.status(200).send({
                status: 'success',
                product
            });
        })        
    },

    update: (req, res ) => {

        //Recoger el id del producto por la url

        const productID = req.params.id;

        //Recoger los datos que llegan por put

        const params = req.body;

        //Validar datos

        try {
            
            var validate_name = !validator.isEmpty(params.name);
            var validate_description = !validator.isEmpty(params.description);
            var validate_precio = !validator.isEmpty(params.precio);

        } catch (err) {

            return res.status(404).send({
                status: 'error',
                message: 'Faltan datos por enviar'
            });
            
        }

        if (validate_name && validate_description && validate_precio) {

            //Find and update
            Product.findOneAndUpdate({ _id: productID }, params, { new: true }, ( err, productUpdated ) => {

                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    });
                }

                if (err) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el producto'
                    });
                }
                
                //Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    product: productUpdated
                });
            } );
            
        }else{
            return res.status(500).send({
                status: 'error',
                message: 'La validacion no es correcta'
            });
        }
    },

    delete: (req, res) => {

        //Recoger ide de url
        const productID = req.params.id;

        //Find and delete
        Product.findOneAndDelete( { _id: productID }, (err, productRemoved ) => {
            
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar'
                });
            }

            if ( !productRemoved ) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha borrado el producto, posiblemente no exista'
                });
            }

            return res.status(200).send({
                status: 'success',
                product: productRemoved
            });
        });
    },

    upload: (req, res) => {

        //Configurtar el modulo connect multiparty routes/product.js (Hecho)

        //Recoger el fichero de la particion
        var file_name = 'Imagen no subida...';

        console.log(req.files)

        if (!req.files) {
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
            
        }

        //Conseguir nombre y la extension del archivo
        const file_path = req.files.file0.path;
        const file_split = file_path.split('\\');

        // Para linux o mac
        // const file_split = file_path.split('/');

        //Nombre del archivo
        var file_name = file_split[2];

        //Extension del fichero
        const extension_split = file_name.split('\.');
        const file_ext = extension_split[1];
        
        //Comprobar la extension, solo imagenes, si es valida borrar el fichero
        if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') {
            //Borrar archivo subido
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: 'error',
                    message: 'La extension de la imagen no es valida'
                });
            })
        }else{
            //Si todo es valido, sacando id de la url

            let productId = req.params.id;

            //Buscar el articulo, asignarle el nombre de la imagen y actualizarlo

            Product.findOneAndUpdate({ _id: productId }, { image: file_name}, { new: true}, (err, productUpdated) => { 


                if (err || !productUpdated) {

                    return res.status(200).send({
                        status: 'error',
                        message: 'Error al guardar la imagen de articulo!!'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    Product: productUpdated
                });

            });

            
        }

    }, //end upload file

    getImage: (req, res) => {

        const file = req.params.image;
        let path_file = './upload/products/'+file;

        fs.exists(path_file, (exists) => {

            console.log(exists);

            if (exists) {
                return res.sendFile(path.resolve(path_file));
            }else{
                
                return res.status(404).send({
                    status: 'error',
                    message: 'La imagen no existe!'
                });
            }
        })
    }, //end getImage

    search: (req, res) => {

        //Sacar el string a buscar

        const searchString = req.params.search;

        //Find or
        Product.find({ "$or": [
            { "name": { "$regex": searchString, "$options": "i"}},
            { "description": { "$regex": searchString, "$options": "i"}}
        ]})
        .sort([['date', 'descending']])
        .exec((err, products) => {

            console.log(searchString);

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la peticion!'
                });
            }

            if (!products || products.length <= 0) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay productos que coincidan con tu busqueda!'
                });
            }

            return res.status(200).send({
                status: 'success',
                products
            });
        })
    }// end search
 

}; // end controller



module.exports = controller;