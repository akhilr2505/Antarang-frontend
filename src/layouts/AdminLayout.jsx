import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header/Header';
import { Footer } from '../components/layout/Footer/Footer';
import { useAdmin } from '../hooks/useAdmin';

export const AdminLayout = () => {
  const { adminActiveTab, setAdminActiveTab } = useAdmin();

  return (
    <div className="app-container">
      <Header activeTab={adminActiveTab} onSelectTab={setAdminActiveTab} />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};
