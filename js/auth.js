// Carrinho de compras - TechParts com Cloudfy Checkout REAL
let cart = JSON.parse(localStorage.getItem('techparts_cart')) || [];

// 🔐 CONFIGURAÇÕES CLOUDFY CHECKOUT
const CLOUDFY_CONFIG = {
    apiKey: 'codiguz_hoPtVWuiglzlhqnlc7PtVWegdF3tKWlaLFDn24soctLFDn249keBfjJ1AS9rP7sV5uMbi4sEp0zd44aNDEa5o02AgeLAUUR9F3tKW98ye3508-r87e-9r82-wy48-88591rr2760wq',
    clientId: 'gateway_8ye3508-r87e-9r82-wy48-88591rr2760wF3tKWqhoPtVWuiglzlhqnlc7PtVWegdF3tKW9',
    baseURL: 'https://api.cloudfycheckout.com',
    webhookURL: 'https://webhooks.cloudfycheckout.com/webhooks/ghostspayv2',
    successURL: window.location.href + '?payment=success',
    failureURL: window.location.href + '?payment=failed'
};

// 🎯 FUNÇÃO PRINCIPAL CLOUDFY
async function processarCheckoutCloudfy() {
    console.log('🚀 INICIANDO CHECKOUT CLOUDFY...');
    
    if (cart.length === 0) {
        alert('🛒 Carrinho vazio!');
        return;
    }

    const usuario = JSON.parse(localStorage.getItem('techparts_current_user') || '{"name":"Cliente","email":"cliente@email.com"}');

    try {
        mostrarLoadingCloudfy();

        // 🔥 DADOS PARA CLOUDFY
        const orderData = {
            order_id: `TP${Date.now()}`,
            amount: calcularTotal(),
            currency: "BRL",
            description: "Compra TechParts - Componentes Eletrônicos",
            customer: {
                name: usuario.name,
                email: usuario.email,
                tax_id: usuario.cpf || "000.000.000-00"
            },
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                description: item.description || `Produto ${item.name}`
            })),
            payment_methods: ["credit_card", "pix", "boleto"],
            success_url: CLOUDFY_CONFIG.successURL,
            failure_url: CLOUDFY_CONFIG.failureURL,
            webhook_url: CLOUDFY_CONFIG.webhookURL,
            expires_in: 3600,
            metadata: {
                store: "TechParts",
                source: "web_store",
                user_id: usuario.id || "guest"
            }
        };

        console.log('📦 Enviando para Cloudfy:', orderData);

        // 🔥 REQUISIÇÃO PARA CLOUDFY
        const response = await fetch(`${CLOUDFY_CONFIG.baseURL}/v1/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CLOUDFY_CONFIG.apiKey}`,
                'X-Client-ID': CLOUDFY_CONFIG.clientId
            },
            body: JSON.stringify(orderData)
        });

        console.log('📥 Status:', response.status);

        const result = await response.json();
        console.log('🎯 Resposta Cloudfy:', result);

        if (!response.ok) {
            throw new Error(result.message || result.error || `Erro ${response.status}`);
        }

        // 🎉 REDIRECIONAR
        if (result.checkout_url) {
            console.log('✅ Redirecionando para checkout...');
            window.location.href = result.checkout_url;
        } else if (result.payment_url) {
            window.location.href = result.payment_url;
        } else {
            throw new Error('URL de pagamento não encontrada');
        }

    } catch (error) {
        console.error('❌ ERRO:', error);
        alert(`💔 Erro: ${error.message}`);
    } finally {
        esconderLoadingCloudfy();
    }
}

// 🧮 FUNÇÕES AUXILIARES
function calcularTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function mostrarLoadingCloudfy() {
    const loadingHTML = `
        <div id="loading-cloudfy" style="
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.95);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99999;
            font-family: Arial, sans-serif;
        ">
            <div style="
                background: linear-gradient(135deg, #667eea, #764ba2);
                padding: 3rem;
                border-radius: 15px;
                text-align: center;
                color: white;
                min-width: 350px;
            ">
                <div style="font-size: 4rem; margin-bottom: 1rem;">⚡</div>
                <h2 style="margin: 0 0 1rem 0;">Cloudfy Checkout</h2>
                <p style="margin: 0 0 2rem 0; opacity: 0.9;">Processando seu pagamento...</p>
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
                    <div style="width: 25px; height: 25px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <span>Conectando com gateway</span>
                </div>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
}

function esconderLoadingCloudfy() {
    const loading = document.getElementById('loading-cloudfy');
    if (loading) loading.remove();
}

// 🔄 VERIFICAR STATUS
function verificarStatusCloudfy() {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('payment');
    
    if (status === 'success') {
        mostrarSucessoCloudfy();
        cart = [];
        localStorage.removeItem('techparts_cart');
        updateCartUI();
        
        setTimeout(() => {
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 100);
        
    } else if (status === 'failed') {
        alert('❌ Pagamento não autorizado pela operadora.');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

function mostrarSucessoCloudfy() {
    const total = calcularTotal();
    
    const successHTML = `
        <div style="
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: linear-gradient(135deg, #00b09b, #96c93d);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99998;
            font-family: Arial, sans-serif;
        ">
            <div style="
                background: white;
                padding: 3rem;
                border-radius: 20px;
                text-align: center;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 25px 50px rgba(0,0,0,0.2);
            ">
                <div style="font-size: 5rem; margin-bottom: 1rem;">🎊</div>
                <h2 style="color: #00b09b; margin-bottom: 1rem; font-size: 2.2rem;">Sucesso!</h2>
                <h3 style="color: #334155; margin-bottom: 2rem;">Pagamento Aprovado</h3>
                
                <div style="background: #f8fafc; padding: 2rem; border-radius: 15px; margin-bottom: 2rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 1.1rem;">
                        <span style="color: #64748b;">Total:</span>
                        <span style="color: #00b09b; font-weight: bold; font-size: 1.3rem;">R$ ${total.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                        <span style="color: #64748b;">Data:</span>
                        <span style="color: #334155;">${new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #64748b;">Processado por:</span>
                        <span style="color: #334155; font-weight: bold;">Cloudfy Checkout</span>
                    </div>
                </div>

                <div style="background: #e8f5e8; padding: 1rem; border-radius: 10px; margin-bottom: 2rem; border-left: 4px solid #00b09b;">
                    <p style="margin: 0; color: #2d5a2d; font-size: 0.9rem;">
                        ✅ Seu pagamento foi processado com segurança. Você receberá um e-mail de conf
