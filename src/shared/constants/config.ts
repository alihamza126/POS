/**
 * Global Configuration Constants for the POS System.
 * Modify these values to update configuration details across the entire application in one place.
 */

export const APP_CONFIG = {
  // Branch & Device Identity Configs
  branch: {
    defaultId: 'BR-1',
    defaultDeviceId: 'D-1',
    invoicePrefix: 'AMA-',
  },

  // PDF & Printable Account Statement Details
  pdf: {
    primaryColor: '#24D4FE', // Brand Cyan Color
    textColorLightBlack: '#374151', // Table text Slate-700 color
    textColorNavy: '#02025C', // Accent Navy Color
    footerFontSize: 11,
  },

  // Developer Support & Footers
  developer: {
    name: 'AH Developer',
    contact: '+923037828419',
    footerText: 'Software Developed by AH Developer | Contact: +923037828419',
  },

  // Default Business Metadata (Fallback)
  defaults: {
    companyName: 'Al Madina autos ',
    companyAddress: 'Quaid Azam road Faqirwali ',
    companyPhone: '03017890207',
    companyEmail: '',
  }
};
