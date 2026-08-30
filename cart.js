export class Cart extends EventTarget {
    constructor() {
        super();

        this.items = [];
        this.load();
    }

    addItem(x, quantity) {
        const cartItem = this.items.find(item => item.product.id === x.id)
        const currentCartQuantity = cartItem ? cartItem.quantity : 0;
        const remainingStock = x.stock - currentCartQuantity;

        if (quantity > remainingStock) {
            return;
        }

        if (cartItem) {
            cartItem.quantity += quantity
        } else {
            this.items.push({
                product: x,
                quantity: quantity
            })
        }
        this.save();
        this.dispatchEvent(new Event("change"))
    }
    /*Ensure cart is source of truth with regards to increse quantity buttons
    as well. Meaning let the method check the cart against products catalog first 
    and stop executing if quantity is too big, and then disable buttons in UI.*/
    increaseQuantity(x) {
        const item = this.items.find(item => item.product.id === x.id);
        if (item && item.quantity < item.product.stock) {
            item.quantity++;
        } else {
            return;
        }

        this.save();
        this.dispatchEvent(new Event("change"))
    }

    decreaseQuantity(x) {
        const item = this.items.find(item => item.product.id === x.id);
        if (item && item.quantity > 1) {
            item.quantity--;
        } else {}

        this.save();
        this.dispatchEvent(new Event("change"))
    }

    removeItem(y) {
        const index = this.items.findIndex(item => item.product.id === y.id);
        if (index !== -1) {
            this.items.splice(index, 1);
            this.save();
            this.dispatchEvent(new Event("change"))
        }
    }

    clearCart() {
        this.items = []

        this.save();
        this.dispatchEvent(new Event("change"))
    }

    getTotal() {
        const prices = this.items.map(stuff => stuff.product.price * stuff.quantity)
        const total = prices.reduce((accumulator, currentValue) => 
            accumulator + currentValue, 0);
        return total;
    }

    save() {
        localStorage.setItem("cart", JSON.stringify(this.items));
    }

    load() {
        const savedCart = localStorage.getItem("cart");
        if (!savedCart) {
            return;
        }

        try {
            const parsedCart = JSON.parse(savedCart);

            if (!Array.isArray(parsedCart)) {
                return;
            }

            this.items = parsedCart.filter(item =>
                item &&
                item.product &&
                typeof item.product.id === "string" &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0
            );
        } catch {
            this.items = [];
            localStorage.removeItem("cart");
        }
    }
}


