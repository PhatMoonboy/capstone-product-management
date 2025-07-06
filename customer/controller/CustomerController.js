class CustomerController {
  constructor() {
    this.productService = new ProductService();
    this.allProducts = [];
    this.filteredProducts = [];
    this.cart = [];
    this.loadCartFromStorage();
  }

  async init() {
    try {
      this.showSpinner();
      await this.loadProducts();
      this.filteredProducts = [...this.allProducts];
      this.renderProducts(this.filteredProducts);
      this.renderCart();
      this.updateCartCount();
      this.setupEventListeners();
      this.hideSpinner();
    } catch (error) {
      console.error("Lỗi khởi tạo trang:", error);
      this.hideSpinner();
      this.showError(error.message || "Không thể tải dữ liệu sản phẩm");
    }
  }

  // render danh sách sản phẩm
  async loadProducts() {
    try {
      this.allProducts = await this.productService.getAllProducts();
    } catch (error) {
      throw error;
    }
  }

  showSpinner() {
    const spinner = document.getElementById("loadingSpinner");
    if (spinner) spinner.style.display = "block";
  }

  hideSpinner() {
    const spinner = document.getElementById("loadingSpinner");
    if (spinner) spinner.style.display = "none";
  }

  // danh sách sản phẩm
  renderProducts(products) {
    const productListElement = document.getElementById("productList");
    if (!productListElement) return;

    if (products.length === 0) {
      productListElement.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info text-center">
            <i class="fas fa-info-circle me-2"></i>
            Không tìm thấy sản phẩm nào
          </div>
        </div>
      `;
      return;
    }

    productListElement.innerHTML = products
      .map((product) => product.renderProduct())
      .join("");
  }

  filterAndSearchProducts() {
    const filterType = document.getElementById("productFilter").value;
    const searchTerm = document.getElementById("searchInput").value;

    let filtered = this.productService.filterProductsByType(
      this.allProducts,
      filterType
    );
    filtered = this.productService.searchProductsByName(filtered, searchTerm);

    this.filteredProducts = filtered;
    this.renderProducts(this.filteredProducts);
  }

  addToCart(productId) {
    const product = this.allProducts.find((p) => p.id === productId);
    if (!product) return;

    const existingItem = this.cart.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
      this.showToast(`Đã tăng số lượng ${product.name}`, "success");
    } else {
      this.cart.push(new CartItem(product, 1));
      this.showToast(`Đã thêm ${product.name} vào giỏ hàng`, "success");
    }

    this.saveCartToStorage();
    this.renderCart();
    this.updateCartCount();
  }

  increaseQuantity(productId) {
    const item = this.cart.find((item) => item.id === productId);
    if (item) {
      item.quantity += 1;
      this.saveCartToStorage();
      this.renderCart();
      this.updateCartCount();
    }
  }

  decreaseQuantity(productId) {
    const item = this.cart.find((item) => item.id === productId);
    if (item && item.quantity > 1) {
      item.quantity -= 1;
      this.saveCartToStorage();
      this.renderCart();
      this.updateCartCount();
    }
  }

  removeFromCart(productId) {
    const item = this.cart.find((item) => item.id === productId);
    if (item) {
      this.cart = this.cart.filter((item) => item.id !== productId);
      this.saveCartToStorage();
      this.renderCart();
      this.updateCartCount();
      this.showToast(`Đã xóa ${item.name} khỏi giỏ hàng`, "warning");
    }
  }

  clearCart() {
    if (this.cart.length === 0) {
      this.showToast("Giỏ hàng đã trống", "info");
      return;
    }

    if (confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm?")) {
      this.cart = [];
      this.saveCartToStorage();
      this.renderCart();
      this.updateCartCount();
      this.showToast("Đã xóa tất cả sản phẩm", "info");
    }
  }

  renderCart() {
    const cartElement = document.getElementById("cartItems");
    const totalElement = document.getElementById("totalPrice");
    const cartTotalSection = document.getElementById("cartTotal");
    const emptyCartSection = document.getElementById("emptyCart");

    if (!cartElement) return;

    if (this.cart.length === 0) {
      cartElement.innerHTML = "";
      if (cartTotalSection) cartTotalSection.style.display = "none";
      if (emptyCartSection) emptyCartSection.style.display = "block";
      return;
    }

    cartElement.innerHTML = this.cart
      .map((item) => item.renderCartItem())
      .join("");

    // Tính tổng tiền
    const total = this.cart.reduce(
      (sum, item) => sum + item.getTotalPrice(),
      0
    );
    if (totalElement) {
      totalElement.textContent = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(total);
    }

    if (cartTotalSection) cartTotalSection.style.display = "block";
    if (emptyCartSection) emptyCartSection.style.display = "none";
  }

  //cập nhật số lượng giỏ hàng
  updateCartCount() {
    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
      const totalItems = this.cart.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      cartCount.textContent = totalItems;
    }
  }

  // Thanh toán
  checkout() {
    if (this.cart.length === 0) {
      this.showToast("Giỏ hàng trống", "warning");
      return;
    }

    const total = this.cart.reduce(
      (sum, item) => sum + item.getTotalPrice(),
      0
    );
    const totalFormatted = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(total);

    if (confirm(`Xác nhận thanh toán ${totalFormatted}?`)) {
      this.cart = [];
      this.saveCartToStorage();
      this.renderCart();
      this.updateCartCount();
      this.showToast(
        "Thanh toán thành công! Cảm ơn bạn đã mua hàng.",
        "success"
      );

      const cartOffcanvas = bootstrap.Offcanvas.getInstance(
        document.getElementById("cartOffcanvas")
      );
      if (cartOffcanvas) {
        cartOffcanvas.hide();
      }
    }
  }

  // Lưu giỏ hàng vào localStorage
  saveCartToStorage() {
    localStorage.setItem("cart", JSON.stringify(this.cart));
  }

  // Tải giỏ hàng từ localStorage
  loadCartFromStorage() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      this.cart = cartData.map((item) => {
        const cartItem = new CartItem(
          {
            id: item.id,
            name: item.name,
            price: item.price,
            img: item.img,
          },
          item.quantity
        );
        return cartItem;
      });
    }
  }

  setupEventListeners() {
    // Filter dropdown
    const filterSelect = document.getElementById("productFilter");
    if (filterSelect) {
      filterSelect.addEventListener("change", () => {
        this.filterAndSearchProducts();
      });
    }

    // Search input
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        this.filterAndSearchProducts();
      });
    }

    // Checkout button
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        this.checkout();
      });
    }

    // Clear cart button
    const clearCartBtn = document.getElementById("clearCartBtn");
    if (clearCartBtn) {
      clearCartBtn.addEventListener("click", () => {
        this.clearCart();
      });
    }
  }

  // Hiển thị toast notification
  showToast(message, type = "info") {
    const toastElement = document.getElementById("liveToast");
    const toastMessage = document.getElementById("toastMessage");

    if (toastElement && toastMessage) {
      toastMessage.textContent = message;

      // Thay đổi màu header dựa trên type
      const toastHeader = toastElement.querySelector(".toast-header");
      toastHeader.className = `toast-header bg-${type} text-white`;

      const toast = new bootstrap.Toast(toastElement);
      toast.show();
    }
  }

  // Hiển thị lỗi
  showError(message) {
    const errorElement = document.getElementById("errorMessage");
    const errorText = document.getElementById("errorText");

    if (errorElement && errorText) {
      errorText.textContent = message;
      errorElement.style.display = "block";

      // Tự động ẩn sau 5 giây
      setTimeout(() => {
        errorElement.style.display = "none";
      }, 5000);
    }
  }
}

let customerController;

document.addEventListener("DOMContentLoaded", () => {
  customerController = new CustomerController();
  customerController.init();
});

// Các hàm global để gọi từ HTML
function addToCart(productId) {
  if (customerController) {
    customerController.addToCart(productId);
  }
}

function increaseQuantity(productId) {
  if (customerController) {
    customerController.increaseQuantity(productId);
  }
}

function decreaseQuantity(productId) {
  if (customerController) {
    customerController.decreaseQuantity(productId);
  }
}

function removeFromCart(productId) {
  if (customerController) {
    customerController.removeFromCart(productId);
  }
}
