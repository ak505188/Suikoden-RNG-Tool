import * as React from 'react';
import { Container, Header, Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Container text={true}>
      <Segment>
        <Header>
          About
        </Header>
        <p>
          This is a webapp dedicated to random number generation(RNG) manipulation
          in Suikoden 1. It's primary use is for routing and assisting a speedrun of
          the game.
        </p>
      </Segment>
      <Segment>
        <Header>
          <Link to="/encounters">Encounter Tool</Link>
        </Header>
        <p>
          Calculate upcoming fights based off the RNG seed and area.
        </p>
      </Segment>
      <Segment>
        <Header>
          <Link to="/sequence">RNG Sequence</Link>
        </Header>
        <p>
          Calculate the sequence of upcoming RNG seeds based off a RNG seed.
        </p>
      </Segment>
      <Segment>
        <Header>
          <Link to="/drops">Item Drops</Link>
        </Header>
        <p>
          Calculate what RNG seeds drop items based off a starting RNG seed and enemy group.
        </p>
      </Segment>
      <Segment>
        <Header>
          <Link to="/rngfinder">RNG Finder</Link>
        </Header>
        <p>
          Find (approximately) the current RNG seed based off a sequence of fights.
        </p>
      </Segment>
      <Segment>
        <Header>
          <Link to="/runassist">Run Assistant</Link>
        </Header>
        <p>
          Tool to assist in implementing RNG manipulation strategies while speedrunning.
        </p>
      </Segment>
      <Segment>
        <Header>
          <a href="https://github.com/ak505188/SuikodenRNG-React/tree/master">Github Repository</a>
        </Header>
        <p>
          This webapp's Github repository. README details how the game calculates
          most things RNG related.
        </p>
      </Segment>
    </Container>
  );
};

export default Home;
