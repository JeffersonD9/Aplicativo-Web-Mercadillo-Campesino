// import app from '../app.js'
// import request from 'supertest'

// //TESTING DE ROUTINGS GET 

// // describe('Get /Admin', () => { 
// //     test('Debería responder con codigo 302',async()=>{
// //        const responder = await request(app).get('/MercadilloBucaramanga/Admin').send()
// //        expect(responder.statusCode).toBe(302)
// //     })
// // })

// // describe('Get /MercadilloBucaramanga', () => { 
// //     test('Debería responder con codigo 302',async()=>{
// //        const responder = await request(app).get('/MercadilloBucaramanga').send()
// //        expect(responder.statusCode).toBe(302)
// //     })
// // })

// // describe('Get /Admin/Usuarios', () => { 
// //     test('Debería responder con codigo 302',async()=>{
// //        const responder = await request(app).get('/MercadilloBucaramanga/Admin/Usuarios').send()
// //        expect(responder.statusCode).toBe(302)
// //     })
// // })

// // describe('Get /Usuario/', () => { 
// //     test('Debería responder con codigo 302',async()=>{
// //        const responder = await request(app).get('/MercadilloBucaramanga/Usuario').send()
// //        expect(responder.statusCode).toBe(302)
// //     })
// // })

// // describe('Get /Admin/Categorias', () => { 
// //     test('Debería responder con codigo 200',async()=>{
// //        const responder = await request(app).get('/MercadilloBucaramanga/Admin/Categorias').send()
// //        expect(responder.statusCode).toBe(200)
// //     })
// // })

// // //TESTING ROUTING POST

// // describe('POST /Productos', () => { 
// //     test('Debería responder con codigo 200',async()=>{
// //        const responder = await request(app).get('/MercadilloBucaramanga/productos').send()
// //        expect(responder.status).toBe(200)
// //     })
// // })

// // describe('POST /Admin/Categorias', () => { 
// //     test('Debería responder con codigo 404',async()=>{
// //        const responder = await request(app).post('/MercadilloBucaramanga/Admin/Categorias').send(
// //         {
// //             Nombre: "Limon Mandarin"
// //         }
// //        )
// //        console.log(responder.body.Nombre)
// //        expect(responder.status).toBe(404)
// //     })
// // })

// // describe('POST /Usuario/Productos-Categorizados', () => {
// //     test('Debería responder con codigo 404', async () => {
// //         const responder = await request(app).post('/MercadilloBucaramanga/Usuario/Productos-Categorizados').send(
// //             {
// //                 Id_producto: 5,
// //                 NombreProducto: "Pera Test",
// //                 Description: "test description",
// //                 NombreCategoria: "Frutas"
// //             }
// //         )
// //         console.log(responder.body.Nombre)
// //         expect(responder.status).toBe(404)
// //     })
// // })

// // describe('POST /Usuario/Productos', () => {
// //     test('Debería responder con codigo 404',async()=>{
// //        const responder = await request(app).post('/MercadilloBucaramanga/Login').send(
// //         {
// //             Email:"Email3",
// //             Password:"Admin123",
// //         }
// //        )
// //        console.log(responder.body)
// //        expect(responder.status).toBe(404)
// //        expect(responder.body.message).toBe('El Usuario No Existe');
// //     })
// // })

// describe('POST /Admin/Productos', () => {
//     test('Debería responder con codigo 404',async()=>{
//        const responder = await request(app).post('/MercadilloBucaramanga/Login').send(
//         {
//             Email:"Email",
//             Password:"Admin123",
//         }
//        )
//        console.log(responder.body)
//        expect(responder.status).toBe(404)
//     })
// })

// // describe('POST /Register', () => {
// //     test('Debería responder con codigo 404',async()=>{
// //        const responder = await request(app).get('/Admin/Usuarios').send(
// //         {
// //             Nombres: "Ivan",
// //             Apellidos: "Caceres",
// //             Celular: "324522010",
// //             UserName: "Ivan204",
// //             Email: "Ivan@vendedor.com",
// //             Password: "1005369500Jm.",
// //             Imagen: "hola"
// //         }
// //        )
// //        expect(responder.statusCode).toBe(404)
// //     })
// // })