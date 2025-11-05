// Dados dos produtos ORGANIZADOS POR CATEGORIA
const productsData = [
    // ===== PROCESSADORES =====
    {
        id: 1,
        name: "Intel Core i9-14900K",
        price: 3299.99,
        category: "processadores",
        image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80",
        description: "24 núcleos, 32 threads, até 6.0GHz"
    },
    {
        id: 2,
        name: "AMD Ryzen 9 7950X",
        price: 2899.99,
        category: "processadores",
        image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&q=80",
        description: "16 núcleos, 32 threads, 5.7GHz"
    },
    {
        id: 3,
        name: "Intel Core i7-14700K",
        price: 2199.99,
        category: "processadores",
        image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80",
        description: "20 núcleos, 28 threads, 5.6GHz"
    },
    {
        id: 4,
        name: "AMD Ryzen 7 7800X3D",
        price: 2499.99,
        category: "processadores",
        image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&q=80",
        description: "8 núcleos, 16 threads, tecnologia 3D-V-Cache"
    },

    // ===== PLACAS DE VÍDEO =====
    {
        id: 5,
        name: "NVIDIA RTX 4090",
        price: 8999.99,
        category: "placas-video",
        image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80",
        description: "24GB GDDR6X, DLSS 3, Ray Tracing"
    },
    {
        id: 6,
        name: "AMD RX 7900 XTX",
        price: 5499.99,
        category: "placas-video",
        image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80",
        description: "24GB GDDR6, FSR 3, Ray Accelerators"
    },
    {
        id: 7,
        name: "NVIDIA RTX 4070 Ti",
        price: 4299.99,
        category: "placas-video",
        image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80",
        description: "12GB GDDR6X, DLSS 3, 4K Gaming"
    },
    {
        id: 8,
        name: "AMD RX 7800 XT",
        price: 3499.99,
        category: "placas-video",
        image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80",
        description: "16GB GDDR6, FSR 3, 1440p Ultra"
    },

    // ===== MEMÓRIAS =====
    {
        id: 9,
        name: "Corsair Vengeance RGB 32GB",
        price: 699.99,
        category: "memorias",
        image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&q=80",
        description: "DDR5 6000MHz, CL36, RGB Sync"
    },
    {
        id: 10,
        name: "G.Skill Trident Z5 64GB",
        price: 1299.99,
        category: "memorias",
        image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&q=80",
        description: "DDR5 6400MHz, CL32, 2x32GB"
    },
    {
        id: 11,
        name: "Kingston Fury Beast 16GB",
        price: 399.99,
        category: "memorias",
        image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&q=80",
        description: "DDR5 5600MHz, CL40, Plug & Play"
    },
    {
        id: 12,
        name: "Team Group Delta RGB 32GB",
        price: 599.99,
        category: "memorias",
        image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&q=80",
        description: "DDR5 6000MHz, CL38, ARGB Lighting"
    },

    // ===== ARMAZENAMENTO =====
    {
        id: 13,
        name: "Samsung 990 Pro 2TB",
        price: 899.99,
        category: "armazenamento",
        image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&q=80",
        description: "NVMe PCIe 4.0, 7450MB/s leitura"
    },
    {
        id: 14,
        name: "WD Black SN850X 4TB",
        price: 1499.99,
        category: "armazenamento",
        image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&q=80",
        description: "NVMe PCIe 4.0, 7300MB/s, heatsink"
    },
    {
        id: 15,
        name: "Crucial P5 Plus 1TB",
        price: 499.99,
        category: "armazenamento",
        image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&q=80",
        description: "NVMe PCIe 4.0, 6600MB/s leitura"
    },
    {
        id: 16,
        name: "Seagate FireCuda 530 2TB",
        price: 999.99,
        category: "armazenamento",
        image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&q=80",
        description: "NVMe PCIe 4.0, 7300MB/s, 5-year warranty"
    }
];

// Função para exibir produtos
function displayProducts(products = productsData) {
    const grid = document.getElementById('products-grid');
    
    if (!grid) {
        console.error('Elemento products-grid não encontrado!');
        return;
    }

    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = '<p class="no-products">Nenhum produto encontrado</p>';
        return;
    }

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product__card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product__image">
            <h3 class="product__name">${product.name}</h3>
            <p class="product__description">${product.description}</p>
            <div class="product__price">R$ ${product.price.toFixed(2)}</div>
            <button class="btn btn--primary add-to-cart" onclick="addToCart(${product.id})">
                <i class="fas fa-shopping-cart"></i>
                Adicionar ao Carrinho
            </button>
        `;
        grid.appendChild(productCard);
    });
}

// Filtro por categoria
function setupCategoryFilters() {
    const categoryBtns = document.querySelectorAll('.category__btn');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active de todos
            categoryBtns.forEach(b => b.classList.remove('active'));
            // Adiciona active no clicado
            this.classList.add('active');
            
            const category = this.dataset.category;
            
            if (category === 'all') {
                displayProducts();
            } else {
                const filteredProducts = productsData.filter(
                    product => product.category === category
                );
                displayProducts(filteredProducts);
            }
        });
    });
}

// ===== SISTEMA DE PESQUISA =====
function setupSearch() {
    const searchIcon = document.querySelector('.nav__search');
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <div class="search-box">
            <input type="text" id="search-input" placeholder="Pesquisar produtos..." class="search-input">
            <button class="search-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Inserir após o header
    const header = document.getElementById('header');
    header.parentNode.insertBefore(searchContainer, header.nextSibling);

    let isSearchOpen = false;

    // Abrir/fechar pesquisa
    searchIcon.addEventListener('click', function() {
        if (!isSearchOpen) {
            searchContainer.classList.add('active');
            document.getElementById('search-input').focus();
            isSearchOpen = true;
        } else {
            closeSearch();
        }
    });

    // Fechar pesquisa
    function closeSearch() {
        searchContainer.classList.remove('active');
        document.getElementById('search-input').value = '';
        displayProducts(); // Mostra todos os produtos novamente
        isSearchOpen = false;
    }

    // Fechar com botão X
    searchContainer.querySelector('.search-close').addEventListener('click', closeSearch);

    // Pesquisar em tempo real
    document.getElementById('search-input').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm.length === 0) {
            displayProducts();
            return;
        }

        const filteredProducts = productsData.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );

        displayProducts(filteredProducts);
    });

    // Fechar pesquisa ao pressionar ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isSearchOpen) {
            closeSearch();
        }
    });
}

// Menu mobile
function setupMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
}

// Inicializar tudo quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    displayProducts();
    setupCategoryFilters();
    setupSearch();
    setupMobileMenu();
    console.log('Página carregada - ' + productsData.length + ' produtos disponíveis');
});