const mongoose = require('mongoose');

const diarySchema = mongoose.Schema( {

    title : String,
    description: String,
    imagePath: String,
    creator: {type: mongoose.Schema.Types.ObjectId, ref:"User", required: true}
})

module.exports = mongoose.model('Diary', diarySchema);
