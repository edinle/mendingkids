import { useState } from 'react';
import { PageLayout, TopNavigation, LeftSidebar, Content, Main } from '@atlaskit/page-layout';
import { token } from '@atlaskit/tokens';
import Modal, { ModalTransition, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button';

import TopNav from './TopNav';
import SideNav from './SideNav';

const REPORT_TYPES = [
  { id: 'inventory-valuation', title: 'Inventory Valuation Report', desc: 'Summary of current stock levels and their estimated market value for tax and compliance.', icon: '💰' },
  { id: 'mission-packing', title: 'Mission Packing Slips', desc: 'Detailed checklists of all items to be packed for upcoming missions.', icon: '📦' },
  { id: 'expiration-alert', title: 'Expiration Alerts', desc: 'Identify items that are expiring within the next 3 to 6 months to minimize waste.', icon: '⚠️' },
  { id: 'donor-receipts', title: 'Donor Contribution Summaries', desc: 'Summarized records of items donated by specific partners over a specific timeframe.', icon: '🤝' },
];

export default function ReportsPage({ onNavigate, user, onSwitchAccount, onLogout }) {
  const [downloading, setDownloading] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [successModal, setSuccessModal] = useState({ isOpen: false, reportTitle: '' });

  const handleDownload = (id) => {
    setDownloading(id);
    // Simulate generation and download delay
    setTimeout(() => {
      setDownloading(null);
      const title = REPORT_TYPES.find(r => r.id === id)?.title || id;
      setSuccessModal({ isOpen: true, reportTitle: title });
    }, 1500);
  };

  return (
    <PageLayout>
      <TopNavigation isFixed><TopNav onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} /></TopNavigation>
      <Content>
        <LeftSidebar width={mobileMenuOpen ? '100vw' : 240}>
          <div className={mobileMenuOpen ? "" : "sidebar-collapsed"}>
            <SideNav 
              active="reports" 
              onNavigate={onNavigate} 
              user={user} 
              onSwitchAccount={onSwitchAccount} 
              onLogout={onLogout}
              isMobile={mobileMenuOpen}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </LeftSidebar>
        <Main>
          <div className="main-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: token('color.text', '#172B4D') }}>Reports & Analytics</h1>
              <button style={{ height: 32, padding: '0 16px', backgroundColor: '#422670', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                Create Custom Report
              </button>
            </div>
            
            <p style={{ color: '#626F86', marginBottom: 32, fontSize: 14 }}>
              Generate structured reports to maintain compliance, track mission readiness, and communicate with partners. All reports are exported as PDF.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {REPORT_TYPES.map(report => (
                <div key={report.id} style={{ 
                  backgroundColor: '#fff', 
                  border: `1px solid ${token('color.border', '#DFE1E6')}`, 
                  borderRadius: 4, 
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'box-shadow 0.2s',
                  boxShadow: '0 1px 1px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 24 }}>{report.icon}</span>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#172B4D' }}>{report.title}</h3>
                  </div>
                  <p style={{ margin: '0 0 24px', fontSize: 14, color: '#5E6C84', flex: 1, lineHeight: 1.5 }}>
                    {report.desc}
                  </p>
                  
                  <button 
                    onClick={() => handleDownload(report.id)}
                    disabled={downloading === report.id}
                    style={{
                      height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      backgroundColor: downloading === report.id ? '#F4F5F7' : '#fff', 
                      color: downloading === report.id ? '#A5ADBA' : 'var(--ds-link)', 
                      border: downloading === report.id ? '1px solid #DFE1E6' : '1px solid var(--ds-link)', 
                      borderRadius: 3, fontSize: 14, fontWeight: 500, cursor: downloading === report.id ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {downloading === report.id ? (
                      'Generating PDF...'
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Run & Download PDF
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
            
          </div>
        </Main>
      </Content>
      <ModalTransition>
        {successModal.isOpen && (
          <Modal onClose={() => setSuccessModal({ ...successModal, isOpen: false })}>
            <ModalHeader>
              <ModalTitle>Report Generated</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p>Successfully generated and downloaded PDF for report: <strong>{successModal.reportTitle}</strong></p>
            </ModalBody>
            <ModalFooter>
              <Button appearance="primary" onClick={() => setSuccessModal({ ...successModal, isOpen: false })}>
                Close
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>
    </PageLayout>
  );
}
