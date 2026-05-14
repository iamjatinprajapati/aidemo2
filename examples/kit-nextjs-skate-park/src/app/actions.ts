"use server";

export async function getDemandbaseData() {
  const req = await fetch("https://api.company-target.com/api/v3/ip.json", {
    body: '{"src":"tag","auth":"SLi1tE4A4gR8IDq5rCfTkwKJvdKxrPtVOfEXp0yg"}',
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
  const body = await req.json();
  return {
    company: body?.company_name || "noValue",
    industry: body?.industry || "noValue",
    audience: body?.audience || "noValue",
    audience_segment: body?.audience_segment || "noValue",
    annual_sales: body?.annual_revenue || "noValue",
  };
}
