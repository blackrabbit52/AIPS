import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await authService.register(username, email, password);
      navigate('/login');
    } catch (error) {
      setError(typeof error === 'string' ? error : 'Une erreur s\'est produite');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* ... champs du formulaire ... */}
        <button type="submit" className="btn btn-primary">
          S'inscrire
        </button>
      </form>
    </div>
  );
};

export default Register; 