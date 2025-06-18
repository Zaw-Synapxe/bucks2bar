// input with id "username" on change
document.getElementById('username').addEventListener('change', function() {
    // Get the value of the input field
    const username = document.getElementById('username').value;
    // Log the value to the console
    console.log('Username changed to:', username);
    
    // Regular expression to validate username
    // At least 1 capital letter, 1 number, and at least 8 characters long
    const usernameRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    
    // Test the username against the regex
    const isValid = usernameRegex.test(username);
    
    if (isValid) {
        console.log('Username is valid!');
        // Remove any error styling if present
        this.classList.remove('is-invalid');
        this.classList.add('is-valid');
        
        // You can add a success message to the UI here
        const feedbackElement = document.getElementById('username-feedback');
        if (feedbackElement) {
            feedbackElement.textContent = 'Username meets all requirements';
            feedbackElement.className = 'valid-feedback d-block';
        }
    } else {
        console.log('Username is invalid! It must contain at least 1 capital letter, 1 number, and be at least 8 characters long.');
        // Add error styling
        this.classList.remove('is-valid');
        this.classList.add('is-invalid');
        
        // You can add an error message to the UI here
        const feedbackElement = document.getElementById('username-feedback');
        if (feedbackElement) {
            feedbackElement.textContent = 'Username must contain at least 1 capital letter, 1 number, and be at least 8 characters long.';
            feedbackElement.className = 'invalid-feedback d-block';
        }
    }
});