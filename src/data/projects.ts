/**
 * Atamura Group residential complexes (ЖК).
 * `bitrixProjectId` maps to the existing CRM field UF_CRM_1758630528 ("Проект - встреча")
 * so a lead's source ЖК is written into the same field the sales team already uses.
 */
export interface Project {
  slug: string;
  name: string;
  bitrixProjectId?: string;
}

export const PROJECTS: ReadonlyArray<Project> = [
  { slug: "atmosfera", name: "Атмосфера", bitrixProjectId: "1962" },
  { slug: "keruen", name: "Керуен", bitrixProjectId: "1964" },
  { slug: "aqsai", name: "Аксай Резорт", bitrixProjectId: "1966" },
  { slug: "aura", name: "Аура", bitrixProjectId: "1968" },
  { slug: "arlan", name: "Арлан", bitrixProjectId: "3676" },
  { slug: "bravo", name: "Браво" },
  { slug: "monarch", name: "Монарх" },
  { slug: "discovery", name: "Дискавери" },
  { slug: "amaya", name: "Амайя" },
  { slug: "olimpik", name: "Олимпик" },
];

const BY_SLUG: ReadonlyMap<string, Project> = new Map(
  PROJECTS.map((p) => [p.slug, p]),
);

export function findProject(slug: string | null | undefined): Project | undefined {
  if (!slug) return undefined;
  return BY_SLUG.get(slug.toLowerCase());
}
