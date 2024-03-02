const express = require("express");
const exphbs = require("express-handlebars");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

const app = express();
const PUERTO = 8080;
const server = http.createServer(app);
const io = socketIO(server);

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

let products = {};
//Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

app.get("/", (req, res) => {
    res.render("home", { products });  // Ajusta "products" según tus necesidades
});

app.get("/realtimeproducts", (req, res) => {
    res.render("realTimeProducts", { products });  // Ajusta "products" según tus necesidades
});


io.on("connection", (socket) => {
    console.log("Usuario conectado");

    socket.on("updateProducts", () => {
        io.emit("updateProducts", products);
    });

    socket.on("disconnect", () => {
        console.log("Usuario desconectado");
    });
});


//Listen:

app.listen(PUERTO, () => {
    console.log(`Escuchando en el puerto: ${PUERTO}`);
})


