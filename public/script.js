const cartBtn = document.getElementById('cart-btn');

const modal = document.getElementById('quantity-modal');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalPrice = document.getElementById('modal-price');
const quantityText = document.getElementById('quantity');
const totalPrice = document.getElementById('total-price');

const minusBtn = document.getElementById('minus-btn');
const plusBtn = document.getElementById('plus-btn');
const confirmAdd = document.getElementById('confirm-add');

const cartPanel = document.getElementById('cart-panel');
const cartClose = document.getElementById('cart-close');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const clearCart = document.getElementById('clear-cart');

const checkoutBtn = document.getElementById('checkout-btn');
const checkoutForm = document.getElementById('checkout-form');
const submitOrder = document.getElementById('submit-order');

const paymentModal = document.getElementById('payment-modal');
const paymentClose = document.getElementById('payment-close');
const payBtn = document.getElementById('pay-btn');

let currentProductName = '';
let currentProductPrice = 0;
let currentProductWeight = '';
let quantity = 1;
let pendingOrder = null;

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Додавання товару в кошик
document.addEventListener('click', (event) => {
  const button = event.target.closest('.add-to-cart');

  if (!button) return;

  currentProductName = button.dataset.name;
  currentProductPrice = Number(button.dataset.price);
  currentProductWeight = button.dataset.weight || '90 г';
  quantity = 1;

  modalTitle.textContent = currentProductName;
  modalPrice.textContent = currentProductPrice + ' грн / ' + currentProductWeight;
  quantityText.textContent = quantity;
  totalPrice.textContent = currentProductPrice + ' грн';

  modal.classList.remove('hidden');
});

plusBtn?.addEventListener('click', () => {
  quantity++;
  quantityText.textContent = quantity;
  totalPrice.textContent = currentProductPrice * quantity + ' грн';
});

minusBtn?.addEventListener('click', () => {
  if (quantity > 1) {
    quantity--;
    quantityText.textContent = quantity;
    totalPrice.textContent = currentProductPrice * quantity + ' грн';
  }
});

modalClose?.addEventListener('click', () => {
  modal.classList.add('hidden');
});

confirmAdd?.addEventListener('click', () => {
  const existingProduct = cart.find(item => item.name === currentProductName);

  if (existingProduct) {
    existingProduct.quantity += quantity;
  } else {
    cart.push({
      name: currentProductName,
      price: currentProductPrice,
      weight: currentProductWeight,
      quantity: quantity
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();

  modal.classList.add('hidden');
  showToast(`${currentProductName} — ${quantity} шт. додано в кошик`);
});

// Відкрити кошик
cartBtn?.addEventListener('click', () => {
  renderCart();
  cartPanel.classList.remove('hidden');
});

// Закрити кошик
cartClose?.addEventListener('click', () => {
  cartPanel.classList.add('hidden');
});

// Очистити кошик
clearCart?.addEventListener('click', () => {
  cart = [];
  localStorage.removeItem('cart');
  renderCart();
});

// Показати кошик
function renderCart() {
  if (!cartItems || !cartTotal) return;

  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Кошик поки що порожній</p>';
    cartTotal.textContent = '0 грн';
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    cartItems.innerHTML += `
      <div class="cart-item">
        <div>
          <h4>${item.name}</h4>
          <p>${item.quantity} шт. × ${item.price} грн / ${item.weight || '90 г'}</p>
        </div>

        <div>
          <strong>${itemTotal} грн</strong>
          <button class="remove-item" data-index="${index}">×</button>
        </div>
      </div>
    `;
  });

  cartTotal.textContent = total + ' грн';

  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', () => {
      const index = button.dataset.index;
      cart.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCart();
    });
  });
}

// Відкрити форму оформлення
checkoutBtn?.addEventListener('click', () => {
  if (cart.length === 0) {
    showToast('Спочатку додайте товар у кошик');
    return;
  }

  checkoutForm.classList.toggle('hidden');
});

// Підтвердити замовлення
submitOrder?.addEventListener('click', async () => {
  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  const city = document.getElementById('customer-city').value.trim();
  const post = document.getElementById('nova-poshta').value.trim();
  const payment = document.getElementById('payment-method').value;

  if (!name || !phone || !city || !post || !payment) {
    showToast('Заповніть усі поля замовлення');
    return;
  }

  const total = cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  pendingOrder = {
    customerName: name,
    phone: phone,
    city: city,
    novaPoshta: post,
    payment: payment,
    items: cart,
    total: total,
    paymentStatus: payment === 'card' ? 'Очікує оплати' : 'Оплата при отриманні'
  };

  if (payment === 'card') {
    paymentModal.classList.remove('hidden');
  } else {
    await saveOrder(pendingOrder);
  }
});

// Зберегти замовлення
async function saveOrder(order) {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(order)
    });

    const result = await response.json();

    if (result.success) {
      showToast('Замовлення успішно оформлено');

      cart = [];
      localStorage.removeItem('cart');
      renderCart();

      document.getElementById('customer-name').value = '';
      document.getElementById('customer-phone').value = '';
      document.getElementById('customer-city').value = '';
      document.getElementById('nova-poshta').value = '';
      document.getElementById('payment-method').value = '';

      const selectedPayment = document.querySelector('.select-selected');
      if (selectedPayment) {
        selectedPayment.textContent = 'Оберіть спосіб оплати';
      }

      checkoutForm.classList.add('hidden');
      cartPanel.classList.add('hidden');
      paymentModal?.classList.add('hidden');

      pendingOrder = null;
    }
  } catch (error) {
    showToast('Помилка оформлення замовлення');
    console.error(error);
  }
}

// Закрити тестову оплату
paymentClose?.addEventListener('click', () => {
  paymentModal.classList.add('hidden');
});

// Тестова оплата
payBtn?.addEventListener('click', async () => {
  const cardNumber = document.getElementById('card-number').value.trim();
  const cardDate = document.getElementById('card-date').value.trim();
  const cardCvv = document.getElementById('card-cvv').value.trim();

  if (!cardNumber || !cardDate || !cardCvv) {
    showToast('Заповніть дані картки');
    return;
  }

  if (cardNumber.replace(/\s/g, '').length < 16) {
    showToast('Номер картки має містити 16 цифр');
    return;
  }

  if (cardCvv.length < 3) {
    showToast('CVV має містити 3 цифри');
    return;
  }

  pendingOrder.paymentStatus = 'Оплачено';

  await saveOrder(pendingOrder);

  document.getElementById('card-number').value = '';
  document.getElementById('card-date').value = '';
  document.getElementById('card-cvv').value = '';

  showToast('Оплату успішно проведено');
});

// оплата
const paymentSelect = document.getElementById('payment-select');
const selectedPayment = paymentSelect?.querySelector('.select-selected');
const paymentItems = paymentSelect?.querySelector('.select-items');
const paymentInput = document.getElementById('payment-method');

selectedPayment?.addEventListener('click', (event) => {
  event.stopPropagation();
  paymentItems.classList.toggle('hidden');
});

paymentItems?.querySelectorAll('div').forEach(item => {
  item.addEventListener('click', () => {
    selectedPayment.textContent = item.textContent;
    paymentInput.value = item.dataset.value;
    paymentItems.classList.add('hidden');
  });
});

document.addEventListener('click', () => {
  paymentItems?.classList.add('hidden');
});

// Повідомлення
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2500);
}