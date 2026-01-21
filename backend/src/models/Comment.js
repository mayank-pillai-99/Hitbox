import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    list: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
    text: { type: String, required: true, maxlength: 1000 }
}, {
    timestamps: true
});

// Index for efficient querying of comments by list
commentSchema.index({ list: 1, createdAt: -1 });

export default mongoose.model('Comment', commentSchema);
