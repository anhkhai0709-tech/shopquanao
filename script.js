/* ===== Anh Khải Shop - Main JavaScript ===== */

(function () {
    'use strict';

    // ===== DOM Elements =====
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');
    const contactForm = document.getElementById('contactForm');
    const toast = document.getElementById('toast');
    const toastClose = document.getElementById('toastClose');
    const toastMessage = document.getElementById('toastMessage');
    const searchInput = document.getElementById('searchInput');
    const productsGrid = document.getElementById('productsGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const headerLinks = document.querySelectorAll('.header__link');

    // ===== Cart Elements =====
    const cartToggleBtn = document.getElementById('cartToggleBtn');
    const cartCloseBtn = document.getElementById('cartCloseBtn');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartBadgeCount = document.getElementById('cartBadgeCount');
    const cartTotalCount = document.getElementById('cartTotalCount');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const cartDrawerBody = document.getElementById('cartDrawerBody');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const messageInput = document.getElementById('message');

    // ===== Cart State =====
    let cart = JSON.parse(localStorage.getItem('anhkhai_cart')) || [];

    function saveCart() {
        localStorage.setItem('anhkhai_cart', JSON.stringify(cart));
        updateCartUI();
    }

    function formatPrice(price) {
        return price.toLocaleString('vi-VN') + '₫';
    }

    function updateCartUI() {
        // Calculate total count and price
        let totalCount = 0;
        let totalPrice = 0;

        cart.forEach(function (item) {
            totalCount += item.quantity;
            totalPrice += item.price * item.quantity;
        });

        // Update badges
        cartBadgeCount.textContent = totalCount;
        cartTotalCount.textContent = totalCount;
        cartTotalPrice.textContent = formatPrice(totalPrice);

        // Render Cart Body
        if (cart.length === 0) {
            cartDrawerBody.innerHTML = `
                <div class="cart-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    <p>Giỏ hàng của bạn đang trống</p>
                </div>
            `;
        } else {
            let html = '';
            cart.forEach(function (item, index) {
                const imgTag = item.img 
                    ? `<img src="${item.img}" alt="${item.name}" class="cart-item__img">`
                    : `<div class="cart-item__img" style="background:#eef2ff;display:flex;align-items:center;justify-content:center;font-size:20px;">👕</div>`;

                html += `
                    <div class="cart-item" data-index="${index}">
                        ${imgTag}
                        <div class="cart-item__info">
                            <h4 class="cart-item__name">${item.name}</h4>
                            <span class="cart-item__price">${formatPrice(item.price)}</span>
                            <div class="cart-item__qty">
                                <button class="cart-item__qty-btn qty-minus" data-index="${index}">-</button>
                                <span class="cart-item__qty-num">${item.quantity}</span>
                                <button class="cart-item__qty-btn qty-plus" data-index="${index}">+</button>
                            </div>
                        </div>
                        <button class="cart-item__remove" data-index="${index}" title="Xóa">&times;</button>
                    </div>
                `;
            });
            cartDrawerBody.innerHTML = html;
        }
    }

    // Toggle Cart Drawer
    function openCart() {
        cartDrawer.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        cartDrawer.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    cartToggleBtn.addEventListener('click', openCart);
    cartCloseBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Cart Body Event Delegation (+, -, Remove)
    cartDrawerBody.addEventListener('click', function (e) {
        const target = e.target;
        const index = parseInt(target.getAttribute('data-index'), 10);

        if (target.classList.contains('qty-plus')) {
            cart[index].quantity += 1;
            saveCart();
        } else if (target.classList.contains('qty-minus')) {
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                cart.splice(index, 1);
            }
            saveCart();
        } else if (target.classList.contains('cart-item__remove')) {
            const removedName = cart[index].name;
            cart.splice(index, 1);
            saveCart();
            showToast(`Đã xóa "${removedName}" khỏi giỏ hàng!`);
        }
    });

    // Clear Cart
    clearCartBtn.addEventListener('click', function () {
        if (cart.length === 0) return;
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ hàng?')) {
            cart = [];
            saveCart();
            showToast('Đã xóa sạch giỏ hàng!');
        }
    });

    // Add to Cart Logic
    function addToCart(product, openDrawer = false) {
        const existingIndex = cart.findIndex(item => item.id === product.id);
        if (existingIndex > -1) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: parseInt(product.price, 10),
                img: product.img,
                quantity: 1
            });
        }
        saveCart();
        showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);

        if (openDrawer) {
            openCart();
        }
    }

    // Event listeners for Add To Cart & Buy Now buttons
    document.addEventListener('click', function (e) {
        const addBtn = e.target.closest('.add-to-cart-btn');
        const buyBtn = e.target.closest('.buy-now-btn');

        if (addBtn) {
            const product = {
                id: addBtn.getAttribute('data-id'),
                name: addBtn.getAttribute('data-name'),
                price: addBtn.getAttribute('data-price'),
                img: addBtn.getAttribute('data-img')
            };
            addToCart(product, false);
        } else if (buyBtn) {
            const product = {
                id: buyBtn.getAttribute('data-id'),
                name: buyBtn.getAttribute('data-name'),
                price: buyBtn.getAttribute('data-price'),
                img: buyBtn.getAttribute('data-img')
            };
            addToCart(product, false);
            populateCheckoutForm();
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });

    // Checkout button inside cart drawer
    function populateCheckoutForm() {
        if (cart.length === 0) return;

        let summaryText = 'ĐƠN HÀNG CỦA BẠN:\n';
        let total = 0;

        cart.forEach((item, i) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            summaryText += `${i + 1}. ${item.name} - SL: ${item.quantity} x ${formatPrice(item.price)} = ${formatPrice(itemTotal)}\n`;
        });

        summaryText += `\nTỔNG CỘNG: ${formatPrice(total)}`;
        messageInput.value = summaryText;
    }

    checkoutBtn.addEventListener('click', function () {
        if (cart.length === 0) {
            showToast('Giỏ hàng trống! Hãy thêm sản phẩm trước.');
            return;
        }
        populateCheckoutForm();
        closeCart();
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
        showToast('Đã chuyển đơn hàng sang form Liên Hệ. Hãy điền thông tin để hoàn tất!');
    });

    // Initial render of cart
    updateCartUI();

    // ===== Mobile Menu =====
    function createOverlay() {
        const overlay = document.createElement('div');
        overlay.classList.add('header__overlay');
        overlay.id = 'headerOverlay';
        document.body.appendChild(overlay);
        return overlay;
    }

    const overlay = createOverlay();

    function toggleMenu() {
        hamburger.classList.toggle('active');
        navbar.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = navbar.classList.contains('active') ? 'hidden' : '';
    }

    function closeMenu() {
        hamburger.classList.remove('active');
        navbar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);

    // Close menu when clicking a nav link
    headerLinks.forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });

    // ===== Header Scroll Effect =====
    function handleScroll() {
        var scrollY = window.scrollY;

        // Header shadow
        if (scrollY > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }

        // Back to top button
        if (scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        // Active nav link based on section
        updateActiveLink();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // ===== Active Navigation Link =====
    function updateActiveLink() {
        var sections = document.querySelectorAll('section[id]');
        var scrollPos = window.scrollY + 150;

        sections.forEach(function (section) {
            var sectionTop = section.offsetTop;
            var sectionHeight = section.offsetHeight;
            var sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                headerLinks.forEach(function (link) {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // ===== Back to Top =====
    backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===== Scroll Animations (Intersection Observer) =====
    function initScrollAnimations() {
        var animatedElements = document.querySelectorAll('.animate-on-scroll');

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            animatedElements.forEach(function (el) {
                observer.observe(el);
            });
        } else {
            animatedElements.forEach(function (el) {
                el.classList.add('visible');
            });
        }
    }

    initScrollAnimations();

    // ===== Counter Animation =====
    function animateCounters() {
        var counters = document.querySelectorAll('.stat__number');

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var counter = entry.target;
                        var target = parseInt(counter.getAttribute('data-target'), 10);
                        var duration = 2000;
                        var startTime = null;

                        function updateCount(timestamp) {
                            if (!startTime) startTime = timestamp;
                            var progress = Math.min((timestamp - startTime) / duration, 1);
                            var easeOut = 1 - Math.pow(1 - progress, 3);
                            counter.textContent = Math.floor(target * easeOut).toLocaleString('vi-VN');

                            if (progress < 1) {
                                requestAnimationFrame(updateCount);
                            } else {
                                counter.textContent = target.toLocaleString('vi-VN');
                            }
                        }

                        requestAnimationFrame(updateCount);
                        observer.unobserve(counter);
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(function (counter) {
                observer.observe(counter);
            });
        }
    }

    animateCounters();

    // ===== Product Filter =====
    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            filterBtns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');

            var filter = btn.getAttribute('data-filter');
            var cards = productsGrid.querySelectorAll('.product-card');

            cards.forEach(function (card) {
                var category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ===== Product Search =====
    searchInput.addEventListener('input', function () {
        var query = searchInput.value.toLowerCase().trim();
        var cards = productsGrid.querySelectorAll('.product-card');

        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        document.querySelector('[data-filter="all"]').classList.add('active');

        cards.forEach(function (card) {
            var name = card.querySelector('.product-card__name').textContent.toLowerCase();
            var desc = card.querySelector('.product-card__desc').textContent.toLowerCase();

            if (name.includes(query) || desc.includes(query)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });

    // ===== Form Validation =====
    function validateField(input, errorEl, rules) {
        var value = input.value.trim();
        var errorMsg = '';

        if (rules.required && !value) {
            errorMsg = rules.requiredMsg || 'Trường này là bắt buộc';
        } else if (rules.minLength && value.length < rules.minLength) {
            errorMsg = 'Tối thiểu ' + rules.minLength + ' ký tự';
        } else if (rules.pattern && !rules.pattern.test(value)) {
            errorMsg = rules.patternMsg || 'Dữ liệu không hợp lệ';
        }

        if (errorMsg) {
            input.classList.add('error');
            errorEl.textContent = errorMsg;
            return false;
        } else {
            input.classList.remove('error');
            errorEl.textContent = '';
            return true;
        }
    }

    var formFields = {
        fullName: {
            input: document.getElementById('fullName'),
            error: document.getElementById('fullNameError'),
            rules: {
                required: true,
                requiredMsg: 'Vui lòng nhập họ và tên',
                minLength: 2
            }
        },
        email: {
            input: document.getElementById('email'),
            error: document.getElementById('emailError'),
            rules: {
                required: true,
                requiredMsg: 'Vui lòng nhập email',
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                patternMsg: 'Email không hợp lệ'
            }
        },
        phone: {
            input: document.getElementById('phone'),
            error: document.getElementById('phoneError'),
            rules: {
                required: true,
                requiredMsg: 'Vui lòng nhập số điện thoại',
                pattern: /^(0|\+84)[0-9]{9,10}$/,
                patternMsg: 'Số điện thoại không hợp lệ (VD: 0901234567)'
            }
        },
        message: {
            input: document.getElementById('message'),
            error: document.getElementById('messageError'),
            rules: {
                required: true,
                requiredMsg: 'Vui lòng nhập nội dung',
                minLength: 5
            }
        }
    };

    // Real-time validation on blur
    Object.keys(formFields).forEach(function (key) {
        var field = formFields[key];
        field.input.addEventListener('blur', function () {
            validateField(field.input, field.error, field.rules);
        });
        field.input.addEventListener('focus', function () {
            field.input.classList.remove('error');
            field.error.textContent = '';
        });
    });

    // Form Submit
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var isValid = true;

        Object.keys(formFields).forEach(function (key) {
            var field = formFields[key];
            if (!validateField(field.input, field.error, field.rules)) {
                isValid = false;
            }
        });

        if (isValid) {
            showToast('Đặt hàng / Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.');
            contactForm.reset();
            // Clear cart after successful order submission
            cart = [];
            saveCart();
        }
    });

    // ===== Toast Notification =====
    var toastTimeout;

    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add('visible');

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(function () {
            toast.classList.remove('visible');
        }, 4000);
    }

    toastClose.addEventListener('click', function () {
        toast.classList.remove('visible');
        if (toastTimeout) clearTimeout(toastTimeout);
    });

    // ===== Smooth Scroll for all anchor links =====
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            var targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ===== Keyboard Accessibility =====
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (navbar.classList.contains('active')) closeMenu();
            if (cartDrawer.classList.contains('active')) closeCart();
        }
    });

    // Run initial scroll handler
    handleScroll();

})();
