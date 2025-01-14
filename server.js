import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-happy-thoughts";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();
const listEndpoints = require('express-list-endpoints');

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (req, res) => {
  const welcomeMessage = "Happy Thoughts API!";
  const endpoints = listEndpoints(app);

  res.status(200).json({
    success: true,
    message: "OK",
    body: {
      welcomeMessage,
      endpoints
    }
  });
});


const { Schema } = mongoose;
const thoughtsSchema = new Schema({
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140,
    trim: true
  },
  hearts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}); 

const Thought = mongoose.model("thoughts", thoughtsSchema);

app.get('/thoughts', async (req, res) => {
  try { 
    const thoughts = await Thought.find().sort({ createdAt: 'desc' }).limit(20).exec();
    res.status(200).json({
      success: true,
      response: thoughts,
      message: "Successfully fetched thoughts"
    }); 
  } catch (error) {
    res.status(400).json({
      success: false,
      response: error,
      message: "An error occured when trying to fetch thoughts"
    });
  }
})

app.post("/thoughts", async (req, res)=>{
  const {message} = req.body;
    try {
      const thought = await new Thought({message}).save();
      res.status(201).json({
       success: true,
        response: thought,
        message: "Thought created successfully"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        response: error,
        message: "An error occurred when creating the thought"
      });
    }
});

app.post('/thoughts/:thoughtId/like', async (req, res) => {
  const { thoughtId } = req.params;

  try {
    const updatedThought = await Thought.findByIdAndUpdate(thoughtId, { $inc: { hearts: 1 } }, { new: true });
    if (updatedThought) {
      res.json(updatedThought);
    } else {
      res.status(404).json({ message: 'The thought could not be found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid request', error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
