// required('dotenv').config();
import dotenv from 'dotenv'
import connectDB from './db/index.js'

dotenv.config({
    path:'./env'
})


connectDB();















// ( async ()=>{
//     try {
//      await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//       app.on("error",()=>{
//         console.log("ERROR",error);
//         throw error
//       })
        
//       app.listen(process.env.PORT,()=>{
//         console.log(`app is listening at PORT ${process.env.PORT}`);

//       })
//     } catch (error) {
//         console.error("ERROR: ",error);
//         throw error
//     }
// })()
