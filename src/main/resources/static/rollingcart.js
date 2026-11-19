import { Product } from "./product.js"
import { Cart } from "./cart.js"

const loginNav = document.querySelector(".login");
const loginDialog = document.getElementById("login-dialog");
const loginForm = document.getElementById("login_form");
const loginError = document.getElementById("login-error");
const navCartText = document.querySelector(".cart-link .nav-cart-text");

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
        const response = await fetch("/loginrequest", {
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


const cart = new Cart(); //load cart



//-----------------parse products and fix them------------------------------------
let parsedProducts = JSON.parse(localStorage.getItem("products") || "[]");
parsedProducts = parsedProducts.map(item =>
    new Product(item.id, item.name, item.price, item.stock, item.category, item.image)
);
const products = parsedProducts;


//----------------fix parsed cart-------------------------------------------------------
cart.items = cart.items
    .map(item => {
        const product = products.find(candidate => candidate.id === item.product.id);
        const quantity = Number.isInteger(item.quantity) ? item.quantity : 0;

        if (!product || quantity <= 0) {
            return null;
        }

        return {
            product: product,
            quantity: Math.min(quantity, product.stock)
        };
    })
    .filter(Boolean);
cart.save();


//--------------------render fixed cart items--------------------------------------------------

if (cart.items.length !== 0) {
    navCartText.style.color = "aqua";
}

cart.addEventListener("change", () => {
    navCartText.style.color = cart.items.length > 0 ? "aqua" : "";
})

const cartElement = document.getElementById("cart");
const totalCard = document.querySelector(".total-card");
const checkout = document.querySelector(".checkout");
function renderCart() {
    cartElement.innerHTML = "";
    totalCard.innerHTML = "";
    checkout.innerHTML = "";

    const checkoutButton = document.createElement("button");
    checkoutButton.classList = "checkout-button"
    checkoutButton.textContent = "Proceed To Checkout"

    const emptyButton = document.createElement("button");
    emptyButton.classList = "empty-button"
    emptyButton.type = "button";
    emptyButton.setAttribute("aria-label", "Empty cart");
    emptyButton.innerHTML = `
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"
            fill="none" stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"></path>
            <path d="M8 6V4h8v2"></path>
            <path d="m19 6-1 14H6L5 6"></path>
            <path d="M10 11v5"></path>
            <path d="M14 11v5"></path>
        </svg>`;

    cart.items.forEach(item => {

        const element = document.createElement("div");
        element.classList = "cartitem-info";
        element.textContent = `${item.product.name} - R${item.product.price} x ${item.quantity}`;

        const itemImage = document.createElement("img");
        itemImage.classList = "cart-item-image"
        itemImage.height = "100";
        itemImage.width = "100";
        itemImage.src = item.product.image;
        cartElement.appendChild(itemImage);

        const removeButton = document.createElement("button");
        removeButton.classList = "remove-button";
        removeButton.textContent = "Remove from Cart";
        removeButton.addEventListener("click", () => {
            cart.removeItem(item.product);
        });
        cartElement.appendChild(element);
        element.appendChild(removeButton);
    });

    const total = document.createElement("div");
    total.id = "total";
    total.textContent = "Total Cost: R" + cart.getTotal();
    totalCard.appendChild(total);
    
    checkout.appendChild(checkoutButton)
    checkout.appendChild(emptyButton);
    emptyButton.addEventListener("click", () => {
        cart.clearCart();
    });

    const emptyCartText = document.createElement("div")
    emptyCartText.textContent = "Your cart is empty"
    emptyCartText.style.cssText = "margin-left: 6rem; margin-top: 5rem; font-size: 2rem"

    if (cartElement.innerHTML == "") {
        cartElement.appendChild(emptyCartText);
        checkoutButton.disabled = true;
        checkoutButton.style.cursor = "not-allowed";
    }
    
    checkoutButton.addEventListener("click", () => {
        window.location.href = "checkout"
    })
}
renderCart();

//listen for event dispatched after every cart method nad re-render cart.

cart.addEventListener("change", renderCart)

//--------------------------------------------------------------------------------