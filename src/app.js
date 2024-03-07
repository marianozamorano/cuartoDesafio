const express = require("express");
const exphbs = require("express-handlebars");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
const fs = require("fs");

const productsFilePath = path.join(__dirname, "public", "js", "products.json");

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

async function initProducts() {
    try {
        const productsData = fs.readFileSync(productsFilePath, 'utf-8');

        if (!productsData.trim()) {
            console.log("El archivo JSON está vacío o no contiene datos válidos.");
            products = [];
        } else {
            const parsedProducts = JSON.parse(productsData);
            products = parsedProducts;
            console.log("Productos inicializados:", products);
        }
    } catch (error) {
        if (error.code === "ENOENT") {
            console.log("El archivo JSON no existe. Se creará uno nuevo.");
            try {
                fs.writeFileSync(productsFilePath, "[]", { encoding: 'utf-8' });
                console.log("Archivo JSON creado con éxito.");
                // const newProductsData = fs.readFileSync(productsFilePath, 'utf-8');
                // const newParsedProducts = JSON.parse(newProductsData);
                // products = newParsedProducts;
                // console.log("Productos inicializados:", products);
                initProducts();
            } catch (writeError) {
                console.error("Error al escribir o leer el archivo JSON:", writeError);
            }
        } else {
            console.error("Error al leer el archivo JSON:", error);
        }
    }
}

initProducts();

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
            fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), "utf-8");

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
    // return currentId.toString();
    return (products.length + 1).toString();
}

//Listen:

server.listen(PUERTO, () => {
    console.log(`Escuchando en el puerto: ${PUERTO}`);
})


