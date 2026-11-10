import { useState, useRef, useEffect } from "react";

function ProjectBacklog() {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [members, setMembers] = useState([]);
    const [stories, setStories] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const currentProject = useRef(selectedProject);

    const [title, setTitle] = useState("");
    const [description, setDesc] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [status, setStatus] = useState("To Do");
    const [assignedUserId, setAssignedUserId] = useState("");
    const [editingStoryId, setEditingStoryId] = useState(null);
    const [response, setResponse] = useState(null);

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
                    setResponse({
                        message: "Failed to load projects or user data.",
                        error: true
                    })
                }
            } catch (error) {
                console.error(error);
                setResponse({
                    message: "Could not get projects or users.",
                    error: true
                });
            }
        }
        getProjectsData();
    }, []);

    useEffect(() => {
        if (selectedProject === "") {
            setStories([]);
            setMembers([]);
            return;
        }

        async function getStoriesData() {
            const selectedProjectId = selectedProject;

            try {
                const [storiesResponse, membersResponse] = await Promise.all([
                    fetch(`http://localhost:9000/api/projects/${selectedProjectId}/stories`),
                    fetch(`http://localhost:9000/api/projects/${selectedProjectId}/members`)
                ]);

                const storiesData = await storiesResponse.json();
                const membersData = await membersResponse.json();

                if (currentProject.current !== selectedProjectId) {
                    return;
                }

                if (storiesResponse.ok && membersResponse.ok) {
                    setStories(storiesData);
                    setMembers(membersData);
                } else {
                    setResponse({
                        message: "Failed to load stories or members.",
                        error: true
                    });
                }
            } catch (error) {
                if (currentProject.current === selectedProjectId) {
                    console.error(error);
                    setResponse({
                        message: "Could not get user stories or members.",
                        error: true
                    });
                }
            }
        }
        getStoriesData();
    }, [selectedProject]);

    function resetForm() {
        setTitle("");
        setDesc("");
        setPriority("Medium");
        setStatus("To Do");
        setAssignedUserId("");
        setEditingStoryId(null);
    }

    function createStory() {
        resetForm();
        setResponse(null);
    }

    function editStory(story) {
        setEditingStoryId(story._id);
        setTitle(story.title);
        setDesc(story.description);
        setPriority(story.priority);
        setStatus(story.status);
        setAssignedUserId(story.assigned_user_id || "");
        setResponse(null);
    }

    async function saveStory(event) {
        event.preventDefault();

        if(!title.trim() || !/^As an? .+?, I want .+?, so that .+$/i.test(description.trim())) {
            setResponse({
                message: "Title and description are required. Description must follow the format: As a..., I want..., so that....",
                error: true
            });
            return;
        }

        const selectedProjectId = selectedProject;
        const storyData = {
            title: title,
            description: description,
            priority: priority,
            assigned_user_id: assignedUserId === "" ? null : assignedUserId
        };

        try {
            if (editingStoryId === null) {
                const response = await fetch(`http://localhost:9000/api/projects/${selectedProjectId}/stories`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(storyData)
                    }
                );
                const data = await response.json();
                
                if (!response.ok) {
                    if (currentProject.current === selectedProjectId) {
                        setResponse({
                            message: "Failed to create story.",
                            error: true
                        });
                    }
                    return;
                }
            } else {
                storyData.status = status;

                const response = await fetch(`http://localhost:9000/api/projects/${selectedProjectId}/stories/${editingStoryId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(storyData)
                    }
                );
                const data = await response.json();
                
                if (!response.ok) {
                    if (currentProject.current === selectedProjectId) {
                        setResponse({
                            message: "Failed to update story.",
                            error: true
                        });
                    }
                    return;
                }
            }

            const updateResponse = await fetch(`http://localhost:9000/api/projects/${selectedProjectId}/stories`);
            if (!updateResponse.ok) {
                setResponse({
                    message: "Failed to refresh.",
                    error: true
                });
                return;
            }

            const updatedStory = await updateResponse.json();
            if (currentProject.current !== selectedProjectId) {
                return;
            }

            setStories(updatedStory);
            resetForm();
            setResponse({
                message: "Story saved successfully.",
                error: false
            });
        } catch (error) {
            if (currentProject.current === selectedProjectId) {
                console.error(error);
                setResponse({
                    message: "Failed to save story.",
                    error: true
                });
            }
        }
    }

    async function deleteStory(storyId) {
        if (!window.confirm("Are you sure you want to delete this story? This action cannot be undone")) {
            return;
        }
        setResponse(null);

        const selectedProjectId = selectedProject;
        try {
            const response = await fetch(`http://localhost:9000/api/projects/${selectedProjectId}/stories/${storyId}`,
                {
                    method: "DELETE"
                }
            );
            const data = await response.json();

            if (!response.ok) {
                if (currentProject.current === selectedProjectId) {
                    setResponse({
                        message: "Failed to delete story.",
                        error: true
                    });
                }
                return;
            }

            const updateResponse = await fetch(`http://localhost:9000/api/projects/${selectedProjectId}/stories`);
            if (!updateResponse.ok) {
                setResponse({
                    message: "Failed to refresh.",
                    error: true
                });
                return;
            }

            const updatedStory = await updateResponse.json();
            if (currentProject.current !== selectedProjectId) {
                return;
            }

            setStories(updatedStory);
            resetForm();
            setResponse({
                message: "Story deleted successfully.",
                error: false
            });
        } catch (error) {
            if (currentProject.current === selectedProjectId) {
                console.error(error);
                setResponse({
                    message: "Failed to delete story.",
                    error: true
                });
            }
        }
    }

    return (
        <div className="project-backlog">
            <h2>Project Backlog</h2>

            <label htmlFor="project">Project </label>
            <select 
                value={selectedProject}
                onChange={(event) => {
                    currentProject.current = event.target.value;
                    setSelectedProject(event.target.value);
                    setStories([]);
                    setMembers([]);
                    resetForm();
                    setResponse(null);
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
                    <h3>User Stories</h3>

                    {stories.length === 0 ? (
                        <p>This project has no user stories.</p>
                    ) : (
                        stories.map((story) => {
                            const user = users.find((user) => user._id === story.assigned_user_id);
                            return (
                                <div key={story._id}>
                                    <h4>{story.title}</h4>
                                    <p>{story.description}</p>
                                    <p>Priority: {story.priority}</p>
                                    <p>Status: {story.status}</p>
                                    <p>Assigned to: {" "}
                                        {user ? `${user.f_name} ${user.l_name}` : "Unassigned"}
                                    </p>

                                    <button type="button" onClick={() => editStory(story)}>Edit</button>
                                    <button type="button" onClick={() => deleteStory(story._id)}>Delete</button>
                                </div>
                            );
                        })
                    )}

                    <h3>
                        {editingStoryId === null ? "Create User Story" : "Edit User Story"}
                    </h3>

                    <form onSubmit={saveStory}>
                        <label htmlFor="title">Title: </label>
                        <input 
                            type="text"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                        />
                        <br />

                        <label htmlFor="description">Description: </label>
                        <textarea 
                            value={description}
                            onChange={(event) => setDesc(event.target.value)}
                            placeholder="As a(n)..., I want..., so that...."
                        />
                        <br />

                        <label htmlFor="priority">Priority: </label>
                        <select 
                            value={priority}
                            onChange={(event) => setPriority(event.target.value)}
                        >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                        <br />

                        <label htmlFor="status">Status: </label>
                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                        >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                        </select>

                    <label htmlFor="assignedUser">Assigned Member: </label>
                    <select
                        value={assignedUserId}
                        onChange={(event) => setAssignedUserId(event.target.value)}
                    >
                        <option value="">Unassigned</option>
                        {members.map((member) => {
                            const user = users.find((user) => user._id === member.user_id);
                            return (
                                <option key={member._id} value={member.user_id}>
                                    {user ? `${user.f_name} ${user.l_name}` : "Unknown User"}
                                </option>
                            )
                        })}
                    </select>
                    <br />

                    <button type="submit">
                        {editingStoryId === null ? "Create Story" : "Save Changes"}
                    </button>

                    {editingStoryId !== null && (
                        <button type="button" onClick={createStory}>Cancel </button>
                    )}
                    </form>
                </div>
            )}
            {response && <p  className={response.error ? "error" : "success"}>{response.message}</p>}
        </div>
    );
}

export default ProjectBacklog;