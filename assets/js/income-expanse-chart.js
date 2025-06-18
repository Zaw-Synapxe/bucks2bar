// Initialize chart when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Get the chart canvas element
    const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
    
    // Array of months for the x-axis
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Initialize with empty data
    const incomeData = Array(12).fill(0);
    const expenseData = Array(12).fill(0);
    
    // Create the Chart.js bar chart
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Month'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Income vs Expenses',
                    font: {
                        size: 18
                    }
                },
                legend: {
                    position: 'top'
                }
            }
        }
    });
    
    // Function to collect data from all input fields and update the chart
    function updateChart() {
        // Get all income and expense values
        for (let i = 0; i < months.length; i++) {
            const monthLower = months[i].toLowerCase();
            const incomeInput = document.getElementById(`${monthLower}-income`);
            const expenseInput = document.getElementById(`${monthLower}-expenses`);
            
            // Update data arrays with values from inputs, defaulting to 0 if empty
            incomeData[i] = incomeInput && incomeInput.value ? parseFloat(incomeInput.value) : 0;
            expenseData[i] = expenseInput && expenseInput.value ? parseFloat(expenseInput.value) : 0;
        }
        
        // Update chart datasets
        myChart.data.datasets[0].data = incomeData;
        myChart.data.datasets[1].data = expenseData;
        
        // Re-render the chart
        myChart.update();
    }
    
    // Add event listener to the update button
    document.getElementById('updateChartBtn').addEventListener('click', updateChart);
      // Also update chart when switching to chart tab
    document.getElementById('chart-tab').addEventListener('click', function() {
        setTimeout(updateChart, 300); // Small delay to ensure the tab is visible
    });
    
    // Function to download chart as image
    function downloadChart() {
        // Get the canvas element
        const canvas = document.getElementById('incomeExpenseChart');
        
        // Create a temporary link element
        const downloadLink = document.createElement('a');
        
        // Set the download attributes
        downloadLink.download = 'income-expense-chart.png';
        
        // Convert the canvas to a data URL
        const dataURL = canvas.toDataURL('image/png');
        downloadLink.href = dataURL;
        
        // Append to the DOM temporarily (required for Firefox)
        document.body.appendChild(downloadLink);
        
        // Trigger the download
        downloadLink.click();
        
        // Clean up - remove the link
        document.body.removeChild(downloadLink);
    }
    
    // Add event listener to the download button
    const downloadBtn = document.getElementById('downloadChartBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadChart);
    }
});
