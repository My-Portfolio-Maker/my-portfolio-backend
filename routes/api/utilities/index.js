const Uploads = require("../../../models/Uploads");
const Users = require("../../../models/Users");

const verifyUploadsHandler = async (images, userId)=>{
    if(images.length){
        const imageList = await Promise.all(images.map(async id=>{
            const verify = await verifyUploads(userId, id, ()=>{
                return id
            })
            return id.includes(verify)?id: null
        })).then(fil=>{
            return fil.filter(i=>i)
        })
        return images = [...imageList]
    }
    return images
}

const verifyUploads = async (user_id, image_id, fn) => {
    try {
        const user = await Users.findById(user_id);
        if (user._id) {
            return await Uploads.find({ $and: [{ uploaded_by: user._id }, { _id: image_id }] }).then(async uploaded => {
                if (uploaded.length) {
                    if (fn) return fn()
                    else {
                        return true
                    }
                }
            })
        }
    }
    catch (err) {
        null;
    }
}

module.exports = { verifyUploads, verifyUploadsHandler }