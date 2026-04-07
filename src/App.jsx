import { useState } from 'react';
import InventoryPage from "./components/InventoryPage";
import MissionsPage from "./components/MissionsPage";
import DashboardPage from "./components/DashboardPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState('inventory');

  return (
    <>
      {currentPage === 'inventory' && <InventoryPage onNavigate={setCurrentPage} />}
      {currentPage === 'missions' && <MissionsPage onNavigate={setCurrentPage} />}
      {currentPage === 'dashboard' && <DashboardPage onNavigate={setCurrentPage} />}
    </>
  );
}
