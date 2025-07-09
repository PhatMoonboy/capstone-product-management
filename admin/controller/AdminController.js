class AdminController {
  constructor() {
    this.baseUrl = "https://6864c98c5b5d8d03397e47c1.mockapi.io/products";
    this.modalAdd = null;
    this.modalEdit = null;
    this.currentEditingId = null;
    this.products = []; // lưu danh sách sản phẩm

    // Tạo element loading overlay
    this.loadingEl = document.createElement("div");
    this.loadingEl.id = "loadingOverlay";
    this.loadingEl.style.position = "fixed";
    this.loadingEl.style.top = "0";
    this.loadingEl.style.left = "0";
    this.loadingEl.style.width = "100%";
    this.loadingEl.style.height = "100%";
    this.loadingEl.style.backgroundColor = "rgba(0,0,0,0.3)";
    this.loadingEl.style.display = "flex";
    this.loadingEl.style.alignItems = "center";
    this.loadingEl.style.justifyContent = "center";
    this.loadingEl.style.zIndex = "1050";
    this.loadingEl.classList.add("d-none");
    this.loadingEl.innerHTML = `<div class="spinner-border text-light" role="status"><span class="visually-hidden">Loading...</span></div>`;
    document.body.appendChild(this.loadingEl);
  }

  showLoading() {
    this.loadingEl.classList.remove("d-none");
  }

  hideLoading() {
    this.loadingEl.classList.add("d-none");
  }

  initDashboard() {
    this.fetchProducts();
    this.initFormValidation();
    this.initAddFormListener();
    this.initEditFormListener();
    this.initSearchListener();
    this.initSortListener(); // thiết lập sự kiện sắp xếp
  }

  fetchProducts() {
    this.showLoading();
    axios
      .get(this.baseUrl)
      .then((res) => {
        this.products = res.data;
        this.renderProducts(this.products);
      })
      .catch((err) => console.error("Lỗi khi lấy danh sách sản phẩm:", err))
      .finally(() => this.hideLoading());
  }

  renderProducts(products) {
    const tbody = document.getElementById("productTableBody");
    tbody.innerHTML = products
      .map((product) => {
        const imgSrc =
          product.img && product.img.startsWith("http")
            ? product.img
            : "https://via.placeholder.com/80x60?text=No+Image";
        return `
        <tr>
          <td>${product.id}</td>
          <td>${product.name}</td>
          <td>${product.price}</td>
          <td>${product.screen}</td>
          <td>${product.backCamera}</td>
          <td>${product.frontCamera}</td>
          <td><img src="${imgSrc}" style="width:80px;border-radius:8px;" /></td>
          <td>${product.desc}</td>
          <td>${product.type}</td>
          <td>
            <button class="btn btn-sm btn-warning me-1" onclick="admin.openEditModal('${product.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="admin.deleteProduct('${product.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>`;
      })
      .join("");
  }

  deleteProduct(id) {
    Swal.fire({
      title: "Bạn có chắc muốn xóa sản phẩm này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        this.showLoading();
        axios
          .delete(`${this.baseUrl}/${id}`)
          .then(() => {
            Swal.fire("Đã xóa!", "Sản phẩm đã được xóa.", "success");
            this.fetchProducts();
          })
          .catch(() => Swal.fire("Lỗi!", "Không thể xóa sản phẩm.", "error"))
          .finally(() => this.hideLoading());
      }
    });
  }

  openAddModal() {
    const form = document.getElementById("addProductForm");
    form.reset();
    form.classList.remove("was-validated");
    document.getElementById("addModalTitle").innerText = "Thêm sản phẩm";
    this.modalAdd = new bootstrap.Modal(
      document.getElementById("addProductModal")
    );
    this.modalAdd.show();
  }

  openEditModal(id) {
    this.currentEditingId = id;
    const form = document.getElementById("editProductForm");
    form.classList.remove("was-validated");

    axios
      .get(`${this.baseUrl}/${id}`)
      .then((res) => {
        const p = res.data;
        document.getElementById("editName").value = p.name;
        document.getElementById("editPrice").value = p.price;
        document.getElementById("editScreen").value = p.screen;
        document.getElementById("editBackCamera").value = p.backCamera;
        document.getElementById("editFrontCamera").value = p.frontCamera;
        document.getElementById("editImg").value = p.img;
        document.getElementById("editDesc").value = p.desc;
        document.getElementById("editType").value = p.type;
        document.getElementById("editModalTitle").innerText =
          "Cập nhật sản phẩm";
        this.modalEdit = new bootstrap.Modal(
          document.getElementById("editProductModal")
        );
        this.modalEdit.show();
      })
      .catch((err) => console.error("Lỗi khi lấy sản phẩm:", err));
  }

  initFormValidation() {
    const forms = document.querySelectorAll(".needs-validation");
    Array.from(forms).forEach((form) => {
      form.addEventListener(
        "submit",
        (event) => {
          if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
          }
          form.classList.add("was-validated");
        },
        false
      );
    });
  }

  initAddFormListener() {
    document
      .getElementById("addProductForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        const form = e.target;
        if (!form.checkValidity()) return;

        const product = {
          name: document.getElementById("addName").value.trim(),
          price: +document.getElementById("addPrice").value,
          screen: document.getElementById("addScreen").value.trim(),
          backCamera: document.getElementById("addBackCamera").value.trim(),
          frontCamera: document.getElementById("addFrontCamera").value.trim(),
          img: document.getElementById("addImg").value.trim(),
          desc: document.getElementById("addDesc").value.trim(),
          type: document.getElementById("addType").value.trim().toLowerCase(),
        };
        if (
          Object.values(product).some(
            (v) =>
              v === "" ||
              v === null ||
              v === undefined ||
              (typeof v === "number" && isNaN(v))
          )
        ) {
          return Swal.fire(
            "Thiếu thông tin",
            "Vui lòng điền đầy đủ thông tin",
            "warning"
          );
        }

        this.showLoading();
        axios
          .post(this.baseUrl, product)
          .then(() => {
            this.fetchProducts();
            this.modalAdd.hide();
            Swal.fire("Thành công", "Đã thêm sản phẩm", "success");
          })
          .catch((err) => Swal.fire("Lỗi", "Không thể thêm sản phẩm", "error"))
          .finally(() => this.hideLoading());
      });
  }

  initEditFormListener() {
    document
      .getElementById("editProductForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        const form = e.target;
        if (!form.checkValidity()) return;

        const id = this.currentEditingId;
        const product = {
          name: document.getElementById("editName").value.trim(),
          price: +document.getElementById("editPrice").value,
          screen: document.getElementById("editScreen").value.trim(),
          backCamera: document.getElementById("editBackCamera").value.trim(),
          frontCamera: document.getElementById("editFrontCamera").value.trim(),
          img: document.getElementById("editImg").value.trim(),
          desc: document.getElementById("editDesc").value.trim(),
          type: document.getElementById("editType").value.trim().toLowerCase(),
        };
        if (
          Object.values(product).some(
            (v) =>
              v === "" ||
              v === null ||
              v === undefined ||
              (typeof v === "number" && isNaN(v))
          )
        ) {
          return Swal.fire(
            "Thiếu thông tin",
            "Vui lòng điền đầy đủ thông tin",
            "warning"
          );
        }

        this.showLoading();
        axios
          .put(`${this.baseUrl}/${id}`, product)
          .then(() => {
            this.fetchProducts();
            this.modalEdit.hide();
            Swal.fire("Thành công", "Đã cập nhật sản phẩm", "success");
          })
          .catch((err) =>
            Swal.fire("Lỗi", "Không thể cập nhật sản phẩm", "error")
          )
          .finally(() => this.hideLoading());
      });
  }

  initSearchListener() {
    const input = document.getElementById("searchInput");
    input.addEventListener("input", (e) => {
      const query = e.target.value.trim().toLowerCase();
      const filtered = this.products.filter((p) =>
        p.name.toLowerCase().includes(query)
      );
      this.renderProducts(filtered);
    });
  }

  initSortListener() {
    const select = document.getElementById("productFilter");
    select.addEventListener("change", (e) => {
      const mode = e.target.value; // 'asc' hoặc 'desc'
      let sorted = [...this.products];
      if (mode === "asc") {
        sorted.sort((a, b) => a.price - b.price);
      } else if (mode === "desc") {
        sorted.sort((a, b) => b.price - a.price);
      }
      this.renderProducts(sorted);
    });
  }
}

const admin = new AdminController();
// Khởi tạo sau khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", () => admin.initDashboard());
