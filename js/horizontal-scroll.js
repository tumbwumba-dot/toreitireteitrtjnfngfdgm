document.addEventListener('DOMContentLoaded', function() {
    const bracketContainer = document.querySelector('.bracket-container');
    
    if(bracketContainer) {
        bracketContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            bracketContainer.scrollLeft += e.deltaY;
        });
    }
});
