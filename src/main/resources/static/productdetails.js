import { Product } from "./product.js"
import { Cart } from "./cart.js"

const loginNav = document.querySelector(".login");
const loginDialog = document.getElementById("login-dialog");
const loginForm = document.getElementById("login_form");
const loginError = document.getElementById("login-error");
const navCartText = document.querySelector(".nav-links .nav-cart-text");

loginNav.addEventListener("click", () => loginDialog.showModal());
document.getElementById("close-login").addEventListener("click", () => loginDialog.close());

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginError.textContent = "";

    const loginInfo = {
        email: document.getElementById("login-email").value,
        password: document.getElementById("login-password").value
    };

    try {
        const response = await fetch("http://localhost:8080/loginrequest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginInfo)
        });
        const body = await response.json();

        if (!response.ok) {
            loginError.textContent = body.message || "Login failed. Please try again.";
            return;
        }

        window.location.reload();
    } catch (error) {
        console.error("Login request failed:", error);
        loginError.textContent = "Unable to log in. Please try again.";
    }
});

let parsedProduct = JSON.parse(localStorage.getItem("selected_product"));

parsedProduct = new Product(parsedProduct.id, parsedProduct.name, parsedProduct.price, parsedProduct.stock, parsedProduct.category, parsedProduct.image)

const productToRender = parsedProduct;

const cart = new Cart();

cart.addEventListener("change", () => {
    navCartText.style.color = cart.items.length > 0 ? "aqua" : "";
});

window.addEventListener("pageshow", () => {
    renderProductDetails(productToRender)
    });


function renderProductDetails(product) {
    const container = document.querySelector(".product-details")
    container.style.display = 'block';

    const cartItem = cart.items.find(item => item.product.id === product.id);
    const cartQuantity = cartItem ? cartItem.quantity : 0;
    const availableStock = product.stock - cartQuantity

    container.innerHTML = ` 
    <img class="product-details-image" src="${product.image}" alt="${product.name}">
    <h2>${product.name}</h2>
    <p>R${product.price}</p>
    <p>${availableStock>0 ? `In Stock: ${availableStock} Units `: "Out of stock"}</p>
    <div class="total-display">Total: R${product.price}</div>
    <div class="quantity-control">
    <button class="decrease-quantity">-</button>
    <button class="product-quantity">1</button>
    <button class="increase-quantity">+</button>
    </div>
    <button class="add-to-cart"></button>
    <button class="back-to-products">Back to Products</button>
    `;

    
    const quantityDisplay = container.querySelector(".product-quantity");
    const decreseButton = container.querySelector(".decrease-quantity");
    const increaseButton = container.querySelector(".increase-quantity")
    const totalDisplay = container.querySelector(".total-display");
    const productDetailsImg = container.querySelector(".product-details-image");
    productDetailsImg.style.cssText = `width: 20rem; 
                                       height: 20rem; 
                                       margin-top: 1rem;`
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

    const AddButton = document.querySelector(".add-to-cart");
    AddButton.textContent = "Add To Cart";
    if (availableStock <= 0) {
        AddButton.disabled = true;
        AddButton.textContent = "Out of Stock";
    }

    
    AddButton.addEventListener("click", () => {
        AddButton.textContent = "Go To Cart";
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
    })

    const BackButton = document.querySelector(".back-to-products");
    BackButton.addEventListener("click", () => {
        window.location.href="ecom"
    })
}

renderProductDetails(productToRender);

