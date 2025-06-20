import mongoose,{Schema} from "mongoose";

const communityPostSchema = new Schema({
  content:{
    type:String,
    required:true
  },
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
  }
},{
  timestamps:true
})

export const communityPost=mongoose.model("communityPost",communityPostSchema)