// ... dans la fonction onSubmit ...
try {
  await authService.register(values);
  showNotification({
    message: "Registration successful! Please log in.",
    type: "success"
  });
  navigate('/login', { 
    state: { 
      message: "Account created successfully. You can now log in." 
    } 
  });
} catch (err) {
  const errorMessage = typeof err === 'string' ? err : 'Registration failed. Please try again.';
  setError(errorMessage);
  showNotification({
    message: errorMessage,
    type: "error"
  });
} 