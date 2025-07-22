import react, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();


    const actualUser = 'admin';
    const actualPassword = 'admin123';
    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (actualPassword == password && actualUser == username) {
            navigate('/home');
        }
        else {
            alert('Entered credentials are wrong')
        }
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1> NirnAI</h1>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <input
                    style={{marginTop: '10px'}}
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                    <input
                    style={{marginTop: '10px'}}
                    id="password"
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                </div>
                <button type="submit" style={{marginTop: '10px'}}> Login</button>
            </form>
            
        </div>
    )
}
export default Login;