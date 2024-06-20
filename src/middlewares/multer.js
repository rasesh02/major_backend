import multer from "multer";
//multer will be used as a middleware to take files from user and store them locally
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        cb(null,file.originalname); // name chose by user, this can cause problems as user can name many files with same name
    //  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
     // cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  
 export const upload = multer(
    { /*storage: storage */ storage,})

    //multer will return filepath like /publi/temp/image-1.png , this filepath is used by cloudinary