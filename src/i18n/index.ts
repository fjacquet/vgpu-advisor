import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import deCommon from './locales/de/common.json';
import enCommon from './locales/en/common.json';
import frCommon from './locales/fr/common.json';
import itCommon from './locales/it/common.json';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      fr: { common: frCommon },
      de: { common: deCommon },
      it: { common: itCommon },
    },
    defaultNS: 'common',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
