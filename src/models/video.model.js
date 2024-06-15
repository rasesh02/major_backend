import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema= new Schema({
    videoFile: {
        type: String, //cloudinary url
        required: true
    },
    thumbnail: {
        type: String, 
        required: true
    },
   title:{
     type: String,
     required: true,
   },
   description: {
    type: String, 
    required: true
},
duration: {
    type: Number, 
    required: true
},
  owner:{
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  views:{
    type: Number,
    default: true,
  },
  isPublished: {
    type: Boolean,
    default: true
},
},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)
export const Video=mongoose.model("Video",videoSchema);