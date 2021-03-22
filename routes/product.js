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
router.post('/save-product', ProductController.saveProduct);
router.get('/products', ProductController.getProducts);
router.get('/products/:last?', ProductController.getProducts);
router.get('/product/:id', ProductController.getProduct);
router.put('/product/:id', ProductController.updateProduct);
router.delete('/product/:id', ProductController.deleteProduct);
router.post('/upload-image-product/:id', md_upload, ProductController.uploadProduct);
router.get('/get-image-product/:image', ProductController.getImageProduct);
router.get('/search-product/:search', ProductController.searchProduct);

module.exports = router;