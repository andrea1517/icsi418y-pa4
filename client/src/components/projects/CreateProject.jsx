import { useState, useEffect } from "react";

function CreateProject() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("");
    const [projectLeadID, setProjectLeadID] = useState("");
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);

    useEffect(() => {
        async function getUsers() {
            try {
                const response = await fetch("http://localhost:9000/api/users");
                const data = await response.json();

                if (response.ok) {
                    setUsers(data);
                } else {
                    setError(true);
                    setMessage("Error in fetching users.");
                }
            } catch (error) {
                console.error(error);
                setError(true);
                setMessage("Could not fetch registered users.");
            }
        }
        getUsers();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        setError(false);
        setMessage("");

        try {
            const response = await fetch("http://localhost:9000/api/projects",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    description: description,
                    status: status,
                    project_lead_id: projectLeadID
                })
            });

            const data = await response.json();

            if (response.ok) {
                setName("");
                setDescription("");
                setStatus("");
                setProjectLeadID("");
                setMessage("Project successfully created.");
            } else {
                setError(true);
                setMessage("Failed to create project.");
            }
        } catch (error) {
            console.error(error);
            setError(true);
            setMessage("Could not create the project.");
        }
    }
    return (
        <div>
            <div className="project-creation-heading">
                <h2>Create Project</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div>
                    <input 
                        type="text"
                        name="projectName"
                        placeholder="Project Name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                </div>

                <div>
                    <textarea 
                        name="projectDesc"
                        placeholder="Project Description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                    />
                </div>

                <div>
                    <select 
                        name="projectStatus"
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                    >
                        <option value="">--Select Project Status--</option>
                        <option value="Planning">Planning</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                <div>
                    <select 
                        name="projectLead"
                        value={projectLeadID}
                        onChange={(event) => setProjectLeadID(event.target.value)}
                    >
                        <option value="">--Select a Project Lead--</option>
                        {users.map((user) => (
                            <option key={user._id} value={user._id}>
                                {user.username}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit">Create Project</button>
            </form>
            {message && <p  className={error ? "error" : "success"}>{message}</p>}
        </div>
    );
}

export default CreateProject;