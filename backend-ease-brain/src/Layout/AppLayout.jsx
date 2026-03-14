import { Outlet } from "react-router-dom";
import { ReactElement } from "react";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

// AppLayout is the layout for public pages. It renders the routed child
// content via <Outlet /> and the shared Footer. Pages should not render
// the Footer themselves when displayed inside this layout.
export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
