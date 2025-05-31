const API_URL = 'https://discover-business-backend.vercel.app/api/events';

async function fetchEvents() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch events');

    const events = await response.json();
    populateEventList(events);
  } catch (error) {
    console.error(error);
    showError('Could not load events.');
  }
}
function convertFirestoreTimestampParts(timestamp) {
    if (!timestamp || typeof timestamp._seconds !== 'number') {
        return { month: 'N/A', day: '??', weekday: '---' };
    }

    const milliseconds = timestamp._seconds * 1000 + Math.floor(timestamp._nanoseconds / 1e6);
    const date = new Date(milliseconds);

    const month = date.toLocaleDateString('en-US', { month: 'short' }); // e.g., "Dec"
    const day = date.getDate(); // e.g., 23
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Sat"

    return { month, day, weekday };
    }

function populateEventList(events) {
    console.log(events)
  const container = document.getElementById('event-list-container');

  if (!container) return;

  container.innerHTML = '';

  if (events.length === 0) {
    container.innerHTML = '<p>No events found.</p>';
    return;
  }

  events.forEach(event => {
    const { month, day, weekday } = convertFirestoreTimestampParts(event.date); // ✅ FIXED LINE

    const card = document.createElement('div');
    // card.className = 'strip_booking';
    card.innerHTML = `
    
    <div class="row">
                <div class="col-lg-2 col-md-2">
                    <div class="date">
                        <span class="month">${month}</span>
                        <span class="day"><strong>${day}</strong>${weekday}</span>
                    </div>
                </div>
                <div class="col-lg-6 col-md-5">
                    <h3 class="hotel_booking">${event.title}<span>${event.description}</span></h3>
                </div>
                <div class="col-lg-2 col-md-3">
                    <ul class="info_booking">
                        <li><strong>Location</strong> ${event.location}</li>
                        <li><strong>Price</strong> ${event.price}</li>

                    </ul>
                </div>
                <div class="col-lg-2 col-md-2">
                    <div class="booking_buttons">
                        <a  href="${event.link}" target="_blank" class="btn_2">More info</a>
                    </div>
                </div>
            </div> 
            <hr> `;

    container.appendChild(card);
  });
}

function showError(message) {
  const container = document.getElementById('event-list-container');
  if (container) {
    container.innerHTML = `<p class="error">${message}</p>`;
  }
}

window.addEventListener('DOMContentLoaded', fetchEvents);
