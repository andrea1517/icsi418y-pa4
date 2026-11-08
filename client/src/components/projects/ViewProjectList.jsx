import { useState, useEffect } from "react";

function ViewProjectList() {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function getProjectsData() {
            try {
                const [projectsResponse, usersResponse] = await Promise.all([
                    fetch("http://localhost:9000/api/projects"),
                    fetch("http://localhost:9000/api/users")

                ]);

                const projectsData = await projectsResponse.json();
                const usersData = await usersResponse.json();

                if (projectsResponse.ok && usersResponse.ok) {
                    setProjects(projectsData);
                    setUsers(usersData);
                } else {
                    setMessage("Failed to load projects or user data.");
                }
            } catch (error) {
                console.error(error);
                setMessage("Could not get projects.")
            }
        }
        getProjectsData();
    }, []);

    function getProjectLeadName(projectLeadID) {
        const projectLead = users.find((user) => user._id === projectLeadID);

        if (!projectLead) {
            return "Missing project lead.";
        } else {
            return projectLead.f_name + " " + projectLead.l_name + " " + "(" + projectLead.username + ")";
        }
    }

    return (
        <div className="project-list-section">
            <h2>Projects</h2>

        {message && <p>{message}</p>}

        {projects.length === 0 ? (
            <p>Projects have yet to be created</p>
        ) : (projects.map((project) => (
                <div key={project._id}>
                    <h3>{project.name}</h3>
                    <p>Description: {project.description}</p>
                    <p>Project Status: {project.status}</p>
                    <p>Project Lead: {getProjectLeadName(project.project_lead_id)}</p>
                </div>
            ))
        )}
        </div>
    );
}

export default ViewProjectList;