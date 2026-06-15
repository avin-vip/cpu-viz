import type {
  Company,
  CompanyCategory,
  EdgeType,
  Facility,
} from "@prisma/client";

export interface CompanyRelationship {
  edgeType: EdgeType;
  direction: "inbound" | "outbound";
  company: {
    id: string;
    slug: string;
    name: string;
    category: CompanyCategory;
    logoUrl: string | null;
  };
  label: string | null;
  strength: number;
}

export interface CompanyRelationships {
  suppliers: CompanyRelationship[];
  customers: CompanyRelationship[];
  partners: CompanyRelationship[];
  competitors: CompanyRelationship[];
  other: CompanyRelationship[];
}

export interface CompanyProfile extends Company {
  facilities: Facility[];
  relationships: CompanyRelationships;
}

export interface CompanyListItem {
  id: string;
  slug: string;
  name: string;
  ticker: string | null;
  category: CompanyCategory;
  description: string | null;
  headquarters: string | null;
  logoUrl: string | null;
}
