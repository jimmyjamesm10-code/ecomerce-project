import { Product } from "./product.js"
import { Cart } from "./cart.js"

const cartElement = document.getElementById("cart");
const total = document.getElementById("total")


const cart = new Cart();

const products = [
    new Product("L001","Laptop", 12000, "", "A Windows 11 Laptop", 10),
    new Product("P001","Phone", 8000, "", "An Iphone 15", 15),
    new Product("K001","Keyboard", 700, "", "A Gaming Keyboard", 20)
];

/*sync local storage cart with products so that when parsed, 
the new objects are instances of the Product() class, like the 
products array and also so that everything in the cart is actually in 
products and all the quantities match. This way when a product is deleted
from the catalog, it also gets deleted from the stored cart.*/
cart.items = cart.items
    .map(item => {
        const product = products.find(candidate => candidate.id === item.product?.id);
        const quantity = Number.isInteger(item.quantity) ? item.quantity : 0;

        if (!product || quantity <= 0) {
            return null;
        }

        return {
            product,
            quantity: Math.min(quantity, product.stock)
        };
    })
    .filter(Boolean);
cart.save();



function renderProductDetails(product) {
    const container = document.querySelector(".product-details")
    container.style.display = 'block';

    const cartItem = cart.items.find(item => item.product.id === product.id);
    const cartQuantity = cartItem ? cartItem.quantity : 0;
    const availableStock = product.stock - cartQuantity

    container.innerHTML = ` 
    <img src="${product.image}" alt="${product.name}">
    <h2>${product.name}</h2>
    <p>${product.description}</p>
    <p>R${product.price}</p>
    <p>${availableStock>0 ? `In Stock: ${availableStock} Units `: "Out of stock"}</p>
    <div class="total-display">Total: R${product.price}</div>
    <div class="quantity-control">
    <button class="decrease-quantity">-</button>
    <button class="product-quantity">1</button>
    <button class="increase-quantity">+</button>
    </div>
    <button class="add-to-cart">Add to Cart</button>
    <button class="back-to-products">Back to Products</button>
    `;

    const quantityDisplay = container.querySelector(".product-quantity");
    const decreseButton = container.querySelector(".decrease-quantity");
    const increaseButton = container.querySelector(".increase-quantity")
    const totalDisplay = container.querySelector(".total-display");
    let quantity = 1;

    const updateQuantityControls = () => {
        quantityDisplay.textContent = quantity;
        totalDisplay.textContent = "Total: R" + product.price * quantity;
        decreseButton.disabled = quantity <= 1;
        increaseButton.disabled = quantity >= availableStock;
    };

    updateQuantityControls();

    increaseButton.addEventListener("click", () => {
        if (quantity < availableStock) {
            quantity++;
            quantityDisplay.textContent = quantity
            totalDisplay.textContent = "Total: R" + (product.price * quantity)
        } 
        if (quantity >= availableStock) {
            increaseButton.disabled = true;
        }
        decreseButton.disabled = false;
    })

    decreseButton.addEventListener("click", () => {
        if (quantity > 1) {
            quantity--;
            quantityDisplay.textContent = quantity
            totalDisplay.textContent = "Total: R" + product.price * (quantity)
        }
        if (quantity <= 1) {
            decreseButton.disabled = true;
        }
        increaseButton.disabled = false;
    })

    const AddButton = document.querySelector(".add-to-cart")
    if (availableStock <= 0) {
        AddButton.disabled = true;
        AddButton.textContent = "Out of Stock";
    }

    
    AddButton.addEventListener("click", () => {
        const currentCartItem = cart.items.find(item => item.product.id === product.id);
        const currentCartQuantity = currentCartItem ? currentCartItem.quantity : 0;
        const remainingStock = product.stock - currentCartQuantity;

        if (quantity > remainingStock) {
            AddButton.textContent = "Not enough stock";
            return;
        }
        cart.addItem(product, quantity);
        console.log(remainingStock)
        renderProductDetails(product)
        AddButton.textContent = "Added to Cart ✔";
    })

    const BackButton = document.querySelector(".back-to-products");
    BackButton.addEventListener("click", () => {
        container.style.display = 'none'
        container.innerHTML = '';
    })
}

function renderProducts() {
    const productsContainer = document.querySelector(".products");

    productsContainer.innerHTML = "";

    products.forEach(product => {

        const ProductElement = document.createElement("div");
        ProductElement.classList.add("product-card");
        ProductElement.addEventListener("click", () => {
            renderProductDetails(product)
        })

        const productImage = document.createElement("img");
        productImage.src = product.image;
        productImage.alt = product.name;
        ProductElement.appendChild(productImage);

        const productName = document.createElement("h3");
        productName.textContent = product.name;
        ProductElement.appendChild(productName);
        productName.addEventListener("click", () => {
        })

        const productDescription = document.createElement("p");
        productDescription.textContent = product.description;
        ProductElement.appendChild(productDescription)

        const productPrice = document.createElement("p");
        productPrice.textContent = `R${product.price}`;
        ProductElement.appendChild(productPrice);

        productsContainer.appendChild(ProductElement);
})
}

renderProducts()

const emptyButton = document.createElement("button");
emptyButton.textContent = "Empty Cart";

const checkoutButton = document.createElement("button");
checkoutButton.textContent = "Checkout"

function renderCart() {
    const container = document.querySelector(".product-details")
    cartElement.innerHTML = "";

    cart.items.forEach(iitem => {
        const prod = products.find(product => product.id === iitem.product.id)

        const element = document.createElement("div");
        element.textContent = `${iitem.product.name} - R${iitem.product.price} x ${iitem.quantity}`;

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove from Cart";
        removeButton.addEventListener("click", () => {
            cart.removeItem(iitem.product);
            renderProductDetails(prod);
        });
        cartElement.appendChild(element);
        element.appendChild(removeButton);
    });


    cartElement.appendChild(emptyButton)
        emptyButton.addEventListener("click", () => {
        cart.clearCart();
        total.textContent = "Total Cost: R" + cart.getTotal();
        cartElement.appendChild(emptyButton);
        emptyButton.textContent = "Your Cart is Empty";
        products.forEach(item => {
            return renderProductDetails(item)
        });
        container.style.display = "none"
    });
    total.textContent = "Total Cost: R" + cart.getTotal();
    
    cartElement.appendChild(checkoutButton)
    
    checkoutButton.addEventListener("click", () => {
        renderCheckout();
    })
}

function renderCheckout() {
    const checkout = document.querySelector(".checkout")
    checkout.innerHTML = `
    <h2>Checkout</h2>
    <p>Order Summary</p>
    `;
};

cart.addEventListener("change", renderCart)

products.forEach(item => {item.addEventListener("change", renderProductDetails)})

renderCart();

