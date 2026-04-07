import React, { useState } from 'react';
import { PageLayout, Content, Main, LeftSidebarWithoutResize, TopNavigation } from '@atlaskit/page-layout';
import TopNav from './TopNav';
import SideNav from './SideNav';
import { token } from '@atlaskit/tokens';
import Button from '@atlaskit/button';
import AddIcon from '@atlaskit/icon/core/add';
import SearchIcon from '@atlaskit/icon/core/search';
import Lozenge from '@atlaskit/lozenge';
import AvatarGroup from '@atlaskit/avatar-group';
import Avatar from '@atlaskit/avatar';

const MISSIONS = [
  { id: 1, name: 'Uganda Cardiac 2026', location: 'Kampala, Uganda', dates: 'Aug 10 - Aug 24, 2026', status: 'upcoming', type: 'Cardiac', items: 340, volunteers: 12 },
  { id: 2, name: 'Guatemala Dental 2026', location: 'Guatemala City', dates: 'Sep 05 - Sep 15, 2026', status: 'upcoming', type: 'Dental', items: 120, volunteers: 8 },
  { id: 3, name: 'Peru General Surgery', location: 'Lima, Peru', dates: 'Oct 01 - Oct 14, 2026', status: 'planning', type: 'General', items: 450, volunteers: 20 },
  { id: 4, name: 'Tanzania Orthopedic', location: 'Dar es Salaam, Tanzania', dates: 'Nov 12 - Nov 28, 2026', status: 'planning', type: 'Orthopedic', items: 210, volunteers: 15 },
  { id: 5, name: 'Vietnam ENT 2025', location: 'Hanoi, Vietnam', dates: 'Dec 01 - Dec 15, 2025', status: 'completed', type: 'ENT', items: 500, volunteers: 18 },
];

export default function MissionsPage({ onNavigate }) {
  const [search, setSearch] = useState('');

  return (
    <PageLayout>
      <TopNavigation isFixed>
        <TopNav />
      </TopNavigation>
      <Content>
        <LeftSidebarWithoutResize width={240}>
          <SideNav active="missions" onNavigate={onNavigate} />
        </LeftSidebarWithoutResize>
        <Main>
          <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h1 style={{ margin: 0, fontSize: 24, color: token('color.text', '#172B4D') }}>Missions</h1>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ position: 'relative', width: 250 }}>
                  <span style={{ position: 'absolute', left: 10, top: 6, color: '#8590A2' }}>
                    <SearchIcon size="small" label="" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search missions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 12px 8px 36px',
                      border: `1px solid ${token('color.border', '#DFE1E6')}`, borderRadius: 4,
                      fontSize: 14, backgroundColor: token('elevation.surface', '#fff')
                    }}
                  />
                </div>
                <button
                  style={{
                    backgroundColor: '#422670', color: '#fff', border: 'none', borderRadius: 4,
                    padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                    fontSize: 14, fontWeight: 500, transition: '0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#331D58'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#422670'}
                >
                  <AddIcon size="small" label="" /> Create Mission
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
              {MISSIONS.filter(m => m.name.toLowerCase().includes(search.toLowerCase())).map(m => (
                <div key={m.id} style={{
                  backgroundColor: '#fff', border: `1px solid ${token('color.border', '#DFE1E6')}`,
                  borderRadius: 8, padding: 20, boxShadow: '0 1px 2px rgba(9,30,66,0.1)', cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(9,30,66,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(9,30,66,0.1)'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 16, color: '#172B4D', fontWeight: 600 }}>{m.name}</h3>
                    <Lozenge appearance={m.status === 'upcoming' ? 'success' : m.status === 'planning' ? 'inprogress' : 'default'} isBold>
                      {m.status.toUpperCase()}
                    </Lozenge>
                  </div>
                  <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6B778C' }}>{m.dates}</p>
                  
                  <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                     <div>
                       <span style={{ display: 'block', fontSize: 12, color: '#8590A2', marginBottom: 4 }}>Location</span>
                       <span style={{ fontSize: 14, color: '#172B4D' }}>{m.location}</span>
                     </div>
                     <div>
                       <span style={{ display: 'block', fontSize: 12, color: '#8590A2', marginBottom: 4 }}>Type</span>
                       <span style={{ fontSize: 14, color: '#172B4D' }}>{m.type}</span>
                     </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #DFE1E6', paddingTop: 16 }}>
                    <span style={{ fontSize: 13, color: '#44546F', fontWeight: 500 }}>{m.items} Items Assigned</span>
                    <AvatarGroup presence="online" size="small" appearance="stack" maxCount={3} data={[
                      { name: 'Dr. Smith', src: '' },
                      { name: 'Dr. Jones', src: '' },
                      { name: 'Nurse Joy', src: '' }
                    ]} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Main>
      </Content>
    </PageLayout>
  );
}
