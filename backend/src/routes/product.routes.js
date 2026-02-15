const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct); // TODO: Add auth middleware
router.put('/:id', productController.updateProduct); // TODO: Add auth middleware
router.delete('/:id', productController.deleteProduct); // TODO: Add auth middleware

module.exports = router;
