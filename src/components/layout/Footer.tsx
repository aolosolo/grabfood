export default function Footer() {
  return (
    <footer className="bg-card shadow-md mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} FastGrab. All rights reserved.</p>
        <p className="text-sm">Delicious food, delivered fast!</p>
      </div>
    </footer>
  );
}