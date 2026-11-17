import { Product } from "./product.js"
import { Cart } from "./cart.js"
import { OrderInfo } from "./orderinfo.js";
import { orderConstructor } from "./OrderConstructor.js";

const loginNav = document.querySelector(".login");
const loginDialog = document.getElementById("login-dialog");
const loginForm = document.getElementById("login_form");
const loginError = document.getElementById("login-error");
const checkoutContainer = document.querySelector(".checkout-container");
checkoutContainer.style.cssText = "flex-wrap: wrap; gap: 1rem"

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

const cart = new Cart();

let parsedProducts = JSON.parse(localStorage.getItem("products"));

parsedProducts = parsedProducts.map(item =>
    new Product(item.id, item.name, item.price, item.stock, item.category, item.image)
);

const products = parsedProducts;




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

const cartItems = cart.items
const cartTotal = cart.getTotal();

console.log(cartItems)

const checkoutTotal = document.querySelector("#checkout-total");
const payButton = document.getElementById("paybutton");
const orderButton = document.getElementById("place_order");
const requestUserLogin = document.createElement("p");
requestUserLogin.classList = "request-user-login";
requestUserLogin.role = "alert";


//----------------rendering------------------------------------------

function renderCheckout() {
    const checkoutItems = document.getElementById("checkout-items");
    checkoutItems.innerHTML = "";

    orderButton.disabled = cartItems.length === 0;
    if (cartItems.length === 0) {
        checkoutItems.innerHTML = `<p>Your cart is empty.</p>`
        return;
    }
    const subtotals = [];
    cartItems.forEach(item => {
        const itemElement = document.createElement("div")
        const subtotal = item.product.price * item.quantity
        itemElement.innerHTML = `
        <h3 class="checkout-product-name">${item.product.name}<h3>
        <p>Price: R${item.product.price}</p>
        <p>Subtotal: R${subtotal}</p>
        `;
        subtotals.push(subtotal)
        checkoutItems.appendChild(itemElement);
    });

    const total = subtotals.reduce((x, y)=> x+y, 0)
    checkoutTotal.textContent = total;//render total from subtotals
}
window.addEventListener("pageshow", () => {
    renderCheckout();
})

//------------------------------------------------------------------


const checkoutForm = document.getElementById("checkout-form");
const checkoutDialog = document.getElementById("checkout-dialog");
const closeCheckoutButton = document.getElementById("close-checkout");

closeCheckoutButton.addEventListener("click", () => checkoutDialog.close());

orderButton.addEventListener("click", async function(event) {
    event.preventDefault();
    const newOrder = new orderConstructor(cartItems, cartTotal, "PENDING")
    orderButton.disabled = true;

    //----------------place order and immediately retrieve its id----------------
    const response = await fetch("http://localhost:8080/order/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder)
    }).then(response => {
        if (!response.ok) {
            requestUserLogin.textContent = "Please log in before placing order"
            checkoutContainer.appendChild(requestUserLogin);
            throw new Error(`HTTP error! Status: ${response.status}`)
        } 
        return response.json();
    })
    console.log(response.message);
    console.log(response.orderId);
    const orderId = response.orderId;
    //---------------------------------------------------------------------------

    //----------------use order id to save order items---------------------------
    const saveitemsresponse = await fetch(`http://localhost:8080/order/saveorderitems/${orderId}`, {
        method: "POST",
        headers: {"content-Type": "application/json"},
        body: JSON.stringify(newOrder)
    })

    const body = saveitemsresponse.json();
    
    if (!saveitemsresponse.ok) {
        console.log(body.message);
        return;
    }

    checkoutDialog.showModal();

    //---------------------------------------------------------------------------
    
    //after order is placed listen for payment init submission
    checkoutForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        newOrder.items.forEach(item => {
            const product = products.find(product => product.id === item.product.id)
            product.updateStock(item.quantity);
        })

        //----------use retrieved orderid to request payment init-------------------
        const paystackResponse = await fetch(`http://localhost:8080/payments/initialize/${orderId}`, {
            method: "POST"
        }).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`)
            }
            cart.items = [];
            cart.save();
            payButton.disabled = true;
            return response.json();
        })

        window.location.href = await paystackResponse.authorization_url

    })
})
