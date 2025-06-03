export class CalendarModal {
    constructor() {
        // Create modal element if it doesn't exist
        if (!document.getElementById('event-modal')) {
            const modalHTML = `
                <div class="modal fade" id="event-modal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <form class="needs-validation" name="event-form" id="forms-event" novalidate>
                                <div class="modal-header">
                                    <h4 class="modal-title" id="modal-title">Create Event</h4>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <div class="row align-items-center justify-content-center">
                                        <div class="col-12">
                                            <div class="mb-2">
                                                <label class="control-label form-label" for="event-title">Titolo</label>
                                                <input class="form-control" placeholder="Inserisci il titolo" type="text"
                                                    name="title" id="event-title" required />
                                                <div class="invalid-feedback">Please provide a valid event name</div>
                                            </div>
                                        </div>
                                        <div class="col-12 mb-2">
                                            <label>Tutto il giorno <input type="checkbox" id="event-allDay" id="allDay"></label>
                                        </div>
                                        <div class="col-6 mb-2">
                                            Inizio
                                        </div>
                                        <div class="col-6 mb-2">
                                            Fine
                                        </div>
                                        <div class="col-6 mb-2">
                                            <input type="datetime-local" id="event-start" name="start" class="form-control" required>
                                        </div>
                                        <div class="col-6 mb-2">
                                            <input type="datetime-local" id="event-end" name="end" class="form-control">
                                        </div>
                                        
                                        <div id="custom-fields-container"></div>
                                    </div>

                                    <div class="d-flex flex-wrap align-items-center gap-2">
                                        <button type="button" class="btn btn-danger" id="btn-delete-event">
                                            Elimina
                                        </button>

                                        <button type="button" class="btn btn-light ms-auto" data-bs-dismiss="modal">
                                            Chiudi
                                        </button>

                                        <button type="submit" class="btn btn-primary" id="btn-save-event">
                                            Salva
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="modal fade" id="settings-modal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <form class="needs-validation" name="settings-form" id="forms-settings" novalidate>
                                <div class="modal-header">
                                    <h4 class="modal-title" id="modal-title">Impostazioni</h4>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <div class="row align-items-center justify-content-center">                   
                                        <div class="col-6 mb-2">
                                            <label for="viewSelect">Vista iniziale:</label>
                                        </div>
                                        <div class="col-6 mb-2">
                                            <select id="viewSelect" class="form-select">
                                                <option value="dayGridMonth">Mese</option>
                                                <option value="timeGridWeek">Settimana</option>
                                                <option value="timeGridDay">Giorno</option>
                                                <option value="listWeek">Lista (Settimana)</option>
                                            </select>
                                        </div>
                                        <div class="col-6 mb-2">
                                            <label for="firstDaySelect">Primo giorno della settimana:</label>
                                        </div>
                                        <div class="col-6 mb-2">
                                            <select id="firstDaySelect" class="form-select">
                                                <option value="0">Domenica</option>
                                                <option value="1">Lunedì</option>
                                            </select>
                                        </div>
                                        <div class="col-6 mb-2">
                                            <label for="slotMinTime">Ora inizio:</label>
                                        </div>
                                        <div class="col-6 mb-2">
                                            <label for="slotMaxTime">Ora inizio:</label>
                                        </div>
                                        <div class="col-6 mb-2">
                                            <input type="time" id="slotMinTime" value="00:00" class="form-control">
                                        </div>
                                        <div class="col-6 mb-2">
                                            <input type="time" id="slotMaxTime" value="23:00" class="form-control">
                                        </div>
                                        <div class="col-6 mb-2">
                                            <label for="slotDuration">Durata slot:</label>
                                        </div>
                                        <div class="col-6 mb-2">
                                            <select id="slotDuration" class="form-select">
                                                <option value="00:15:00">15 minuti</option>
                                                <option value="00:30:00" selected>30 minuti</option>
                                                <option value="01:00:00">1 ora</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="d-flex flex-wrap align-items-center gap-2">
                                        <button type="button" class="btn btn-light ms-auto" data-bs-dismiss="modal">
                                            Chiudi
                                        </button>

                                        <button type="submit" class="btn btn-primary" id="btn-save-settings">
                                            Salva
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        this.settings = new bootstrap.Modal(document.getElementById('settings-modal'), { backdrop: 'static' });
        this.main = new bootstrap.Modal(document.getElementById('event-modal'), { backdrop: 'static' });
        this.formSettings = document.getElementById('forms-settings');
        this.formEvent = document.getElementById('forms-event');
        this.btnDeleteEvent = document.getElementById('btn-delete-event');
        this.modalTitle = document.getElementById('modal-title');

    }
}
