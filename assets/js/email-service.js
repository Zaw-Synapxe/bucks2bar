// filepath: c:\DIM\Zaw\222-GitHubCopilot\Projects\bucks2bar\assets\js\email-service.js
// Email chart functionality

document.addEventListener('DOMContentLoaded', function() {
    // Get references to elements
    const emailChartBtn = document.getElementById('emailChartBtn');
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    const emailStatusDiv = document.getElementById('emailStatus');
    
    // Add click event for opening the email modal
    if (emailChartBtn) {
        emailChartBtn.addEventListener('click', function() {
            // Initialize a new bootstrap modal
            const emailModal = new bootstrap.Modal(document.getElementById('emailChartModal'));
            emailModal.show();
        });
    }
    
    // Add click event for sending the email
    if (sendEmailBtn) {
        sendEmailBtn.addEventListener('click', sendChartByEmail);
    }
    
    // Function to send chart by email
    function sendChartByEmail() {
        // Get form values
        const recipientEmail = document.getElementById('recipientEmail').value;
        // const emailSubject = document.getElementById('emailSubject').value;
        // const emailMessage = document.getElementById('emailMessage').value;
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipientEmail)) {
            showEmailStatus('Please enter a valid email address', 'danger');
            return;
        }
        
        // Get the chart canvas and convert to data URL with quality optimization
        const canvas = document.getElementById('incomeExpenseChart');
        
        // Using lower quality (0.8) to reduce file size
        const chartDataUrl = canvas.toDataURL('image/png'); //canvas.toDataURL('image/jpeg', 0.8);
        
        // // Create FormData object for the email data
        // const formData = new FormData();
        // formData.append('recipient', recipientEmail);
        // formData.append('subject', emailSubject || 'My Financial Chart from Bucks2Bar');
        // formData.append('message', emailMessage);
        // formData.append('chartImage', chartDataUrl);
        
        // Show loading message
        showEmailStatus('Sending email...', 'info');
        console.log('Sending email...');

        // Send data to the server endpoint
        //sendToServer(formData);
        sendToServer(recipientEmail, chartDataUrl);
    }
    
    // Function to handle server communication
    //function sendToServer(formData) {
    function sendToServer(email, image ) {
        // Show a progress indicator
        showEmailStatus('Sending email, please wait...', 'info');
        console.log('Sending email to server...');

        if (email) {
        fetch("http://localhost:3000/api/send-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, image  }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    showEmailStatus('Email sent successfully!', 'success');
                    
                    // Close modal after delay
                    setTimeout(() => {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('emailChartModal'));
                        if (modal) {
                            modal.hide();
                        }
                    }, 2000);
                } else {
                    showEmailStatus(data.error || 'Failed to send email', 'danger');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showEmailStatus('An error occurred while sending the email', 'danger');
            });
        }

        console.log('call send-chart-email api from server ...');

    }
    
    // Helper function to show status messages
    function showEmailStatus(message, type) {
        emailStatusDiv.textContent = message;
        emailStatusDiv.className = `alert alert-${type}`;
        emailStatusDiv.classList.remove('d-none');
    }
});
