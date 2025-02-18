import DashboardLayout from "./_components/dashlayout";

export default async function DashboardServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col min-h-screen bg-green-50 mx-auto sm:max-w-[100%]`}
      style={{
        fontFamily: "Inter",
      }}
    >
      <DashboardLayout>{children}</DashboardLayout>
    </div>
  );
}
