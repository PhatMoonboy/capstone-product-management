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

  // alert with modal bootstrap
  showModal(
    title,
    message,
    type = "info",
    showConfirm = false,
    onConfirm = null
  ) {
    const modal = document.getElementById("notificationModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalMessage = document.getElementById("modalMessage");
    const modalIcon = document.getElementById("modalIcon");
    const modalConfirmBtn = document.getElementById("modalConfirmBtn");

    if (!modal) return;

    // Set title và message
    modalTitle.textContent = title;
    modalMessage.innerHTML = message; // Sử dụng innerHTML để hỗ trợ HTML tags

    // Set icon dựa theo type
    const iconClasses = {
      success: "fas fa-check-circle text-success",
      warning: "fas fa-exclamation-triangle text-warning",
      danger: "fas fa-times-circle text-danger",
      info: "fas fa-info-circle text-info",
    };
    modalIcon.className = iconClasses[type] || iconClasses.info;

    if (showConfirm) {
      modalConfirmBtn.style.display = "inline-block";
      modalConfirmBtn.onclick = () => {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
          modalInstance.hide();
        }
        // Chờ modal đóng xong rồi mới chạy callback
        setTimeout(() => {
          if (onConfirm) onConfirm();
        }, 300);
      };
    } else {
      modalConfirmBtn.style.display = "none";
    }

    // Hiển thị modal
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
  }

  // Cập nhật checkout để sử dụng modal
  checkout() {
    if (this.cart.length === 0) {
      this.showModal("Thông báo", "Giỏ hàng đang trống", "warning");
      return;
    }

    const total = this.cart.reduce(
      (sum, item) => sum + item.getTotalPrice(),
      0
    );

    // Debug: In ra thông tin chi tiết
    console.log("=== CHECKOUT DEBUG ===");
    console.log("Cart items:", this.cart);
    this.cart.forEach((item) => {
      console.log(
        `${item.name}: ${item.price} x ${
          item.quantity
        } = ${item.getTotalPrice()}`
      );
    });
    console.log("Total calculated:", total);

    const totalFormatted = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(total);

    this.showModal(
      "Xác nhận thanh toán",
      `Tổng tiền: ${totalFormatted}<br>Bạn có muốn thanh toán không?`,
      "info",
      true,
      () => {
        this.cart = [];
        this.saveCartToStorage();
        this.renderCart();
        this.updateCartCount();
        this.showToast(
          "Thanh toán thành công! Cảm ơn bạn đã mua hàng.",
          "success"
        );

        // Đóng offcanvas
        const cartOffcanvas = bootstrap.Offcanvas.getInstance(
          document.getElementById("cartOffcanvas")
        );
        if (cartOffcanvas) {
          cartOffcanvas.hide();
        }
      }
    );
  }

  clearCart() {
    if (this.cart.length === 0) {
      this.showModal("Thông báo", "Giỏ hàng đã trống", "info");
      return;
    }

    this.showModal(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?",
      "warning",
      true,
      () => {
        this.cart = [];
        this.saveCartToStorage();
        this.renderCart();
        this.updateCartCount();
        this.showToast("Đã xóa tất cả sản phẩm", "info");
      }
    );
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

    // Render cart items
    cartElement.innerHTML = this.cart
      .map((item) => item.renderCartItem())
      .join("");

    // Tính toán chi tiết
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = this.cart.reduce((sum, item) => sum + item.getTotalPrice(), 0);
    const avgPrice = totalPrice / totalItems;

    // Cập nhật tổng tiền
    if (totalElement) {
      totalElement.innerHTML = `
        <div class="cart-summary">
          <div class="summary-row">
            <span class="summary-label">
              <i class="fas fa-shopping-bag me-2"></i>
              Số lượng sản phẩm:
            </span>
            <span class="summary-value">${totalItems} sản phẩm</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">
              <i class="fas fa-calculator me-2"></i>
              Giá trung bình:
            </span>
            <span class="summary-value">${new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(avgPrice)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">
              <i class="fas fa-money-bill-wave me-2"></i>
              <strong>Tổng cộng:</strong>
            </span>
            <span class="summary-value text-primary">
              <strong>${new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalPrice)}</strong>
            </span>
          </div>
        </div>
      `;
    }

    if (cartTotalSection) cartTotalSection.style.display = "block";
    if (emptyCartSection) emptyCartSection.style.display = "none";
  }

  // Cập nhật số lượng giỏ hàng
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

  // Thiết lập event listeners
  setupEventListeners() {
    // Filter dropdown
    const filterElement = document.getElementById("productFilter");
    if (filterElement) {
      filterElement.addEventListener("change", () => {
        this.filterAndSearchProducts();
      });
    }

    // Search input
    const searchElement = document.getElementById("searchInput");
    if (searchElement) {
      searchElement.addEventListener("input", () => {
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

  // Lưu giỏ hàng vào localStorage
  saveCartToStorage() {
    try {
      const cartData = this.cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        img: item.img, // Sửa từ image thành img
        type: item.type,
        screen: item.screen,
        backCamera: item.backCamera,
        frontCamera: item.frontCamera,
        desc: item.desc,
        quantity: item.quantity,
      }));
      localStorage.setItem("cart", JSON.stringify(cartData));
    } catch (error) {
      console.error("Lỗi khi lưu giỏ hàng:", error);
    }
  }

  // Tải giỏ hàng từ localStorage
  loadCartFromStorage() {
    try {
      const cartData = localStorage.getItem("cart");
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        this.cart = parsedCart.map((item) => {
          const product = new Product(
            item.id,
            item.name,
            item.price,
            item.screen,
            item.backCamera,
            item.frontCamera,
            item.img, // Sửa từ item.image thành item.img
            item.desc,
            item.type
          );
          return new CartItem(product, item.quantity);
        });
      } else {
        this.cart = [];
      }
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
      this.cart = [];
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
