import { CalendarModal } from './calendarModal.js';
import { CalendarCustomFields } from './calendarCustomFields.js';
import { CalendarHoliday } from './calendarHoliday.js';
import { CalendarSources } from './calendarSources.js';
import { CalendarSchedule } from './calendarMain.js';

export class CRCalendar {
    constructor(options) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init(options));
        } else {
            this.init(options);
        }
    }

    init(options) {
        const modal = new CalendarModal();
        const customFieldsClass = new CalendarCustomFields();
        const holiday = new CalendarHoliday();
        const sources = new CalendarSources();
        new CalendarSchedule(modal, holiday, customFieldsClass, sources, options).init();
    }
}



