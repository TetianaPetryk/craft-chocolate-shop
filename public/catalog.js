const pageCategory = document.body.dataset.category;

async function loadCatalogProducts() {
  const res = await fetch('/api/products');
  const products = await res.json();

  const grid = document.getElementById('products-grid');

  const filteredProducts = products.filter(product => {
    return product.category === pageCategory && product.available;
  });

  if (filteredProducts.length === 0) {
    grid.innerHTML = '<p class="empty-cart">Товарів поки немає</p>';
    return;
  }

  grid.innerHTML = filteredProducts.map(product => `
    <div class="product-card">
      <div class="card-content">
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>${product.description}</p>

        <div class="price-block">
          <span class="price">${product.price} грн</span>
          <span class="weight">за ${product.weight}</span>
        </div>
      </div>

    <button 
  class="add-to-cart" 
  data-name="${product.name}" 
  data-price="${product.price}"
  data-weight="${product.weight}">
        Додати в кошик
      </button>
    </div>
  `).join('');
}

loadCatalogProducts();