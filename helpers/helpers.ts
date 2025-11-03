export const downloadResults = (data?: any) => {
  if (!data) return;

  console.log(data);

  const results = data || [];
  const csv = [
    [
      "Phone Number",
      "Valid",
      "Is Reachable",
      "Country Code",
      "E.164",
      "National Format",
      "Validated At",
    ],
    ...results.map((item: any) => {
      const result = item.validation || item;
      return [
        result.phoneNumber,
        result.isValid ? "Yes" : "No",
        result.isReachable ? "Yes" : "No",
        result.countryCode || "",
        result.formattedNumber || "",
        result.nationalFormat || "",
        result.validatedAt ? new Date(result.validatedAt).toLocaleString() : "",
      ];
    }),
  ]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `phone-validation-results-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
