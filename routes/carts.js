const express = require('express');
const router = express.Router();
const fs = require('fs');

// Ruta POST / (Crear carrito)
router.post('/', (req, res) => {
  const newCart = {
    id: generateUniqueId(),
    products: []
  };

  const carts = JSON.parse(fs.readFileSync('./data/carts.json', 'utf-8'));
  carts.push(newCart);
  fs.writeFileSync('./data/carts.json', JSON.stringify(carts, null, 2));
  res.status(201).json(newCart);
});

// Ruta GET /:cid (Listar productos del carrito)
router.get('/:cid', (req, res) => {
    const cid = req.params.cid;
    const carts = JSON.parse(fs.readFileSync('./data/carts.json', 'utf-8'));
    const cart = carts.find(c => c.id === cid);

    if (cart) {
        res.json(cart.products);
    } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
    }
});

// Ruta POST /:cid/product/:pid (Agregar producto al carrito)
router.post('/:cid/product/:pid', (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const { quantity } = req.body; // Obtener la cantidad del cuerpo de la solicitud
    const carts = JSON.parse(fs.readFileSync('./data/carts.json', 'utf-8'));
    const cartIndex = carts.findIndex(c => c.id === cid);
    const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'));
    const product = products.find(p => p.id === pid);

    if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (cartIndex !== -1) {
        const cart = carts[cartIndex];
        const existingProduct = cart.products.find(p => p.product === pid);

        if (existingProduct) {
            // Incrementar la cantidad si el producto ya existe en el carrito
            existingProduct.quantity += quantity || 1; // Usar 1 si no se proporciona cantidad
        } else {
            // Agregar el producto al carrito con la cantidad especificada o 1 por defecto
            cart.products.push({ product: pid, quantity: quantity || 1 });
        }

        fs.writeFileSync('./data/carts.json', JSON.stringify(carts, null, 2));
        res.json(cart);
    } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
    }
});

module.exports = router;