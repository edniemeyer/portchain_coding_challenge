import React from 'react';
import { Moment } from 'moment';
import { Link } from "@reach/router";


interface State {
  vesselSchedule: {
    id: number;
    portId: string;
    arrival: Moment;
    departure: Moment;
    portName: string;
    isDeleted: boolean;
    createdDate: Moment;
    updatedDate: Moment;
  }[];
}

export class VesselSchedule extends React.Component<any, State>  {

  constructor(props) {
    super(props);
    this.state = {
      vesselSchedule: [],
    };
  }

  componentDidMount() {
    console.log(this.props)
    this.renderVesselSchedule();
  }

  renderVesselSchedule() {
    fetch('/api/vessel-schedule/' + this.props.vesselImo)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({ vesselSchedule: responseJson })
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    return (
      <div>
        <h1>Vessel Schedule for -{this.props.location.state.vesselName}- (-{this.props.location.state.vesselImo}-)</h1>
        <table className="table-fill">
          <tr>
            <th>Port</th>
            <th>Arrival</th>
            <th>Departure</th>
            <th>Deleted</th>
          </tr>
          {this.state.vesselSchedule.map(vs =>
            <tr key={vs.id}>
              <td>
                <Link to={`/port-call-history/${vs.id}`}
                  state={{
                    vesselName: this.props.location.state.vesselName,
                    arrival: vs.arrival,
                    departure: vs.departure,
                    portId: vs.portId
                  }}>
                  {vs.portName} ({vs.portId})
              </Link>
              </td>
              <td>{vs.arrival}</td>
              <td>{vs.departure}</td>
              <td>{vs.isDeleted ? "Yes" : "No"}</td>
            </tr>)}
        </table>
      </div>
    );
  }
}