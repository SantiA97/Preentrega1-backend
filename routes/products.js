const express = require('express');
const router = express.Router();
const fs = require('fs');

// Función para generar IDs únicos (puedes usar una librería como uuid)
function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15);
}

// Ruta GET / (Listar productos)
router.get('/', (req, res) => {
  const limit = req.query.limit;
  const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'));

  if (limit) {
    res.json(products.slice(0, limit));
  } else {
    res.json(products);
  }
});

// Ruta GET /:pid (Obtener producto por ID)
router.get('/:pid', (req, res) => {
  const pid = req.params.pid;
  const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'));
  const product = products.find(p => p.id === pid);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

// Ruta POST / (Crear producto) - MODIFICADA
router.post('/', (req, res) => {
  const newProduct = req.body;
  const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'));

  newProduct.id = generateUniqueId();
  newProduct.status = true;

  const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
  const missingFields = requiredFields.filter(field => !newProduct[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({ error: `Faltan campos obligatorios: ${missingFields.join(', ')}` });
  }

  products.push(newProduct);
  fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2));

  // No emitimos el evento 'newProduct' aquí, ya que se maneja en el WebSocket

  res.status(201).json(newProduct);
});

// Ruta PUT /:pid (Actualizar producto)
router.put('/:pid', (req, res) => {
  const pid = req.params.pid;
  const updatedProduct = req.body;
  const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'));
  const index = products.findIndex(p => p.id === pid);

  if (index !== -1) {
    // No actualizar el ID
    delete updatedProduct.id;
    products[index] = { ...products[index], ...updatedProduct };
    fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2));
    res.json(products[index]);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

// Ruta DELETE /:pid (Eliminar producto)
router.delete('/:pid', (req, res) => {
  const pid = req.params.pid;
  const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'));
  const index = products.findIndex(p => p.id === pid);

  if (index !== -1) {
    products.splice(index, 1);
    fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2));
    res.status(204).end(); // 204 No Content
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

module.exports = router;