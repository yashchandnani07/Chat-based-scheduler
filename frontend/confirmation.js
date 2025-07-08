function loadEventDetails() {
    fetch('/api/schedule/latest', { credentials: 'include' })
        .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
        .then(data => {
            if (data && data.success && data.schedule) {
                const schedule = data.schedule;
                document.getElementById('eventTitle').textContent = schedule.title || 'N/A';
                
                const startTime = new Date(schedule.startTime);
                const endTime = new Date(schedule.endTime);

                document.getElementById('eventTime').textContent = `${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`;
                
                const viewInCalendarButton = document.getElementById('viewInCalendarButton');
                const scheduleAnotherButton = document.getElementById('scheduleAnotherButton');

                if (schedule.eventLink) {
                    viewInCalendarButton.href = schedule.eventLink;
                    viewInCalendarButton.style.display = 'inline-block';
                    scheduleAnotherButton.style.display = 'inline-block';
                } else {
                    viewInCalendarButton.style.display = 'none';
                    scheduleAnotherButton.style.display = 'inline-block';
                }

            } else {
                document.querySelector('.content').innerHTML = '<h1 class="title">No Schedule Found</h1><p class="subtitle">Please go back to the main page to create a schedule.</p>';
                document.querySelector('.action-buttons').innerHTML = '<a href="index.html" class="secondary-button">Back to Home</a>';
            }
        })
        .catch(error => {
            console.error('Error loading event details:', error);
            document.querySelector('.content').innerHTML = '<h1 class="title">Error</h1><p class="subtitle">An error occurred. Please try again.</p>';
            document.querySelector('.action-buttons').innerHTML = '<a href="index.html" class="secondary-button">Back to Home</a>';
        });
}

window.addEventListener('DOMContentLoaded', () => {
    loadEventDetails();
    document.getElementById('scheduleAnotherButton').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});