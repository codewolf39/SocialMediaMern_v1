const router = require("express").Router();
const Post = require("../models/Post");
const Users = require("../models/Users");

//create a post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err.message);
  }
});
//update a post
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.status(200).json("the post has been updated");
    } catch (err) {
      res.status(500).json(err.message);
    }
  } else {
    return res.status(403).json("Unauthorized");
  }
});
//delete a post
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      await Post.findByIdAndDelete(req.params.id);
      res.status(200).json("the post has been deleted");
    } catch (err) {
      res.status(500).json(err.message);
    }
  } else {
    res.status(403).json("Unauthorized");
  }
});
//like a post
router.put("/:id/likes", async (req, res) => {
  if (req.body.userId) {
    try {
      const post = await Post.findById(req.params.id);
      if (post.likes.includes(req.body.userId)) {
        await post.updateOne({ $pull: { likes: req.body.userId } });
        res.status(200).json({
          noOfLikes: post.likes.length - 1,
          message: "You have unliked this post",
        });
      } else {
        await post.updateOne({ $push: { likes: req.body.userId } });
        res.status(200).json({
          noOfLikes: post.likes.length + 1,
          message: "You have liked this post",
        });
      }
    } catch (err) {
      res.status(500).json(err.message);
    }
  } else {
    return res.status(403).json("Unauthorized");
  }
});
//get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error.message);
  }
});
// get timeline posts

router.get("/timeline/:id", async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);
    const following = [...user.followings, req.params.id];
    const posts = await Post.find({ userId: { $in: following } }).sort({
      createdAt: -1,
    });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

module.exports = router;
