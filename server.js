const express = require('express');
const { create } = require('express-handlebars');
const { Server } = require('socket.io');
const app = express();
const PORT = process.env.PORT || 8080;


const hbs = create({
  extname: '.handlebars',
  layoutsDir: __dirname + '/views/layouts',
  defaultLayout: 'main',
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
const productsRoutes = require('./routes/products');
const cartsRoutes = require('./routes/carts');
app.use('/api/products', productsRoutes);
app.use('/api/carts', cartsRoutes);

app.use(express.static('public')); 

// Rutas para las vistas
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts');
});

// Datos de productos (se cargarán desde el archivo)
let products = JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'));

// Servidor HTTP y WebSocket
const server = app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

const io = new Server(server);


io.on('connection', (socket) => {
  console.log('Cliente conectado');


  socket.emit('updateProducts', products);


  socket.on('newProduct', (product) => {
    product.id = generateUniqueId(); // Genera un ID único para el producto
    products.push(product);
    fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2)); // Guardar en el archivo
    io.emit('updateProducts', products); // Emitir a todos los clientes conectados
  });

  socket.on('deleteProduct', (productId) => {
    products = products.filter((product) => product.id !== productId);
    fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2)); // Guardar en el archivo
    io.emit('updateProducts', products); // Emitir a todos los clientes conectados
  });
});

function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15);
}