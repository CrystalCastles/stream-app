import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

import classes from './MainNavigation.module.css';
import { useEffect } from 'react';

const MainNavigation = () => {
  const user = useSelector((state) => state.auth.user);
  const profileText = user ? 'Profile' : 'Sign In';

  return (
    <header className={classes.header}>
      <div className={classes.logo}>cg</div>
      <nav className={classes.nav}>
        <ul>
          <li>
            <NavLink to='/' className={navData => navData.isActive ? classes.active : '' }>
              Stream
            </NavLink>
          </li>
          <li>
            <NavLink to='/profile' className={navData => navData.isActive ? classes.active : '' }>
              {profileText}
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default MainNavigation;
