'use-strict'

const validator = require('validator');
const Article = require('../models/article');
const fs = require('fs');
const path = require('path');
const { exists } = require('../models/article');

const controller = {

    datosActicle: (req, res) => {
        return res.status(200).send({
            status: 'success',
            web: 'The Origin',
            autor: 'Roger Gajardo'
        });
    },
    test: (req, res) => {
        return res.status(200).send({
            status: 'success',
            message: 'Soy la Accion test de mi controller de articulos'
        });
    },

    saveArticle: (req, res) => {

        //Recargar parametros por post

        const params = req.body;
        
        //Validar datos (validator)

        try {

            var validate_name = !validator.isEmpty(params.name);
            var validate_description = !validator.isEmpty(params.description);
            
        } catch (err) {
            return res.status(404).send({
                status: 'error',
                message: 'Faltan datos'
            });
        }
        
        if (validate_name && validate_description) {

            //Crear el objeto a guardar
            const article = new Article();

            //Asignar valores
            article.name = params.name;
            article.description = params.description;
            article.image = null;

            //Guardar el articulo

            article.save((err, articleStored) => {

                if (err || !articleStored) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'El articulo no se a guardado'
                    });
                }

                //Devolver una respuesta
                return res.status(200).send({
                    status: 'success',
                    article: articleStored
                });
            });

            
        }else{
            return res.status(500).send({
                status: 'error',
                message: 'Los datos no son validos'
            });
        }
    },

    getArticles: (req, res) => {


        const query = Article.find( {} );

        const last = req.params.last;
        if (last || last != undefined) {
            
            query.limit(5);

        }

        //Find para obtener los obbjetos de la db
        //sort('-_id') hace que se pordene de forma desc, sin '-' asc
        query.sort('-_id').exec(( err, articles ) =>{

            if ( err ) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los articulos'
                });
            }if ( !articles ) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay articulos para mostrar'
                });
            }else{
                return res.status(200).send({
                    status: 'success',
                    articles
                });
            }
        });
    }, 

    getArticle: (req, res) => {


        //Recoger id de url

        const articleID = req.params.id;

        //Validar datos

        if ( !articleID || articleID == null) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe el articulo'
            });
        }

        //Buscar articULO

        Article.findById( articleID, ( err, article ) => {

            if ( !article || err ) {
                return res.status(500).send({
                    status: 'error',
                    message: 'No existe el articulo'
                });
            }

            //Devolverlo en JSON        
            return res.status(200).send({
                status: 'success',
                article
            });
        })        
    },

    updateArticle: (req, res ) => {

        //Recoger el id del articulo por la url

        const articleID = req.params.id;

        //Recoger los datos que llegan por put

        const params = req.body;

        //Validar datos

        try {
            
            var validate_name = !validator.isEmpty(params.name);
            var validate_description = !validator.isEmpty(params.description);

        } catch (err) {

            return res.status(404).send({
                status: 'error',
                message: 'Faltan datos por enviar'
            });
            
        }

        if (validate_name && validate_description ) {

            //Find and update
            Article.findOneAndUpdate({ _id: articleID }, params, { new: true }, ( err, articleUpdated ) => {

                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    });
                }

                if (err) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el articulo'
                    });
                }
                
                //Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    article: articleUpdated
                });
            } );
            
        }else{
            return res.status(500).send({
                status: 'error',
                message: 'La validacion no es correcta'
            });
        }
    },

    deleteArticle: (req, res) => {

        //Recoger ide de url
        const articleID = req.params.id;

        //Find and delete
        Article.findOneAndDelete( { _id: articleID }, (err, articleRemoved ) => {
            
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar'
                });
            }

            if ( !articleRemoved ) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha borrado el articulo, posiblemente no exista'
                });
            }

            return res.status(200).send({
                status: 'success',
                article: articleRemoved
            });
        });
    },

    uploadArticle: (req, res) => {

        //Configurtar el modulo connect multiparty routes/article.js (Hecho)

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

            let articleId = req.params.id;

            //Buscar el articulo, asignarle el nombre de la imagen y actualizarlo

            Article.findOneAndUpdate({ _id: articleId }, { image: file_name}, { new: true}, (err, articleUpdated) => { 


                if (err || !articleUpdated) {

                    return res.status(200).send({
                        status: 'error',
                        message: 'Error al guardar la imagen de articulo!!'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    Article: articleUpdated
                });

            });

            
        }

    }, //end upload file

    getImageArticle: (req, res) => {

        const file = req.params.image;
        let path_file = './upload/articles/'+file;

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

    searchArticle: (req, res) => {

        //Sacar el string a buscar

        const searchString = req.params.search;

        //Find or
        Article.find({ "$or": [
            { "name": { "$regex": searchString, "$options": "i"}},
            { "description": { "$regex": searchString, "$options": "i"}}
        ]})
        .sort([['date', 'descending']])
        .exec((err, articles) => {

            console.log(searchString);

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la peticion!'
                });
            }

            if (!articles || articles.length <= 0) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay articulos que coincidan con tu busqueda!'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });
        })
    }// end search
 

}; // end controller



module.exports = controller;