export const downloadResults = (data?: any, companyAbbr: string = "VNC") => {
  if (!data || !Array.isArray(data) || data.length === 0) return;

  const results = data || [];

  // Get current EST time
  const now = new Date();
  const estTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  const day = String(estTime.getDate()).padStart(2, "0");
  const month = String(estTime.getMonth() + 1).padStart(2, "0");
  const year = String(estTime.getFullYear()).slice(-2);
  const hours = String(estTime.getHours()).padStart(2, "0");
  const minutes = String(estTime.getMinutes()).padStart(2, "0");

  const fileName = `${companyAbbr}${month}${day}${year}${hours}${minutes}.csv`;

  const headers = [
    "Phone Number",
    "Valid",
    "Is Reachable",
    "Country Code",
    "E.164",
    "National Format",
    "Validated At",
  ];

  const rows = results.map((item: any) => {
    const result = item.validation || item;
    return [
      result.phoneNumber || "",
      result.isValid ? "Yes" : "No",
      result.isReachable ? "Yes" : "No",
      result.countryCode || "",
      result.formattedNumber || "",
      result.nationalFormat || "",
      result.validatedAt
        ? new Date(result.validatedAt).toLocaleString("en-US", {
            timeZone: "America/New_York",
          })
        : "",
    ];
  });

  const csvContent =
    [headers, ...rows]
      .map((row) =>
        row
          .map((val) => `"${String(val).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};
