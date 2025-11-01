document.addEventListener('DOMContentLoaded', function() {
    let hoverTimeout;
    const allTooltips = [];
    
    document.querySelectorAll('.bracket-title').forEach((title, index) => {
        const tooltip = title.querySelector('.bracket-day-tooltip');
        if(!tooltip) return;
        
        document.body.appendChild(tooltip);
        allTooltips.push(tooltip);
        
        title.addEventListener('mouseenter', () => {
            hoverTimeout = setTimeout(() => {
                const rect = title.getBoundingClientRect();
                tooltip.style.display = 'block';
                if(index === 4) {
                    tooltip.style.left = rect.left - tooltip.offsetWidth - 20 + 'px';
                } else {
                    tooltip.style.left = rect.right + 20 + 'px';
                }
                tooltip.style.top = rect.top + rect.height / 2 - tooltip.offsetHeight / 2 + 'px';
                tooltip.style.opacity = '1';
            }, 500);
        });
        
        title.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
            tooltip.style.opacity = '0';
            setTimeout(() => tooltip.style.display = 'none', 200);
        });
    });
    
    document.querySelectorAll('.bracket-match').forEach((match, index) => {
        const tooltip = match.querySelector('.bracket-match-tooltip');
        if(!tooltip) return;
        
        document.body.appendChild(tooltip);
        allTooltips.push(tooltip);
        
        match.addEventListener('mouseenter', () => {
            hoverTimeout = setTimeout(() => {
                const rect = match.getBoundingClientRect();
                tooltip.style.display = 'block';
                if(index === 4) {
                    tooltip.style.left = rect.left - tooltip.offsetWidth - 20 + 'px';
                } else {
                    tooltip.style.left = rect.right + 20 + 'px';
                }
                tooltip.style.top = rect.top + rect.height / 2 - tooltip.offsetHeight / 2 + 'px';
                tooltip.style.opacity = '1';
            }, 500);
        });
        
        match.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
            tooltip.style.opacity = '0';
            setTimeout(() => tooltip.style.display = 'none', 200);
        });
    });
    
    window.addEventListener('scroll', () => {
        allTooltips.forEach(t => {
            t.style.opacity = '0';
            t.style.display = 'none';
        });
    });
});
