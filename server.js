const express = require('express');
const app = express();
const PORT = 8080;


app.use(express.json());


const productsRoutes = require('./routes/products');
const cartsRoutes = require('./routes/carts');


app.use('/api/products', productsRoutes);
app.use('/api/carts', cartsRoutes);


app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});