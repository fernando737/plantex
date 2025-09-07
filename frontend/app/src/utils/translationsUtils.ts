// src/utils/translationUtils.ts

interface TranslationDictionary {
  [key: string]: string;
}

const soilClassificationTranslations: TranslationDictionary = {
  urban: 'Urbano',
  suburban: 'Suburbano',
  rural: 'Rural',
  urban_expansion: 'Expansión Urbana',
};

const processStatusTranslations: TranslationDictionary = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  completed: 'Completado',
};

const roleTranslations: TranslationDictionary = {
  owner: 'Propietario',
  agent: 'Apoderado',
  both: 'Propietario y Apoderado',
};

const professionalRoleTranslations: TranslationDictionary = {
  developer: 'Urbanizador/Parcelador',
  construction_director: 'Director de Construcción',
  project_architect: 'Arquitecto del Proyecto',
  structural_designer: 'Ingeniero Civil Diseñador Estructural',
  non_structural_designer: 'Diseñador de Elementos No Estructurales',
  geotechnical_engineer: 'Ingeniero Civil Geotécnico',
  topographic_engineer: 'Ingeniero Topográfico',
  independent_reviewer: 'Revisor Independiente de Diseños Estructurales',
  other_specialist: 'Otros Profesionales Especialistas',
};

const professionalProfessionTranslations: TranslationDictionary = {
  architect: 'Arquitecto',
  civil_engineer: 'Ingeniero Civil',
  topographer: 'Topógrafo',
  other: 'Otro',
};

/**
 * Translates a soil classification value to its Spanish equivalent.
 * @param value - The soil classification value in English.
 * @returns The translated value in Spanish.
 */
export function translateSoilClassification(value: string): string {
  return soilClassificationTranslations[value] || value;
}

/**
 * Translates a process status value to its Spanish equivalent.
 * @param value - The process status value in English.
 * @returns The translated value in Spanish.
 */
export function translateProcessStatus(value: string): string {
  return processStatusTranslations[value] || value;
}

/**
 * Translates a role value to its Spanish equivalent.
 * @param value - The role value in English.
 * @returns The translated value in Spanish.
 */
export function translateRole(value: string): string {
  return roleTranslations[value] || value;
}

/**
 * Translates a professional role value to its Spanish equivalent.
 * @param value - The professional role value in English.
 * @returns The translated value in Spanish.
 */
export function translateProfessionalRole(value: string): string {
  return professionalRoleTranslations[value] || value;
}

/**
 * Translates a professional profession value to its Spanish equivalent.
 * @param value - The professional profession value in English.
 * @returns The translated value in Spanish.
 */
export function translateProfessionalProfession(value: string): string {
  return professionalProfessionTranslations[value] || value;
}
