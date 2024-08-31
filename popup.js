// popup.js
document.addEventListener('DOMContentLoaded', async() => {
    const { apiKey } = await chrome.storage.local.get('apiKey');
    if (apiKey) {
        document.getElementById('api-key').value = apiKey; // Set the input value
        document.getElementById('api-key-section').style.display = 'none'; // Hide the API key section
        document.getElementById('concept-section').style.display = 'block'; // Show the concept section
    }
});

document.getElementById('save-key').addEventListener('click', async() => {
    const apiKey = document.getElementById('api-key').value;
    await chrome.storage.local.set({ apiKey });
    document.getElementById('api-key-section').style.display = 'none';
    document.getElementById('concept-section').style.display = 'block';
});

document.getElementById('update-key').addEventListener('click', async() => {
    const apiKey = document.getElementById('api-key').value;
    await chrome.storage.local.set({ apiKey });
    alert('API key updated successfully.');
});

document.getElementById('remove-key').addEventListener('click', async() => {
    await chrome.storage.local.remove('apiKey');
    document.getElementById('api-key').value = '';
    document.getElementById('api-key-section').style.display = 'block';
    document.getElementById('concept-section').style.display = 'none';
    alert('API key removed successfully.');
});

document.getElementById('concept-input').addEventListener('input', () => {
    const input = document.getElementById('concept-input').value;
    document.getElementById('get-answer').disabled = !input;
});

document.getElementById('concept-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        // Trigger the click event of the "Get Answer" button
        document.getElementById('get-answer').click();
    }
});

document.getElementById('get-answer').addEventListener('click', async() => {
    // Disable the button to prevent multiple clicks
    document.getElementById('get-answer').disabled = true;


    // Retrieve the API key from chrome storage
    const apiKey = (await chrome.storage.local.get('apiKey')).apiKey;
    // Get the concept input from the text field
    const concept = document.getElementById('concept-input').value;
    // Reference the output element to display the answer
    const output = document.getElementById('answer-output');
    // Clear any previous output before processing the new request
    output.innerHTML = '';

    try {

        const customInstruction = "Please provide a answer with meow in head of each sentence.";
        // Send a POST request to the OpenAI API with the concept and API key
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: customInstruction },
                    { role: "user", content: concept }
                ],
                stream: true // Enable streaming to receive the response in chunks
            })
        });

        // Check if the response was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Initialize a reader to read the response body in chunks
        const reader = response.body.getReader();
        // Create a decoder to decode the UTF-8 encoded chunks
        const decoder = new TextDecoder("utf-8");

        // Read and process the response in chunks
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }

            // Decode the chunk
            const chunk = decoder.decode(value);
            // Split the chunk into lines and filter out empty lines
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            // Process each line
            for (const line of lines) {
                // Check if the line is a data line
                if (line.startsWith('data:')) {
                    // Extract the JSON data from the line
                    const jsonData = line.replace(/^data: /, '');
                    // Check if the data indicates the end of the response
                    if (jsonData === '[DONE]') {
                        break;
                    }
                    try {
                        // Parse the JSON data
                        const data = JSON.parse(jsonData);
                        // Extract the content from the parsed data
                        const content = data.choices[0].delta.content;
                        // Append the content to the output element
                        if (content) {
                            output.innerHTML += content;
                        }
                    } catch (error) {
                        // Log any errors parsing the JSON data
                        console.error('Error parsing JSON:', error);
                    }
                }
            }
        }
    } catch (error) {
        // Log any errors that occur during the process
        console.error('Error:', error);
        // Display an error message in the output element
        output.innerHTML = `An error occurred: ${error.message}`;
    } finally {
        // Re-enable the button after processing is complete
        document.getElementById('get-answer').disabled = false;
        // Clear the input field
        document.getElementById('concept-input').value = '';
    }
});

document.getElementById('save-key').addEventListener('click', async() => {
    const apiKey = document.getElementById('api-key').value;
    await chrome.storage.local.set({ apiKey });
    document.getElementById('api-key-section').style.display = 'none';
    document.getElementById('concept-section').style.display = 'block';
});