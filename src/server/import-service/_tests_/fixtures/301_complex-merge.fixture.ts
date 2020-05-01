/** Test scenario
 * Complex scenario with multiple inserts, edits and deletes
 */
import {
  MergeAction, MergeActionType, ImportedVesselSchedule, StoredVesselSchedule,
} from '../../data-types';

import moment = require('moment');



const storedVesselSchedule: StoredVesselSchedule = {
  vessel: {
    imo: 1,
    name: 'Dummy vessel'
  },
  portCalls: [{
    id: 1,
    arrival: moment('2019-02-01T00:00:00Z'),
    departure: moment('2019-02-02T00:00:00Z'),
    portId: 'FAKE1',
    portName: 'Fake port 1',
    isDeleted: false
  }, {
    id: 2,
    arrival: moment('2019-02-10T00:00:00Z'),
    departure: moment('2019-02-11T00:00:00Z'),
    portId: 'FAKE2',
    portName: 'Fake port 2',
    isDeleted: false // delete
  }, {
    id: 3,
    arrival: moment('2019-02-12T00:00:00Z'),
    departure: moment('2019-02-13T00:00:00Z'),
    portId: 'FAKE3',
    portName: 'Fake port 3', // move to earlier than #2
    isDeleted: false
  }, {
    id: 4,
    arrival: moment('2019-02-25T00:00:00Z'),
    departure: moment('2019-02-28T00:00:00Z'),
    portId: 'FAKE1',
    portName: 'Fake port 1', // move 2 days earlier
    isDeleted: false
  }, {
    id: 5,
    arrival: moment('2019-03-05T00:00:00Z'),
    departure: moment('2019-03-06T00:00:00Z'),
    portId: 'FAKE2',
    portName: 'Fake port 2', // untouch
    isDeleted: false
  }, {
    id: 6,
    arrival: moment('2019-04-01T00:00:00Z'),
    departure: moment('2019-04-01T00:00:00Z'),
    portId: 'FAKE3',
    portName: 'Fake port 3', // omit
    isDeleted: false
  }, {
    id: 7,
    arrival: moment('2019-04-10T00:00:00Z'),
    departure: moment('2019-04-11T00:00:00Z'),
    portId: 'FAKE1',
    portName: 'Fake port 1', // delay 3 d
    isDeleted: false
  }, {
    id: 8,
    arrival: moment('2019-04-12T00:00:00Z'),
    departure: moment('2019-04-13T00:00:00Z'),
    portId: 'FAKE2',
    portName: 'Fake port 2', // omit
    isDeleted: false
  }]
};

const importedVesselSchedule: ImportedVesselSchedule = {
  cursorValueAtFetchTime: moment('2019-02-05'),
  vessel: storedVesselSchedule.vessel,
  portCalls: [{
    //id: '3',
    arrival: moment('2019-02-09T21:00:00Z'),
    departure: moment('2019-02-10T15:00:00Z'),
    portId: 'FAKE3',
    portName: 'Fake port 3',
  }, {
    //id: '4',
    arrival: moment('2019-02-24T07:00:00Z'),
    departure: moment('2019-02-25T23:30:00Z'),
    portId: 'FAKE1',
    portName: 'Fake port 1',
  }, {
    //id: '5',
    arrival: moment('2019-03-05T00:00:00Z'),
    departure: moment('2019-03-06T00:00:00Z'),
    portId: 'FAKE2',
    portName: 'Fake port 2',
  }, {
    //id: '7',
    arrival: moment('2019-04-12T22:30:00Z'),
    departure: moment('2019-04-13T13:45:00Z'),
    portId: 'FAKE1',
    portName: 'Fake port 1'
  }],
};

const expectedMergeActions: MergeAction[] = [{
    action: MergeActionType.UPDATE,
    storedPortCall: storedVesselSchedule.portCalls[2],
    importedPortCall: importedVesselSchedule.portCalls[0]
  }, {
    action: MergeActionType.UPDATE,
    storedPortCall: storedVesselSchedule.portCalls[3],
    importedPortCall: importedVesselSchedule.portCalls[1]
  },  {
    action: MergeActionType.UPDATE,
    storedPortCall: storedVesselSchedule.portCalls[6],
    importedPortCall: importedVesselSchedule.portCalls[3]
  }, {
    action: MergeActionType.DELETE,
    storedPortCall: storedVesselSchedule.portCalls[1],
    importedPortCall: null
  }, {
    action: MergeActionType.DELETE,
    storedPortCall: storedVesselSchedule.portCalls[5],
    importedPortCall: null
  }, {
    action: MergeActionType.DELETE,
    storedPortCall: storedVesselSchedule.portCalls[7],
    importedPortCall: null
  }
]
export {
  importedVesselSchedule,
  storedVesselSchedule,
  expectedMergeActions,
};
