export const metadata = {
  title: "License Panel",
  description: "Panel de licencias"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "system-ui, Arial", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
