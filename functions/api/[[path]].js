// Cloudflare Pages Functions / Workers Backend API Router
// Handles Auth (Login/Register), Products (CRUD), Orders, and R2 Image Uploads

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api/, '');
    const method = request.method;

    // CORS Headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json; charset=utf-8'
    };

    if (method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // ===== AUTHENTICATION ENDPOINTS =====

        // POST /api/auth/register
        if (path === '/auth/register' && method === 'POST') {
            const body = await request.json();
            const { username, email, password } = body;

            if (!username || !email || !password) {
                return new Response(JSON.stringify({ error: 'Vui lòng điền đầy đủ thông tin' }), { status: 400, headers: corsHeaders });
            }

            const passHash = await hashPassword(password);
            
            if (env.DB) {
                try {
                    await env.DB.prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)')
                        .bind(username, email, passHash, 'user')
                        .run();
                } catch (e) {
                    return new Response(JSON.stringify({ error: 'Tài khoản hoặc email đã tồn tại' }), { status: 400, headers: corsHeaders });
                }
            }

            return new Response(JSON.stringify({ message: 'Đăng ký tài khoản thành công!' }), { status: 200, headers: corsHeaders });
        }

        // POST /api/auth/login
        if (path === '/auth/login' && method === 'POST') {
            const body = await request.json();
            const { username, password } = body;

            if (!username || !password) {
                return new Response(JSON.stringify({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu' }), { status: 400, headers: corsHeaders });
            }

            const passHash = await hashPassword(password);

            let user = null;
            if (env.DB) {
                user = await env.DB.prepare('SELECT id, username, email, role FROM users WHERE (username = ? OR email = ?) AND password_hash = ?')
                    .bind(username, username, passHash)
                    .first();
            } else {
                // Hardcoded fallback for demo/testing without D1 bound
                if ((username === 'admin' || username === 'admin@anhkhaishop.com') && password === 'admin123') {
                    user = { id: 1, username: 'admin', email: 'admin@anhkhaishop.com', role: 'admin' };
                } else if (username && password) {
                    user = { id: 2, username: username, email: `${username}@gmail.com`, role: 'user' };
                }
            }

            if (!user) {
                return new Response(JSON.stringify({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' }), { status: 401, headers: corsHeaders });
            }

            const token = btoa(JSON.stringify({ id: user.id, username: user.username, role: user.role, exp: Date.now() + 86400000 }));

            return new Response(JSON.stringify({
                message: 'Đăng nhập thành công!',
                token,
                user: { id: user.id, username: user.username, email: user.email, role: user.role }
            }), { status: 200, headers: corsHeaders });
        }

        // ===== PRODUCTS ENDPOINTS =====

        // GET /api/products
        if ((path === '/products' || path === '') && method === 'GET') {
            let products = [];
            if (env.DB) {
                const { results } = await env.DB.prepare('SELECT * FROM products ORDER BY id DESC').all();
                products = results;
            }
            return new Response(JSON.stringify({ products }), { status: 200, headers: corsHeaders });
        }

        // POST /api/products (Add product - Admin)
        if ((path === '/products' || path === '') && method === 'POST') {
            const body = await request.json();
            const { name, category, price, description, image_url, badge } = body;

            if (!name || !price) {
                return new Response(JSON.stringify({ error: 'Tên và giá sản phẩm là bắt buộc' }), { status: 400, headers: corsHeaders });
            }

            if (env.DB) {
                await env.DB.prepare('INSERT INTO products (name, category, price, description, image_url, badge) VALUES (?, ?, ?, ?, ?, ?)')
                    .bind(name, category || 'nam', parseInt(price, 10), description || '', image_url || '', badge || '')
                    .run();
            }

            return new Response(JSON.stringify({ message: 'Thêm sản phẩm thành công!' }), { status: 200, headers: corsHeaders });
        }

        // DELETE /api/products/:id
        if (path.startsWith('/products/') && method === 'DELETE') {
            const id = path.split('/')[2];
            if (env.DB && id) {
                await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
            }
            return new Response(JSON.stringify({ message: 'Xóa sản phẩm thành công!' }), { status: 200, headers: corsHeaders });
        }

        // ===== ORDERS ENDPOINTS =====

        // POST /api/orders
        if (path === '/orders' && method === 'POST') {
            const body = await request.json();
            const { customer_name, customer_email, customer_phone, items, total_amount, notes } = body;

            if (!customer_name || !customer_phone || !items) {
                return new Response(JSON.stringify({ error: 'Vui lòng cung cấp đầy đủ thông tin đơn hàng' }), { status: 400, headers: corsHeaders });
            }

            let orderId = Date.now();
            if (env.DB) {
                const orderResult = await env.DB.prepare('INSERT INTO orders (customer_name, customer_email, customer_phone, total_amount, notes, status) VALUES (?, ?, ?, ?, ?, ?)')
                    .bind(customer_name, customer_email || '', customer_phone, total_amount, notes || '', 'pending')
                    .run();
                
                orderId = orderResult.meta.last_row_id;

                for (const item of items) {
                    await env.DB.prepare('INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)')
                        .bind(orderId, item.id || 0, item.name, item.price, item.quantity)
                        .run();
                }
            }

            return new Response(JSON.stringify({ message: 'Đặt hàng thành công!', order_id: orderId }), { status: 200, headers: corsHeaders });
        }

        // GET /api/orders (Admin)
        if (path === '/orders' && method === 'GET') {
            let orders = [];
            if (env.DB) {
                const { results } = await env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
                orders = results;
            }
            return new Response(JSON.stringify({ orders }), { status: 200, headers: corsHeaders });
        }

        // ===== CLOUDFLARE R2 IMAGE UPLOAD =====

        // POST /api/upload (Upload image to Cloudflare R2 Bucket)
        if (path === '/upload' && method === 'POST') {
            const formData = await request.formData();
            const file = formData.get('file');

            if (!file) {
                return new Response(JSON.stringify({ error: 'Không tìm thấy file ảnh' }), { status: 400, headers: corsHeaders });
            }

            const fileName = `products/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

            if (env.MY_R2_BUCKET) {
                await env.MY_R2_BUCKET.put(fileName, file.stream(), {
                    httpMetadata: { contentType: file.type }
                });
                const imageUrl = `/api/images/${fileName}`;
                return new Response(JSON.stringify({ message: 'Tải ảnh lên R2 thành công!', url: imageUrl }), { status: 200, headers: corsHeaders });
            } else {
                // Return local preview data URL if R2 bucket is not yet bound
                return new Response(JSON.stringify({
                    message: 'Chưa gắn R2 Bucket (dùng ảnh local demo)',
                    url: `assets/images/${file.name}`
                }), { status: 200, headers: corsHeaders });
            }
        }

        // GET /api/images/* (Serve images stored in R2)
        if (path.startsWith('/images/') && method === 'GET') {
            const key = path.replace(/^\/images\//, '');
            if (env.MY_R2_BUCKET) {
                const object = await env.MY_R2_BUCKET.get(key);
                if (!object) {
                    return new Response('File not found', { status: 404 });
                }
                const headers = new Headers();
                object.writeHttpMetadata(headers);
                headers.set('etag', object.httpEtag);
                headers.set('Cache-Control', 'public, max-age=31536000');
                return new Response(object.body, { headers });
            }
            return new Response('R2 Bucket not configured', { status: 404 });
        }

        return new Response(JSON.stringify({ message: 'Anh Khải Shop Worker API Running', path }), { status: 200, headers: corsHeaders });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
}

// SHA-256 Password Hashing Helper
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
