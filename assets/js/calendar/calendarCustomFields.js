export class CalendarCustomFields {
    constructor() {
        this.customFieldsConfig = null;
        this.initialized = false;
    }

    initialize(customFields) {
        // Genera i campi solo se non sono già stati inizializzati o se la configurazione è cambiata
        if (!this.initialized || this._hasConfigChanged(customFields)) {
            this.customFieldsConfig = customFields;
            this._generateFieldsMarkup();
            this.initialized = true;
        }
    }

    populateValues(data = {}) {
        if (!this.initialized) return;

        this.customFieldsConfig.forEach(field => {
            const element = document.getElementById(`event-${field.key}`);
            if (!element) return;

            switch (field.type) {
                case 'checkbox':
                    element.checked = !!data[field.key];
                    break;
                case 'select':
                    element.value = data[field.key] || '';
                    break;
                case 'textarea':
                    element.value = data[field.key] || '';
                    break;
                default:
                    element.value = data[field.key] || '';
            }
        });
    }
    

    _generateFieldsMarkup() {
        const container = document.getElementById('custom-fields-container');
        if (!container) return;

        container.innerHTML = '';

        this.customFieldsConfig.forEach(field => {
            const fieldId = `event-${field.key}`;
            let fieldHtml = '';

            switch (field.type) {
                case 'checkbox':
                    fieldHtml = `
                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" id="${fieldId}">
                            <label class="form-check-label" for="${fieldId}">${field.label}</label>
                        </div>
                    `;
                    break;
                case 'select':
                    const options = field.options.map(opt => 
                        `<option value="${opt.value}">${opt.label}</option>`
                    ).join('');
                    fieldHtml = `
                        <div class="mb-3">
                            <label for="${fieldId}" class="form-label">${field.label}</label>
                            <select class="form-select" id="${fieldId}">
                                ${options}
                            </select>
                        </div>
                    `;
                    break;
                case 'textarea':
                    fieldHtml = `
                        <div class="mb-3">
                            <label for="${fieldId}" class="form-label">${field.label}</label>
                            <textarea class="form-control" id="${fieldId}" rows="3"></textarea>
                        </div>
                    `;
                    break;
                default:
                    fieldHtml = `
                        <div class="mb-3">
                            <label for="${fieldId}" class="form-label">${field.label}</label>
                            <input type="${field.type}" class="form-control" id="${fieldId}">
                        </div>
                    `;
            }

            container.insertAdjacentHTML('beforeend', fieldHtml);
        });
    }

    _hasConfigChanged(newConfig) {
        if (!this.customFieldsConfig) return true;
        
        // Confronto semplice (potrebbe essere migliorato con un confronto più approfondito)
        return JSON.stringify(this.customFieldsConfig) !== JSON.stringify(newConfig);
    }

    getFieldValues() {
        if (!this.initialized) return {};
        
        const values = {};
        this.customFieldsConfig.forEach(field => {
            const element = document.getElementById(`event-${field.key}`);
            if (!element) return;
            
            values[field.key] = field.type === 'checkbox' 
                ? element.checked 
                : element.value;
        });
        return values;
    }
}
