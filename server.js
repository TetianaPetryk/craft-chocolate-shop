const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const ordersPath = path.join(__dirname, 'data', 'orders.json');
const productsPath = path.join(__dirname, 'data', 'products.json');
const usersPath = path.join(__dirname, 'data', 'users.json');

// ===== СТОРІНКИ =====

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/black', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'black.html'));
});

app.get('/milk', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'milk.html'));
});

app.get('/special', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'special.html'));
});

app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

//  КОРИСТУВАЧІ 

app.post('/api/register', (req, res) => {
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  const { name, phone, email, password } = req.body;

  const existingUser = users.find(user => user.email === email);

  if (existingUser) {
    return res.json({
      success: false,
      message: 'Користувач з таким email вже існує'
    });
  }

  const newUser = {
    id: Date.now(),
    name,
    phone,
    email,
    password
  };

  users.push(newUser);
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  res.json({ success: true });
});

app.post('/api/login', (req, res) => {
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  const { email, password } = req.body;

  const user = users.find(item => {
    return item.email === email && item.password === password;
  });

  if (!user) {
    return res.json({
      success: false,
      message: 'Невірний email або пароль'
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email
    }
  });
});

// ЗАМОВЛЕННЯ

app.get('/api/orders', (req, res) => {
  const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));

  const newOrder = {
    id: Date.now(),
    ...req.body,
    status: 'Нове',
    createdAt: new Date().toLocaleString('uk-UA')
  };

  orders.push(newOrder);
  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));

  res.json({ success: true, order: newOrder });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
  const orderId = Number(req.params.id);

  const order = orders.find(item => item.id === orderId);

  if (!order) {
    return res.status(404).json({ success: false });
  }

  order.status = req.body.status;
  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));

  res.json({ success: true, order });
});

app.patch('/api/orders/:id/ttn', (req, res) => {
  const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
  const orderId = Number(req.params.id);

  const order = orders.find(item => item.id === orderId);

  if (!order) {
    return res.status(404).json({ success: false });
  }

  order.ttn = req.body.ttn;
  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));

  res.json({ success: true, order });
});

// ТОВАРИ 

app.get('/api/products', (req, res) => {
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

  const newProduct = {
    id: Date.now(),
    ...req.body,
    available: true
  };

  products.push(newProduct);
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));

  res.json({ success: true, product: newProduct });
});

app.patch('/api/products/:id', (req, res) => {
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  const productId = Number(req.params.id);

  const product = products.find(item => item.id === productId);

  if (!product) {
    return res.status(404).json({ success: false });
  }

  Object.assign(product, req.body);
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));

  res.json({ success: true, product });
});

app.delete('/api/products/:id', (req, res) => {
  let products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  const productId = Number(req.params.id);

  products = products.filter(item => item.id !== productId);
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));

  res.json({ success: true });
});

// ЗАПУСК 

app.listen(PORT, () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
});