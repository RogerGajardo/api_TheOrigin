'use-strict'

const express = require('express');
const ProductController = require('../controllers/product');

const router = express.Router();


//Cargar modulo Multiparty
const multiparty = require('connect-multiparty');
const md_upload = multiparty({ uploadDir: './upload/products'});

//Rutas de Prueba
router.get('/test-de-controller', ProductController.test);
router.post('/test-de-controller', ProductController.datosProducto);

//Rutas utiles
router.post('/save', ProductController.save);
router.get('/products', ProductController.getProducts);
router.get('/products/:last?', ProductController.getProducts);
router.get('/product/:id', ProductController.getProduct);
router.put('/product/:id', ProductController.update);
router.delete('/product/:id', ProductController.delete);
router.post('/upload-image/:id', md_upload, ProductController.upload);
router.get('/get-image/:image', ProductController.getImage);
router.get('/search/:search', ProductController.search);

module.exports = router;