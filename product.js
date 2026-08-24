export class Product extends EventTarget {
    constructor(id, name, price, image, description, stock) {
        super();

        this.id = id;
        this.name = name;
        this.price = price;
        this.image = image;
        this.description = description;
        this.stock = stock
    }
}