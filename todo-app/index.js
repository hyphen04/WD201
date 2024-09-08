// const app = require('./app');

// app.listen(5000, () => {
//     console.log("started express server at port 5000")
// })


// new

// const app = require("./app");
// const PORT = process.env.PORT || 5000;
// app.listen(PORT,()=>{
//     console.log('started express server');
// });


// const app = require("./app");
// const port = process.env.PORT || 5000;
// // var http = require('http');
// app.listen(port, () => {
//   console.log(`server listening at port - ${port}`);
// });

const app = require('./app');
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("started express server at port 3000")
})