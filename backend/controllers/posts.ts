import { Request, Response } from "express";
import SocialCircle from "../models/SocialCircle.js";
import { MessageType, PostType, RecipeThumbnailType } from "../types/types.js";

async function addPostToCircle(req: Request, res: Response) {
    const user = req.user;
    const { id } = req.params;
    const { recipeId, message } = req.body;
    const { title, image } = req.body;

    if (!id || !recipeId || !message || !title) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const socialCircle = await SocialCircle.findById(id);
        if (!socialCircle) {
            return res.status(404).json({ error: "Social circle not found" });
        }
        // Check if user is a member of the circle
        if (!socialCircle.members.includes(user.id)) {
            return res.status(401).json({
                error: "Unauthorized: only members can post to circle",
            });
        }

        const messageBlock: MessageType = {
            _id: socialCircle.id,
            userInfo: {
                name: user.name,
                userId: user.id,
                userImage: user.profileUrl,
            },
            message: message,
            timestamp: new Date(),
        };

        const recipeThumbnailBlock: RecipeThumbnailType = {
            title: title,
            image: image,
            id: recipeId,
        };
        const fullPost: PostType = {
            message: messageBlock,
            recipeThumbnail: recipeThumbnailBlock,
        };

        const circlePost = await SocialCircle.findByIdAndUpdate(
            id,
            {
                $push: { posts: fullPost },
            },
            { runValidators: true, new: true }
        );
        console.log(circlePost);

        return res.status(200).json({ post: fullPost });
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

async function getPostsByCircleId(req: Request, res: Response) {}

export default {
    addPostToCircle,
    getPostsByCircleId,
};
