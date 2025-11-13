export interface User {
  id?: string;
  email: string;
  name: string;
  role: 'institution' | 'superviseur' | 'admin';
  token?: string;
  institutionId?: string;
}

export interface Institution {
  id: string;
  name: string;
  address?: string;
  sector: string;
  activities: string[];
  employeeCount?: number;
  annualRevenue?: number;
  creationDate?: Date;
  mainContact?: {
    name: string;
    email: string;
    phone: string;
  };
  riskLevel: 'high' | 'medium' | 'low';
  lastAssessment?: Date;
  nextSupervision?: Date;
  score?: number;
}

export interface Country {
  idPays: string;
  libelle: string;
  code: string;
  categoriePays?: { libelle: string };
  listType?: 'blacklist' | 'greylist';
}

export interface QuestionAxis {
  id: string;
  name: string;
  description: string;
  order: number;
}
export interface TypeReponse {
  idTypeReponse: string;
  type: string;
  creeLe?: string;
  modifieLe?: string;
}

export interface SousSection {
  idSousSection: string;
  libelle: string;
  creeLe?: string;
  modifieLe?: string;
  section?: { idSection: string; libelle: string; coefficient: number; creeLe?: string; modifieLe?: string };
}

export interface QuestionRule {
  id: string;
  value: any;
  points: number;
  condition?: 'equal' | 'greater' | 'less' | 'between' | 'contains' | 'greater_equal' | 'less_equal';
}

export interface Question {
  id: string;  // Mappé depuis idQuestion
  label: string;  // Mappé depuis libelle
  definition: string;
  type: string;  // Mappé depuis typeReponse.type
  required: boolean;  // Mappé depuis exigeDocument
  justificationRequired: boolean;
  commentRequired: boolean;
  notes: string;
  axisId: string;  // Mappé depuis sousSection.idSousSection
  rules?: QuestionRule[]; // Added for dynamic rating form
  scoring?: {
    mapping: Array<{ value: any; points: number }>;
    weightBySector: Array<{ sector: string; weight: number }>;
  };
  // Optionnels backend (pour debug si besoin)
  creeLe?: string;
  modifieLe?: string;
  typeReponse?: TypeReponse;
  sousSection?: SousSection;
  dropdownOptions?: string[]; // ["svt", "hg", "pc"]
  min?: number; // For range, integer, decimal
  max?: number; // For range, integer, decimal
}

export interface Axis {
  id: string;
  name: string;
}



export interface Response {
  id: string;
  questionId: string;
  institutionId: string;
  value: any;
  justification?: string;
  comment?: string;
  documents?: string[];
  submittedAt: Date;
}

export interface Assessment {
  id: string;
  institutionId: string;
  totalScore: number;
  axisScores: Record<string, number>;
  riskLevel: 'high' | 'medium' | 'low';
  submittedAt: Date;
  responses: Response[];
}

export interface SectorWeight {
  id: string;
  name: string;
  weight: number;
  coefficient: number;
}

export interface RiskThreshold {
  level: string;  
  label: string;
  minScore: number;
  maxScore: number;
  color: string; 
}

export interface SectionWithNested {
  id: string;
  name: string;
  coefficient: number;
  creeLe: string;
  modifieLe: string;
  sousSections: SousSection[];
}