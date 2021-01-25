import * as React from 'react';
import { Container, Header, Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const StatsInfo = () => (
  <Container text={true}>
    <Segment>
      <Header>
        <Link to="/stats/starting-stats">Starting Stats</Link>
      </Header>
      <p>
          Used to calculate a characters starting stats.
          Can also be used to find good RNG values for a certain character's stat.
          For example, if you're trying to find a +8 Cleo MGC off Varkas &amp; Sydonia,
          select Cleo, set starting level to 5, levels gained to 2, and RNG &amp; iterations
          to whatever suits you. Then look for rows where Cleo has 8 MGC.
      </p>
      <p>
          Note that this doesn't include character's level 1 stats.
          So if you want actual starting stats, you need to figure out that character's
          level 1 stats and add them to the values in the table.
      </p>
    </Segment>
    <Segment>
      <Header>
        <Link to="/stats/level-ups">Level Ups</Link>
      </Header>
      <p>
        This is used to see what kind of levelups you get off a certain RNG.
        The primary use case is to optimize stats via formation swaps off certain fights.
      </p>
    </Segment>
  </Container>
);

export default StatsInfo;
