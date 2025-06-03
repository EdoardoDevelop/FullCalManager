export class CalendarSources {
    fetchEvents(callback, url) {
        fetch(url.get)
            .then(res => res.json())
            .then(events => callback(events))
            .catch(err => console.error('Errore caricamento eventi:', err));
    }

    saveEventToServer(eventData, callback, url) {
        fetch(url.save, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        })
            .then(res => res.json())
            .then(data => callback(data))
            .catch(err => console.error('Errore salvataggio evento:', err));
    }

    updateEventOnServer(event, callback, url) {
        // Normalizza le date per il server
        const eventData = {
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end || event.start, // Se non c'è end, usa start
            allDay: event.allDay,
            className: event.className,
            extendedProps: event.extendedProps
        };
    
        fetch(url.update.replace('$id', event.id, url.update), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        })
        .then(res => res.json())
        .then(data => callback(data))
        .catch(err => console.error('Errore aggiornamento evento:', err));
    }

    deleteEventFromServer(id, callback, url) {
        fetch(url.delete.replace('$id', id), {
            method: 'DELETE'
        })
            .then(res => res.json())
            .then(data => callback(data))
            .catch(err => console.error('Errore eliminazione evento:', err));
    }
}