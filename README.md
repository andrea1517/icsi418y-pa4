# ICSI418Y - Programming Assignment 4: User Stories and Project Backlog

**Author:** Andrea Ye

This is an extension of PA3. New features include being able to create, edit, save, and delete user stories. Stories display title, description, priority, progress status, and the assigned member responsible for the user story. Additionally, users are able to view their project backlog where they can access and modify user stories.

## How to Run the Application
1. Clone this repository.
```bash
git clone https://github.com/andrea1517/icsi418y-pa4.git
cd icsi418y-pa4
```

2. Open one terminal and enter
```bash
cd client
npm run dev
```
Open another terminal and enter
```bash
cd server
node server.js
```

3. The application should be running on `http://localhost:5173/`. To check if the server is running, go to `http://localhost:9000/` and see if it says "Server running on port 9000." If it is, then you are connected!

**Note:**
- Be sure to install project dependencies using `npm install`
- Have a MongoDB Atlas account for the database collections
- Create your own `.env` file and add in your MongoDB connection string in the format of `MONGO_URI=YOUR_MONGODB_CONNECTION_STRING`

## Incomplete Features
PA4 has the same incomplete features as PA3.