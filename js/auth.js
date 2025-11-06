// Carrinho de compras - TechParts com Olympo Checkout
let cart = JSON.parse(localStorage.getItem('techparts_cart')) || [];

// Configurações da API Olympo Checkout
const OLYMPO_CONFIG = {
    apiToken: 'fba5da8b187996626e9cfa0d99aa3dccd880ca8e4bc2d080d2a561d32f5daf67',
    baseUrl: 'https://api.olympocheckout.com/api/public',
    successUrl: 'https://joseph001479.github.io/Esquema_js_v2/',
    failureUrl: 'https://joseph001479.github.io/Esquema_js_v2/',
    webhookUrl: 'https://joseph001479.github.io/Esquema_js_v2/'
};

// Elementos DOM do carrinho
const cartIcon = document.getElementById('cart-icon');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartClose = document.getElementById('cart-close');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.querySelector('.cart__count');
const checkoutBtn = document.getElementById('checkout-btn');

// Inicialização do carrinho
document.addEventListener('DOMContentLoaded', function() {
    updateCartUI();
    setupCartEventListeners();
    checkPaymentReturn();
});

// Configurar event listeners do carrinho
function setupCartEventListeners() {
    if (cartIcon) cartIcon.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if (checkoutBtn) checkoutBtn.addEventListener('click', handleCheckout);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeCart();
    });
}

// Verificar se voltou do pagamento
function checkPaymentReturn() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    
    if (paymentStatus === 'success') {
        showCartMessage('✅ Pagamento aprovado! Pedido confirmado.', 'success');
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'failure') {
        showCartMessage('❌ Pagamento recusado. Tente novamente.', 'error');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Abrir/fechar carrinho
function openCart() {
    if (cartSidebar) cartSidebar.classList.add('active');
    if (cartOverlay) cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    if (cartSidebar) cartSidebar.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Adicionar ao carrinho
function addToCart(productId) {
    const product = productsData.find(p => p.id === productId);
    
    if (!product) {
        showCartMessage('Produto não encontrado', 'error');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1,
            cartId: Date.now()
        });
    }

    updateCartUI();
    saveCartToStorage();
    showCartMessage(`${product.name} adicionado ao carrinho!`, 'success');
    setTimeout(openCart, 500);
}

// Remover do carrinho
function removeFromCart(cartId) {
    cart = cart.filter(item => item.cartId !== cartId);
    updateCartUI();
    saveCartToStorage();
    showCartMessage('Produto removido do carrinho', 'info');
}

// Atualizar quantidade
function updateQuantity(cartId, change) {
    const item = cart.find(item => item.cartId === cartId);
    
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(cartId);
        } else {
            updateCartUI();
            saveCartToStorage();
        }
    }
}

// Atualizar UI do carrinho
function updateCartUI() {
    updateCartCount();
    updateCartItems();
    updateCartTotal();
    updateCheckoutButton();
}

function updateCartCount() {
    if (!cartCount) return;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
}

function updateCartItems() {
    if (!cartItems) return;
    cartItems.innerHTML = '';

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Seu carrinho está vazio</div>';
        return;
    }

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item__image">
            <div class="cart-item__details">
                <div class="cart-item__name">${item.name}</div>
                <div class="cart-item__price">R$ ${item.price.toFixed(2)}</div>
                <div class="cart-item__quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.cartId}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.cartId}, 1)">+</button>
                </div>
                <button class="cart-item__remove" onclick="removeFromCart(${item.cartId})">
                    <i class="fas fa-trash"></i> Remover
                </button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
}

function updateCartTotal() {
    if (!cartTotal) return;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `R$ ${total.toFixed(2)}`;
}

function updateCheckoutButton() {
    if (!checkoutBtn) return;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (cart.length === 0) {
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = '0.6';
        checkoutBtn.innerHTML = 'Finalizar Compra';
    } else {
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = '1';
        checkoutBtn.innerHTML = `Finalizar Compra - R$ ${total.toFixed(2)}`;
    }
}

function saveCartToStorage() {
    try {
        localStorage.setItem('techparts_cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Erro ao salvar carrinho:', error);
        showCartMessage('Erro ao salvar carrinho', 'error');
    }
}

// ===== INTEGRAÇÃO COM OLYMPO CHECKOUT =====

async function handleCheckout() {
    const currentUser = localStorage.getItem('techparts_current_user');
    if (!currentUser) {
        showCartMessage('Faça login para finalizar a compra', 'error');
        closeCart();
        setTimeout(() => {
            if (typeof authSystem !== 'undefined') authSystem.showAuthScreen('login');
            const navMenu = document.getElementById('nav-menu');
            if (navMenu) navMenu.classList.add('active');
        }, 500);
        return;
    }

    if (cart.length === 0) {
        showCartMessage('Seu carrinho está vazio', 'error');
        return;
    }

    try {
        const orderData = prepareOrderData();
        showPaymentMethodSelector(orderData);
    } catch (error) {
        console.error('Erro no checkout:', error);
        showCartMessage('Erro ao processar pedido', 'error');
    }
}

function prepareOrderData() {
    const currentUser = JSON.parse(localStorage.getItem('techparts_current_user'));
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
        order_id: `TP${Date.now()}`,
        amount: total,
        currency: 'BRL',
        items: cart.map(item => ({
            id: item.id.toString(),
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            description: item.description || `Componente ${item.name} - ${item.category}`
        })),
        customer: {
            name: currentUser.name,
            email: currentUser.email
        },
        metadata: {
            order_id: `TP${Date.now()}`,
            store: 'TechParts',
            source: 'web_store'
        }
    };
}

// ===== SELEÇÃO DE MÉTODO DE PAGAMENTO =====

function showPaymentMethodSelector(orderData) {
    const selectorHTML = `
        <div class="payment-selector-overlay">
            <div class="payment-selector">
                <div class="selector-header">
                    <h2><i class="fas fa-credit-card"></i> Escolha como pagar</h2>
                    <button class="selector-close" onclick="closePaymentSelector()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="order-summary">
                    <h3>Resumo do Pedido</h3>
                    <p><strong>Total:</strong> R$ ${orderData.amount.toFixed(2)}</p>
                    <p><strong>Itens:</strong> ${orderData.items.length} produto(s)</p>
                </div>

                <div class="payment-methods">
                    <div class="payment-method" data-method="credit_card">
                        <div class="method-icon">
                            <i class="fas fa-credit-card"></i>
                        </div>
                        <div class="method-info">
                            <h4>Cartão de Crédito</h4>
                            <p>Pague com cartão em até 12x</p>
                        </div>
                        <div class="method-check">
                            <i class="fas fa-check"></i>
                        </div>
                    </div>

                    <div class="payment-method" data-method="pix">
                        <div class="method-icon">
                            <i class="fas fa-qrcode"></i>
                        </div>
                        <div class="method-info">
                            <h4>PIX</h4>
                            <p>Pagamento instantâneo com QR Code</p>
                        </div>
                        <div class="method-check">
                            <i class="fas fa-check"></i>
                        </div>
                    </div>

                    <div class="payment-method" data-method="boleto">
                        <div class="method-icon">
                            <i class="fas fa-barcode"></i>
                        </div>
                        <div class="method-info">
                            <h4>Boleto Bancário</h4>
                            <p>Pague em qualquer banco</p>
                        </div>
                        <div class="method-check">
                            <i class="fas fa-check"></i>
                        </div>
                    </div>
                </div>

                <div class="selector-actions">
                    <button class="btn btn--secondary" onclick="closePaymentSelector()">
                        <i class="fas fa-arrow-left"></i>
                        Voltar
                    </button>
                    <button id="confirm-payment-btn" class="btn btn--primary" disabled>
                        <i class="fas fa-lock"></i>
                        Continuar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', selectorHTML);
    setupPaymentSelectorEvents(orderData);
}

function setupPaymentSelectorEvents(orderData) {
    let selectedMethod = null;
    
    document.querySelectorAll('.payment-method').forEach(methodEl => {
        methodEl.addEventListener('click', function() {
            selectedMethod = this.getAttribute('data-method');
            
            document.querySelectorAll('.payment-method').forEach(el => {
                el.classList.remove('selected');
            });
            
            this.classList.add('selected');
            
            const confirmBtn = document.getElementById('confirm-payment-btn');
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = `<i class="fas fa-lock"></i> Pagar com ${getMethodName(selectedMethod)}`;
            
            confirmBtn.onclick = () => processPaymentWithMethod(orderData, selectedMethod);
        });
    });
}

function getMethodName(method) {
    const names = {
        'credit_card': 'Cartão',
        'pix': 'PIX', 
        'boleto': 'Boleto'
    };
    return names[method] || method;
}

function closePaymentSelector() {
    const overlay = document.querySelector('.payment-selector-overlay');
    if (overlay) overlay.remove();
}

// ===== PROCESSAR PAGAMENTO REAL =====

async function processPaymentWithMethod(orderData, method) {
    try {
        closePaymentSelector();
        closeCart();
        
        showCartMessage(`Processando pagamento com ${getMethodName(method)}...`, 'info');
        
        const paymentResult = await createRealOlympoInvoice(orderData, method);
        
        if (paymentResult.success) {
            await handleSuccessfulPayment(orderData, paymentResult);
        } else {
            showCartMessage(`Erro: ${paymentResult.message}`, 'error');
            setTimeout(() => showPaymentMethodSelector(orderData), 3000);
        }
        
    } catch (error) {
        console.error('Erro no processamento:', error);
        showCartMessage('Erro de conexão. Tente novamente.', 'error');
        setTimeout(() => showPaymentMethodSelector(orderData), 3000);
    }
}

// Função principal - Integração real
async function createRealOlympoInvoice(orderData, method) {
    try {
        console.log('🚀 Criando fatura REAL na Olympo...');
        
        const payload = {
            description: `Pedido ${orderData.order_id} - TechParts`,
            amount: orderData.amount,
            currency: 'BRL',
            payment_method: method,
            customer: orderData.customer,
            items: orderData.items,
            success_url: OLYMPO_CONFIG.successUrl + '?payment_status=success',
            failure_url: OLYMPO_CONFIG.failureUrl + '?payment_status=failure',
            webhook_url: OLYMPO_CONFIG.webhookUrl,
            expires_in: 86400,
            metadata: orderData.metadata
        };

        console.log('📤 Payload REAL:', payload);

        const response = await fetch(`${OLYMPO_CONFIG.baseUrl}/invoices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OLYMPO_CONFIG.apiToken}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log('📥 Status da resposta:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro HTTP:', response.status, errorText);
            
            let errorMessage = `Erro ${response.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorJson.error || errorMessage;
            } catch (e) {
                errorMessage = errorText || errorMessage;
            }
            
            return {
                success: false,
                message: errorMessage
            };
        }

        const result = await response.json();
        console.log('✅ Resposta REAL da Olympo:', result);

        if (result.id && result.checkout_url) {
            return {
                success: true,
                invoiceId: result.id,
                checkoutUrl: result.checkout_url,
                status: result.status || 'pending',
                paymentMethod: method,
                realPayment: true
            };
        } else {
            return {
                success: false,
                message: 'Resposta incompleta da API Olympo'
            };
        }

    } catch (error) {
        console.error('❌ Erro na integração REAL:', error);
        return {
            success: false,
            message: error.message || 'Erro de comunicação com o gateway'
        };
    }
}

// Pagamento bem-sucedido
async function handleSuccessfulPayment(orderData, paymentResult) {
    try {
        const orders = JSON.parse(localStorage.getItem('techparts_orders') || '[]');
        const orderToSave = {
            ...orderData,
            invoiceId: paymentResult.invoiceId,
            checkoutUrl: paymentResult.checkoutUrl,
            status: paymentResult.status,
            createdAt: new Date().toISOString(),
            paymentMethod: paymentResult.paymentMethod,
            realPayment: true
        };
        
        orders.push(orderToSave);
        localStorage.setItem('techparts_orders', JSON.stringify(orders));
        localStorage.setItem('last_olympo_invoice', JSON.stringify(orderToSave));

        cart = [];
        saveCartToStorage();
        updateCartUI();
        
        showCartMessage(`✅ Pagamento via ${getMethodName(paymentResult.paymentMethod)} criado! Redirecionando...`, 'success');

        setTimeout(() => {
            if (paymentResult.checkoutUrl) {
                console.log('🔄 Redirecionando para:', paymentResult.checkoutUrl);
                window.location.href = paymentResult.checkoutUrl;
            } else {
                showOrderConfirmation(orderToSave);
            }
        }, 2000);

    } catch (error) {
        console.error('Erro ao finalizar pedido:', error);
        throw new Error('Erro ao finalizar o pedido');
    }
}

// Mostrar confirmação do pedido
function showOrderConfirmation(order) {
    const confirmationHTML = `
        <div class="order-confirmation-overlay">
            <div class="order-confirmation">
                <div class="confirmation-header">
                    <i class="fas fa-check-circle"></i>
                    <h2>Pedido Criado com Sucesso!</h2>
                </div>
                <div class="confirmation-details">
                    <p><strong>Número do Pedido:</strong> ${order.order_id}</p>
                    <p><strong>Fatura Olympo:</strong> ${order.invoiceId}</p>
                    <p><strong>Total:</strong> R$ ${order.amount.toFixed(2)}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <p><strong>Método:</strong> ${getMethodName(order.paymentMethod)}</p>
                    <p class="success-info"><i class="fas fa-info-circle"></i> Você será redirecionado para o pagamento</p>
                </div>
                <div class="confirmation-actions">
                    <button onclick="closeConfirmation()" class="btn btn--secondary">
                        <i class="fas fa-home"></i>
                        Fechar
                    </button>
                    ${order.checkoutUrl ? `
                    <button onclick="window.location.href='${order.checkoutUrl}'" class="btn btn--primary">
                        <i class="fas fa-credit-card"></i>
                        Ir para Pagamento
                    </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', confirmationHTML);
}

function closeConfirmation() {
    const overlay = document.querySelector('.order-confirmation-overlay');
    if (overlay) overlay.remove();
}

// ===== ESTILOS =====

const paymentSelectorStyles = `
    .payment-selector-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    }
    
    .payment-selector {
        background: white;
        padding: 0;
        border-radius: 1rem;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        animation: slideInUp 0.3s ease;
    }
    
    .selector-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e2e8f0;
        background: #f8fafc;
        border-radius: 1rem 1rem 0 0;
    }
    
    .selector-header h2 {
        color: #1e293b;
        margin: 0;
        font-size: 1.25rem;
    }
    
    .selector-close {
        background: none;
        border: none;
        font-size: 1.25rem;
        color: #64748b;
        cursor: pointer;
        padding: 0.5rem;
    }
    
    .order-summary {
        padding: 1.5rem;
        background: #f1f5f9;
        margin: 0;
    }
    
    .order-summary h3 {
        margin: 0 0 1rem 0;
        color: #334155;
    }
    
    .order-summary p {
        margin: 0.25rem 0;
        color: #475569;
    }
    
    .payment-methods {
        padding: 1.5rem;
    }
    
    .payment-method {
        display: flex;
        align-items: center;
        padding: 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 0.75rem;
        margin-bottom: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .payment-method:hover {
        border-color: #3b82f6;
        background: #f8fafc;
    }
    
    .payment-method.selected {
        border-color: #10b981;
        background: #f0fdf4;
    }
    
    .method-icon {
        width: 3rem;
        height: 3rem;
        background: #3b82f6;
        color: white;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 1rem;
        font-size: 1.25rem;
    }
    
    .payment-method[data-method="pix"] .method-icon {
        background: #32bbad;
    }
    
    .payment-method[data-method="boleto"] .method-icon {
        background: #8b5cf6;
    }
    
    .method-info {
        flex: 1;
    }
    
    .method-info h4 {
        margin: 0 0 0.25rem 0;
        color: #1e293b;
    }
    
    .method-info p {
        margin: 0;
        color: #64748b;
        font-size: 0.875rem;
    }
    
    .method-check {
        color: #10b981;
        font-size: 1.25rem;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .payment-method.selected .method-check {
        opacity: 1;
    }
    
    .selector-actions {
        display: flex;
        gap: 1rem;
        padding: 1.5rem;
        border-top: 1px solid #e2e8f0;
        background: #f8fafc;
        border-radius: 0 0 1rem 1rem;
    }
    
    .selector-actions .btn {
        flex: 1;
    }
    
    .success-info {
        background: #d1fae5;
        color: #065f46;
        padding: 0.75rem;
        border-radius: 0.375rem;
        border-left: 4px solid #10b981;
        margin-top: 1rem;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

// Adicionar estilos ao documento
if (!document.querySelector('#payment-selector-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'payment-selector-styles';
    styleEl.textContent = paymentSelectorStyles;
    document.head.appendChild(styleEl);
}

// Mensagens do carrinho
function showCartMessage(message, type = 'info') {
    removeExistingCartMessages();

    const messageEl = document.createElement('div');
    messageEl.className = `cart-message cart-message--${type}`;
    messageEl.innerHTML = `
        <i class="fas fa-${getMessageIcon(type)}"></i>
        ${message}
        <button class="cart-message-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(messageEl);

    setTimeout(() => {
        if (messageEl.parentElement) messageEl.remove();
    }, 4000);

    messageEl.querySelector('.cart-message-close').addEventListener('click', () => {
        messageEl.remove();
    });
}

function getMessageIcon(type) {
    const icons = { 
        success: 'check-circle', 
        error: 'exclamation-circle', 
        info: 'info-circle',
        warning: 'exclamation-triangle'
    };
    return icons[type] || 'info-circle';
}

function removeExistingCartMessages() {
    document.querySelectorAll('.cart-message').forEach(msg => msg.remove());
}

// Limpeza e inicialização
function cleanupCorruptedCart() {
    try {
        JSON.parse(localStorage.getItem('techparts_cart'));
    } catch (error) {
        localStorage.removeItem('techparts_cart');
        cart = [];
        updateCartUI();
    }
}

cleanupCorruptedCart();

// Exportar funções globais
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.openCart = openCart;
window.closeCart = closeCart;
window.handleCheckout = handleCheckout;
window.closeConfirmation = closeConfirmation;
window.closePaymentSelector = closePaymentSelector;

console.log('🛒 Sistema do carrinho 100% FUNCIONAL carregado!');
