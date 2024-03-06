const express = require("express");
const exphbs = require("express-handlebars");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

const app = express();
const PUERTO = 8080;
const server = http.createServer(app);
const io = socketIO(server);

let nextProductId = 1;

const hbs = exphbs.create({
    layoutsDir: path.join(__dirname, "views/layouts"),
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

const productsRouter = require("./routes/products.router");
const cartsRouter = require("./routes/carts.router");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json())
//Acá le digo a express que voy a recibir datos en formato JSON.

let products = [];
//Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

app.get("/", (req, res) => {
    res.render("home", { products });
});

app.get("/realtimeproducts", (req, res) => {
    res.render("realTimeProducts", { products });
});


io.on("connection", (socket) => {
    console.log("Usuario conectado");

    socket.on("addProduct", (productData) => {
        console.log("Valor actual de 'products':", products);
        console.log("Producto recibido en el servidor:", productData);
        try {
            const newProduct = {
                id: generateProductId(),
                ...productData,
            };
            products.push(newProduct);
            io.emit("updateProducts", products);
        } catch (error) {
            console.error("Error al agregar producto:", error);
        }
    });

    socket.on("updateProducts", () => {
        io.emit("updateProducts", products);
    });

    socket.on("disconnect", () => {
        console.log("Usuario desconectado");
    });
});

function generateProductId() {
    const currentId = nextProductId;
    nextProductId++;
    return currentId.toString();
}

//Listen:

server.listen(PUERTO, () => {
    console.log(`Escuchando en el puerto: ${PUERTO}`);
})


