// Service để call API lấy dữ liệu sản phẩm sử dụng Axios
class ProductService {
  constructor() {
    this.baseUrl = "https://68653afd5b5d8d0339805a6f.mockapi.io/Products";
  }

  async getAllProducts() {
    try {
      console.log("Đang tải sản phẩm từ API...");
      const response = await axios.get(this.baseUrl);
      console.log("✅ API Response:", response.data);

      // Convert data to object Product
      return response.data.map(
        (item) =>
          new Product(
            item.id,
            item.name,
            item.price,
            item.screen,
            item.backCamera,
            item.frontCamera,
            item.img || item.image,
            item.desc,
            item.type
          )
      );
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error);
    }
  }

  async getProductById(id) {
    try {
      const response = await axios.get(`${this.baseUrl}/${id}`);
      const data = response.data;
      return new Product(
        data.id,
        data.name,
        data.price,
        data.screen,
        data.backCamera,
        data.frontCamera,
        data.img || data.image,
        data.desc,
        data.type
      );
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm theo ID:", error);
    }
  }

  filterProductsByType(products, type) {
    if (!type || type === "all") {
      return products;
    }
    return products.filter(
      (product) => product.type.toLowerCase() === type.toLowerCase()
    );
  }

  searchProductsByName(products, searchTerm) {
    if (!searchTerm || searchTerm.trim() === "") {
      return products;
    }

    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerSearchTerm) ||
        product.desc.toLowerCase().includes(lowerSearchTerm)
    );
  }
}
