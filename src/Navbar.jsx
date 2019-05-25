import * as React from 'react';
import { Menu } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';

const Routes = [
  { name: 'Home', path: '/' },
  { name: 'Encounters', path: '/encounters' },
  { name: 'RNG Sequence', path: '/sequence' },
  { name: 'NPC Movements', path: '/npc' },
  { name: 'Item Drops', path: '/drops' },
  { name: 'RNG Finder', path: '/rngfinder' },
  { name: 'Experience', path: '/experience' },
  { name: 'Run Assistant', path: '/runassist' }
];

const Navbar = () => {
  return (
    <Menu widths={Routes.length}>
      {Routes.map((route, index) => {
        return (
          <Menu.Item
            as={NavLink}
            exact={true}
            key={index}
            name={route.name}
            to={route.path}
          />
        );
      })}
    </Menu>
  );
};

export default Navbar;
