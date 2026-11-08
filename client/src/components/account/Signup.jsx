import { useState } from "react";

function Signup() {
    const [firstname, setFirstName] = useState("");
    const [lastname, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError(false);
        setMessage("");

        try {
            const response = await fetch("http://localhost:9000/signup",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    f_name: firstname,
                    l_name: lastname,
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                setFirstName("");
                setLastName("");
                setUsername("");
                setPassword("");
                setMessage(data.message);
            } else {
                setError(true);
                setMessage(data.message);
            }
        } catch (error) {
            console.error(error);
            setError(true);
            setMessage("Could not connect to the server.");
        }
    }

    return (
        <div>
            <div className="signup-heading">
                <h2>Create Account</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div>
                    <input 
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={firstname}
                        onChange={(event) => setFirstName(event.target.value)}
                    />
                </div>

                <div>
                    <input 
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={lastname}
                        onChange={(event) => setLastName(event.target.value)}
                    />
                </div>

                <div>
                    <input 
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                    />
                </div>

                <div>
                    <input 
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </div>
                <button type="submit">Create Account</button>
            </form>
            {message && <p  className={error ? "error" : "success"}>{message}</p>}
        </div>
    );
}

export default Signup;