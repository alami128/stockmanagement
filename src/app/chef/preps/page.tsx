import PrepsPageLoader from "@/components/PrepsPageLoader";

export default function Page() {
  return (
    <PrepsPageLoader
      basePath="/chef"
      mode="select"
      stockHref="/chef/stock"
    />
  );
}
