'use-strict'

const express = require('express');
const ArticleController = require('../controllers/articles');

const router = express.Router();


//Cargar modulo Multiparty
const multiparty = require('connect-multiparty');
const md_upload = multiparty({ uploadDir: './upload/articles'});

//Rutas de Prueba
router.get('/test-de-controller', ArticleController.test);
router.post('/test-de-controller', ArticleController.datosActicle);

//Rutas utiles
router.post('/save-article', ArticleController.saveArticle);
router.get('/articles', ArticleController.getArticles);
router.get('/articles/:last?', ArticleController.getArticles);
router.get('/articles/:id', ArticleController.getArticle);
router.put('/articles/:id', ArticleController.updateArticle);
router.delete('/articles/:id', ArticleController.deleteArticle);
router.post('/upload-image-articles/:id', md_upload, ArticleController.uploadArticle);
router.get('/get-image-articles/:image', ArticleController.getImageArticle);
router.get('/search-articles/:search', ArticleController.searchArticle);

module.exports = router;