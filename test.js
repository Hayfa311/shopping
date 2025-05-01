// script.js - تحديث مصفوفة الأطباق
const dishes = [
    // الأطباق الرئيسية
    {
        id: 1,
        name: 'شيش طاووق مشوي',
        price: 45,
        image :'شيش طاوق.jpg',
        category: 'main',
        rating: 4.7,
        options: [
            { name: 'صلصة ثوم', price: 3 },
            { name: 'بطاطس مشوية', price: 5 }
        ]
    },
    {
        id: 2,
        name: 'ستيك لحم',
        price: 65,
        image:'لحم ستيك.jpg',
        category: 'main',
        rating: 4.9,
        options: [
            { name: 'صلصة فطر', price: 5 },
            { name: 'خضار مشوية', price: 7 }
        ]
    },
    
    // المقبلات
    {
        id: 3,
        name:'سلطة يونانية',
        price: 25,
        image:'سلطة.jpg',
        category: 'appetizers',
        rating: 4.5,
        options: [
            { name: 'جبنة إضافية', price: 4 }
        ]
    },
    {
        id: 4,
        name:'مقبلات مشكلة',
        price: 35,
        image:'مقبلات مشكلة.jpg',
        category: 'appetizers',
        rating: 4.3
    },
    
    // المشروبات
   {
        id: 5,
        name: 'عصير مانجو',
        price: 15,
        image:'عصير.jpg',
        category: 'drinks',
        rating: 4.8,
        options: [
            { name: 'حجم كبير', price: 5 }
        ]
    },
    {
        id: 6,
        name:'قهوة عربية',
        price: 12,
        image:'قهوة.jpg',
        category: 'drinks',
        rating: 4.6
    },
    
    // الحلويات
    {
        id: 7,
        name:'تشيز كيك',
        price: 30,
        image:'شيزكيك.jpg',
        category: 'desserts',
        rating: 4.9,
        options: [
            { name: 'صوص كراميل', price: 4 }
        ]
    },
    {
        id: 8,
        name:'كنافة نابلسية',
        price: 40,
        image:'كنافة.jpg',
        category: 'desserts',
        rating: 5.0
    }
];

// حالة التطبيق
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'default';

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', () => {
    renderDishes();
    setupEventListeners();
    updateCart();
});

// إعداد مستمعي الأحداث
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        renderDishes();
    });

    document.querySelectorAll('.category-filter button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.category-filter .active').classList.remove('active');
            button.classList.add('active');
            currentCategory = button.dataset.category;
            renderDishes();
        });
    });

    document.getElementById('sortSelect').addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderDishes();
    });

    document.getElementById('cartLink').addEventListener('click', (e) => {
        e.preventDefault();
        toggleCart();
    });
}

// عرض الأطباق
function renderDishes() {
    const grid = document.getElementById('menuGrid');
    grid.innerHTML = '';

    getFilteredDishes().forEach(dish => {
        const dishElement = document.createElement('div');
        dishElement.className = 'menu-item';
        dishElement.innerHTML = `
            <img src="${dish.image}" alt="${dish.name}" loading="lazy">
            <div class="item-content">
                <h3>${dish.name}</h3>
                <div class="rating">${renderRating(dish.rating)}</div>
                <p class="price">${dish.price} ر.س</p>
                
                ${dish.options ? `
                <div class="add-options">
                    ${dish.options.map(option => `
                        <div class="option-group">
                            <input type="checkbox" id="opt-${dish.id}-${option.name}" 
                                   data-price="${option.price}">
                            <label for="opt-${dish.id}-${option.name}">
                                ${option.name} (+${option.price} ر.س)
                            </label>
                        </div>
                    `).join('')}
                </div>` : ''}
                
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="updateQuantity(${dish.id}, -1)">-</button>
                    <input type="number" 
                           id="quantity-${dish.id}" 
                           class="quantity-input"
                           value="1" 
                           min="1" 
                           max="10">
                    <button class="quantity-btn" onclick="updateQuantity(${dish.id}, 1)">+</button>
                </div>
                
                <button class="add-to-cart" onclick="addToCart(${dish.id})">إضافة إلى السلة</button>
            </div>
        `;
        grid.appendChild(dishElement);
    });

    renderRecommendations();
}

// فلترة وفرز الأطباق
function getFilteredDishes() {
    let filtered = dishes.filter(dish => {
        const matchesCategory = currentCategory === 'all' || dish.category === currentCategory;
        const matchesSearch = dish.name.toLowerCase().includes(currentSearch);
        return matchesCategory && matchesSearch;
    });

    switch(currentSort) {
        case 'price-asc': return filtered.sort((a, b) => a.price - b.price);
        case 'price-desc': return filtered.sort((a, b) => b.price - a.price);
        case 'rating': return filtered.sort((a, b) => b.rating - a.rating);
        default: return filtered;
    }
}

// عرض التقييم
function renderRating(rating) {
    return Array.from({length: 5}, (_, i) => {
        const filled = i < Math.floor(rating);
        const half = (rating - i) >= 0.5;
        return `<i class="fas fa-star${half ? '-half-alt' : filled ? '' : '-o'}"></i>`;
    }).join('');
}

// تحديث الكمية
function updateQuantity(dishId, change) {
    const input = document.getElementById(`quantity-${dishId}`);
    let newValue = parseInt(input.value) + change;
    newValue = Math.max(1, Math.min(10, newValue));
    input.value = newValue;
}

// إضافة إلى السلة
function addToCart(dishId) {
    const dish = dishes.find(d => d.id === dishId);
    const quantity = parseInt(document.getElementById(`quantity-${dishId}`).value);
    
    const options = Array.from(document.querySelectorAll(`input[type="checkbox"]:checked`))
        .filter(input => input.id.startsWith(`opt-${dishId}`))
        .map(input => ({
            name: input.nextElementSibling.textContent.split('+')[0].trim(),
            price: parseInt(input.dataset.price)
        }));

    const totalPrice = (dish.price + options.reduce((sum, opt) => sum + opt.price, 0)) * quantity;
    
    cart.push({
        ...dish,
        quantity,
        options,
        totalPrice
    });
    
    updateCart();
    showNotification('تمت الإضافة إلى السلة بنجاح 🛒');
    saveToLocalStorage();
}

// تحديث السلة
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    
    cartItems.innerHTML = '';
    cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div>
                <h4>${item.name} (×${item.quantity})</h4>
                ${item.options.map(opt => `<small>+ ${opt.name}</small>`).join('')}
            </div>
            <div>
                <span>${item.totalPrice} ر.س</span>
                <button onclick="removeFromCart(${index})">×</button>
            </div>
        `;
        cartItems.appendChild(div);
    });
    
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartTotal.textContent = cart.reduce((sum, item) => sum + item.totalPrice, 0);
}

// إزالة من السلة
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
    saveToLocalStorage();
    showNotification('تمت الإزالة من السلة ❌');
}

// إتمام الطلب
function handleCheckout() {
    if (cart.length === 0) {
        showNotification('السلة فارغة، أضف بعض الأطباق أولاً ⚠️');
        return;
    }
    
    showNotification(`تم الطلب بنجاح! المجموع: ${cartTotal.textContent} ر.س 🎉`);
    cart = [];
    updateCart();
    saveToLocalStorage();
    toggleCart();
}

// التوصيات
function renderRecommendations() {
    const recommendationsGrid = document.getElementById('recommendationsGrid');
    const categories = [...new Set(cart.map(item => item.category))];
    
    const recommended = dishes
        .filter(dish => categories.includes(dish.category))
        .slice(0, 4);
    
    recommendationsGrid.innerHTML = recommended.map(dish => `
        <div class="menu-item">
            <img src="${dish.image}" alt="${dish.name}">
            <div class="item-content">
                <h3>${dish.name}</h3>
                <p class="price">${dish.price} ر.س</p>
                <button class="add-to-cart" onclick="addToCart(${dish.id})">إضافة إلى السلة</button>
            </div>
        </div>
    `).join('');
}

// خدمات مساعدة
function saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => notification.style.display = 'none', 3000);
}

function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('active');
}