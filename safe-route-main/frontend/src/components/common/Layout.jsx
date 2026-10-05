// Layout.jsx
// Place this in: frontend/src/components/common/Layout.jsx
//
// ✅ Wraps every page with padding-top: 60px so the fixed navbar
//    never overlaps page content — add this ONCE here, not in every page.

export default function Layout({ children }) {
  return (
    <div className="page-root">
      {children}
    </div>
  );
}