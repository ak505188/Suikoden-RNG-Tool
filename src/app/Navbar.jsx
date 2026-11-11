import * as React from 'react';
import { Dropdown, Menu } from 'semantic-ui-react';
import { NavLink, useLocation } from 'react-router-dom';
import { TOOL_GROUPS } from './tools';

// Home, then one drop-down per group of tools. A group is marked while you are on any of its pages
// (including a result page), not only on its forms.
const Navbar = () => {
  const { pathname } = useLocation();
  const inGroup = (group) =>
    group.tools.some((tool) => pathname === tool.path || pathname.startsWith(`${tool.path}/`));
  return (
    <Menu widths={TOOL_GROUPS.length + 1}>
      <Menu.Item as={NavLink} exact={true} name="Home" to="/" />
      {TOOL_GROUPS.map((group) => (
        <Dropdown
          key={group.name}
          item={true}
          text={group.name}
          className={inGroup(group) ? 'active' : undefined}
        >
          <Dropdown.Menu>
            {group.tools.map((tool) => (
              <Dropdown.Item as={NavLink} exact={true} key={tool.path} to={tool.path}>
                {tool.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      ))}
    </Menu>
  );
};

export default Navbar;
