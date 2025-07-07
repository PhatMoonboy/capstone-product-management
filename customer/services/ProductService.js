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
      // Fallback to sample data
      console.warn("⚠️ API lỗi, sử dụng dữ liệu mẫu");
      return this.getFallbackData();
    }
  }

  // Dữ liệu mẫu khi API không hoạt động
  getFallbackData() {
    const sampleData = [
      {
        id: "1",
        name: "iPhone X",
        price: "1000",
        screen: "5.8 inch",
        backCamera: "12 MP",
        frontCamera: "7 MP",
        img: "https://cdn.tgdd.vn/Products/Images/42/114115/iphone-x-64gb-hh-600x600.jpg",
        desc: "Thiết kế đột phá, màn hình tuyệt đẹp",
        type: "iphone",
      },
      {
        id: "2",
        name: "Samsung Galaxy M51",
        price: "3500",
        screen: "6.7 inch",
        backCamera: "64 MP & Phụ 64 MP, 12 MP, 5 MP",
        frontCamera: "32 MP",
        img: "https://cdn.tgdd.vn/Products/Images/42/228967/samsung-galaxy-m51-xanh-600x600-600x600.jpg",
        desc: "Thiết kế đột phá, màn hình tuyệt đẹp",
        type: "samsung",
      },
      {
        id: "3",
        name: "Samsung Galaxy M22",
        price: "45000",
        screen: "6.4 inch",
        backCamera: "Chính 64 MP & Phụ 8 MP, 2 MP, 2 MP",
        frontCamera: "13 MP",
        img: "https://cdn.tgdd.vn/Products/Images/42/271522/samsung-galaxy-m22-den-600x600.jpg",
        desc: "Thiết kế đột phá, màn hình tuyệt đẹp",
        type: "samsung",
      },
      {
        id: "4",
        name: "iPhone 11",
        price: "15000",
        screen: "6.1 inch",
        backCamera: "Camera: Chính 12 MP & Phụ 12 MP",
        frontCamera: "12 MP",
        img: "https://cdn.tgdd.vn/Products/Images/42/153894/iphone-11-trang-600x600.jpg",
        desc: "Thiết kế đột phá, màn hình tuyệt đẹp",
        type: "iphone",
      },
      {
        id: "5",
        name: "iPhone 13",
        price: "25000",
        screen: "6.1 inch",
        backCamera: "Camera: Chính 12 MP & Phụ 12 MP",
        frontCamera: "12 MP",
        img: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pink-600x600.jpg",
        desc: "Thiết kế tinh tế, hiệu năng mạnh mẽ",
        type: "iphone",
      },
      {
        id: "6",
        name: "Samsung Galaxy S21",
        price: "18000",
        screen: "6.2 inch",
        backCamera: "Chính 64 MP & Phụ 12 MP, 12 MP",
        frontCamera: "10 MP",
        img: "https://cdn.tgdd.vn/Products/Images/42/228967/samsung-galaxy-m51-xanh-600x600-600x600.jpg",
        desc: "Flagship Samsung với camera tuyệt vời",
        type: "samsung",
      },
    ];

    return sampleData.map(
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

      // Fallback: tìm trong data mẫu
      const fallbackProducts = this.getFallbackData();
      const product = fallbackProducts.find((p) => p.id === id);
      if (product) {
        return product;
      }

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
