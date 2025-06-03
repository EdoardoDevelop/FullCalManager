export class CalendarSchedule {

    constructor(modal, holiday, customFieldsClass, sources, options = []) {
        this.calendar = document.getElementById('calendar');
        this.body = document.body;

        this.modal = modal;
        this.customFields = options.fields;
        this.customFieldsClass = customFieldsClass;
        this.sources = sources;
        this.holiday = holiday;
        
        this.options = options;

        this.calendarObj = null;
        this.selectedEvent = null;
        this.newEventData = null;

        this.setSettingForm();

    }
    
    getText(key) {
        return this.options.texts[key] || `[Testo non trovato per: ${key}]`;
    }

    onEventClick(info) {
        this.modal.formEvent?.reset();
        this.modal.formEvent.classList.remove('was-validated');
        this.newEventData = null;
        this.modal.btnDeleteEvent.style.display = "block";
        this.modal.modalTitle.innerText = this.getText('edit');
        this.modal.main.show();
        this.selectedEvent = info.event;
        document.getElementById('event-start').value = this.formatDateTimeLocal(this.selectedEvent.start);
        document.getElementById('event-end').value = this.formatDateTimeLocal(this.selectedEvent.end);
        document.getElementById('event-title').value = this.selectedEvent.title;
        document.getElementById('event-allDay').checked = this.selectedEvent.allDay;

        // Popola campi personalizzati
        this.customFieldsClass.populateValues(this.selectedEvent.extendedProps);
    }

    onSelect(info) {
        this.modal.formEvent?.reset();
        this.modal.formEvent.classList.remove('was-validated');
        this.selectedEvent = null;
        this.newEventData = info;
        this.modal.btnDeleteEvent.style.display = "none";
        this.modal.modalTitle.innerText = this.getText('add');
        const startDate = new Date(info.date ?? info.start);
        //const endDate = info.allDay ? '' : new Date(info.end ?? startDate);
        const endDate = new Date(info.end ?? startDate);
        document.getElementById('event-start').value = this.formatDateTimeLocal(startDate);
        document.getElementById('event-end').value = this.formatDateTimeLocal(endDate);
        document.getElementById('event-allDay').checked = info.allDay;
        
        this.customFieldsClass.populateValues();
        this.modal.main.show();
        this.calendarObj.unselect();
    }

    formatDateTimeLocal(date) {
        if (!date) return '';
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    }

    // Estrae le classi dai campi personalizzati
    geteventClasses() {
        const eventClasses = [];
        
        this.customFields.forEach(field => {
            if (field.type === 'select' && field.options) {
                const element = document.getElementById(`event-${field.key}`);
                if (!element) return;
                
                const selectedValue = element.value;
                const selectedOption = field.options.find(opt => opt.value === selectedValue);
                
                if (selectedOption && selectedOption.eventClass) {
                    eventClasses.push(selectedOption.eventClass);
                }
            }
        });
        
        return eventClasses;
    }
    
    setSettingForm() {
        document.getElementById('viewSelect').value = localStorage.getItem("calendarView") ? localStorage.getItem("calendarView") : this.options.initialView;
        document.getElementById('firstDaySelect').value = localStorage.getItem("calendarFirstDay") ? localStorage.getItem("calendarFirstDay") : 0;
        document.getElementById('slotMinTime').value = localStorage.getItem("calendarSlotMinTime") ? localStorage.getItem("calendarSlotMinTime") : '00:00';
        document.getElementById('slotMaxTime').value = localStorage.getItem("calendarSlotMaxTime") ? localStorage.getItem("calendarSlotMaxTime") : '23:00';
        document.getElementById('slotDuration').value = localStorage.getItem("calendarSlotDuration") ? localStorage.getItem("calendarSlotDuration") : this.options.slotDuration;
    }

    init() {
        const self = this;
        const currentYear = new Date().getFullYear();
        self.customFieldsClass.initialize(self.customFields);
        // const alertHTML = '<div class="alert alert-success" id="success-alert" style="display: none; position: fixed; top: 0; left: 50%; transform: translateX(-50%); z-index: 9999;" role="alert" >Aggiornamento avvenuto con successo!</div>';
        // document.body.insertAdjacentHTML('afterbegin', alertHTML);

        self.sources.fetchEvents(function (defaultEvents) {
            const festività = self.holiday.generaFestività(currentYear);
            
            self.calendarObj = new FullCalendar.Calendar(self.calendar, {
                plugins: [],
                locale: 'it',
                buttonIcons: true,
                slotDuration: localStorage.getItem("calendarSlotDuration") ? localStorage.getItem("calendarSlotDuration") : self.options.slotDuration,
                themeSystem: 'bootstrap5',
                bootstrapFontAwesome: false,
                buttonText: {
                    today: self.getText('today'),
                    month: self.getText('month'),
                    week: self.getText('week'),
                    day: self.getText('day'),
                    list: self.getText('list')
                },
                //initialView: self.options.initialView,
                initialView: localStorage.getItem("calendarView") ? localStorage.getItem("calendarView") : self.options.initialView,
                handleWindowResize: true,
                height: self.options.height,
                headerToolbar: {
                    left: 'prev,next today addEventButton',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek menuOptions'
                },
                customButtons: {
                    addEventButton: {
                        text: self.getText('add'),
                        click: function () {
                            self.onSelect({
                                date: new Date(),
                                allDay: true
                            });
                        }
                    },
                    menuOptions: {
                        text: '⋮',
                        click: function () {
                            self.modal.settings.show();
                        }
                    }
                },
                events: [...defaultEvents,...festività],
                editable: true,
                droppable: true,
                selectable: true,
                expandRows: true,
                loading: function( isLoading, view ) {
                    if(isLoading) {// isLoading gives boolean value
                        //show your loader here 
                        
                        //self.calendar.appendChild(spinner);
                        
                    } else {
                        //hide your loader here
                    }
                },
                dateClick: function (info) {
                    if(self.calendarObj.view.type === 'dayGridMonth'){
                        self.calendarObj.changeView('timeGridDay', info.dateStr);
                    }
                },
                select: function (info) {
                    if(self.calendarObj.view.type === 'timeGridDay' || self.calendarObj.view.type === 'timeGridWeek'){
                        self.onSelect(info);
                    }
                },
                eventClick: function (info) {
                    self.onEventClick(info);
                },
                eventDrop: function (info) {
                    // Forza il refresh delle classi
                    const originalClasses = info.oldEvent.classNames;
                    info.event.setProp('className', originalClasses.join(' '));
                    // Mantieni tutte le proprietà originali dell'evento
                    const updatedEvent = {
                        id: info.event.id,
                        title: info.event.title,
                        start: info.event.start,
                        end: info.event.end,
                        allDay: info.event.allDay,
                        className: info.event.classNames.join(' '), // Mantieni le classi esistenti
                        extendedProps: info.event.extendedProps // Mantieni tutte le extendedProps
                    };
                    
                    self.sources.updateEventOnServer(updatedEvent, () => {
                        // Aggiorna l'evento nel calendario con tutte le proprietà
                        info.event.setProp('className', updatedEvent.className);
                        Object.keys(updatedEvent.extendedProps).forEach(key => {
                            info.event.setExtendedProp(key, updatedEvent.extendedProps[key]);
                        });

                        // document.getElementById('success-alert').style.display = 'block';
                        // setTimeout(() => {
                        // document.getElementById('success-alert').style.display = 'none';
                        // }, 1000);
                    },self.options.url);
                },
                eventResize: function(info) {
                    const updatedEvent = {
                        id: info.event.id,
                        title: info.event.title,
                        start: info.event.start,
                        end: info.event.end,
                        allDay: info.event.allDay,
                        className: info.event.classNames.join(' '),
                        extendedProps: info.event.extendedProps
                    };
                    
                    self.sources.updateEventOnServer(updatedEvent, () => {
                        info.event.setProp('className', updatedEvent.className);
                    },self.options.url);
                }
            });
            if (localStorage.getItem("calendarFirstDay")) {
                self.calendarObj.setOption('firstDay', localStorage.getItem("calendarFirstDay"));
            }
            if (localStorage.getItem("calendarSlotMinTime")) {
                self.calendarObj.setOption('slotMinTime', localStorage.getItem("calendarSlotMinTime"));
            }
            if (localStorage.getItem("calendarSlotMaxTime")) {
                self.calendarObj.setOption('slotMaxTime', localStorage.getItem("calendarSlotMaxTime"));
            }

            self.calendarObj.render();
        }, this.options.url);


        self.modal.formEvent?.addEventListener('submit', function (e) {
            e.preventDefault();
            const form = self.modal.formEvent;
            const start = new Date(document.getElementById('event-start').value);
            const end = new Date(document.getElementById('event-end').value);
        
            if (form.checkValidity()) {
                const title = document.getElementById('event-title').value;
                const isAllDay = document.getElementById('event-allDay').checked;
        
                // Raccoglie dati personalizzati
                const customData = {};
                self.customFields.forEach(field => {
                    const element = document.getElementById(`event-${field.key}`);
                    if (!element) return;
        
                    if (field.type === 'checkbox') {
                        customData[field.key] = element.checked;
                    } else {
                        customData[field.key] = element.value;
                    }
                });
        
                // Calcola le classi CSS
                const eventClasses = self.geteventClasses();
                const allClasses = eventClasses.join(' ');
        
                if (self.selectedEvent) {
                    // Crea una copia dell'evento aggiornato
                    const updatedEvent = {
                        id: self.selectedEvent.id,
                        title: title,
                        start: start,
                        end: end,
                        allDay: isAllDay,
                        extendedProps: customData,
                        className: allClasses
                    };
        
                    // 1. Rimuovi l'evento vecchio
                    self.selectedEvent.remove();
                    
                    // 2. Aggiungi l'evento aggiornato
                    self.calendarObj.addEvent(updatedEvent);
                    
                    // 3. Aggiorna sul server
                    self.sources.updateEventOnServer(updatedEvent, () => {

                    },self.options.url);
                } else {
                    const eventData = {
                        title: title,
                        start: start,
                        end: end,
                        allDay: isAllDay,
                        extendedProps: customData,
                        className: allClasses
                    };
        
                    self.sources.saveEventToServer(eventData, function (savedEvent) {
                        self.calendarObj.addEvent(savedEvent);
                    },self.options.url);
                }
                self.modal.main.hide();
            } else {
                e.stopPropagation();
                form.classList.add('was-validated');
            }
        });

        self.modal.btnDeleteEvent.addEventListener('click', function () {
            if (confirm('Sei sicuro di voler procedere?')) {
                if (self.selectedEvent) {
                    const eventId = self.selectedEvent.id;
                    self.sources.deleteEventFromServer(eventId, function () {
                        self.selectedEvent.remove();
                        self.selectedEvent = null;
                        self.modal.main.hide();
                    },self.options.url);
                }
            }
        });
        self.modal.main._element.addEventListener('shown.bs.modal', function () {
            document.getElementById('event-title').focus();
            
        });
        self.modal.formSettings?.addEventListener('submit', function (e) {
            e.preventDefault();
            const newView = document.getElementById('viewSelect').value;
            const firstDay = parseInt(document.getElementById('firstDaySelect').value);
            const minTime = document.getElementById('slotMinTime').value;
            const maxTime = document.getElementById('slotMaxTime').value;
            const slotDuration = document.getElementById('slotDuration').value;

            localStorage.setItem('calendarView', newView);
            localStorage.setItem('calendarFirstDay', firstDay);
            localStorage.setItem('calendarSlotMinTime', minTime);
            localStorage.setItem('calendarSlotMaxTime', maxTime);
            localStorage.setItem('calendarSlotDuration', slotDuration);

            self.calendarObj.setOption('firstDay', firstDay);
            self.calendarObj.setOption('slotMinTime', minTime);
            self.calendarObj.setOption('slotMaxTime', maxTime);
            self.calendarObj.setOption('slotDuration', slotDuration);
            self.calendarObj.changeView(newView);
            
        })
        
    }
}
