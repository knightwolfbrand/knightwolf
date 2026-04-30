// Knight Wolf - Interactive Logic
// Backend Configuration (Python API)
const API_BASE_URL = 'http://localhost:5050/api';
let CURRENT_USER_ID = window.CURRENT_ALPHA_ID || 'alpha_pioneer_2026';

document.addEventListener('authStateChanged', (e) => {
    const user = e.detail.user;
    if (user) {
        CURRENT_USER_ID = user.uid;
        console.log("Script.js: User Authenticated:", CURRENT_USER_ID);
        // Proactively load history if the account modal is open
        if (document.querySelector('.account-modal').style.display === 'flex') {
            loadUserHistory();
        }
    } else {
        console.log("Script.js: User Logged Out");
        CURRENT_USER_ID = null;
    }
});

const loadUserHistory = async () => {
    if (!CURRENT_USER_ID) return;
    try {
        const response = await fetch(`${API_BASE_URL}/orders/history/${CURRENT_USER_ID}`);
        const data = await response.json();
        if (data.success) {
            renderOrderHistory(data.history);
        }
    } catch (error) {
        console.error("Failed to load user history:", error);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // State
    let cart = [];
    const cartCountNodes = document.querySelectorAll('.cart-count, .cart-drawer-count');
    const cartDrawer = document.querySelector('.cart-drawer');
    const cartItemsContainer = document.querySelector('.cart-items-container');
    const totalAmountNode = document.querySelector('.total-amount');

    // UI Elements - Navigation
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const closeMobileMenu = document.querySelector('.close-mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

    // UI Elements - Cart
    const cartBtn = document.querySelector('.cart-btn');
    const closeCartBtn = document.querySelector('.close-cart');
    const addToCartBtns = document.querySelectorAll('.add-to-cart-quick');

    // UI Elements - Modals
    const quickViewModal = document.querySelector('.quick-view-modal');
    const sizeChartModal = document.querySelector('.size-chart-modal');
    const closeQuickView = document.querySelector('.close-modal');
    const closeSizeChart = document.querySelector('.close-chart-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalPrice = document.getElementById('modal-price');
    const sizePills = document.querySelectorAll('.size-pill');
    const addToCartModalBtn = document.querySelector('.add-to-cart-modal');
    const openSizeChartBtn = document.querySelector('.size-chart-link');
    const modalOverlayNodes = document.querySelectorAll('.modal-overlay');

    // UI Elements - 3D Customizer
    const custom3dModal = document.querySelector('.custom-3d-modal');
    const closeCustomizerBtn = document.querySelector('.close-customizer');
    const addCustomToCartBtn = document.querySelector('.add-custom-to-cart');
    const textureBtns = document.querySelectorAll('.option-btn');

    let selectedTexture = 'classic';
    let activeCustomItem = null;

    let selectedSize = 'M'; // Default

    // Functions
    const toggleCart = () => cartDrawer.classList.toggle('active');
    const toggleMobileMenu = () => mobileMenuOverlay.classList.toggle('active');

    const openQuickView = (data) => {
        modalImg.src = data.img;
        modalTitle.innerText = data.name;
        modalPrice.innerText = data.price;
        quickViewModal.style.display = 'flex';
        selectedSize = 'M'; // Reset to default
        updateSizePills();
    };

    const openCustomizer = (productData) => {
        activeCustomItem = productData;
        custom3dModal.style.display = 'flex';
    };

    const addItemToCart = (itemData) => {
        const { name, price, quantity, size, purchaseType, isCustom, texture } = itemData;

        // Check for existing item with same name, size, type, and custom status
        const existingItem = cart.find(item =>
            item.name === name &&
            item.size === size &&
            item.purchaseType === purchaseType &&
            item.isCustom === isCustom &&
            item.texture === texture
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...itemData });
        }

        updateCartUI();
        toggleCart();
    };

    const updateSizePills = () => {
        sizePills.forEach(pill => {
            pill.classList.toggle('active', pill.dataset.size === selectedSize);
        });
    };

    const updateCartUI = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountNodes.forEach(node => node.innerText = totalItems);

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your bag is empty.</p>';
            totalAmountNode.innerText = '₹0.00';
            return;
        }

        let total = 0;
        cartItemsContainer.innerHTML = cart.map((item, index) => {
            total += item.price * item.quantity;
            const typeLabel = item.purchaseType === 'subscription' ? '<span class="sub-badge">Subscription</span>' : 'One-time';
            const customBadge = item.isCustom ? '<span class="custom-badge">Custom</span>' : '';
            return `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-header">
                            <h4>${item.name}</h4>
                            ${customBadge}
                        </div>
                        <p class="cart-item-details">Size: ${item.size} • ₹${item.price.toLocaleString('en-IN')}</p>
                        <div class="cart-item-controls">
                            <div class="cart-qty-selector">
                                <button class="cart-qty-btn minus" data-index="${index}">-</button>
                                <span class="cart-qty-value">${item.quantity}</span>
                                <button class="cart-qty-btn plus" data-index="${index}">+</button>
                            </div>
                            <p class="cart-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                    <button class="remove-item" data-index="${index}">&times;</button>
                </div>
            `;
        }).join('');

        totalAmountNode.innerText = `₹${total.toLocaleString('en-IN')}`;

        // Add Quantity Logic
        document.querySelectorAll('.cart-qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.dataset.index;
                if (cart[index].quantity > 1) {
                    cart[index].quantity--;
                    updateCartUI();
                }
            });
        });

        document.querySelectorAll('.cart-qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.dataset.index;
                cart[index].quantity++;
                updateCartUI();
            });
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                cart.splice(btn.dataset.index, 1);
                updateCartUI();
            });
        });
    };

    // Event Listeners - Product Cards (Modal & Controls)
    document.querySelectorAll('.product-card').forEach(card => {
        const qtyValue = card.querySelector('.qty-value');
        const minusBtn = card.querySelector('.minus');
        const plusBtn = card.querySelector('.plus');

        // Quantity +/- Logic
        minusBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            let current = parseInt(qtyValue.innerText);
            if (current > 1) qtyValue.innerText = --current;
        });

        plusBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            let current = parseInt(qtyValue.innerText);
            qtyValue.innerText = ++current;
        });

        // Add to Bag Logic
        card.querySelector('.add-to-cart-quick')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const name = card.querySelector('h3').innerText;
            const priceText = card.querySelector('.product-price').innerText;
            const price = parseFloat(priceText.replace('₹', '').replace(',', ''));

            // Use defaults if controls are missing (minimalist grid)
            const quantity = qtyValue ? parseInt(qtyValue.innerText) : 1;
            const purchaseTypeSelect = card.querySelector('.purchase-type-select');
            const purchaseType = purchaseTypeSelect ? purchaseTypeSelect.value : 'one-time';
            const size = 'M'; // Default for quick add

            addItemToCart({ name, price, quantity, size, purchaseType, isCustom: false });

            // Reset local quantity if control exists
            if (qtyValue) qtyValue.innerText = '1';
        });

        // Customize Logic
        card.querySelector('.customize-btn-quick')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const name = card.querySelector('h3').innerText;
            const priceText = card.querySelector('.product-price').innerText;
            const price = parseFloat(priceText.replace('₹', '').replace(',', ''));
            const img = card.querySelector('img').src;

            openCustomizer({ name, price, img });
        });

        // Modal Open Logic
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-quick') ||
                e.target.closest('.purchase-controls')) return;

            const img = card.querySelector('img').src;
            const name = card.querySelector('h3').innerText;
            const price = card.querySelector('.product-price').innerText;
            openQuickView({ img, name, price });
        });
    });

    closeQuickView?.addEventListener('click', () => quickViewModal.style.display = 'none');
    closeSizeChart?.addEventListener('click', () => sizeChartModal.style.display = 'none');
    openSizeChartBtn?.addEventListener('click', () => sizeChartModal.style.display = 'flex');
    modalOverlayNodes.forEach(overlay => overlay.addEventListener('click', () => {
        quickViewModal.style.display = 'none';
        sizeChartModal.style.display = 'none';
    }));

    sizePills.forEach(pill => {
        pill.addEventListener('click', () => {
            selectedSize = pill.dataset.size;
            updateSizePills();
        });
    });

    // Modal Quantity Controls
    const modalQtyValue = document.querySelector('.modal-qty-value');
    const modalMinusBtn = document.querySelector('.modal-qty-btn.minus');
    const modalPlusBtn = document.querySelector('.modal-qty-btn.plus');
    const modalPurchaseType = document.querySelector('.modal-purchase-type-select');

    modalMinusBtn?.addEventListener('click', () => {
        let current = parseInt(modalQtyValue.innerText);
        if (current > 1) modalQtyValue.innerText = --current;
    });

    modalPlusBtn?.addEventListener('click', () => {
        let current = parseInt(modalQtyValue.innerText);
        modalQtyValue.innerText = ++current;
    });

    addToCartModalBtn?.addEventListener('click', () => {
        const name = modalTitle.innerText;
        const price = parseFloat(modalPrice.innerText.replace('₹', '').replace(',', ''));
        const quantity = parseInt(modalQtyValue.innerText);
        const purchaseType = modalPurchaseType.value;

        addItemToCart({ name, price, quantity, size: selectedSize, purchaseType, isCustom: false });

        // Reset modal state
        modalQtyValue.innerText = '1';
        modalPurchaseType.value = 'one-time';

        quickViewModal.style.display = 'none';
    });

    // 3D Customizer Event Listeners
    closeCustomizerBtn?.addEventListener('click', () => {
        custom3dModal.style.display = 'none';
    });

    textureBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            textureBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTexture = btn.dataset.texture;
        });
    });

    addCustomToCartBtn?.addEventListener('click', () => {
        if (!activeCustomItem) return;

        const { name, price } = activeCustomItem;
        const quantity = 1;
        const size = 'M';
        const purchaseType = 'one-time';
        const isCustom = true;
        const texture = selectedTexture;

        addItemToCart({
            name: `${name} (Custom)`,
            price: price + 200, // Premium for custom
            quantity,
            size,
            purchaseType,
            isCustom,
            texture
        });

        custom3dModal.style.display = 'none';
    });


    // UI Elements - Checkout & Payment
    const checkoutBtn = document.querySelector('.checkout-btn');
    const paymentModal = document.querySelector('.payment-modal');
    const closePaymentBtn = document.querySelector('.close-payment');
    const payMethods = document.querySelectorAll('.pay-method');
    const completePaymentBtn = document.querySelector('.complete-payment-btn');
    const orderConfirmedModal = document.querySelector('.order-confirmed-modal');
    const closeConfirmBtn = document.querySelector('.close-confirm-btn');

    // UI Elements - Account
    const accountBtn = document.getElementById('account-btn');
    const accountModal = document.querySelector('.account-modal');
    const closeAccountBtn = document.querySelector('.close-account');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const logoutBtn = document.querySelector('.logout-btn');

    // UI Elements - Phase 4 (Logistics)
    const adminLink = document.getElementById('admin-link');
    const inventoryModal = document.querySelector('.inventory-modal');
    const closeInventoryBtn = document.querySelector('.close-inventory');
    const shippingModal = document.querySelector('.shipping-modal');
    const closeShippingBtn = document.querySelector('.close-shipping');
    const printLabelBtn = document.querySelector('.print-label-btn');

    // ... (existing functions)

    // Event Listeners - Phase 4
    adminLink?.addEventListener('click', (e) => {
        e.preventDefault();
        inventoryModal.style.display = 'flex';
    });

    closeInventoryBtn?.addEventListener('click', () => {
        inventoryModal.style.display = 'none';
    });

    closeShippingBtn?.addEventListener('click', () => {
        shippingModal.style.display = 'none';
    });

    printLabelBtn?.addEventListener('click', () => {
        printLabelBtn.innerText = 'Connecting...';
        printLabelBtn.disabled = true;

        setTimeout(() => {
            printLabelBtn.innerText = 'Label Printed ✓';
            setTimeout(() => {
                shippingModal.style.display = 'none';
                printLabelBtn.innerText = 'Print Shipping Label';
                printLabelBtn.disabled = false;
            }, 1500);
        }, 2000);
    });

    // Add "View Label" to order confirmation
    document.querySelector('.close-confirm-btn')?.addEventListener('click', () => {
        // Option to view label before returning
        if (confirm('Would you like to view your shipping label?')) {
            shippingModal.style.display = 'flex';
        }
    });

    // Event Listeners - Account
    accountBtn?.addEventListener('click', () => {
        if (document.body.classList.contains('is-logged-in')) {
            accountModal.style.display = 'flex';
        } else {
            document.querySelector('.auth-modal').style.display = 'flex';
        }
    });

    closeAccountBtn?.addEventListener('click', () => {
        accountModal.style.display = 'none';
    });

    tabBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const tabId = btn.dataset.tab;

            // Toggle buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle content
            tabContents.forEach(content => {
                content.style.display = (content.id === `${tabId}-tab`) ? 'block' : 'none';
            });

            // Fetch History if on orders tab
            if (tabId === 'orders') {
                loadUserHistory();
            }
        });
    });

    const renderOrderHistory = (history) => {
        const ordersTab = document.getElementById('orders-tab');
        if (history.length === 0) {
            ordersTab.innerHTML = '<p class="no-orders-msg">No orders found yet.</p>';
            return;
        }

        ordersTab.innerHTML = history.map(order => `
        <div class="order-card-status">
            <div class="order-header">
                <div>
                    <span class="order-id">#${order._id.substring(18).toUpperCase()}</span>
                    <span class="order-date">${new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                ${order.paymentStatus === 'Paid' ? `
                    <button class="download-invoice-btn" onclick="window.open('${API_BASE_URL}/orders/invoice/${order._id}', '_blank')">
                        Invoice ↓
                    </button>
                ` : ''}
            </div>
            <div class="status-tracker">
                <div class="status-step active">Placed</div>
                <div class="status-step ${order.paymentStatus === 'Paid' ? 'active' : ''}">Paid</div>
                <div class="status-step">Delivered</div>
            </div>
            <div class="order-items-minimal">
                ${order.items.map(i => `<small>${i.name} (${i.size})</small>`).join(', ')}
            </div>
        </div>
    `).join('');
    };

    logoutBtn?.addEventListener('click', () => {
        logoutBtn.innerText = 'Signing Out...';
        setTimeout(() => {
            accountModal.style.display = 'none';
            logoutBtn.innerText = 'Sign Out';
        }, 1000);
    });

    // Event Listeners - Checkout Flow
    checkoutBtn?.addEventListener('click', () => {
        if (cart.length === 0) {
            checkoutBtn.innerText = 'Bag is Empty!';
            setTimeout(() => checkoutBtn.innerText = 'Checkout', 2000);
            return;
        }
        toggleCart(); // Close cart drawer
        paymentModal.style.display = 'flex';
    });

    closePaymentBtn?.addEventListener('click', () => {
        paymentModal.style.display = 'none';
    });

    payMethods.forEach(method => {
        method.addEventListener('click', () => {
            payMethods.forEach(m => m.classList.remove('active'));
            method.classList.add('active');
        });
    });

    completePaymentBtn?.addEventListener('click', async () => {
        // 1. Create Order in Backend
        completePaymentBtn.innerText = 'Creating Order...';
        completePaymentBtn.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: CURRENT_USER_ID,
                    items: cart,
                    totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
                })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            const orderId = data.orderId;

            // 2. Simulate Payment Process
            completePaymentBtn.innerText = 'Processing Payment...';
            setTimeout(async () => {
                // 3. Simulate Payment Success Webhook
                await fetch(`${API_BASE_URL}/orders/payment-webhook`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: orderId,
                        transactionId: `KW-TXN-${Date.now()}`,
                        status: 'success'
                    })
                });

                paymentModal.style.display = 'none';
                orderConfirmedModal.style.display = 'flex';

                // Clear cart
                cart = [];
                updateCartUI();

                // Reset button
                completePaymentBtn.innerText = 'Complete Purchase';
                completePaymentBtn.disabled = false;
            }, 2000);

        } catch (error) {
            console.error('Checkout Error:', error);
            completePaymentBtn.innerText = 'Checkout Failed';
            setTimeout(() => {
                completePaymentBtn.innerText = 'Complete Purchase';
                completePaymentBtn.disabled = false;
            }, 2000);
        }
    });

    closeConfirmBtn?.addEventListener('click', () => {
        orderConfirmedModal.style.display = 'none';
    });

    // Handle overlay clicks for new modals
    window.addEventListener('click', (e) => {
        if (e.target === paymentModal.querySelector('.modal-overlay')) {
            paymentModal.style.display = 'none';
        }
    });

    // Smooth Scroll with Offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Auto-close mobile menu if open
                if (mobileMenuOverlay.classList.contains('active')) {
                    toggleMobileMenu();
                }
            }
        });
    });

    // Event Listeners - Navigation & Cart
    cartBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleCart();
    });

    closeCartBtn?.addEventListener('click', () => {
        toggleCart();
    });

    document.querySelector('.continue-shopping')?.addEventListener('click', () => {
        toggleCart();
    });

    mobileMenuBtn?.addEventListener('click', () => {
        toggleMobileMenu();
    });

    closeMobileMenu?.addEventListener('click', () => {
        toggleMobileMenu();
    });

    // Close mobile menu on link click
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuOverlay.classList.remove('active');
        });
    });

    // Navbar Shadow on Scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.05)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });
});
