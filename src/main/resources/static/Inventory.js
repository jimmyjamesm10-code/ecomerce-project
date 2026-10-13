import { Product } from "./product.js";

export class Inventory {
    constructor() {
        this.fixedProductCatalog = [
            new Product("L001", "Laptop", 12000, "", "A good laptop", 10),
            new Product("P001", "Phone",  8000, "", "An i-phone infinity", 30),
            new Product("K001", "Keyboard",  700, "", "A gaming keyboard", 50),
            new Product("M001", "Mouse",  360, "", "A desktop mouse", 100)
        ]
        this.products = [];
        this.baseProducts = [];
        this.load();
    }

    updateInventory(purchasedItem, quantity_purchased) {
        const product = this.products.find(product =>
            product.id === purchasedItem.product.id
        );

        if (!product || !Number.isInteger(quantity_purchased) || quantity_purchased <= 0) {
            return;
        }

        if (quantity_purchased <= product.stock) {
            product.stock -= quantity_purchased;
            this.save();
        }
    }

    checkorders() {
        const savedOrders = localStorage.getItem("orders");
        if (savedOrders) {
            return;
        } else {
            this.baseProducts = this.fixedProductCatalog;
        }
        this.save1();
    }
    restoreInventoryFromBase() {
        if (this.baseProducts.length === 0) {
            return;
        } 
        this.products = this.baseProducts.map((product) => ({...product})) 
        
        this.save();
    }

    updateBaseInventory() {
        this.baseProducts = this.products.map((product) => ({...product}))
        this.save1();
    }
    

    save() {
        this.products.forEach((product) => {
            if (product.stock < 0) {
                return;
            }
        })
        this.baseProducts.forEach((product) => {
            if (product.stock < 0) {
                return;
            }
        })

        const savedBase = localStorage.getItem("base inventory");
        if (savedBase && savedBase.length !== 0) {
            localStorage.setItem("inventory", JSON.stringify(this.products));
            return;
        }
        localStorage.setItem("base inventory", JSON.stringify(this.baseProducts));
    }

    save1() {
        localStorage.setItem("base inventory", JSON.stringify(this.baseProducts));
    }

    load() {
        const savedInventory = localStorage.getItem("base inventory");

        if (!savedInventory) {
            return;
        }

        try {
            const parsedInventory = JSON.parse(savedInventory);
        
            if (Array.isArray(parsedInventory)) {
                this.products = parsedInventory;
            }
        
        } catch {
            this.products = []
            localStorage.removeItem("inventory")
        }
    }
}

