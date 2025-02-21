// App.jsx
import React from 'react';
import { 
  AppBar, 
  AppBarSection,
  AppBarSpacer,
  DrawerContainer,
  DrawerContent,
  DrawerItem
} from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { Badge } from '@progress/kendo-react-indicators';

const App = () => {
  const [expanded, setExpanded] = React.useState(true);

  const items = [
    { text: 'Dashboard', icon: 'k-i-grid' },
    { text: 'Reports', icon: 'k-i-chart' },
    { text: 'Settings', icon: 'k-i-gear' },
  ];

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <AppBar>
        <AppBarSection>
          <Button 
            icon="menu" 
            look="flat"
            onClick={() => setExpanded(!expanded)}
          />
        </AppBarSection>
        <AppBarSection>
          <h1 className="title">My Application</h1>
        </AppBarSection>
        <AppBarSpacer />
        <AppBarSection>
          <Button icon="user" look="flat">
            Profile
          </Button>
          <Button icon="bell" look="flat">
            <Badge shape="dot" themeColor="info" />
          </Button>
        </AppBarSection>
      </AppBar>

      {/* Main Content Area with Drawer */}
      <DrawerContainer expanded={expanded}>
        <div className="drawer">
          {items.map((item) => (
            <DrawerItem
              key={item.text}
              text={item.text}
              icon={item.icon}
              selected={item.text === 'Dashboard'}
            />
          ))}
        </div>
        <DrawerContent>
          <div className="page-container">
            <h2>Welcome to Your Dashboard</h2>
            {/* Add your main content here */}
          </div>
        </DrawerContent>
      </DrawerContainer>

      <style>{`
        .app-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }

        .title {
          font-size: 1.2rem;
          margin: 0 1rem;
        }

        .drawer {
          border-right: 1px solid rgba(0, 0, 0, 0.08);
        }

        .page-container {
          padding: 2rem;
        }

        /* Kendo Theme Import */
        @import '@progress/kendo-theme-default/dist/all.css';
      `}</style>
    </div>
  );
};

export default App;

