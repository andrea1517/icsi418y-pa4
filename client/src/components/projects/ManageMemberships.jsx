import { useState, useEffect } from "react";

function ManageMemberships() {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [members, setMembers] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);

    useEffect(() => {
        async function getData() {
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
                setMessage("Could not get projects or users.")
            }
        }
        getData();
    }, []);

    // Updates the displayed membership list
    async function updateMembers(selectedProjectId) {
        if (!selectedProjectId) {
            setMembers([]);
            return;
        }

        try {
            const response = await fetch(`http://localhost:9000/api/projects/${selectedProjectId}/members`);
            const data = await response.json();

            if (response.ok) {
                setMembers(data);
            } else {
                setError(true);
                setMessage("Failed to load members.");
            }
        } catch (error) {
            console.error(error);
            setMessage("Could not get memebers.");
        }
    }

    // Changes the membership list when the selected project changes
    useEffect(() => {
        updateMembers(selectedProject);
    }, [selectedProject]);

    async function addMember(event) {
        event.preventDefault();
        setMessage("");
        setError(false);

        try {
            const response = await fetch(`http://localhost:9000/api/projects/${selectedProject}/members`, 
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        userId: selectedUser
                    })
                }
            );  
            const data = await response.json();

            if (response.ok) {
                setSelectedUser("");
                await updateMembers(selectedProject);
                setMessage("Member added successfully.");
            } else {
                setError(true);
                setMessage(data.message || "Failed to add member.")
            }
        } catch (error) {
            console.error(error);
            setMessage("Could not add member.");
        }
    }

    async function removeMember(userId) {
        setMessage("");
        setError(false);

        try {
            const response = await fetch(`http://localhost:9000/api/projects/${selectedProject}/members/${userId}`, 
                {
                    method: "DELETE"
                }
            );
            const data = await response.json();

            if (response.ok) {
                await updateMembers(selectedProject);
                setMessage("Member removed successfully.");
            } else {
                setError(true);
                setMessage(data.message || "Failed to remove member.")
            }
        } catch (error) {
            console.error(error);
            setMessage("Could not remove member.");
        }
    }

    const project = projects.find((project) => project._id === selectedProject);
    return (
        <div className="memberships-manager">
            <h2>Project Members</h2>

            <label htmlFor="projects">Project </label>
            <select
                value={selectedProject}
                onChange={(event) => {
                    setSelectedProject(event.target.value);
                    setSelectedUser("");
                    setMembers([]);
                    setMessage("");
                }}
            >
                <option value="">--Select a project--</option>
                {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                        {project.name}
                    </option>
                ))}
            </select>

        {selectedProject && (
            <div>
                <h3>Project Members</h3>

                {members.length === 0 ? (
                    <p>No members working on this project</p>
                ) : (
                    members.map((member) => {
                        const user = users.find((user) => user._id === member.user_id);
                        return (
                            <div key={member._id}>
                                <p>{user.f_name} {user.l_name}</p>

                                {project && project.project_lead_id === member.user_id ? (
                                    <p>Project Lead</p>
                                ) : (
                                    <button type="button" onClick={() => removeMember(member.user_id)}>Remove</button>
                                )}
                            </div>
                        );
                    })
                )}

                <h3>Add a Member</h3>
                <form onSubmit={addMember}>
                    <select
                        name="user"
                        value={selectedUser}
                        onChange={(event) => setSelectedUser(event.target.value)}
                    >
                        <option value="">--Select a user--</option>
                        {users.map((user) => (
                            <option key={user._id} value={user._id}>
                                {user.f_name} {user.l_name}
                            </option>
                        ))}
                    </select>
                    <button type="submit">Add Member</button>
                </form>
                {message && <p  className={error ? "error" : "success"}>{message}</p>}
            </div>
        )}
        </div>
    );
}

export default ManageMemberships;