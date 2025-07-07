// Service để call API lấy dữ liệu sản phẩm sử dụng Axios
class ProductService {
  constructor() {
    this.baseUrl = "https://68653afd5b5d8d0339805a6f.mockapi.io/Products";
  }

  async getAllProducts() {
    try {
      const response = await axios({
        url: this.baseUrl,
        method: "GET",
      });

      console.log("API Response:", response.data);

      //   conver data to object Product
      return response.data.map(
        (item) =>
          new Product(
            item.id,
            item.name,
            item.price,
            item.screen,
            item.backCamera,
            item.frontCamera,
            item.img,
            item.desc,
            item.type
          )
      );
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      throw new Error(
        "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau."
      );
    }
  }


  async getProductById(id) {
    try {
      const response = await axios({
        url: `${this.baseUrl}/${id}`,
        method: "GET",
      });

      const data = response.data;
      return new Product(
        data.id,
        data.name,
        data.price,
        data.screen,
        data.backCamera,
        data.frontCamera,
        data.img,
        data.desc,
        data.type
      );
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm theo ID:", error);
      throw new Error(`Không thể tải sản phẩm ID: ${id}`);
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
