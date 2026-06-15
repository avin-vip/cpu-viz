import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMPANY_CATEGORIES } from "@/lib/constants/categories";
import { listCompanies } from "@/lib/companies/get-company";
import { formatCategory } from "@/lib/utils/format";

export const metadata = {
  title: "Companies",
  description: "Browse semiconductor industry company profiles.",
};

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await listCompanies();

  const grouped = companies.reduce(
    (acc, company) => {
      if (!acc[company.category]) {
        acc[company.category] = [];
      }
      acc[company.category].push(company);
      return acc;
    },
    {} as Record<string, typeof companies>,
  );

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Company Directory
        </h1>
        <p className="mt-2 text-muted-foreground">
          {companies.length} semiconductor companies across the global supply
          chain.
        </p>
      </header>

      <div className="space-y-10">
        {Object.entries(grouped).map(([category, categoryCompanies]) => {
          const style = COMPANY_CATEGORIES[category as keyof typeof COMPANY_CATEGORIES];

          return (
            <section key={category}>
              <div className="mb-4 flex items-center gap-3">
                <span
                  aria-hidden
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: style?.color }}
                />
                <h2 className="text-lg font-semibold text-foreground">
                  {formatCategory(category as Parameters<typeof formatCategory>[0])}
                </h2>
                <Badge variant="outline">{categoryCompanies.length}</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryCompanies.map((company) => (
                  <Link key={company.id} href={`/companies/${company.slug}`}>
                    <Card className="h-full transition-colors hover:border-primary/40">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{company.name}</CardTitle>
                        {company.ticker && (
                          <p className="text-xs text-muted-foreground">
                            {company.ticker}
                          </p>
                        )}
                      </CardHeader>
                      {company.description && (
                        <CardContent>
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {company.description}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
