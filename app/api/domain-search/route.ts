import { parseDomain, SUGGESTED_TLDS } from "@/lib/domains";
import { checkDomain } from "@/lib/clientexec";

export async function POST(request: Request): Promise<Response> {
  let domain = "";
  try {
    const body = await request.json();
    domain = typeof body?.domain === "string" ? body.domain : "";
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parseDomain(domain);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const { name, tld } = parsed.value;
  const tlds = [tld, ...SUGGESTED_TLDS.filter((t) => t !== tld)];

  try {
    const results = await Promise.all(tlds.map((t) => checkDomain({ name, tld: t })));
    if (results.length > 0 && results.every((r) => r.status === "error")) {
      return Response.json(
        { error: "Domain search is temporarily unavailable. Please try again." },
        { status: 502 }
      );
    }
    return Response.json({ query: { name, tld }, results });
  } catch {
    return Response.json(
      { error: "Domain search is temporarily unavailable. Please try again." },
      { status: 502 }
    );
  }
}
