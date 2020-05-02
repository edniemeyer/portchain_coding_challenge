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
         {this.props.location.state.arrival}/{this.props.location.state.departure},
         vessel {this.props.location.state.vesselName}</h1>
        <table className="table-fill"><tr>
          <th>Cursor</th>
          <th>Port</th>
          <th>Arrival</th>
          <th>Departure</th>
          <th>Status</th>
        </tr>
          {this.state.portCallHistory.map(pch =>
            <tr key={pch.id}>
              <td>{pch.logDate}</td>
              <td>{pch.portName} ({pch.portId})</td>
              <td>{pch.arrival}</td>
              <td>{pch.departure}</td>
              <td>{pch.isInsert ? "INSERT" : ""}
                {pch.isUpdate ? "UPDATE" : ""}
                {pch.isDelete ? "DELETE" : ""}
              </td>
            </tr>)}
        </table>
      </div>
    );
  }
}