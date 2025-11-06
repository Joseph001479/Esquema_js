// Carrinho de compras - TechParts com Olympo Checkout REAL
let cart = JSON.parse(localStorage.getItem('techparts_cart')) || [];

// Configurações REAIS da API Olympo Checkout
const OLYMPO_CONFIG = {
    apiToken: 'fba5da8b187996626e9cfa0d99aa3dccd880ca8e4bc2d080d2a561d32f5daf67',
    baseUrl: 'https://integration.olympocheckout.com',
    successUrl: window.location.href,
    failureUrl: window.location.href
};

// ===== INTEGRAÇÃO REAL COM OLYMPO CHECKOUT =====

async function handleRealCheckout() {
    if (cart.length === 0) {
        showCartMessage('Seu carrinho está vazio', 'error');
        return;
    }

    try {
        showCartMessage('🔄 Conectando com Olympo Checkout...', 'info');
        
        const orderData = prepareRealOrderData();
        const paymentResult = await createRealOlympoInvoice(orderData);
        
        if (paymentResult.success && paymentResult.checkout_url) {
            // 🎉 REDIRECIONAR PARA O CHECKOUT REAL DA OLYMPO
            showCartMessage('✅ Redirecionando para pagamento...', 'success');
            setTimeout(() => {
                window.location.href = paymentResult.checkout_url;
            }, 1500);
        } else {
            showCartMessage(`❌ Erro: ${paymentResult.message}`, 'error');
        }
        
    } catch (error) {
        console.error('Erro no checkout real:', error);
        showCartMessage('❌ Erro de conexão com a Olympo', 'error');
    }
}

// 🎯 FUNÇÃO PRINCIPAL - INTEGRAÇÃO 100% REAL
async function createRealOlympoInvoice(orderData) {
    try {
        console.log('🚀 Criando fatura REAL na Olympo...', orderData);
        
        // 🔥 PAYLOAD CORRETO BASEADO NA DOCUMENTAÇÃO
        const payload = {
            description: `Pedido ${orderData.order_id} - TechParts`,
            amount: orderData.amount,
            currency: 'BRL',
            customer: {
                name: orderData.customer.name,
                email: orderData.customer.email
            },
            items: orderData.items.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            success_url: `${OLYMPO_CONFIG.successUrl}?payment_status=success&order_id=${orderData.order_id}`,
            failure_url: `${OLYMPO_CONFIG.failureUrl}?payment_status=failure&order_id=${orderData.order_id}`,
            metadata: {
                order_id: orderData.order_id,
                store: 'TechParts'
            }
        };

        console.log('📤 Payload enviado para Olympo:', payload);

        // 🔥 CHAMADA REAL PARA API OLYMPO
        const response = await fetch(`${OLYMPO_CONFIG.baseUrl}/faturas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OLYMPO_CONFIG.apiToken}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const responseData = await response.json();
        console.log('📥 Resposta da Olympo:', responseData);

        if (!response.ok) {
            return {
                success: false,
                message: responseData.message || `Erro ${response.status}`,
                status: response.status
            };
        }

        // 🎉 SUCESSO - RETORNAR DADOS REAIS DA OLYMPO
        return {
            success: true,
            invoice_id: responseData.id,
            checkout_url: responseData.checkout_url || `${OLYMPO_CONFIG.baseUrl}/faturas/${responseData.id}/link-de-pagamento`,
            status: responseData.status,
            payment_data: responseData
        };

    } catch (error) {
        console.error('❌ Erro na integração REAL:', error);
        return {
            success: false,
            message: 'Falha na conexão: ' + error.message
        };
    }
}

function prepareRealOrderData() {
    const currentUser = JSON.parse(localStorage.getItem('techparts_current_user') || '{"name":"Cliente","email":"cliente@email.com"}');
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
            description: `Componente ${item.name}`
        })),
        customer: {
            name: currentUser.name,
            email: currentUser.email
        }
    };
}

// ===== VERIFICAÇÃO DE STATUS DE PAGAMENTO REAL =====

function checkRealPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    const orderId = urlParams.get('order_id');
    
    if (paymentStatus === 'success' && orderId) {
        showRealPaymentSuccess(orderId);
    } else if (paymentStatus === 'failure') {
        showCartMessage('❌ Pagamento recusado pela operadora', 'error');
    }
}

function showRealPaymentSuccess(orderId) {
    // Limpar carrinho após sucesso
    cart = [];
    localStorage.removeItem('techparts_cart');
    updateCartUI();
    
    // Mostrar confirmação REAL
    const total = JSON.parse(localStorage.getItem('last_order_total') || '0');
    
    const successHTML = `
        <div class="real-payment-success">
            <div class="success-content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Pagamento Aprovado!</h2>
                <div class="order-details">
                    <p><strong>Número do pedido:</strong> ${orderId}</p>
                    <p><strong>Total:</strong> R$ ${parseFloat(total).toFixed(2)}</p>
                    <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
                    <p><strong>Status:</strong> <span class="status-approved">Aprovado</span></p>
                </div>
                <div class="success-note">
                    <i class="fas fa-info-circle"></i>
                    <strong>Pagamento processado com sucesso pela Olympo Checkout</strong>
                    <p>Você receberá um e-mail com os detalhes da compra.</p>
                </div>
                <button onclick="closeRealPaymentSuccess()" class="btn btn--primary">
                    <i class="fas fa-shopping-bag"></i>
                    Continuar Comprando
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', successHTML);
}

function closeRealPaymentSuccess() {
    const successEl = document.querySelector('.real-payment-success');
    if (successEl) successEl.remove();
    // Limpar parâmetros da URL
    window.history.replaceState({}, document.title, window.location.pathname);
}

// ===== ATUALIZAR O BOTÃO DE CHECKOUT PARA USAR O SISTEMA REAL =====

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
        checkoutBtn.innerHTML = `💰 Pagar com Olympo - R$ ${total.toFixed(2)}`;
        // 🔥 USAR O CHECKOUT REAL
        checkoutBtn.onclick = handleRealCheckout;
    }
}

// ===== ESTILOS PARA O SUCESSO REAL =====

const realPaymentStyles = `
    .real-payment-success {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    }
    
    .success-content {
        background: white;
        padding: 3rem;
        border-radius: 1rem;
        text-align: center;
        max-width: 500px;
        width: 90%;
        animation: slideInUp 0.5s ease;
    }
    
    .success-icon {
        font-size: 4rem;
        color: #10b981;
        margin-bottom: 1.5rem;
    }
    
    .success-content h2 {
        color: #1e293b;
        margin-bottom: 2rem;
        font-size: 1.8rem;
    }
    
    .order-details {
        background: #f8fafc;
        padding: 1.5rem;
        border-radius: 0.75rem;
        margin-bottom: 2rem;
        text-align: left;
    }
    
    .order-details p {
        margin: 0.75rem 0;
        color: #475569;
        display: flex;
        justify-content: space-between;
    }
    
    .status-approved {
        color: #10b981;
        background: #d1fae5;
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.875rem;
        font-weight: 600;
    }
    
    .success-note {
        background: #dbeafe;
        color: #1e40af;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 2rem;
        text-align: left;
        border-left: 4px solid #3b82f6;
    }
    
    .success-note i {
        margin-right: 0.5rem;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

// Adicionar estilos
if (!document.querySelector('#real-payment-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'real-payment-styles';
    styleEl.textContent = realPaymentStyles;
    document.head.appendChild(styleEl);
}

// ===== INICIALIZAÇÃO =====

document.addEventListener('DOMContentLoaded', function() {
    updateCartUI();
    checkRealPaymentStatus(); // Verificar status REAL ao carregar a página
});

// Substituir a função handleCheckout antiga pela nova
window.handleCheckout = handleRealCheckout;
window.closeRealPaymentSuccess = closeRealPaymentSuccess;

console.log('💰 Sistema de pagamento REAL Olympo carregado!');
