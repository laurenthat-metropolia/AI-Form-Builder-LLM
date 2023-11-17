// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';
import { Outlet } from 'react-router-dom';
import { TopNav } from './components/TopNav';

function App() {
  return (
    <>
      <TopNav />
      <Outlet></Outlet>
    </>
  );
}

export default App;
