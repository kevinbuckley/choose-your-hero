function getActiveThemes(themes) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    return themes.filter(function(theme) {
        if (theme.activeDate === null || theme.activeDate === undefined) {
            return true;
        }
        return new Date(theme.activeDate).getTime() >= today.getTime();
    });
}

window.onload = () => {
    const galleryContainer = document.getElementById('imageGallery');
    fetch('assets/vault.json')
        .then(response => response.json())
        .then(game_files => {
            game_files = getActiveThemes(game_files);
            game_files.forEach(game_file => {
                const header = document.createElement('h2');
                const prompt = game_file["prompt"];
                header.innerText = game_file["prompt"];
                galleryContainer.appendChild(header);
                game_file["cards"].forEach(card => {
                    const divContainer = document.createElement('div');
                    divContainer.classList.add('image-container');
                    
                    const imgElement = document.createElement('img');
                    imgElement.src = "assets/" + prompt + "/" + card.name + ".png";
                    imgElement.classList.add('gallery-image'); // Optional: for styling
                    divContainer.appendChild(imgElement);

                    const divCaption = document.createElement('div');
                    divCaption.classList.add('image-caption');
                    divCaption.innerText = card.name;
                    divContainer.appendChild(divCaption);

                    galleryContainer.appendChild(divContainer);
                });
            });
        })
        .catch(error => console.error('Error loading images:', error));
};