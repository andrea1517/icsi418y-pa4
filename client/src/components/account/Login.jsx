import { useState } from "react";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError(false);
        setMessage("");

        try {
            const response = await fetch("http://localhost:9000/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
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
            <div className="login-heading">
                <h2>Log In</h2>
            </div>

            <form onSubmit={handleSubmit}>
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
                <button type="submit">Login</button>
            </form>
            {message && <p  className={error ? "error" : "success"}>{message}</p>}
        </div>
    );
}

export default Login;