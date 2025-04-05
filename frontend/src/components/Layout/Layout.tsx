import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Main = styled.main`
  min-height: calc(100vh - 200px); // Adjust based on header/footer height
`;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <Main>{children}</Main>
      <Footer />
    </>
  );
};

export default Layout; 