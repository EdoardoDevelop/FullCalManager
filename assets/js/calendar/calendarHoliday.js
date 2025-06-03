export class CalendarHoliday{
    
  festivitàItalia = [
      { name: "Capodanno", date: "01/01", fixed: true },
      { name: "Epifania", date: "06/01", fixed: true },
      { name: "Pasqua", fixed: false }, // Data mobile (calcolata)
      { name: "Lunedì dell'Angelo", offset: 1, parent: "Pasqua" }, // Pasqua +1 giorno
      { name: "Liberazione", date: "25/04", fixed: true },
      { name: "Festa dei Lavoratori", date: "01/05", fixed: true },
      { name: "Festa della Repubblica", date: "02/06", fixed: true },
      { name: "Ferragosto", date: "15/08", fixed: true },
      { name: "Ognissanti", date: "01/11", fixed: true },
      { name: "Immacolata Concezione", date: "08/12", fixed: true },
      { name: "Natale", date: "25/12", fixed: true },
      { name: "Santo Stefano", date: "26/12", fixed: true }
  ];
  calcolaPasqua(year) {
      const a = year % 19;
      const b = Math.floor(year / 100);
      const c = year % 100;
      const d = Math.floor(b / 4);
      const e = b % 4;
      const f = Math.floor((b + 8) / 25);
      const g = Math.floor((b - f + 1) / 3);
      const h = (19 * a + b - d - g + 15) % 30;
      const i = Math.floor(c / 4);
      const k = c % 4;
      const l = (32 + 2 * e + 2 * i - h - k) % 7;
      const m = Math.floor((a + 11 * h + 22 * l) / 451);
      const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
      const day = ((h + l - 7 * m + 114) % 31) + 1;
      return new Date(year, month, day);
  }
  generaFestività(year) {
      const pasqua = this.calcolaPasqua(year);
      
      return this.festivitàItalia.map(fest => {
        // 1. Calcola la data
        let date;
        if (fest.fixed) {
          const [day, month] = fest.date.split('/');
          date = new Date(year, parseInt(month) - 1, parseInt(day));
        } else {
          date = new Date(pasqua);
          if (fest.offset) date.setDate(date.getDate() + fest.offset);
        }
    
        // 2. Formatta per FullCalendar
        return {
          title: fest.name,
          start: date.toISOString(), // Converti in stringa ISO
          display: 'background',
          editable: false,
          className: 'festività',
          allDay: true // Aggiungi se vuoi che siano giornate intere
        };
      });
  }

}
