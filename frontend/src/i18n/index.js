// Internationalization setup for Stack Facilitation
// Supports multiple languages and right-to-left text

const DEFAULT_LANGUAGE = 'en';
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

// Language configurations
const LANGUAGES = {
  en: {
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h'
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h'
  },
  fr: {
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h'
  },
  de: {
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    dateFormat: 'dd.MM.yyyy',
    timeFormat: '24h'
  },
  ar: {
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h'
  },
  he: {
    name: 'Hebrew',
    nativeName: 'עברית',
    direction: 'rtl',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h'
  }
};

// Translation strings
const TRANSLATIONS = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.create': 'Create Meeting',
    'nav.join': 'Join Meeting',
    'nav.settings': 'Settings',
    
    // Common actions
    'action.create': 'Create',
    'action.join': 'Join',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.delete': 'Delete',
    'action.edit': 'Edit',
    'action.submit': 'Submit',
    'action.close': 'Close',
    'action.back': 'Back',
    'action.next': 'Next',
    'action.previous': 'Previous',
    'action.refresh': 'Refresh',
    'action.export': 'Export',
    'action.import': 'Import',
    
    // Meeting states
    'meeting.active': 'Active',
    'meeting.ended': 'Ended',
    'meeting.starting': 'Starting',
    'meeting.paused': 'Paused',
    
    // User roles
    'role.facilitator': 'Facilitator',
    'role.stack_keeper': 'Stack Keeper',
    'role.participant': 'Participant',
    'role.observer': 'Observer',
    
    // Queue types
    'queue.hand': 'Raise Hand',
    'queue.direct_response': 'Direct Response',
    'queue.point_process': 'Point of Process',
    'queue.point_info': 'Point of Information',
    'queue.point_clarification': 'Point of Clarification',
    
    // Proposal states
    'proposal.active': 'Active',
    'proposal.passed': 'Passed',
    'proposal.blocked': 'Blocked',
    'proposal.withdrawn': 'Withdrawn',
    
    // Vote types
    'vote.agree': 'Agree',
    'vote.stand_aside': 'Stand Aside',
    'vote.concern': 'Concern',
    'vote.block': 'Block',
    
    // Accessibility
    'a11y.skip_to_content': 'Skip to main content',
    'a11y.menu_toggle': 'Toggle navigation menu',
    'a11y.close_dialog': 'Close dialog',
    'a11y.loading': 'Loading...',
    'a11y.error': 'Error',
    'a11y.success': 'Success',
    'a11y.warning': 'Warning',
    'a11y.info': 'Information',
    
    // Queue announcements
    'announce.queue_joined': 'You joined the speaking queue at position {position} of {total}',
    'announce.queue_left': 'You left the speaking queue',
    'announce.queue_position': 'You are now position {position} of {total} in the queue',
    'announce.now_speaking': '{name} is now speaking',
    'announce.next_speaker': 'Next speaker: {name}',
    
    // Error messages
    'error.network': 'Network connection error',
    'error.permission_denied': 'Permission denied',
    'error.not_found': 'Not found',
    'error.server_error': 'Server error',
    'error.validation': 'Validation error',
    'error.timeout': 'Request timeout',
    
    // Success messages
    'success.meeting_created': 'Meeting created successfully',
    'success.joined_meeting': 'Joined meeting successfully',
    'success.proposal_created': 'Proposal created successfully',
    'success.vote_recorded': 'Vote recorded successfully',
    'success.settings_saved': 'Settings saved successfully',
    
    // Forms
    'form.required': 'Required',
    'form.optional': 'Optional',
    'form.invalid_email': 'Invalid email address',
    'form.password_too_short': 'Password too short',
    'form.passwords_dont_match': 'Passwords don\'t match',
    
    // Time and dates
    'time.now': 'now',
    'time.seconds_ago': '{count} seconds ago',
    'time.minutes_ago': '{count} minutes ago',
    'time.hours_ago': '{count} hours ago',
    'time.days_ago': '{count} days ago',
    'time.weeks_ago': '{count} weeks ago',
    'time.months_ago': '{count} months ago',
    'time.years_ago': '{count} years ago',
    
    // Numbers
    'number.first': 'first',
    'number.second': 'second',
    'number.third': 'third',
    'number.nth': '{n}th',
    
    // Pluralization
    'plural.participant': '{count, plural, one {participant} other {participants}}',
    'plural.proposal': '{count, plural, one {proposal} other {proposals}}',
    'plural.vote': '{count, plural, one {vote} other {votes}}',
    'plural.minute': '{count, plural, one {minute} other {minutes}}',
    'plural.second': '{count, plural, one {second} other {seconds}}'
  },
  
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.create': 'Crear Reunión',
    'nav.join': 'Unirse a Reunión',
    'nav.settings': 'Configuración',
    
    // Common actions
    'action.create': 'Crear',
    'action.join': 'Unirse',
    'action.save': 'Guardar',
    'action.cancel': 'Cancelar',
    'action.delete': 'Eliminar',
    'action.edit': 'Editar',
    'action.submit': 'Enviar',
    'action.close': 'Cerrar',
    'action.back': 'Volver',
    'action.next': 'Siguiente',
    'action.previous': 'Anterior',
    'action.refresh': 'Actualizar',
    'action.export': 'Exportar',
    'action.import': 'Importar',
    
    // Meeting states
    'meeting.active': 'Activa',
    'meeting.ended': 'Terminada',
    'meeting.starting': 'Iniciando',
    'meeting.paused': 'Pausada',
    
    // User roles
    'role.facilitator': 'Facilitador/a',
    'role.stack_keeper': 'Moderador/a de Cola',
    'role.participant': 'Participante',
    'role.observer': 'Observador/a',
    
    // Queue types
    'queue.hand': 'Levantar Mano',
    'queue.direct_response': 'Respuesta Directa',
    'queue.point_process': 'Punto de Proceso',
    'queue.point_info': 'Punto de Información',
    'queue.point_clarification': 'Punto de Aclaración',
    
    // Accessibility
    'a11y.skip_to_content': 'Saltar al contenido principal',
    'a11y.loading': 'Cargando...',
    'a11y.error': 'Error',
    'a11y.success': 'Éxito',
    'a11y.warning': 'Advertencia',
    'a11y.info': 'Información'
  }
  
  // Additional languages would be added here
};

class I18n {
  constructor() {
    this.currentLanguage = this.detectLanguage();
    this.translations = TRANSLATIONS;
    this.listeners = [];
    
    // Set document direction
    this.updateDocumentDirection();
  }

  detectLanguage() {
    // Check localStorage first
    const stored = localStorage.getItem('stack-facilitation-language');
    if (stored && LANGUAGES[stored]) {
      return stored;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (LANGUAGES[browserLang]) {
      return browserLang;
    }

    return DEFAULT_LANGUAGE;
  }

  setLanguage(language) {
    if (!LANGUAGES[language]) {
      console.warn(`Language ${language} not supported`);
      return false;
    }

    this.currentLanguage = language;
    localStorage.setItem('stack-facilitation-language', language);
    
    this.updateDocumentDirection();
    this.notifyListeners();
    
    return true;
  }

  updateDocumentDirection() {
    const direction = LANGUAGES[this.currentLanguage].direction;
    document.documentElement.dir = direction;
    document.documentElement.lang = this.currentLanguage;
  }

  translate(key, params = {}) {
    const translations = this.translations[this.currentLanguage] || this.translations[DEFAULT_LANGUAGE];
    let translation = translations[key];

    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    // Simple parameter substitution
    Object.keys(params).forEach(param => {
      const placeholder = `{${param}}`;
      translation = translation.replace(new RegExp(placeholder, 'g'), params[param]);
    });

    return translation;
  }

  // Alias for translate
  t(key, params = {}) {
    return this.translate(key, params);
  }

  formatDate(date, format = null) {
    const config = LANGUAGES[this.currentLanguage];
    const formatString = format || config.dateFormat;
    
    // Simple date formatting - in production, use a library like date-fns
    const d = new Date(date);
    
    if (formatString === 'MM/dd/yyyy') {
      return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
    } else if (formatString === 'dd/MM/yyyy') {
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } else if (formatString === 'dd.MM.yyyy') {
      return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
    }
    
    return d.toLocaleDateString(this.currentLanguage);
  }

  formatTime(date, format = null) {
    const config = LANGUAGES[this.currentLanguage];
    const use24h = format === '24h' || config.timeFormat === '24h';
    
    return new Date(date).toLocaleTimeString(this.currentLanguage, {
      hour12: !use24h,
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return this.t('time.seconds_ago', { count: seconds });
    } else if (minutes < 60) {
      return this.t('time.minutes_ago', { count: minutes });
    } else if (hours < 24) {
      return this.t('time.hours_ago', { count: hours });
    } else {
      return this.t('time.days_ago', { count: days });
    }
  }

  getAvailableLanguages() {
    return Object.keys(LANGUAGES).map(code => ({
      code,
      ...LANGUAGES[code]
    }));
  }

  getCurrentLanguage() {
    return {
      code: this.currentLanguage,
      ...LANGUAGES[this.currentLanguage]
    };
  }

  isRTL() {
    return LANGUAGES[this.currentLanguage].direction === 'rtl';
  }

  // Event system for language changes
  onChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentLanguage));
  }
}

// Create singleton instance
const i18n = new I18n();

export default i18n;

