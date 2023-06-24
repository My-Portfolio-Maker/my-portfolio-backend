const mongoose = require('mongoose');
const cron = require('node-cron');
const Sessions = require('../../models/Sessions');
const Users = require('../../models/Users');
const Uploads = require('../../models/Uploads');
const path = require('path');
const fs = require('fs');
const { __basedir } = require('../../server.js');
const Profiles = require('../../models/Profiles');

// @desc        Cron job to remove unrelated cv uploads and images
// @param       {Object}  cronJob  Cron job object
// @interval    Every midnight

let UploadsRemoveCron = cron.schedule('0 0 0 * * *', async () => {
    console.log("Current time: ", new Date().toLocaleTimeString());
    console.log("This Cron Job runs only on midnights\n");
    console.log("Finding Unrelated CVs and Images...");
    try {
        const baseDir = path.join(__basedir, "uploads");

        // Checking collection - uploads for images
        const imagePath = path.join(baseDir, "/images");
        const fn = (file) => {
            console.log('Deleting Unrelated Image...')
            const filePath = path.join(imagePath, file);
            fs.unlinkSync(filePath);
        }
        const userList = await Users.find();
        userList.forEach(async ({ _id, avatar }) => {
            if (avatar) {
                const image = await Uploads.findById(avatar)
                if (!image) {
                    console.log('Removing unrelated image references from collections...');
                    await Users.findByIdAndUpdate(_id, { avatar: null })
                }
            }
        })
        const profileList = await Profiles.find();
        profileList.forEach(async ({ _id, images }) => {
            if (images.length) {
                images.forEach(async id => {
                    const image = await Uploads.findById(id)
                    if (!image) {
                        console.log('Removing unrelated image references from collections...');
                        await Profiles.findByIdAndUpdate(_id, { $pull: { images: id } })
                    }
                })
            }
        })
        fs.readdir(imagePath, (err, files) => {
            files.forEach(async file => {
                await Uploads.find({ name: file }).then(async upload => {
                    if (!upload.length) {
                        fn(file)
                    }
                    else {
                        const { _id } = upload[0];
                        const imageinUser = await Users.find({ avatar: _id }).count();
                        const imageinProfile = await Profiles.find({ images: _id }).count()

                        if (!imageinUser || !imageinProfile) {
                            console.log('Deleting unrelated image documents from collection...');
                            await Uploads.deleteOne({ name: file }).then(deleted => {
                                if (deleted.acknowledged)
                                    fn(file)
                            })
                        }
                    }
                })
            })
            if(err){
                throw err;
            }
        })
        const uploadList = await Uploads.find()
        uploadList.forEach(async ({name})=>{
            const filePath = path.join(imagePath, name);
            fs.stat(filePath, async (err, stats)=>{
                if(!stats || err){
                    console.log('Deleting unrelated image documents from collection...');
                    await Uploads.deleteOne({name})
                }
            })
        })


    }
    catch (err) {
        console.log(err);
    }
})

module.exports = UploadsRemoveCron