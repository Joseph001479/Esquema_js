// Carrinho de compras - TechParts com Olympo Checkout REAL
let cart = JSON.parse(localStorage.getItem('techparts_cart')) || [];

// 🔐 CREDENCIAIS REAIS DA OLYMPO CHECKOUT - CORRIGIDAS
const OLYMPO_CONFIG = {
    secretKey: 'fba5da8b187996626e9cfa0d99aa3dccd880ca8e4bc2d080d2a561d32f5daf67', // ✅ CHAVE REAL DO SEU DASHBOARD
    baseUrl: 'https://integration.olympocheckout.com',
    successUrl: window.location.href,
    failureUrl: window.location.href,
    webhookUrl: window.location.href
};

// ===== INTEGRAÇÃO CORRIGIDA COM OLYMPO CHECKOUT =====

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
        
        console.log('🎯 Resultado do pagamento:', paymentResult);
        
        if (paymentResult.success && paymentResult.checkout_url) {
            // 💰 SALVAR DADOS DO PEDIDO
            localStorage.setItem('last_order_total', orderData.amount.toString());
            localStorage.setItem('last_order_id', orderData.order_id);
            
            showCartMessage('✅ Redirecionando para pagamento seguro...', 'success');
            setTimeout(() => {
                // 🎯 REDIRECIONAR PARA CHECKOUT REAL DA OLYMPO
                window.location.href = paymentResult.checkout_url;
            }, 2000);
        } else {
            showCartMessage(`❌ Erro: ${paymentResult.message}`, 'error');
            console.error('Detalhes do erro:', paymentResult);
        }
        
    } catch (error) {
        console.error('Erro no checkout real:', error);
        showCartMessage('❌ Erro de conexão com a Olympo', 'error');
    }
}

// 🎯 FUNÇÃO PRINCIPAL - INTEGRAÇÃO CORRIGIDA
async function createRealOlympoInvoice(orderData) {
    try {
        console.log('🚀 Criando fatura REAL na Olympo...', orderData);
        
        // 🔥 PAYLOAD SIMPLIFICADO E CORRETO
        const payload = {
            amount: orderData.amount,
            currency: 'BRL',
            description: `Pedido ${orderData.order_id} - TechParts`,
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
        console.log('🔑 Usando Secret Key:', OLYMPO_CONFIG.secretKey.substring(0, 10) + '...');

        // 🔐 CHAMADA REAL PARA API OLYMPO - ENDPOINT CORRETO
        const response = await fetch(`${OLYMPO_CONFIG.baseUrl}/faturas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OLYMPO_CONFIG.secretKey}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log('📥 Status da resposta:', response.status);
        console.log('📥 Headers:', response.headers);

        const responseText = await response.text();
        console.log('📥 Resposta completa:', responseText);

        if (!response.ok) {
            let errorMessage = `Erro HTTP ${response.status}`;
            try {
                const errorJson = JSON.parse(responseText);
                errorMessage = errorJson.message || errorJson.error || errorMessage;
                console.error('❌ Erro detalhado:', errorJson);
            } catch (e) {
                errorMessage = responseText || errorMessage;
            }
            
            return {
                success: false,
                message: errorMessage,
                status: response.status
            };
        }

        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            console.error('Erro ao parsear JSON:', e);
            return {
                success: false,
                message: 'Resposta inválida da API'
            };
        }

        console.log('✅ Resposta REAL da Olympo:', responseData);

        // 🎉 VERIFICAR DIFERENTES FORMATOS DE RESPOSTA
        if (responseData.id) {
            return {
                success: true,
                invoice_id: responseData.id,
                checkout_url: responseData.checkout_url || 
                             responseData.payment_url || 
                             `${OLYMPO_CONFIG.baseUrl}/faturas/${responseData.id}/link-de-pagamento`,
                status: responseData.status || 'pending',
                payment_data: responseData
            };
        } else {
            return {
                success: false,
                message: 'Resposta incompleta da API Olympo',
                response: responseData
            };
        }

    } catch (error) {
        console.error('❌ Erro na integração REAL:', error);
        return {
            success: false,
            message: 'Falha na conexão: ' + error.message
        };
    }
}

// ===== TESTE DE CONEXÃO COM A API =====

async function testOlympoConnection() {
    try {
        console.log('🔍 Testando conexão com Olympo API...');
        
        const response = await fetch(`${OLYMPO_CONFIG.baseUrl}/empresa/informacoes`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${OLYMPO_CONFIG.secretKey}`,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Conexão OK - Informações da empresa:', data);
            return { success: true, data };
        } else {
            console.error('❌ Falha na conexão:', response.status);
            return { success: false, status: response.status };
        }
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        return { success: false, error: error.message };
    }
}

// ===== VERIFICAÇÃO DE STATUS =====

function checkRealPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    const orderId = urlParams.get('order_id');
    
    console.log('🔍 Verificando status de pagamento:', { paymentStatus, orderId });
    
    if (paymentStatus === 'success' && orderId) {
        showRealPaymentSuccess(orderId);
        // Limpar URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'failure') {
        showCartMessage('❌ Pagamento não autorizado. Tente novamente.', 'error');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

function showRealPaymentSuccess(orderId) {
    // 🛒 LIMPAR CARRINHO
    cart = [];
    localStorage.removeItem('techparts_cart');
    updateCartUI();
    
    const total = localStorage.getItem('last_order_total') || '0';
    
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
                        <p>Seu pedido foi confirmado e está sendo processado.</p>
                    </div>
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

// ===== BOTÃO DE TESTE (para desenvolvimento) =====

function addTestButton() {
    const testBtn = document.createElement('button');
    testBtn.innerHTML = '🧪 Testar Conexão Olympo';
    testBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #f59e0b;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        z-index: 10000;
        font-size: 12px;
    `;
    testBtn.onclick = async () => {
        const result = await testOlympoConnection();
        if (result.success) {
            showCartMessage('✅ Conexão com Olympo OK!', 'success');
        } else {
            showCartMessage('❌ Falha na conexão com Olympo', 'error');
        }
    };
    document.body.appendChild(testBtn);
}

// ===== INICIALIZAÇÃO =====

document.addEventListener('DOMContentLoaded', function() {
    updateCartUI();
    checkRealPaymentStatus();
    
    // Adicionar botão de teste apenas em desenvolvimento
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('github.io')) {
        addTestButton();
    }
    
    // Testar conexão automaticamente
    setTimeout(() => {
        testOlympoConnection().then(result => {
            if (result.success) {
                console.log('🚀 Olympo Checkout conectado com sucesso!');
            } else {
                console.error('❌ Falha na conexão com Olympo');
            }
        });
    }, 1000);
});

// Exportar funções globais
window.handleCheckout = handleRealCheckout;
window.closeRealPaymentSuccess = closeRealPaymentSuccess;
window.testOlympoConnection = testOlympoConnection;

console.log('💰 Sistema Olympo carregado - Chave:', OLYMPO_CONFIG.secretKey.substring(0, 10) + '...');
