window.onload = () => {
    const galleryContainer = document.getElementById('imageGallery');
    fetch('vault/vault.json')
        .then(response => response.json())
        .then(game_files => {
            game_files.forEach(game_file => {
                const header = document.createElement('h2');
                const prompt = game_file["prompt"];
                header.innerText = game_file["prompt"];
                galleryContainer.appendChild(header);
                game_file["game_file"].forEach(card => {
                    const imgElement = document.createElement('img');
                    imgElement.src = "vault/" + prompt + "/" + card.name + ".png";
                    imgElement.classList.add('gallery-image'); // Optional: for styling
                    galleryContainer.appendChild(imgElement);
                });
            });
        })
        .catch(error => console.error('Error loading images:', error));
};
