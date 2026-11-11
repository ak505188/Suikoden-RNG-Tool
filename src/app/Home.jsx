import * as React from 'react';
import { Container, Header, Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { TOOLS } from './tools';

const Home = () => {
  return (
    <Container text={true}>
      <Segment>
        <Header>About</Header>
        <p>
          This is a webapp dedicated to random number generation(RNG) manipulation in Suikoden 1.
          It's primary use is for routing and assisting a speedrun of the game.
        </p>
      </Segment>
      {TOOLS.filter((tool) => tool.description).map((tool) => (
        <Segment key={tool.path}>
          <Header>
            <Link to={tool.path}>{tool.title ?? tool.name}</Link>
          </Header>
          <p>{tool.description}</p>
        </Segment>
      ))}
      <Segment>
        <Header>
          <a href="https://github.com/ak505188/Suikoden-RNG-Tool/tree/master">Github Repository</a>
        </Header>
        <p>
          This webapp's Github repository. README details how the game calculates most things RNG
          related.
        </p>
      </Segment>
    </Container>
  );
};

export default Home;
