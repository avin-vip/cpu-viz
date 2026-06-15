import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { COMPANY_CATEGORIES } from "@/lib/constants/categories";
import { getCompany } from "@/lib/companies/get-company";
import { formatCategory } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

interface CompanyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CompanyPageProps) {
  const { slug } = await params;
  const company = await getCompany(slug);

  if (!company) {
    return { title: "Company not found" };
  }

  return {
    title: company.name,
    description: company.description ?? undefined,
  };
}

export default async function CompanyDetailPage({ params }: CompanyPageProps) {
  const { slug } = await params;
  const company = await getCompany(slug);

  if (!company) {
    notFound();
  }

  const categoryStyle = COMPANY_CATEGORIES[company.category];
  const relationshipSections = [
    { key: "suppliers", label: "Suppliers" },
    { key: "customers", label: "Customers" },
    { key: "partners", label: "Partners" },
    { key: "competitors", label: "Competitors" },
  ] as const;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <Breadcrumbs
        items={[
          { label: "Companies", href: "/companies" },
          { label: company.name },
        ]}
        className="mb-6"
      />

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            style={{
              borderColor: `${categoryStyle.color}40`,
              backgroundColor: `${categoryStyle.color}15`,
              color: categoryStyle.color,
            }}
          >
            {formatCategory(company.category)}
          </Badge>
          {company.ticker && (
            <span className="text-sm text-muted-foreground">{company.ticker}</span>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
          {company.name}
        </h1>
        {company.headquarters && (
          <p className="mt-2 text-sm text-muted-foreground">
            HQ: {company.headquarters}
          </p>
        )}
        {company.description && (
          <p className="mt-4 max-w-3xl text-muted-foreground">
            {company.description}
          </p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {relationshipSections.map(({ key, label }) => {
          const relationships = company.relationships[key];
          if (relationships.length === 0) {
            return null;
          }

          return (
            <Panel key={key}>
              <PanelHeader>
                <PanelTitle>{label}</PanelTitle>
                <Badge variant="outline">{relationships.length}</Badge>
              </PanelHeader>
              <PanelContent>
                <ul className="space-y-2">
                  {relationships.map((relationship) => (
                    <li key={`${relationship.company.id}-${relationship.edgeType}`}>
                      <Link
                        href={`/companies/${relationship.company.slug}`}
                        className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
                      >
                        <span className="font-medium text-foreground">
                          {relationship.company.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatCategory(relationship.company.category)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </PanelContent>
            </Panel>
          );
        })}

        {company.facilities.length > 0 && (
          <Panel className="lg:col-span-2">
            <PanelHeader>
              <PanelTitle>Facilities</PanelTitle>
            </PanelHeader>
            <PanelContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {company.facilities.map((facility) => (
                  <Card key={facility.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{facility.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <p>{facility.type.replaceAll("_", " ")}</p>
                      {facility.location && <p>{facility.location}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </PanelContent>
          </Panel>
        )}
      </div>
    </div>
  );
}
