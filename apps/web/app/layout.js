import './globals.css';

export const metadata = {
  title: 'Mini Task App',
  description: 'Mini full-stack project using Express and Mongo/MySQL',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
