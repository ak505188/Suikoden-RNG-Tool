import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { Helpers } from 'suikoden-rng-lib';
import { Container, Form } from 'semantic-ui-react';

class RunAssistantForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rng: Helpers.numToHexString(0x12),
      iterations: 1000,
      partylevel: 0,
      realistic: true,
      areas: []
    };
  }

  handleInputChange = (_event, { checked, name, value }) => {
    this.setState(prevState => ({ ...prevState, [name]: checked || value }));
  }

  handleAreaChange = (_event, data) => {
    this.setState({ areas: data.value });
  }

  handleSubmit = event => {
    event.preventDefault();
    const params = new URLSearchParams();
    Object.keys(this.state).forEach((key) => {
      params.append(key, this.state[key]);
    });
    this.props.history.push(`/runassist/result?${params.toString()}`);
  }

  render() {
    return (
      <Container textAlign="center">
        <Form size="large" onSubmit={this.handleSubmit}>
          <Form.Input
            label="Initial RNG Value"
            name="rng"
            type="text"
            value={this.state.rng}
            onChange={this.handleInputChange}
          />
          <Form.Input
            label="Iterations"
            name="iterations"
            type="number"
            step={500}
            value={this.state.iterations}
            onChange={this.handleInputChange}
          />
          <Form.Input
            label="Party Level"
            name="partylevel"
            type="number"
            value={this.state.partylevel}
            onChange={this.handleInputChange}
          />
          <Form.Dropdown
            label="Areas"
            placeholder="Area"
            options={Helpers.areaNamesWithRandomEncounters.map(name =>
              ({ key: name, value: name, text: this.props.areas[name].name })
            )}
            value={this.state.areas}
            onChange={this.handleAreaChange}
            multiple={true}
            search={true}
            selection={true}
          />
          <Form.Checkbox
            label="Realistic Mode"
            name="realistic"
            checked={this.state.realistic}
            onChange={this.handleInputChange}
          />
          <Form.Button type="submit" content="Generate Encounters" primary={true}/>
        </Form>
      </Container>
    );
  }
}

export default withRouter(RunAssistantForm);
