export class Product {
    constructor(id, name, price, stock, category, image) {

        this.id = id;
        this.name = name;
        this.price = price;
        this.stock = stock;
        this.category = category
        this.image = image;
    }

    updateStock(purchased_quantity) {
        this.stock -= purchased_quantity;
        this.save()
    }

    save() {
        const product = {
            id: this.id,
            name: this.name,
            price: this.price,
            stock: this.stock,
            category: this.category,
            image: this.image
        }
        localStorage.setItem("selected_product", JSON.stringify(product))
    }
}