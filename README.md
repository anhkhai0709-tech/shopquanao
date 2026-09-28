# Anh Khải Shop - Website Thời Trang

Website thời trang hiện đại, responsive, tích hợp Giỏ hàng (Cart Drawer) hoàn chỉnh. Được xây dựng bằng HTML5, CSS3 và JavaScript thuần. Sẵn sàng deploy lên Cloudflare Pages.

## 📁 Cấu trúc project

```
shopquanao/
│
├── index.html          # Trang chủ Anh Khải Shop
├── style.css           # CSS styles & Cart Drawer
├── script.js           # JavaScript logic & Cart Management
├── assets/
│   ├── images/
│   │   ├── anhaolv.jpg # Ảnh thật sản phẩm Áo phông LV
│   │   └── .gitkeep
│   └── icons/
│       └── favicon.svg # Favicon
└── README.md           # Hướng dẫn
```

## ✨ Tính năng nổi bật

- 🛒 **Giỏ hàng thông minh (Cart Drawer)**: Slide-over sidebar xem giỏ hàng real-time, tăng/giảm số lượng, tính tổng tiền tự động, lưu vào `localStorage`.
- 🛍️ **Nút "+ Giỏ hàng" & "Mua ngay"**: Thao tác đặt hàng nhanh chóng trên từng sản phẩm.
- 👕 **Sản phẩm Áo phông LV**: Sử dụng đường dẫn tương đối `assets/images/anhaolv.jpg` tương thích 100% với Cloudflare Pages.
- 📞 **Thanh toán tự động**: Nhấn "Đặt hàng ngay" từ giỏ hàng sẽ tự động tổng hợp đơn hàng và điền vào Form Liên hệ.

## 🚀 Chạy trên máy tính

### Cách 1: Mở trực tiếp
Nhấp đúp vào file `index.html` để mở trong trình duyệt.

### Cách 2: Dùng Live Server (VS Code)
1. Cài extension **Live Server** trong VS Code.
2. Mở project trong VS Code.
3. Nhấp chuột phải vào `index.html` → **Open with Live Server**.

## 📤 Upload lên GitHub & Deploy Cloudflare Pages

1. Commit và push code lên GitHub:
```bash
git add .
git commit -m "Cập nhật Anh Khải Shop & tính năng giỏ hàng"
git push origin main
```
2. Cloudflare Pages sẽ **tự động phát hiện thay đổi và deploy lại** chỉ trong vài giây!

## 📱 Responsive
Website hiển thị mượt mà trên Desktop, Laptop, Tablet và Mobile.

## 📝 License
© 2026 Anh Khải Shop. Tất cả quyền được bảo lưu.
