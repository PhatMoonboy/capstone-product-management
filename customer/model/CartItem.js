class CartItem {
  constructor(product, quantity = 1) {
    this.id = product.id;
    this.name = product.name;
    this.price = product.price;
    this.img = product.img;
    this.screen = product.screen;
    this.backCamera = product.backCamera;
    this.frontCamera = product.frontCamera;
    this.desc = product.desc;
    this.type = product.type;
    this.quantity = quantity;
  }

  getTotalPrice() {
    return this.price * this.quantity;
  }

  formatPrice() {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(this.price);
  }

  formatTotalPrice() {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(this.getTotalPrice());
  }

  // Render HTML cho cart item 
  renderCartItem() {
    return `
      <div class="cart-item-card mb-3" data-id="${this.id}">
        <div class="row g-0 align-items-center">
          <!-- Product Image -->
          <div class="col-md-3">
            <div class="cart-item-image">
              <img src="${this.img}" alt="${this.name}" class="img-fluid">
              <div class="product-badge">${this.type.toUpperCase()}</div>
            </div>
          </div>
          
          <!-- Product Info -->
          <div class="col-md-6">
            <div class="cart-item-info">
              <h6 class="product-name">${this.name}</h6>
              
              <!-- Product Description -->
              <div class="product-description mb-2">
                <small class="text-muted">${this.desc}</small>
              </div>
              
              <!-- Product Specifications -->
              <div class="product-specs">
                <div class="spec-item">
                  <i class="fas fa-tv text-primary"></i>
                  <span>Màn hình: ${this.screen}</span>
                </div>
                <div class="spec-item">
                  <i class="fas fa-camera text-success"></i>
                  <span>Camera sau: ${this.backCamera}</span>
                </div>
                <div class="spec-item">
                  <i class="fas fa-camera-retro text-info"></i>
                  <span>Camera trước: ${this.frontCamera}</span>
                </div>
              </div>
              
              <!-- Price Info -->
              <div class="price-info mt-2">
                <span class="unit-price">Đơn giá: ${this.formatPrice()}</span>
              </div>
            </div>
          </div>
          
          <!-- Quantity & Actions -->
          <div class="col-md-3">
            <div class="cart-item-actions">
              <!-- Quantity Controls -->
              <div class="quantity-controls mb-3">
                <label class="form-label small text-muted">Số lượng:</label>
                <div class="input-group input-group-sm">
                  <button class="btn btn-outline-secondary" type="button" onclick="decreaseQuantity('${this.id}')">
                    <i class="fas fa-minus"></i>
                  </button>
                  <input type="text" class="form-control text-center fw-bold" value="${this.quantity}" readonly>
                  <button class="btn btn-outline-secondary" type="button" onclick="increaseQuantity('${this.id}')">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              
              <!-- Total Price -->
              <div class="total-price mb-3">
                <div class="text-center">
                  <small class="text-muted d-block">Thành tiền:</small>
                  <h6 class="text-primary fw-bold mb-0">${this.formatTotalPrice()}</h6>
                </div>
              </div>
              
              <!-- Remove Button -->
              <div class="text-center">
                <button class="btn btn-outline-danger btn-sm" onclick="removeFromCart('${this.id}')" title="Xóa sản phẩm">
                  <i class="fas fa-trash me-1"></i>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
