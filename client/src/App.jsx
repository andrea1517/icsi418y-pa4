import { useState } from "react";
import Login from "./components/account/Login";
import Signup from "./components/account/Signup";
import CreateProject from "./components/projects/CreateProject";
import ViewProjectList from "./components/projects/ViewProjectList";
import ManageMemberships from "./components/projects/ManageMemberships";

function App() {
  const [page, setPage] = useState("login");

  return (
    <div className="app">
      <div className="app-header">
        <h1> Welcome! </h1>
      </div>

      <div className="form">
        {page === "login" && <Login />}
        {page === "signup" && <Signup />}
        {page === "createProject" && <CreateProject />}
        {page === "viewProjectList" && <ViewProjectList />}
        {page === "manageMemberships" && <ManageMemberships />}

        <br/>

        {page === "login" && (
          <p className="switch-forms">
            Don't have an account?{" "}
            <button type="button" onClick={() => setPage("signup")}>Sign up</button>
          </p>
        )}
        
        {page === "signup" && (
          <p className="switch-forms">
            Already have an account?{" "}
            <button type="button" onClick={() => setPage("login")}>Log in</button>
          </p>
        )}
      </div>

      <div className="projects">
        <button type="button" onClick={() => setPage("createProject")}>Create Project</button>
        <button type="button" onClick={() => setPage("viewProjectList")}>View Projects</button>
        <button type="button" onClick={() => setPage("manageMemberships")}>Manage Members</button>
      </div>

      <div className="return">
        <button type="button" onClick={() => setPage("login")}>Go Back</button>
      </div>
    </div>
  );
}

export default App;