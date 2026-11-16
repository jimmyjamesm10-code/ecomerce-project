import { Product } from "./product.js"
import { Cart } from "./cart.js"

const loginnav = document.querySelector(".login")
const logindialog = document.getElementById("login-dialog")
loginnav.addEventListener("click", () => {
    logindialog.showModal();
})

const loginButton = document.getElementById("login");
const loginForm = document.getElementById("login_form");
const loginFailureMessage = document.createElement("div");
loginFailureMessage.classList = "login-failure-message"
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const loginInfo = {email:  email, password: password}

    
    const response = await fetch("http://localhost:8080/loginrequest", {
        method: "POST", 
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(loginInfo)
    })

    const body = await response.json();

    if (!response.ok) {
        console.error(`HTTP error! Status: ${response.status}: ${body.message}`);
        loginFailureMessage.textContent = body.message;
        logindialog.appendChild(loginFailureMessage)
        return;    
    }
    console.log(response.status, body.message)
    window.location.href = "ecom"; 
})


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
    if (cartElement == "") {
        cartElement.appendChild(emptyCartText);
    }
    
    checkoutButton.addEventListener("click", () => {
        window.location.href = "checkout"
    })
}
renderCart();

//listen for event dispatched after every cart method nad re-render cart.
cart.addEventListener("change", renderCart)

//--------------------------------------------------------------------------------