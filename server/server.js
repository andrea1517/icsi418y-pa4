require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.json({
        message: "Server is running."
    });
});

const { MongoClient, ObjectId } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI);
const db = client.db("pa2");

const users = db.collection("users");
const projects = db.collection("projects");
const projectMemberships = db.collection("projectMemberships");

// SIGNUP
app.post("/signup", async (req, res) => {
    
    try {
        const { f_name, l_name, username, password } = req.body;

        if (!f_name || !l_name || !username || !password) {
            return res.status(400).json({
                message: "Please fill in all fields."
            });
        }

        const userExists = await users.findOne({ username: username });
        if (userExists !== null) {
            return res.status(409).json({
                message: "Username already exists."
            });
        }

        await users.insertOne({
            f_name: f_name,
            l_name: l_name,
            username: username,
            password: password
        });

        res.status(201).json({
            message: "User created successfully."
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error. Please try again later."
        });
    }
});

// LOGIN
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username && !password) {
            return res.status(400).json({
                message: "Missing username and password."
            });
        } else if (!username) {
            return res.status(400).json({
                message: "Missing username."
            });
        } else if (!password) {
            return res.status(400).json({
                message: "Missing password."
            });
        }

        const user = await users.findOne({ username: username });
        if (user === null) {
            return res.status(401).json({
                message: "Username does not exist."
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                message: "Incorrect password."
            });
        }

        res.status(200).json({
            message: "Login success!"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error. Please try again later."
        });
    }
});

// GET REGISTERED USERS
app.get("/api/users", async (req, res) => {
    try {
        const usersList = await users.find({}, { projection: { password: 0 } }).toArray();
        res.json(usersList);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to get users. Please try again later."
        });
    }
});

// CREATE A PROJECT
app.post("/api/projects", async (req, res) => {    
    try {
        const { name, description, status, project_lead_id } = req.body;

        if (!name || !description || !status || !project_lead_id) {
            return res.status(400).json({
                message: "Please fill in all fields."
            });
        }

        if (status !== "Planning" && status !== "Active" && status !== "Completed") {
            return res.status(400).json({
                message: "Invalid project status."
            });
        }

        if (!ObjectId.isValid(project_lead_id)) {
            return res.status(400).json({
                message: "Invalid project lead ID."
            });
        }

        const projectLeadId = new ObjectId(project_lead_id);
        const projectLead = await users.findOne({ _id: projectLeadId });
        if (!projectLead) {
            return res.status(400).json({
                message: "Selected project lead not found."
            });
        }

        const result = await projects.insertOne({
            name: name,
            description: description,
            status,
            project_lead_id: projectLeadId
        });

        try {
            await projectMemberships.insertOne({
                project_id: result.insertedId,
                user_id: projectLeadId
            })
            res.status(201).json({
                message: "Project created successfully."
            });
        } catch (error) {
            console.error(error);
            await projects.deleteOne({ _id: result.insertedId });
            return res.status(500).json({
                message: "Project can not be created without a project lead."
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to create project."
        });
    }
});

// GET ALL PROJECTS
app.get("/api/projects", async (req, res) => {
    try {
        const projectsList = await projects.find().toArray();
        res.json(projectsList);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to get projects. Please try again later."
        });
    }
});

// VIEW PROJECT MEMBERS
app.get("/api/projects/:projectId/members", async (req, res) => {
    try {
        const { projectId } = req.params;

        if (!ObjectId.isValid(projectId)) {
            return res.status(400).json({
                message: "Invalid project ID."
            });
        }

        const id = new ObjectId(projectId);
        const project = await projects.findOne({ _id: id });
        if (!project) {
            return res.status(400).json({
                message: "Selected project ID not found."
            });
        }

        const projectMembers = await projectMemberships.find({ project_id: id }).toArray();
        res.json(projectMembers);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to view members. Please try again later."
        });
    }
});

// ADD A PROJECT MEMBER
app.post("/api/projects/:projectId/members", async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.body;

        if (!ObjectId.isValid(projectId)) {
            return res.status(400).json({
                message: "Invalid project ID."
            });
        }

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid user ID."
            });
        }

        const id = new ObjectId(projectId);
        const memberId = new ObjectId(userId);

        const project = await projects.findOne({ _id: id });
        if (!project) {
            return res.status(400).json({
                message: "Selected project not found."
            });
        }

        const user = await users.findOne({ _id: memberId });
        if (!user) {
            return res.status(400).json({
                message: "Selected user not found."
            });
        }

        const existingMember = await projectMemberships.findOne({
            project_id: id,
            user_id: memberId
        })

        if (existingMember !== null) {
            return res.status(409).json({
                message: "This user is already a member of this project."
            });
        }

        await projectMemberships.insertOne({
            project_id: id,
            user_id: memberId
        });

        res.status(201).json({
            message: "Member added successfully."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to add the member. Please try again."
        });
    }
});

// REMOVE A PROJECT MEMBER
app.delete("/api/projects/:projectId/members/:userId", async (req, res) => {
    try {
        const { projectId, userId } = req.params;

        if (!ObjectId.isValid(projectId)) {
            return res.status(400).json({
                message: "Invalid project ID."
            });
        }

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid user ID."
            });
        }

        const id = new ObjectId(projectId);
        const memberId = new ObjectId(userId);

        const project = await projects.findOne({ _id: id });
        if (!project) {
            return res.status(400).json({
                message: "Selected project not found."
            });
        }

        if (project.project_lead_id.equals(memberId)) {
            return res.status(400).json({
                message: "Project lead cannot be removed."
            });
        }

        const result = await projectMemberships.deleteOne({
            project_id: id,
            user_id: memberId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "This project has no members."
            })
        }

        res.json({
            message: "Member removed."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to remove the member. Please try again."
        });
    }
});

app.listen(9000, () => {
    console.log("Server running on port 9000");
});

async function connectDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Could not connect to MongoDB");
        console.error(error);
    }
}

connectDatabase();