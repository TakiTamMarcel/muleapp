// Select the elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snapButton = document.getElementById('snap');
const context = canvas.getContext('2d');

// Input fields
const nameInput = document.getElementById('name');
const lastnameInput = document.getElementById('lastname');
const invoiceNumberInput = document.getElementById('invoice-number');
const invoiceDateInput = document.getElementById('invoice-date');
const totalAmountInput = document.getElementById('total-amount');

// MuleSoft API Details
const authURL = 'https://anypoint.mulesoft.com/accounts/api/v2/oauth2/token';
const apiURL = 'https://idp-rt.us-east-1.anypoint.mulesoft.com/api/v1/organizations/fd562c7b-38e9-4ad4-9ffd-16bb26b93e47/actions/5c64638b-967d-4798-b2be-db631cb2ce26/versions/1.0.0/executions';
const clientID = '8cd80c66628642c2ac40c32aad0dfd26';
const clientSecret = '097C00c9a49748F090e57076b1B0Cea4';

// Get access to the camera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        video.play();
    })
    .catch(err => {
        console.error("Error accessing the camera: ", err);
    });

// Function to get Bearer Token
async function getBearerToken() {
    const credentials = btoa(`${clientID}:${clientSecret}`);
    const response = await fetch(authURL, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    return data.access_token;
}

// Function to send data to MuleSoft API
async function sendToMuleSoftAPI(imageDataURL) {
    const token = await getBearerToken();

    const name = nameInput.value;
    const lastname = lastnameInput.value;
    const invoiceNumber = invoiceNumberInput.value;
    const invoiceDate = invoiceDateInput.value;
    const totalAmount = totalAmountInput.value;

    // Convert the image data URL to a Blob
    const response = await fetch(imageDataURL);
    const blob = await response.blob();

    // Create form data
    const formData = new FormData();
    formData.append('name', name);
    formData.append('lastname', lastname);
    formData.append('invoiceNumber', invoiceNumber);
    formData.append('invoiceDate', invoiceDate);
    formData.append('totalAmount', totalAmount);
    formData.append('file', blob, 'image.png');

    // Send the data using fetch
    fetch(apiURL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the MuleSoft API
        console.log('Success:', data);
        alert('Image and data sent successfully. Response: ' + JSON.stringify(data));
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error sending image and data: ' + error.message);
    });
}

// Take a picture when the button is clicked
snapButton.addEventListener('click', () => {
    // Capture the image from the video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas to a data URL
    const imageURL = canvas.toDataURL('image/png');
    
    // Send the captured image and form data to MuleSoft API
    sendToMuleSoftAPI(imageURL);
});