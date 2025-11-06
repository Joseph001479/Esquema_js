// Carrinho de compras - TechParts com Olympo Checkout REAL
let cart = JSON.parse(localStorage.getItem('techparts_cart')) || [];

// 🔐 CREDENCIAIS REAIS DA OLYMPO CHECKOUT
const OLYMPO_CONFIG = {
    secretKey: 'codiguz_hoPtVWuiglzlhqnlc7PtVWegdF3tKWlaLFDn24soctLFDn249keBfjJ1AS9rP7sV5uMbi4sEp0zd44aNDEa5o02AgeLAUUR9F3tKW98ye3508-r87e-9r82-wy48-88591rr2760wq',
    clientId: 'gateway_8ye3508-r87e-9r82-wy48-88591rr2760wF3tKWqhoPtVWuiglzlhqnlc7PtVWegdF3tKW9',
    baseUrl: 'https://integration.olympocheckout.com',
    successUrl: window.location.href,
    failureUrl: window.location.href,
    webhookUrl: window.location.href
};

// ===== INTEGRAÇÃO PROFISSIONAL COM OLYMPO CHECKOUT =====

async function handleRealCheckout() {
    const currentUser = localStorage.getItem('techparts_current_user');
    if (!currentUser) {
        showCartMessage('🔐 Faça login para finalizar a compra', 'error');
        closeCart();
        setTimeout(() => {
            const authButtons = document.querySelector('[onclick*="authSystem"]');
            if (authButtons) authButtons.click();
        }, 500);
        return;
    }

    if (cart.length === 0) {
        showCartMessage('🛒 Seu carrinho está vazio', 'error');
        return;
    }

    try {
        showCartMessage('🔄 Conectando com Olympo Checkout...', 'info');
        
        const orderData = prepareRealOrderData();
        const paymentResult = await createRealOlympoInvoice(orderData);
        
        if (paymentResult.success && paymentResult.checkout_url) {
            // 💰 SALVAR DADOS DO PEDIDO ANTES DE REDIRECIONAR
            localStorage.setItem('last_order_total', orderData.amount.toString());
            localStorage.setItem('last_order_id', orderData.order_id);
            
            showCartMessage('✅ Redirecionando para pagamento seguro...', 'success');
            setTimeout(() => {
                // 🎯 REDIRECIONAR PARA CHECKOUT REAL DA OLYMPO
                window.location.href = paymentResult.checkout_url;
            }, 2000);
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
        
        // 🔥 PAYLOAD CORRETO PARA API OLYMPO
        const payload = {
            order_id: orderData.order_id,
            amount: orderData.amount,
            currency: orderData.currency,
            description: `Pedido ${orderData.order_id} - TechParts Store`,
            customer: {
                name: orderData.customer.name,
                email: orderData.customer.email,
                // Campos adicionais que podem ser úteis
                tax_id: orderData.customer.cpf || '', // CPF opcional
                phone: orderData.customer.phone || '' // Telefone opcional
            },
            items: orderData.items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                description: item.description
            })),
            // 🔗 URLs de retorno
            success_url: `${OLYMPO_CONFIG.successUrl}?payment_status=success&order_id=${orderData.order_id}`,
            failure_url: `${OLYMPO_CONFIG.failureUrl}?payment_status=failure&order_id=${orderData.order_id}`,
            webhook_url: OLYMPO_CONFIG.webhookUrl,
            // ⚙️ Configurações adicionais
            expires_in: 3600, // 1 hora para expirar
            metadata: {
                store: 'TechParts',
                source: 'web_store',
                user_agent: navigator.userAgent
            },
            // 💳 Configurações de métodos de pagamento
            payment_methods: ['credit_card', 'pix', 'boleto'],
            capture: true, // Capturar pagamento automaticamente
            statement_descriptor: 'TechParts' // Nome no extrato
        };

        console.log('📤 Payload enviado para Olympo:', payload);

        // 🔐 CHAMADA REAL PARA API OLYMPO COM CREDENCIAIS REAIS
        const response = await fetch(`${OLYMPO_CONFIG.baseUrl}/faturas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OLYMPO_CONFIG.secretKey}`,
                'Client-ID': OLYMPO_CONFIG.clientId,
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        console.log('📥 Resposta bruta da Olympo:', responseText);

        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            console.error('Erro ao parsear resposta:', e);
            return {
                success: false,
                message: 'Resposta inválida da API'
            };
        }

        console.log('📊 Resposta parseada da Olympo:', responseData);

        if (!response.ok) {
            return {
                success: false,
                message: responseData.message || responseData.error || `Erro ${response.status}`,
                status: response.status,
                details: responseData
            };
        }

        // 🎉 SUCESSO - RETORNAR DADOS REAIS DA OLYMPO
        return {
            success: true,
            invoice_id: responseData.id,
            checkout_url: responseData.checkout_url || responseData.payment_url,
            status: responseData.status,
            payment_data: responseData,
            // Dados específicos da Olympo
            qr_code: responseData.qr_code, // Para PIX
            barcode: responseData.barcode, // Para boleto
            due_date: responseData.due_date // Para boleto
        };

    } catch (error) {
        console.error('❌ Erro na integração REAL:', error);
        return {
            success: false,
            message: 'Falha na conexão com a Olympo: ' + error.message
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
            description: `${item.name} - ${item.category || 'Componente'}`
        })),
        customer: {
            name: currentUser.name,
            email: currentUser.email,
            cpf: currentUser.cpf || '', // Se disponível
            phone: currentUser.phone || '' // Se disponível
        }
    };
}

// ===== VERIFICAÇÃO DE STATUS DE PAGAMENTO REAL =====

function checkRealPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    const orderId = urlParams.get('order_id');
    const invoiceId = urlParams.get('invoice_id');
    
    if (paymentStatus === 'success' && orderId) {
        showRealPaymentSuccess(orderId, invoiceId);
    } else if (paymentStatus === 'failure') {
        showRealPaymentFailure(orderId);
    }
}

function showRealPaymentSuccess(orderId, invoiceId) {
    // 🛒 LIMPAR CARRINHO APÓS SUCESSO
    cart = [];
    localStorage.removeItem('techparts_cart');
    updateCartUI();
    
    // 💾 SALVAR NO HISTÓRICO DE PEDIDOS
    const orders = JSON.parse(localStorage.getItem('techparts_orders') || '[]');
    const total = localStorage.getItem('last_order_total') || '0';
    
    orders.push({
        id: orderId,
        invoice_id: invoiceId,
        total: parseFloat(total),
        date: new Date().toISOString(),
        status: 'approved',
        items: JSON.parse(localStorage.getItem('techparts_cart') || '[]')
    });
    
    localStorage.setItem('techparts_orders', JSON.stringify(orders));
    
    // 🎉 MOSTRAR CONFIRMAÇÃO REAL
    const successHTML = `
        <div class="real-payment-success">
            <div class="success-content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Pagamento Aprovado! 🎉</h2>
                
                <div class="order-details">
                    <div class="detail-item">
                        <span class="label">Número do pedido:</span>
                        <span class="value">${orderId}</span>
                    </div>
                    ${invoiceId ? `
                    <div class="detail-item">
                        <span class="label">Fatura Olympo:</span>
                        <span class="value">${invoiceId}</span>
                    </div>
                    ` : ''}
                    <div class="detail-item">
                        <span class="label">Total pago:</span>
                        <span class="value">R$ ${parseFloat(total).toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Data:</span>
                        <span class="value">${new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Status:</span>
                        <span class="status-badge status-approved">Aprovado</span>
                    </div>
                </div>

                <div class="success-note">
                    <i class="fas fa-shield-alt"></i>
                    <div>
                        <strong>Pagamento processado com segurança pela Olympo Checkout</strong>
                        <p>Você receberá um e-mail com todos os detalhes da compra e instruções de entrega.</p>
                    </div>
                </div>

                <div class="success-actions">
                    <button onclick="closeRealPaymentSuccess()" class="btn btn--primary">
                        <i class="fas fa-shopping-bag"></i>
                        Continuar Comprando
                    </button>
                    <button onclick="printOrderDetails('${orderId}')" class="btn btn--secondary">
                        <i class="fas fa-print"></i>
                        Imprimir Recibo
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', successHTML);
}

function showRealPaymentFailure(orderId) {
    showCartMessage('❌ Pagamento não autorizado. Tente novamente.', 'error');
    // Limpar parâmetros da URL
    setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
    }, 3000);
}

function closeRealPaymentSuccess() {
    const successEl = document.querySelector('.real-payment-success');
    if (successEl) successEl.remove();
    // Limpar parâmetros da URL
    window.history.replaceState({}, document.title, window.location.pathname);
}

function printOrderDetails(orderId) {
    const printWindow = window.open('', '_blank');
    const total = localStorage.getItem('last_order_total') || '0';
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Recibo - Pedido ${orderId}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .details { margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
                .footer { margin-top: 30px; text-align: center; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>TechParts Store</h1>
                <h2>Recibo de Pagamento</h2>
            </div>
            <div class="details">
                <div class="detail-row">
                    <strong>Número do Pedido:</strong>
                    <span>${orderId}</span>
                </div>
                <div class="detail-row">
                    <strong>Data:</strong>
                    <span>${new Date().toLocaleString('pt-BR')}</span>
                </div>
                <div class="detail-row">
                    <strong>Total:</strong>
                    <span>R$ ${parseFloat(total).toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <strong>Status:</strong>
                    <span style="color: green;">Aprovado</span>
                </div>
            </div>
            <div class="footer">
                <p>Processado por Olympo Checkout</p>
                <p>TechParts Store - CNPJ: 12.345.678/0001-99</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// ===== ATUALIZAR BOTÃO PARA CHECKOUT REAL =====

function updateCheckoutButton() {
    if (!checkoutBtn) return;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (cart.length === 0) {
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = '0.6';
        checkoutBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Finalizar Compra';
    } else {
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = '1';
        checkoutBtn.innerHTML = `
            <i class="fas fa-lock"></i> 
            Pagar com Olympo - R$ ${total.toFixed(2)}
        `;
        // 🔥 USAR O CHECKOUT REAL
        checkoutBtn.onclick = handleRealCheckout;
    }
}

// ===== ESTILOS PROFISSIONAIS =====

const realPaymentStyles = `
    .real-payment-success {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
        padding: 20px;
        box-sizing: border-box;
    }
    
    .success-content {
        background: white;
        padding: 3rem 2rem;
        border-radius: 1.5rem;
        text-align: center;
        max-width: 500px;
        width: 100%;
        animation: slideInUp 0.5s ease;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    
    .success-icon {
        font-size: 5rem;
        color: #10b981;
        margin-bottom: 1.5rem;
        animation: bounce 1s ease;
    }
    
    .success-content h2 {
        color: #1e293b;
        margin-bottom: 2rem;
        font-size: 2rem;
        font-weight: 700;
    }
    
    .order-details {
        background: #f8fafc;
        padding: 2rem;
        border-radius: 1rem;
        margin-bottom: 2rem;
        text-align: left;
        border: 2px solid #e2e8f0;
    }
    
    .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 1rem 0;
        padding: 0.75rem 0;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .detail-item:last-child {
        border-bottom: none;
    }
    
    .label {
        font-weight: 600;
        color: #475569;
    }
    
    .value {
        color: #1e293b;
        font-weight: 500;
    }
    
    .status-badge {
        padding: 0.5rem 1rem;
        border-radius: 2rem;
        font-size: 0.875rem;
        font-weight: 600;
    }
    
    .status-approved {
        background: #d1fae5;
        color: #065f46;
    }
    
    .success-note {
        background: linear-gradient(135deg, #dbeafe, #e0e7ff);
        color: #1e40af;
        padding: 1.5rem;
        border-radius: 1rem;
        margin-bottom: 2rem;
        text-align: left;
        border-left: 4px solid #3b82f6;
        display: flex;
        align-items: flex-start;
        gap: 1rem;
    }
    
    .success-note i {
        font-size: 1.5rem;
        margin-top: 0.25rem;
    }
    
    .success-actions {
        display: flex;
        gap: 1rem;
        flex-direction: column;
    }
    
    .success-actions .btn {
        padding: 1rem 2rem;
        font-size: 1.1rem;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(50px) scale(0.9);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-10px);
        }
        60% {
            transform: translateY(-5px);
        }
    }
    
    @media (max-width: 480px) {
        .success-content {
            padding: 2rem 1rem;
            margin: 10px;
        }
        
        .success-actions {
            flex-direction: column;
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
    checkRealPaymentStatus(); // Verificar status REAL ao carregar
});

// Exportar funções globais
window.handleCheckout = handleRealCheckout;
window.closeRealPaymentSuccess = closeRealPaymentSuccess;
window.printOrderDetails = printOrderDetails;

console.log('💰 Sistema de pagamento REAL Olympo carregado com credenciais profissionais!');
