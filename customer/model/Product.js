// object Product
class Product {
  constructor(
    id,
    name,
    price,
    screen,
    backCamera,
    frontCamera,
    img,
    desc,
    type
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.screen = screen;
    this.backCamera = backCamera;
    this.frontCamera = frontCamera;
    this.img = img;
    this.desc = desc;
    this.type = type;
  }

  // format giá tiền
  formatPrice() {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(this.price);
  }

  renderProduct() {
    return `
      <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
        <div class="card h-100 product-card">
          <div class="position-relative">
            <img src="${this.img}" class="card-img-top product-image" alt="${
      this.name
    }" />
            <span class="badge bg-primary position-absolute top-0 end-0 m-2">${
              this.type
            }</span>
          </div>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${this.name}</h5>
            <p class="card-text text-muted flex-grow-1">${this.desc}</p>
            
            <div class="product-specs mb-3">
              <small class="text-muted d-block">
                <i class="fas fa-tv me-1"></i> ${this.screen}
              </small>
              <small class="text-muted d-block">
                <i class="fas fa-camera me-1"></i> ${this.backCamera}
              </small>
              <small class="text-muted d-block">
                <i class="fas fa-camera-retro me-1"></i> ${this.frontCamera}
              </small>
            </div>
            
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="text-primary mb-0">${this.formatPrice()}</h4>
              <button class="btn btn-success" onclick="addToCart('${this.id}')">
                <i class="fas fa-cart-plus me-1"></i>
                Thêm
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
