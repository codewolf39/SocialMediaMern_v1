const router = require("express").Router();
const bcrypt = require("bcrypt");
const Users = require("../models/Users");
//update a user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err.message);
      }
    }

    try {
      const user = await Users.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated");
    } catch (error) {
      return res.status(500).json(err.message);
    }
  } else {
    return res.status(403).json("Unauthorized");
  }
});
//delete a user

router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await Users.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted successfully");
    } catch (err) {
      return res.status(500).json(err.message);
    }
  } else {
    return res.status(403).json("Unauthorized");
  }
});

//get a user
router.get("/:id", async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);
    const { isAdmin, password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (error) {
    res.status(500).json(error.message);
  }
});
//get all users
router.get("/", async (req, res) => {
  try {
    const users = await Users.find();
    res.status(200).json({
      status: "success",
      totalUsers: users.length,
      Users: users,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});
//follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await Users.findById(req.params.id); //who is being followed
      const currentUser = await Users.findById(req.body.userId); // who wants to follow
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("User followed successfully");
      } else {
        res.status(403).json("You already follow this user");
      }
    } catch (err) {
      res.status(500).json(err.message);
    }
  } else {
    res.status(403).json("You cannot follow yourself");
  }
});

//unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await Users.findById(req.params.id); //who is being followed
      const currentUser = await Users.findById(req.body.userId); // who wants to follow
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("User unfollowed successfully");
      } else {
        res.status(403).json("You do not follow this user");
      }
    } catch (err) {
      res.status(500).json(err.message);
    }
  } else {
    res.status(403).json("You cannot unfollow yourself");
  }
});

module.exports = router;
