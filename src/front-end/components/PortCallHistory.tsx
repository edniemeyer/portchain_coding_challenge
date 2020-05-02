import React from 'react';
import { Moment } from 'moment';

interface State {
  portCallHistory: {
    id: number;
    portId: string;
    arrival: Moment;
    departure: Moment;
    portName: string;
    isInsert: boolean;
    isUpdate: boolean;
    isDelete: boolean;
    createdDate: Moment;
    updatedDate: Moment;
    logDate: Moment;
  }[];
}

export class PortCallHistory extends React.Component<any, State>  {

  constructor(props) {
    super(props);
    this.state = {
      portCallHistory: []
    };
  }

  componentDidMount() {
    console.log(this.props)
    this.renderPortCallHistory();
  }

  renderPortCallHistory() {
    fetch('/api/port-call-history/' + this.props.portcallId)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({ portCallHistory: responseJson })
      })
      .catch((error) => {
        console.error(error);
      });
  }
  render() {
    return (
      <div>
        <h1>Port call history for port call {this.props.location.state.portId} in port,
        {this.props.location.state.arrival}/{this.props.location.state.departure}, vessel {this.props.location.state.vesselName}</h1>
        <ul>{this.state.portCallHistory.map(pch =>
          <li key={pch.id}>
            [cursor: {pch.logDate}] {pch.portName} ({pch.portId}): [arrival: {pch.arrival}, departure: {pch.departure}]
              {pch.isInsert ? " - INSERT" : ""}
            {pch.isUpdate ? " - UPDATE" : ""}
            {pch.isDelete ? " - DELETE" : ""}
          </li>)}</ul>
      </div>
    );
  }
}