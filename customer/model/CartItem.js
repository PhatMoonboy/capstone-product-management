class CartItem {
  constructor(product, quantity = 1) {
    this.id = product.id;
    this.name = product.name;
    this.price = product.price;
    this.img = product.img;
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
      <div class="card mb-3 cart-item" data-id="${this.id}">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-3">
              <img src="${this.img}" alt="${
      this.name
    }" class="img-fluid rounded" style="max-height: 60px; object-fit: cover;">
            </div>
            <div class="col-9">
              <h6 class="card-title mb-1">${this.name}</h6>
              <p class="card-text text-muted mb-2">${this.formatPrice()}</p>
              
              <div class="d-flex justify-content-between align-items-center">
                <div class="btn-group" role="group">
                  <button class="btn btn-outline-secondary btn-sm" onclick="decreaseQuantity('${
                    this.id
                  }')">
                    <i class="fas fa-minus"></i>
                  </button>
                  <span class="btn btn-outline-secondary btn-sm disabled">${
                    this.quantity
                  }</span>
                  <button class="btn btn-outline-secondary btn-sm" onclick="increaseQuantity('${
                    this.id
                  }')">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
                
                <div class="d-flex align-items-center">
                  <strong class="text-primary me-2">${this.formatTotalPrice()}</strong>
                  <button class="btn btn-outline-danger btn-sm" onclick="removeFromCart('${
                    this.id
                  }')">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
